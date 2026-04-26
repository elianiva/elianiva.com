import sites from '#/data/sites'

export function Footer() {
  const buildDate = new Date().toISOString()
  const commitHash = import.meta.env.VITE_COMMIT_HASH || 'dev'

  return (
    <footer className="site-footer mt-auto py-8 text-center text-sm text-pink-950/60">
      <div className="page-wrap">
        <p>
          Built with{' '}
          <a href="https://tanstack.com/start" className="text-pink-600 hover:text-pink-800">
            TanStack Start
          </a>{' '}
          &bull;{' '}
          <a href={sites.github} className="text-pink-600 hover:text-pink-800">
            Source
          </a>
        </p>
        <p className="mt-2 font-mono text-xs text-pink-950/40">
          {commitHash} &bull; {buildDate}
        </p>
      </div>
    </footer>
  )
}
