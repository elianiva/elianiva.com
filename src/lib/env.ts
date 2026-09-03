import { Config, Effect, Redacted } from "effect";

export const GH_TOKEN = Config.redacted("GH_TOKEN").pipe(Config.withDefault(Redacted.make("")));
export const LASTFM_API_KEY = Config.redacted("LASTFM_API_KEY").pipe(
  Config.withDefault(Redacted.make("")),
);

export const logMissingEnvWarnings = Effect.gen(function* () {
  const gh = Redacted.value(yield* GH_TOKEN);
  const fm = Redacted.value(yield* LASTFM_API_KEY);
  if (!gh) yield* Effect.logWarning("[env] GH_TOKEN empty — GitHub sections will be empty");
  if (!fm) yield* Effect.logWarning("[env] LASTFM_API_KEY empty — music data will be empty");
});
