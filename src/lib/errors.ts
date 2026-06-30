import { Data } from "effect";

export class EnvVarMissing extends Data.TaggedError("EnvVarMissing")<{
  readonly key: string;
}> {}

export class GitHubError extends Data.TaggedError("GitHubError")<{
  readonly message: string;
}> {}

export class LastFMError extends Data.TaggedError("LastFMError")<{
  readonly message: string;
  readonly status?: number;
}> {}

export class TokscaleError extends Data.TaggedError("TokscaleError")<{
  readonly message: string;
}> {}

export class NotesError extends Data.TaggedError("NotesError")<{
  readonly message: string;
}> {}

export class KvCacheError extends Data.TaggedError("KvCacheError")<{
  readonly key: string;
  readonly cause: string;
}> {}
