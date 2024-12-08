import { Story } from '@/types/story';

const CURRENT_STORY_KEY = 'fabula_current_story';
const STORIES_KEY = 'fabula_stories';

export const saveCurrentStory = (story: Story) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_STORY_KEY, JSON.stringify(story));
};

export const getCurrentStory = (): Story | null => {
  if (typeof window === 'undefined') return null;
  const story = localStorage.getItem(CURRENT_STORY_KEY);
  return story ? JSON.parse(story) : null;
};

export const clearCurrentStory = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_STORY_KEY);
};

export const saveStoryToHistory = (story: Story) => {
  if (typeof window === 'undefined') return;
  const stories = getAllStories();
  stories.unshift(story); // Add new story to the beginning
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
};

export const getAllStories = (): Story[] => {
  if (typeof window === 'undefined') return [];
  const stories = localStorage.getItem(STORIES_KEY);
  return stories ? JSON.parse(stories) : [];
};

export const generateStoryTitle = (content: string): string => {
  // Extract first few words to create a title
  const words = content.split(' ').slice(0, 5);
  return words.join(' ') + '...';
};

export function deleteStory(storyId: string) {
  const stories = getAllStories();
  const updatedStories = stories.filter(story => story.id !== storyId);
  localStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));
}
