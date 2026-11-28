import { describe, expect, it } from "vite-plus/test";
import { highlighter } from "./highlight";

describe("highlighter", () => {
  it("emits class-based token markup for a registered language", () => {
    const result = highlighter.highlight("const answer = 42", { lang: "ts" });
    expect(result.lang).toBe("ts");
    expect(result.html).toContain('<pre class="th-code th-code--ts"');
    expect(result.html).toContain("th-keyword");
    expect(result.html).not.toContain("style=");
  });

  it("resolves common fence aliases to the registered language", () => {
    for (const [alias, canonical] of [
      ["bash", "shell"],
      ["javascript", "js"],
      ["typescript", "ts"],
      ["yml", "yaml"],
      ["md", "markdown"],
    ] as const) {
      expect(highlighter.normalizeLanguage(alias), alias).toBe(canonical);
    }
  });

  it.each(["vim", "lua", "nix", "csharp", "tex", "ini", "c"])(
    "degrades the unregistered %s fence to escaped plain text",
    (lang) => {
      const source = "<script>alert('x')</script>";
      const result = highlighter.highlight(source, { lang });
      expect(result.lang).toBe("plaintext");
      expect(result.html).toContain("&lt;script&gt;");
      expect(result.html).not.toContain("<script>");
    },
  );

  it("keeps source text intact through tokenization", () => {
    const source = "echo $HOME && exit 0 # done";
    const { tokens } = highlighter.tokenize(source, { lang: "bash" });
    expect(tokens.map((t) => t.value).join("")).toBe(source);
  });
});
