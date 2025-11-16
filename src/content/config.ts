import { defineCollection, z } from 'astro:content';

const videos = defineCollection({
  type: 'content',
  schema: z.object({
    videoId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  videos,
  blog,
};