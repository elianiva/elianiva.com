import { Config, Effect, Redacted } from "effect";

/**
 * Browser-safe credentials. Both are optional `VITE_`-prefixed build-time
 * values: `import.meta.env` inlines them into the client bundle, and an
 * absent key degrades to empty data in the services (same contract as the
 * old server runtime had — see `GitHubService.layer` / `LastFM.layer`).
 *
 * Note these are public once inlined, so only read-scoped tokens belong
 * here. The deployed site sets neither, and the sections render their
 * empty states.
 */
function viteEnv(name: string): string {
  const value = (import.meta.env?.[name] as string | undefined) ?? "";
  return value;
}

export const GH_TOKEN = Config.succeed(Redacted.make(viteEnv("VITE_GH_TOKEN")));
export const LASTFM_API_KEY = Config.succeed(Redacted.make(viteEnv("VITE_LASTFM_API_KEY")));

export const logMissingEnvWarnings = Effect.gen(function* () {
  const gh = Redacted.value(yield* GH_TOKEN);
  const fm = Redacted.value(yield* LASTFM_API_KEY);
  if (!gh) yield* Effect.logWarning("[env] VITE_GH_TOKEN empty — GitHub sections will be empty");
  if (!fm) yield* Effect.logWarning("[env] VITE_LASTFM_API_KEY empty — music data will be empty");
});
