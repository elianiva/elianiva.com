import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { allPosts } from "content-collections";
import { z } from "zod";
import { getPost, listPosts } from "~/features/content/lib/posts";
import { Heading } from "~/components/ui/heading";

export const getPosts = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({ limit: z.number().int().positive().optional() }).parse(data),
  )
  .handler(async ({ data }) => listPosts(allPosts, { limit: data?.limit }));

export const getPostBySlug = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.string().min(1).parse(data))
  .handler(async ({ data: slug }) => {
    const detail = getPost(allPosts, slug);
    if (!detail) throw notFound();

    const mdx = await renderServerComponent(
      <detail.mdx
        components={{
          h2: (props) => <Heading level={2} {...props} />,
          h3: (props) => <Heading level={3} {...props} />,
          h4: (props) => <Heading level={4} {...props} />,
          h5: (props) => <Heading level={5} {...props} />,
          h6: (props) => <Heading level={6} {...props} />,
        }}
      />,
    );

    return {
      ...detail.post,
      wordCount: detail.wordCount,
      readingTime: detail.readingTime,
      prevPost: detail.prevPost,
      nextPost: detail.nextPost,
      mdx,
    };
  });
