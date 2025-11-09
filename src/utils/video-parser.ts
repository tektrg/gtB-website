import type { VideoSummary } from "@/types/youtube";

export function extractVideoMetadata(content: string): { videoId: string; title: string } {
  const lines = content.trim().split('\n').map(line => line.trim());

  // Extract videoId from frontmatter or first YouTube link
  let videoId = '';
  const videoIdMatch = content.match(/videoId:\s*["']([^"']+)["']/);
  if (videoIdMatch) {
    videoId = videoIdMatch[1];
  } else {
    // Fallback: extract from first YouTube link
    const linkMatch = content.match(/https:\/\/www\.youtube\.com\/watch\?v=([^&\s]+)/);
    if (linkMatch) {
      videoId = linkMatch[1];
    }
  }

  // Extract title from first bold line (excluding common summary headers)
  let title = 'Untitled Video';
  const summaryHeaders = ['**TL;DR**', '**Timestamped Summary**', '**Summary**'];

  for (const line of lines) {
    const titleMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (titleMatch && !summaryHeaders.includes(titleMatch[0])) {
      title = titleMatch[1];
      break;
    }
  }

  return { videoId, title };
}

// Legacy function for backward compatibility
export function parseVideoMarkdown(content: string, videoId: string): VideoSummary {
  const { title } = extractVideoMetadata(content);

  return {
    videoId,
    title,
    summary: title,
    sections: [] // Will use raw markdown content instead
  };
}

export function timeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
}

export function secondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}