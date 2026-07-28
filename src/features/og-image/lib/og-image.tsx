import satori from "@cf-wasm/satori";
import { Resvg } from "@cf-wasm/resvg";
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
        }}
      />
    </>
  );
}

function CornerSquares() {
  const size = 24;
  const offset = -size / 2;
  const style = {
    position: "absolute" as const,
    width: size,
    height: size,
    border: `1.5px solid ${COLORS.border}`,
    background: COLORS.white,
  };

  return (
    <>
      <div style={{ ...style, left: offset, top: offset }} />
      <div style={{ ...style, left: offset, bottom: offset }} />
      <div style={{ ...style, right: offset, top: offset }} />
      <div style={{ ...style, right: offset, bottom: offset }} />
    </>
  );
}

function HeadingAccent({ width }: { width: number }) {
  const chWidth = width * 0.012; // approximate ch width at this scale
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        bottom: -8,
        left: 0,
        right: 0,
        height: 1,
        background: COLORS.border,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: chWidth * 5,
          height: 2,
          background: COLORS.pink200,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: chWidth * 2,
          height: 2,
          background: COLORS.pink300,
        }}
      />
    </div>
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
      <div style={{ width: size, height: size, background: COLORS.pink50 }} />
      <div style={{ width: size, height: size, background: COLORS.pink100 }} />
    </div>
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

function PostLayout(title: string, date: string, tags: string[], description: string) {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
    weekday: "long",
  });

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
          padding: 40,
        }}
      >
        <CornerSquares />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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

        {/* Title with accent */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingTop: 8,
            paddingBottom: 8,
            position: "relative",
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
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h1>
              <HeadingAccent width={OG_IMAGE_WIDTH} />
            </div>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Google Sans',sans-serif",
            fontSize: 22,
            color: COLORS.textMuted,
            lineHeight: 1.5,
            margin: 0,
            opacity: 0.85,
            maxWidth: "92%",
            marginTop: 24,
          }}
        >
          {description}
        </p>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        {/* Footer branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: 20,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: COLORS.textMuted,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.5,
            }}
          >
            {siteName}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: COLORS.textMuted,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.4,
            }}
          >
            made with actual care
          </span>
        </div>
      </div>
    </div>
  );
}

function DefaultLayout(title: string, subtitle: string) {
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
          padding: 40,
        }}
      >
        <CornerSquares />

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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

        {/* Centered content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            textAlign: "center",
            gap: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              position: "relative",
            }}
          >
            <h1
              style={{
                fontFamily: "'Google Sans',sans-serif",
                fontSize: 68,
                fontWeight: 600,
                color: COLORS.textPrimary,
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>
            <div
              style={{
                display: "flex",
                position: "relative",
                width: "60%",
                height: 1,
                background: COLORS.border,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "20%",
                  bottom: 0,
                  width: "30%",
                  height: 2,
                  background: COLORS.pink200,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "20%",
                  bottom: 0,
                  width: "12%",
                  height: 2,
                  background: COLORS.pink300,
                }}
              />
            </div>
          </div>

          {subtitle ? (
            <p
              style={{
                fontFamily: "'Google Sans',sans-serif",
                fontSize: 26,
                color: COLORS.textMuted,
                lineHeight: 1.4,
                margin: 0,
                opacity: 0.8,
                maxWidth: "75%",
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: 16,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12,
              color: COLORS.textMuted,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.4,
            }}
          >
            made with actual care (and probably too much coffee)
          </span>
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
  const [googleSans, ibmPlex] = await Promise.all([
    googleSansRes.arrayBuffer(),
    ibmPlexRes.arrayBuffer(),
  ]);

  return [
    { name: "Google Sans", data: googleSans, weight: 700 as const, style: "normal" as const },
    { name: "Google Sans", data: googleSans, weight: 800 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: ibmPlex, weight: 400 as const, style: "normal" as const },
  ];
}

/**
 * Render an OG Image spec to PNG bytes. The route adapter supplies `origin`
 * so fonts can be fetched from the same deployment.
 */
export async function renderOgImage(spec: OgImageSpec, origin: string): Promise<ArrayBuffer> {
  const fonts = await loadFonts(origin);
  const card =
    spec.type === "default"
      ? DefaultLayout(spec.title, spec.subtitle ?? "")
      : PostLayout(spec.title, spec.date, spec.tags, spec.description);

  const svg = await satori(card, {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: false,
      defaultFontFamily: "Google Sans",
    },
    fitTo: {
      mode: "width",
      value: OG_IMAGE_WIDTH,
    },
  });

  return resvg.render().asPng().buffer as ArrayBuffer;
}
