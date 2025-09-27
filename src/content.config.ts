import { defineCollection, z } from "astro:content";

export const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().min(40),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    slug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    canonicalURL: z.string().url().optional(),
  }),
});

export const guide = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().min(40),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    slug: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    canonicalURL: z.string().url().optional(),
  }),
});

export const collections = { blog, guide };
