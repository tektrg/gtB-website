import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET({ site }) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return rss({
    title: "Your Blog",
    description: "Fresh takes, no fluff",
    site,
    items: posts
      .filter((p) => new Date(p.data.pubDate) <= new Date())
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        link: `/blog/${p.slug ?? p.id}/`,
      })),
  });
}
