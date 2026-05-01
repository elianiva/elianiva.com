import { readFile } from "node:fs/promises";
import { createFileRoute } from "@tanstack/react-router";
import { html } from "satori-html";
import { satori } from "@cf-wasm/satori";
import { Resvg } from "@cf-wasm/resvg";
import sites from "~/data/sites";

const domainName = new URL(sites.siteUrl).hostname;

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

const COLORS = {
  bgGradientStart: "#fff5f0",
  bgGradientMid: "#fff9f5",
  bgGradientEnd: "#fff0f5",
  border: "rgba(249, 168, 212, 0.6)",
  borderLight: "rgba(249, 168, 212, 0.3)",
  textPrimary: "#431407",
  textSecondary: "#831843",
  textMuted: "#9d174d",
  peach: "#ffd4bc",
  pinkLight: "#fce7f3",
  pinkMedium: "#f9a8d4",
  pinkDark: "#db2777",
  roseDeep: "#be185d",
  white: "#ffffff",
  whiteTransparent: "rgba(255, 255, 255, 0.6)",
};

// Corner decoration squares like on the site
function CornerSquares() {
  return `
    <div style="display:flex;position:absolute;left:-12px;top:-12px;width:24px;height:24px;border:1.5px solid ${COLORS.border};background:${COLORS.white};z-index:10;" />
    <div style="display:flex;position:absolute;left:-12px;bottom:-12px;width:24px;height:24px;border:1.5px solid ${COLORS.border};background:${COLORS.white};z-index:10;" />
    <div style="display:flex;position:absolute;right:-12px;top:-12px;width:24px;height:24px;border:1.5px solid ${COLORS.border};background:${COLORS.white};z-index:10;" />
    <div style="display:flex;position:absolute;right:-12px;bottom:-12px;width:24px;height:24px;border:1.5px solid ${COLORS.border};background:${COLORS.white};z-index:10;" />
  `;
}

function PostLayout(title: string, date: string, tags: string[], description: string) {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
    weekday: "long",
  });

  return html`
    <div style="display:flex;flex-direction:column;width:100%;height:100%;background:linear-gradient(135deg,${COLORS.bgGradientStart} 0%,${COLORS.bgGradientMid} 50%,${COLORS.bgGradientEnd} 100%);padding:24px;position:relative;overflow:hidden;">
      <div style="display:flex;flex-direction:column;width:100%;height:100%;border:1.5px solid ${COLORS.border};background:${COLORS.whiteTransparent};backdrop-filter:blur(12px);position:relative;padding:32px;position:relative;">
        ${CornerSquares()}

        <!-- Top bar: domain + type + date -->
        <div style="display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:18px;color:${COLORS.textMuted};letter-spacing:0.3em;text-transform:uppercase;">
          <span>${domainName}</span>
          <span style="display:flex;align-items:center;gap:16px;">
            <span style="opacity:0.7;">/ post</span>
            <span style="opacity:0.7;">·</span>
            <span style="opacity:0.7;">${formattedDate}</span>
          </span>
        </div>

        <!-- Divider line -->
        <div style="display:flex;width:100%;height:1.5px;background:${COLORS.borderLight};margin:20px 0;" />

        <!-- Title (large, Google Sans) -->
        <div style="display:flex;flex-direction:column;justify-content:center;flex:1;padding:8px 0;">
          <h1 style="font-family:'Google Sans',sans-serif;font-size:56px;font-weight:700;color:${COLORS.textPrimary};line-height:1.15;margin:0;letter-spacing:-0.02em;max-width:95%;">
            ${title}
          </h1>
        </div>

        <!-- Description -->
        <p style="font-family:'IBM Plex Mono',monospace;font-size:22px;color:${COLORS.textMuted};line-height:1.4;margin:0;opacity:0.8;max-width:90%;">
          ${description}
        </p>

        <!-- Tags footer -->
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
          ${tags.map((tag) => `
            <span style="display:flex;align-items:center;background:linear-gradient(135deg,${COLORS.peach} 0%,${COLORS.pinkLight} 100%);border-radius:9999px;padding:8px 18px;font-family:'IBM Plex Mono',monospace;font-size:18px;color:${COLORS.roseDeep};border:1px solid ${COLORS.border};">
              #${tag}
            </span>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function DefaultLayout(title: string, subtitle: string) {
  return html`
    <div style="display:flex;flex-direction:column;width:100%;height:100%;background:linear-gradient(135deg,${COLORS.bgGradientStart} 0%,${COLORS.bgGradientMid} 50%,${COLORS.bgGradientEnd} 100%);padding:24px;position:relative;overflow:hidden;">
      <div style="display:flex;flex-direction:column;width:100%;height:100%;border:1.5px solid ${COLORS.border};background:${COLORS.whiteTransparent};backdrop-filter:blur(12px);position:relative;padding:32px;position:relative;">
        ${CornerSquares()}

        <!-- Top bar -->
        <div style="display:flex;justify-content:space-between;align-items:center;font-family:'IBM Plex Mono',monospace;font-size:18px;color:${COLORS.textMuted};letter-spacing:0.3em;text-transform:uppercase;">
          <span>${domainName}</span>
        </div>

        <!-- Divider -->
        <div style="display:flex;width:100%;height:1.5px;background:${COLORS.borderLight};margin:20px 0;" />

        <!-- Centered content -->
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;flex:1;text-align:center;gap:12px;">
          <h1 style="font-family:'Google Sans',sans-serif;font-size:64px;font-weight:700;color:${COLORS.textPrimary};line-height:1.15;margin:0;letter-spacing:-0.02em;">
            ${title}
          </h1>
          ${subtitle ? `
            <p style="font-family:'IBM Plex Mono',monospace;font-size:24px;color:${COLORS.textMuted};line-height:1.4;margin:0;opacity:0.8;max-width:80%;">
              ${subtitle}
            </p>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

export const Route = createFileRoute("/api/og-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get("type") || "post";
        const title = url.searchParams.get("title");
        const date = url.searchParams.get("date");
        const tags = url.searchParams.get("tags");
        const description = url.searchParams.get("description");
        const subtitle = url.searchParams.get("subtitle");

        if (type === "default") {
          if (!title) {
            return new Response("Missing required query parameters", { status: 400 });
          }

          const decodedTitle = decodeURIComponent(title);
          const decodedSubtitle = subtitle ? decodeURIComponent(subtitle) : "";

          const markup = DefaultLayout(decodedTitle, decodedSubtitle);

          const [googleSansFont, ibmPlexFont] = await Promise.all([
            readFile("node_modules/@fontsource-variable/google-sans/files/google-sans-latin-standard-normal.woff2"),
            readFile("node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"),
          ]);

          const svg = await satori(markup, {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            fonts: [
              {
                name: "Google Sans",
                data: googleSansFont,
                weight: 700,
                style: "normal",
              },
              {
                name: "IBM Plex Mono",
                data: ibmPlexFont,
                weight: 400,
                style: "normal",
              },
            ],
          });

          const resvg = new Resvg(svg, {
            font: {
              loadSystemFonts: false,
              defaultFontFamily: "Google Sans",
            },
            fitTo: {
              mode: "width",
              value: CARD_WIDTH,
            },
          });

          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();

          return new Response(pngBuffer.buffer as ArrayBuffer, {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }

        if (!title || !date || !tags || !description) {
          return new Response("Missing required query parameters", { status: 400 });
        }

        const decodedTitle = decodeURIComponent(title);
        const decodedTags = decodeURIComponent(tags)
          .split(",")
          .map((tag) => tag.trim());
        const decodedDescription = decodeURIComponent(description);

        const markup = PostLayout(decodedTitle, date, decodedTags, decodedDescription);

        const [googleSansFont, ibmPlexFont] = await Promise.all([
          readFile("node_modules/@fontsource-variable/google-sans/files/google-sans-latin-standard-normal.woff2"),
          readFile("node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"),
        ]);

        const svg = await satori(markup, {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          fonts: [
            {
              name: "Google Sans",
              data: googleSansFont,
              weight: 700,
              style: "normal",
            },
            {
              name: "IBM Plex Mono",
              data: ibmPlexFont,
              weight: 400,
              style: "normal",
            },
          ],
        });

        const resvg = new Resvg(svg, {
          font: {
            loadSystemFonts: false,
            defaultFontFamily: "Google Sans",
          },
          fitTo: {
            mode: "width",
            value: CARD_WIDTH,
          },
        });

        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        return new Response(pngBuffer.buffer as ArrayBuffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});