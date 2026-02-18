import { defineCollection, z } from "astro:content";

const videos = defineCollection({
  type: "content",
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
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    // Optional: use when you update a post significantly
    updatedDate: z.date().optional(),

    // AUTONOMUS metadata (used for strict de-dup + rotation)
    topicId: z.string().optional(),

    author: z.string().optional(),
    tags: z.array(z.string()).optional(),

    // Optional: override canonical when republishing / cross-posting
    canonicalURL: z.string().url().optional(),

    // Optional: conversion-focused FAQ at the end of each post
    faq: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        })
      )
      .optional(),
    draft: z.boolean().default(false),
  }),
});

// Guides live under src/content/guide and are rendered by /guide routes.
// NOTE: Pages already use getCollection('guide') so this collection must exist.
const guide = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),

    // AUTONOMUS metadata
    topicId: z.string().optional(),

    tags: z.array(z.string()).optional(),
    canonicalURL: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  videos,
  blog,
  guide,
};
