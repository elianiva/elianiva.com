import satori from "@cf-wasm/satori";
import { Resvg } from "@cf-wasm/resvg";
import * as DateTime from "effect/DateTime";
import sites from "~/data/sites";

const domainName = new URL(sites.siteUrl).hostname;
const siteName = sites.siteName;

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type OgImageSpec =
  | { type: "default"; title: string; subtitle?: string }
  | { type: "post"; title: string; date: string; tags: string[]; description: string };

const COLORS = {
  bgStart: "#fff5f0",
  bgMid: "#fff9f5",
  bgEnd: "#fff0f5",
  frame: "#fbcfe8",
  border: "rgba(249, 168, 212, 0.5)",
  borderLight: "rgba(249, 168, 212, 0.3)",
  cardBg: "rgba(255, 255, 255, 0.6)",
  cardSolid: "#ffffff",
  textPrimary: "#431407",
  textSecondary: "#831843",
  textMuted: "#9d174d",
  textAccent: "#db2777",
  pink50: "rgba(253, 242, 248, 0.5)",
  pink100: "#fce7f3",
  pink200: "#fbcfe8",
  pink300: "#f9a8d4",
  pink400: "#f472b6",
  pink600: "#db2777",
  pink700: "#be185d",
  white: "#ffffff",
};

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  const dt = DateTime.makeUnsafe(date);
  return DateTime.format(dt, { locale: "en-GB", ...options });
}

function FrameBorder() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: COLORS.frame,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 2,
          background: COLORS.frame,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: COLORS.frame,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 2,
          background: COLORS.frame,
          display: "flex",
        }}
      />
    </>
  );
}

function Divider() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: 1,
        background: COLORS.border,
        marginTop: 16,
        marginBottom: 16,
      }}
    />
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(252, 231, 243, 0.4)",
        border: `1px solid ${COLORS.border}`,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 12,
        paddingRight: 12,
        fontFamily: "'IBM Plex Mono',monospace",
        fontSize: 14,
        color: COLORS.textPrimary,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      #{tag}
    </span>
  );
}

function LeftAccentBar() {
  const size = 10;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
        width: size,
        alignSelf: "stretch",
      }}
    >
      <div style={{ width: size, height: size, background: COLORS.pink50, display: "flex" }} />
      <div style={{ width: size, height: size, background: COLORS.pink100, display: "flex" }} />
    </div>
  );
}

function PostLayout(title: string, date: string, tags: string[], description: string) {
  const formattedDate = formatDate(date, {
    month: "long",
    day: "numeric",
    year: "numeric",
    weekday: "long",
  });
  const t = truncate(title, 85);
  const d = truncate(description, 155);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg,${COLORS.bgStart} 0%,${COLORS.bgMid} 50%,${COLORS.bgEnd} 100%)`,
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <FrameBorder />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          border: `1.5px solid ${COLORS.border}`,
          background: COLORS.cardBg,
          position: "relative",
          padding: 32,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 14,
              color: COLORS.textMuted,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            {domainName}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 14,
              color: COLORS.textMuted,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ opacity: 0.7 }}>/ post</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ opacity: 0.7 }}>{formattedDate}</span>
          </span>
        </div>
        <Divider />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: 0,
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <LeftAccentBar />
            <div
              style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}
            >
              <h1
                style={{
                  fontFamily: "'Google Sans',sans-serif",
                  fontSize: 54,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                  lineHeight: 1.08,
                  margin: 0,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </h1>
              <div style={{ position: "relative", height: 12, display: "flex", marginTop: 10 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 4,
                    height: 1,
                    background: "rgba(251,207,232,0.5)",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 4,
                    width: 90,
                    height: 2,
                    background: COLORS.pink200,
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 4,
                    width: 36,
                    height: 2,
                    background: COLORS.pink300,
                    display: "flex",
                  }}
                />
              </div>
            </div>
          </div>
          <p
            style={{
              fontFamily: "'Google Sans',sans-serif",
              fontSize: 20,
              color: COLORS.textMuted,
              lineHeight: 1.55,
              margin: 0,
              opacity: 0.84,
              maxWidth: "92%",
              marginTop: 20,
              marginLeft: 26,
            }}
          >
            {d}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 26 }}>
          {tags.slice(0, 5).map((tag) => (
            <TagBadge key={tag} tag={truncate(tag, 18)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DefaultLayout(title: string, subtitle: string) {
  const t = truncate(title, 56);
  const s = subtitle ? truncate(subtitle, 105) : "";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg,${COLORS.bgStart} 0%,${COLORS.bgMid} 50%,${COLORS.bgEnd} 100%)`,
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <FrameBorder />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          border: `1.5px solid ${COLORS.border}`,
          background: COLORS.cardBg,
          position: "relative",
          padding: 32,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 14,
              color: COLORS.textMuted,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            {domainName}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 14,
              color: COLORS.textMuted,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            {siteName}
          </span>
        </div>
        <Divider />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              position: "relative",
              paddingLeft: 16,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 8,
                bottom: 8,
                width: 10,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <div style={{ width: 10, height: 10, background: COLORS.pink50, display: "flex" }} />
              <div style={{ width: 10, height: 10, background: COLORS.pink100, display: "flex" }} />
            </div>
            <h1
              style={{
                fontFamily: "'Google Sans',sans-serif",
                fontSize: 60,
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1.06,
                margin: 0,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              {t}
            </h1>
            <div style={{ position: "relative", height: 10, display: "flex", marginTop: 10 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 4,
                  height: 1,
                  background: "rgba(251,207,232,0.5)",
                  display: "flex",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 4,
                  width: 90,
                  height: 2,
                  background: COLORS.pink200,
                  display: "flex",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 4,
                  width: 36,
                  height: 2,
                  background: COLORS.pink300,
                  display: "flex",
                }}
              />
            </div>
          </div>
          {s ? (
            <p
              style={{
                fontFamily: "'Google Sans',sans-serif",
                fontSize: 22,
                color: COLORS.textMuted,
                lineHeight: 1.5,
                margin: 0,
                opacity: 0.78,
                paddingLeft: 16,
                maxWidth: "84%",
                marginTop: 18,
              }}
            >
              {s}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

async function loadFonts(origin: string) {
  const [googleSansRes, ibmPlexRes] = await Promise.all([
    fetch(new URL("/assets/fonts/google-sans.ttf", origin)),
    fetch(new URL("/assets/fonts/ibm-plex-mono.ttf", origin)),
  ]);
  if (!googleSansRes.ok || !ibmPlexRes.ok)
    throw new Error(`Font fetch failed: ${googleSansRes.status} ${ibmPlexRes.status}`);
  const [googleSans, ibmPlex] = await Promise.all([
    googleSansRes.arrayBuffer(),
    ibmPlexRes.arrayBuffer(),
  ]);
  return [
    { name: "Google Sans", data: googleSans, weight: 400 as const, style: "normal" as const },
    { name: "Google Sans", data: googleSans, weight: 600 as const, style: "normal" as const },
    { name: "Google Sans", data: googleSans, weight: 700 as const, style: "normal" as const },
    { name: "Google Sans", data: googleSans, weight: 800 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: ibmPlex, weight: 400 as const, style: "normal" as const },
  ];
}

export async function renderOgImage(spec: OgImageSpec, origin: string): Promise<ArrayBuffer> {
  const fonts = await loadFonts(origin);
  const card =
    spec.type === "default"
      ? DefaultLayout(spec.title, spec.subtitle ?? "")
      : PostLayout(spec.title, spec.date, spec.tags, spec.description);
  const svg = await satori(card, { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, fonts });
  const resvg = new Resvg(svg, {
    font: { loadSystemFonts: false, defaultFontFamily: "Google Sans" },
    fitTo: { mode: "width", value: OG_IMAGE_WIDTH },
  });
  return resvg.render().asPng().buffer as ArrayBuffer;
}
