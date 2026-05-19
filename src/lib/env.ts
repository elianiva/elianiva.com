import { Config, Redacted } from "effect"

export const GH_TOKEN = Config.redacted("GH_TOKEN").pipe(Config.withDefault(Redacted.make("")))
export const LASTFM_API_KEY = Config.redacted("LASTFM_API_KEY").pipe(Config.withDefault(Redacted.make("")))
export const NOTES_OWNER = Config.string("NOTES_OWNER").pipe(Config.withDefault("elianiva"))
export const NOTES_REPO = Config.string("NOTES_REPO").pipe(Config.withDefault("notes"))
export const NOTES_BRANCH = Config.string("NOTES_BRANCH").pipe(Config.withDefault("main"))
