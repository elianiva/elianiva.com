import { Config } from "effect"

export const GH_TOKEN = Config.redacted("GH_TOKEN")
export const LASTFM_API_KEY = Config.redacted("LASTFM_API_KEY")
export const NOTES_OWNER = Config.string("NOTES_OWNER").pipe(Config.withDefault("elianiva"))
export const NOTES_REPO = Config.string("NOTES_REPO").pipe(Config.withDefault("notes"))
export const NOTES_BRANCH = Config.string("NOTES_BRANCH").pipe(Config.withDefault("main"))
