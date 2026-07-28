import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { runtime } from "~/lib/effect";
import { Tokscale } from "./tokscale.service";
import { AiPage } from "~/features/ai/components/ai-page-body";

export const getAiUsageRsc = createServerFn({ method: "GET" }).handler(async () => {
  const data = await runtime.runPromise(
    Effect.gen(function* () {
      const svc = yield* Tokscale;
      return yield* svc.getUsage();
    }),
  );
  return renderServerComponent(<AiPage data={data} />);
});
