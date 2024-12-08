'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllStories, saveCurrentStory, deleteStory } from '@/utils/storyManager';
import type { Story } from '@/types/story';
import { TrashIcon } from '@heroicons/react/24/outline';

const WORDS_PER_PAGE = 100;

export default function HistoryPage() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const savedStories = getAllStories().filter(story => story && story.content);
    setStories(savedStories);
  }, []);

  const handleStoryClick = (story: Story) => {
    saveCurrentStory(story);
  };

  const handleDelete = (e: React.MouseEvent, storyId: string) => {
    e.preventDefault(); // Prevent navigation to read page
    e.stopPropagation(); // Prevent event bubbling
    deleteStory(storyId);
    setStories(stories.filter(story => story.id !== storyId));
  };

  if (stories.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            No Stories Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your reading history will appear here once you start reading stories.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Reading
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Your Reading History
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => {
          const numPages = Math.ceil((story.content?.split(/\s+/).length || 0) / WORDS_PER_PAGE) || 1;

          return (
            <Link
              key={story.id}
              href="/read"
              onClick={() => handleStoryClick(story)}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow relative group"
            >
              <button
                onClick={(e) => handleDelete(e, story.id)}
                className="absolute top-4 right-4 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
                aria-label="Delete story"
              >
                <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </button>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white pr-12">
                {story.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {new Date(story.createdAt).toLocaleDateString()}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Page {story.currentPage || 1} of {numPages}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
