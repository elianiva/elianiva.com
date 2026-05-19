// Hybrid dev/prod loader: try dev first, fall back to prod
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
