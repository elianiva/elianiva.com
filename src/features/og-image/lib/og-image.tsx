import { fontFromUrl } from "takumi-js/helpers";
import sites from "~/data/sites";

const domainName = new URL(sites.siteUrl).hostname;
const siteName = sites.siteName;

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type OgImageSpec =
  | { type: "default"; title: string; subtitle?: string }
  | { type: "post"; title: string; date: string; tags: string[]; description: string };

const DISPLAY_FONT = "'Google Sans',sans-serif";
const MONO_FONT = "'IBM Plex Mono',monospace";

/**
 * Brand fonts, pinned to a commit via jsDelivr (immutable, cacheable).
 *
 * Why not self-hosted /assets/fonts? The worker cannot subrequest its own
 * origin — edge returns HTTP 522 (verified in prod). External egress works.
 * Fonts change ~never; bump FONTS_REF when they do.
 */
const FONTS_REF = "e8d6f52b57e60184a754d434a1f74f589d8a3190";
const FONTS_BASE = `https://cdn.jsdelivr.net/gh/elianiva/elianiva.com@${FONTS_REF}/public/assets/fonts`;

export function ogFonts() {
  return [
    fontFromUrl(`${FONTS_BASE}/google-sans.ttf`),
    fontFromUrl(`${FONTS_BASE}/ibm-plex-mono.ttf`),
  ];
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatDate(date: string) {
  // oxlint-disable-next-line efx-no-native-date
  const parsed = new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

interface CardContent {
  eyebrowRight: string;
  title: string;
  body: string;
  tags: string[];
}

function toContent(spec: OgImageSpec): CardContent {
  if (spec.type === "post") {
    return {
      eyebrowRight: `/ post · ${formatDate(spec.date)}`,
      title: truncate(spec.title, 85),
      body: truncate(spec.description, 155),
      tags: spec.tags.slice(0, 5).map((tag) => `#${truncate(tag, 18)}`),
    };
  }
  return {
    eyebrowRight: siteName,
    title: truncate(spec.title, 56),
    body: spec.subtitle ? truncate(spec.subtitle, 105) : "",
    tags: [],
  };
}

// OG card — light minimal, centered, editorial rules.

function PaperDesign({ content }: { content: CardContent }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#faf7f2",
        padding: 56,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "rgba(120,53,15,0.25)" }} />
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 15,
            color: "#92400e",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
          }}
        >
          {domainName}
        </span>
        <div style={{ flex: 1, height: 1, backgroundColor: "rgba(120,53,15,0.25)" }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 15,
            color: "#db2777",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {content.eyebrowRight}
        </span>
        <h1
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 64,
            fontWeight: 700,
            color: "#431407",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          {content.title}
        </h1>
        <div style={{ display: "flex", gap: 8, marginTop: 28, marginBottom: 28 }}>
          <div style={{ width: 56, height: 3, backgroundColor: "#f9a8d4" }} />
          <div style={{ width: 56, height: 3, backgroundColor: "#db2777" }} />
          <div style={{ width: 56, height: 3, backgroundColor: "#f9a8d4" }} />
        </div>
        {content.body ? (
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 22,
              color: "#78350f",
              lineHeight: 1.55,
              margin: 0,
              opacity: 0.8,
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            {content.body}
          </p>
        ) : null}
      </div>

      {content.tags.length > 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {content.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: MONO_FONT,
                fontSize: 14,
                color: "#92400e",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function OgImage({ spec }: { spec: OgImageSpec }) {
  const content = toContent(spec);
  return <PaperDesign content={content} />;
}
