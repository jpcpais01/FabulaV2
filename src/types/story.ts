export interface StoryPage {
  content: string;
  pageNumber: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  currentPage: number;
  createdAt: string;
  lastModified: string;
}

export interface StoryGenerationResponse {
  content: string;
  error?: string;
}
