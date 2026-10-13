import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import * as DateTime from "effect/DateTime";
import { profile, utcOffsetLabel } from "~/data/profile";
import { currentRoles, pastRoles, place, engagement, yearRange } from "~/data/work-experience";
import { takes } from "~/data/takes";
import { getPostBySlug } from "~/features/posts/lib/posts";
import { LocalClock } from "./local-clock";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.18em] text-pink-950/65 md:pt-0.5";
const VALUE = "font-body text-sm md:text-base leading-relaxed text-pink-950/80";
const ROW = "grid gap-1 py-5 md:grid-cols-[9rem_1fr] md:gap-x-8";

/**
 * The claims from `~/data/takes`, each linked to the post that argues it. The
 * post supplies the date, so a claim is never dated by hand.
 */
function Takes() {
  return (
    <>
      <ul className="divide-y divide-pink-200/40">
        {takes.map((take) => {
          const post = getPostBySlug(take.post)?.post;
          return (
            <li
              key={take.post}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 first:pt-0 last:pb-0"
            >
              {post ? (
                <Link
                  to="/posts/$slug"
                  params={{ slug: post.slug }}
                  className="max-w-[52ch] text-pretty underline decoration-pink-300 decoration-dotted underline-offset-4 transition-colors hover:text-pink-600 hover:decoration-pink-500 hover:decoration-solid"
                >
                  {take.claim}
                </Link>
              ) : (
                <span className="max-w-[52ch] text-pretty">{take.claim}</span>
              )}
              {post && (
                <span className="font-mono text-xs text-pink-950/70">
                  {DateTime.format(DateTime.makeUnsafe(post.date), {
                    locale: "en-GB",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="pt-3 font-mono text-xs text-pink-950/70">
        Each one links to the post where I argue it.
      </p>
    </>
  );
}

/**
 * The at-a-glance block: the same facts the CV leads with, in the shape a
 * profile page uses. Roles come from `work`, so joining or leaving a company
 * updates "Currently" and "Previously" together.
 */
export function ProfileFacts() {
  return (
    <section aria-labelledby="facts-heading" className="relative with-box-underline px-2 md:px-8">
      <h2 id="facts-heading" className="sr-only">
        At a glance
      </h2>
      <dl className="divide-y divide-pink-200/50">
        <div className={ROW}>
          <dt className={LABEL}>Currently</dt>
          <dd className={VALUE}>
            {currentRoles().map((role, index) => (
              <Fragment key={role.company}>
                {index > 0 ? " and " : ""}
                <span className="font-semibold text-pink-950">{role.company}</span>
                {` — ${role.position}, ${place(role)} · ${engagement(role)}`}
              </Fragment>
            ))}
            <p className="pt-2 text-pink-950/60">
              Aviation operations software on Cloudflare Workers. Around that, merging pull requests
              into other people&rsquo;s projects and building tools to scratch my own itch.
            </p>
          </dd>
        </div>

        <div className={ROW}>
          <dt className={LABEL}>Previously</dt>
          <dd className={VALUE}>
            {pastRoles().map((role, index) => (
              <Fragment key={role.company}>
                {index > 0 && <span className="text-pink-200"> · </span>}
                <span className="text-pink-950">{role.company}</span>
                <span className="font-mono text-xs text-pink-950/70"> {yearRange(role)}</span>
              </Fragment>
            ))}
          </dd>
        </div>

        <div className={ROW}>
          <dt className={LABEL}>Based</dt>
          <dd className={VALUE}>
            {profile.location} · {utcOffsetLabel(profile.timeZone)} —{" "}
            <LocalClock className="font-mono text-pink-700" /> here, so I am probably awake right
            now.
          </dd>
        </div>

        <div className={ROW}>
          <dt className={LABEL}>Takes</dt>
          <dd className={VALUE}>
            <Takes />
          </dd>
        </div>
      </dl>
    </section>
  );
}
