export interface VideoSummarySection {
  text: string;
  timestamp: number;
  formattedTime: string;
  youtubeUrl: string;
}

export interface VideoSummary {
  videoId: string;
  title: string;
  summary: string;
  sections: VideoSummarySection[];
}