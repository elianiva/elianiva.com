interface Pattern {
  pattern: string;
  color: string;
}

interface RegexHighlighterProps {
  patterns: Pattern[];
  text: string;
}

export function RegexHighlighter({ patterns, text }: RegexHighlighterProps) {
  const lines = text.trim().split("\n");

  return (
    <div className="my-6 overflow-x-auto border border-pink-200/50 bg-pink-50/30">
      <pre className="p-4 font-mono text-sm leading-relaxed">
        {lines.map((line, lineIdx) => {
          const segments: { text: string; color: string | null }[] = [];
          let remaining = line;

          while (remaining.length > 0) {
            let bestMatch: { start: number; end: number; color: string } | null = null;

            for (const { pattern, color } of patterns) {
              const regex = new RegExp(pattern, "g");
              regex.lastIndex = 0;
              const match = regex.exec(remaining);
              if (match && match.index === 0) {
                bestMatch = { start: match.index, end: match.index + match[0].length, color };
                break;
              }
            }

            if (bestMatch) {
              segments.push({ text: remaining.slice(0, bestMatch.end), color: bestMatch.color });
              remaining = remaining.slice(bestMatch.end);
            } else {
              segments.push({ text: remaining[0], color: null });
              remaining = remaining.slice(1);
            }
          }

          return (
            <div key={lineIdx}>
              {segments.map((seg, segIdx) =>
                seg.color ? (
                  <span key={segIdx} style={{ color: seg.color }}>
                    {seg.text}
                  </span>
                ) : (
                  <span key={segIdx} className="text-pink-950/80">
                    {seg.text}
                  </span>
                )
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
