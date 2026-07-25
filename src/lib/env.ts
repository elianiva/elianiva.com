import { Config, Redacted } from "effect";

export const GH_TOKEN = Config.redacted("GH_TOKEN").pipe(Config.withDefault(Redacted.make("")));
export const LASTFM_API_KEY = Config.redacted("LASTFM_API_KEY").pipe(
  Config.withDefault(Redacted.make("")),
);

