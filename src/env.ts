import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    GH_TOKEN: z.string().min(1).optional(),
    NOTES_REPO: z.string().min(1).optional(),
    NOTES_OWNER: z.string().min(1).optional(),
    NOTES_BRANCH: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
