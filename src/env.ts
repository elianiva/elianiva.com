import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    SERVER_URL: z.url().optional(),
    GH_TOKEN: z.string().min(1).optional(),
    NOTES_REPO: z.string().min(1).optional(),
    NOTES_OWNER: z.string().min(1).optional(),
    NOTES_BRANCH: z.string().min(1).optional(),
  },
  clientPrefix: "VITE_",
  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
