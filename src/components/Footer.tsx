export function Footer() {
  const buildDate = new Date().toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  })

  const commitHash =
    (import.meta.env.VITE_COMMIT_HASH as string | undefined)?.slice(0, 7) ?? "dev"

  return (
    <footer className="relative mx-auto max-w-[1080px] px-4 py-10 border-x border-pink-200/50 with-box-upperline">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-light! font-body text-pink-950/50 leading-relaxed">
          made with actual care (and probably too much coffee)<br />
        </p>

        <div className="w-24 h-px bg-pink-200/50"></div>

        <p className="text-[11px] font-mono text-pink-950/40 uppercase tracking-[0.15em]">
          tanstack start · react · tailwind
        </p>

        <p className="text-xs font-mono text-pink-950/30 lowercase">
          last updated {buildDate} · {commitHash}
        </p>
      </div>
    </footer>
  )
}
