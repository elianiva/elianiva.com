import path from "node:path";
import { runnerImport, type Plugin } from "vite-plus";

/**
 * Evaluates `css({...})` calls whose arguments are plain literals while the
 * site builds, and puts the class string where the call was.
 *
 * Panda's `css()` walks, merges and hashes its style objects each time it runs,
 * and the views call it for nearly every element, so hydration spent about a
 * tenth of its time there. Panda already read these same literals to emit the
 * CSS, so nothing about the output changes: the string is what the call returns.
 * A call with anything dynamic in it (a parameter, a condition) stays a call.
 */

type Node = { type: string; start: number; end: number; [key: string]: any };

const NOT_STATIC = Symbol("not static");

const isCssImport = (node: Node) =>
  node.type === "ImportDeclaration" &&
  /styled-system\/css(\/index(\.m?js)?)?$/.test(node.source.value);

export function hoistCss(): Plugin {
  let cssFn: ((...args: unknown[]) => string) | undefined;
  let root = process.cwd();

  return {
    name: "hoist-css",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      root = config.root;
    },
    async transform(code, id) {
      if (
        !/\/app\/.*\.[cm]?[jt]sx?$/.test(id.split("?")[0]!) ||
        !code.includes("styled-system/css")
      ) {
        return null;
      }
      const program = this.parse(code) as unknown as Node;
      const imported = program.body.find(isCssImport);
      const local = imported?.specifiers.find(
        (s: Node) => s.type === "ImportSpecifier" && s.imported.name === "css",
      )?.local.name as string | undefined;
      if (!local) return null;

      // Top-level `const x = <literal>` that a call may spread or pass.
      const constants = new Map<string, unknown>();
      const evaluate = (node: Node): unknown => {
        switch (node.type) {
          case "Literal":
            return node.regex || node.bigint ? NOT_STATIC : node.value;
          case "TemplateLiteral":
            return node.expressions.length === 0 ? node.quasis[0].value.cooked : NOT_STATIC;
          case "UnaryExpression": {
            const value = evaluate(node.argument);
            return node.operator === "-" && typeof value === "number" ? -value : NOT_STATIC;
          }
          case "Identifier":
            return constants.has(node.name) ? constants.get(node.name) : NOT_STATIC;
          case "ArrayExpression": {
            const items: unknown[] = [];
            for (const element of node.elements) {
              const value =
                element && element.type !== "SpreadElement" ? evaluate(element) : NOT_STATIC;
              if (value === NOT_STATIC) return NOT_STATIC;
              items.push(value);
            }
            return items;
          }
          case "ObjectExpression": {
            const object: Record<string, unknown> = {};
            for (const property of node.properties) {
              if (property.type === "SpreadElement") {
                const value = evaluate(property.argument);
                if (typeof value !== "object" || value === null) return NOT_STATIC;
                Object.assign(object, value);
                continue;
              }
              if (property.kind !== "init" || property.method || property.computed)
                return NOT_STATIC;
              const key =
                property.key.type === "Identifier" ? property.key.name : property.key.value;
              const value = evaluate(property.value);
              if (value === NOT_STATIC || typeof key !== "string") return NOT_STATIC;
              object[key] = value;
            }
            return object;
          }
          default:
            return NOT_STATIC;
        }
      };
      for (const statement of program.body) {
        if (statement.type !== "VariableDeclaration" || statement.kind !== "const") continue;
        for (const declaration of statement.declarations) {
          if (declaration.id.type !== "Identifier" || !declaration.init) continue;
          const value = evaluate(declaration.init);
          if (value !== NOT_STATIC) constants.set(declaration.id.name, value);
        }
      }

      // Panda's generated `css` imports without extensions, which only Vite resolves.
      cssFn ??= (
        await runnerImport<{ css: (...args: unknown[]) => string }>(
          path.join(root, "styled-system/css/index.js"),
          { configFile: false, root, logLevel: "silent" },
        )
      ).module.css;

      const edits: { start: number; end: number; text: string }[] = [];
      const visit = (node: unknown): void => {
        if (Array.isArray(node)) return node.forEach(visit);
        if (typeof node !== "object" || node === null || !("type" in node)) return;
        const n = node as Node;
        if (
          n.type === "CallExpression" &&
          n.callee.type === "Identifier" &&
          n.callee.name === local
        ) {
          const args = n.arguments.map((a: Node) =>
            a.type === "SpreadElement" ? NOT_STATIC : evaluate(a),
          );
          if (args.length > 0 && !args.includes(NOT_STATIC)) {
            edits.push({ start: n.start, end: n.end, text: JSON.stringify(cssFn!(...args)) });
            return;
          }
        }
        for (const key of Object.keys(n)) if (key !== "type") visit(n[key]);
      };
      visit(program);
      if (edits.length === 0) return null;

      let out = code;
      for (const { start, end, text } of [...edits].sort((a, b) => b.start - a.start)) {
        out = out.slice(0, start) + text + out.slice(end);
      }
      return { code: out, map: null };
    },
  };
}
