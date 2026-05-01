/**
 * Content loader abstraction for hybrid dev/prod data sources.
 *
 * In development, attempts the dev loader first for fast feedback (local FS).
 * Falls back to the production loader if dev source is unavailable.
 * In production, always uses the prod loader.
 *
 * Usage:
 *   const loadNotes = createContentLoader({
 *     dev: loadNotesFromLocalFS,
 *     prod: loadNotesFromGithub,
 *   });
 */
export async function createContentLoader<T>(loaders: {
  dev?: () => Promise<T[]>;
  prod: () => Promise<T[]>;
}): Promise<T[]> {
  if (import.meta.env.DEV && loaders.dev) {
    try {
      const result = await loaders.dev();
      if (result.length > 0) return result;
    } catch {
      // fall through to prod loader
    }
  }
  return loaders.prod();
}
