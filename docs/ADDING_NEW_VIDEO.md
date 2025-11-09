# Adding New Video Pages

This guide explains how to add new video summary pages to the GPT Breeze website.

## Overview

Video pages are automatically generated from Markdown files in the `src/content/videos/` directory. Each video has its own dedicated page with an embedded YouTube player and interactive timestamps.

## Prerequisites

- YouTube video URL and ID
- Video summary content with timestamps
- Basic understanding of Markdown formatting

## Step-by-Step Guide

### 1. Create Video Content File

Create a new Markdown file in `src/content/videos/` with the format `{video-title}.md`.

### 2. Add Frontmatter

Add YAML frontmatter at the top of your file:

```yaml
---
videoId: "YOUTUBE_VIDEO_ID_HERE"
title: "Your Video Title Here - GPT Breeze summarization"
description: "A detailed description of your video content for SEO and search engines."
publishDate: 2025-01-15
tags: ["tag1", "tag2", "tag3"]
draft: false
---
```

**Required Fields:**
- `videoId`: YouTube video ID (11 characters)
- `title`: Video title (will appear in page title and header)
- `draft`: Must be `false` for published content

**Optional Fields:**
- `description`: SEO description (auto-generated if not provided)
- `publishDate`: Publication date
- `tags`: Array of topic tags
- `thumbnail`: Custom thumbnail URL

### 3. Add Video Summary Content

After the frontmatter, add your video summary with the following structure:

#### TL;DR Section
```markdown
**TL;DR**
A concise 2-3 sentence summary of the video's main points and key takeaways.
```

#### Timestamped Summary
```markdown
**Timestamped Summary**

**Section Title**
- Key point with clickable timestamp [00:00](https://www.youtube.com/watch?v=VIDEO_ID&t=0s)
- Another important point [01:23](https://www.youtube.com/watch?v=VIDEO_ID&t=83s)
- Final insight [02:45](https://www.youtube.com/watch?v=VIDEO_ID&t=165s)
```

**Important Notes:**
- Use `**Bold Section Titles**` for main topics
- Each bullet point should start with `- `
- Timestamp format: `[MM:SS](https://www.youtube.com/watch?v=VIDEO_ID&t=SECONDSs)`
- Replace `VIDEO_ID` with your actual YouTube video ID
- Timestamps must be in seconds (not minutes:seconds format)

### 4. URL Format

Your video will be accessible at:
```
https://your-domain.com/video/YOUTUBE_VIDEO_ID
```

Example: `https://your-domain.com/video/w3zxMrwWrt0`

### 5. Testing

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to your video page to verify:
   - Page loads without errors
   - Video embeds correctly
   - Timestamp links work (should seek in embedded video, not open new tabs)
   - Page title and meta information are correct

### 6. Template File

For reference, see `src/content/videos/VIDEO-TEMPLATE.md` which contains a complete template structure.

## Example Complete File

```markdown
---
videoId: "dQw4w9WgXcQ"
title: "Never Gonna Give You Up - Rick Astley - GPT Breeze summarization"
description: "A comprehensive breakdown of Rick Astley's iconic hit song and its cultural impact."
publishDate: 2025-01-15
tags: ["music", "80s", "pop-culture", "analysis"]
draft: false
---

**TL;DR**
Rick Astley's "Never Gonna Give You Up" became a worldwide hit in 1987 and later evolved into one of the internet's most famous memes through the Rickrolling phenomenon.

**Timestamped Summary**

**Song Introduction and Background**
- Song released in 1987 as part of "Whenever You Need Somebody" album [00:00](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=0s)
- Written and produced by Stock Aitken Waterman [00:15](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=15s)

**Musical Analysis**
- Key features: bassline, drum machine, and Rick's distinctive baritone voice [00:45](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=45s)
- Song structure and chord progression [01:20](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=80s)

**Cultural Impact and Legacy**
- Initial chart success and global reach [02:10](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=130s)
- Evolution into Rickrolling meme phenomenon [02:45](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=165s)
```

## Common Issues and Solutions

### Page Shows 500 Error
- Ensure `draft: false` is set in frontmatter
- Check that `videoId` is exactly 11 characters
- Verify YAML syntax is correct (no trailing spaces, proper indentation)

### Timestamp Links Don't Work
- Ensure timestamp format is `t=SECONDSs` (with 's' at the end)
- Check that YouTube video ID matches in all timestamp URLs
- Verify links include the full YouTube URL format

### Video Doesn't Embed
- Confirm YouTube video ID is correct
- Check if video is public/unlisted (private videos won't embed)
- Ensure no ad blockers are blocking the embed

## Best Practices

1. **Content Quality**: Focus on valuable insights, not just transcription
2. **Timestamp Accuracy**: Double-check all timestamps match actual video moments
3. **SEO Optimization**: Use descriptive titles and descriptions
4. **Readability**: Use clear section titles and concise bullet points
5. **Consistency**: Follow the established formatting pattern

## File Naming Convention

Use kebab-case for file names:
- ✅ `marketing-success-without-ads.md`
- ✅ `rick-astley-analysis.md`
- ❌ `Marketing Success Without Ads.md`
- ❌ `video 1.md`

## Automation Tips

Consider creating a script or template to:
- Generate timestamp URLs automatically
- Validate frontmatter fields
- Check for broken YouTube links
- Ensure consistent formatting

For technical questions about the video page implementation, refer to the [YouTubeViewer component](../src/components/YouTubeViewer.astro) and [video page template](../src/pages/video/[videoId].astro).