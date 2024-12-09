'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllStories, saveCurrentStory, deleteStory, clearAllStories } from '@/utils/storyManager';
import type { Story } from '@/types/story';
import { TrashIcon } from '@heroicons/react/24/outline';

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
    e.preventDefault();
    e.stopPropagation();
    deleteStory(storyId);
    setStories(stories.filter(story => story.id !== storyId));
  };

  const handleClearAll = () => {
    clearAllStories();
    setStories([]);
  };

  if (stories.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-light mb-4 text-foreground">
            No Stories Yet
          </h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Your reading history will appear here once you start reading stories.
          </p>
          <Link
            href="/"
            className="inline-block bg-foreground text-background px-8 py-3 hover:opacity-90 transition-opacity"
          >
            Start Reading
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background px-4 py-12 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-lg font-light tracking-wide">Your Reading History</h1>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
              aria-label="Clear all history"
            >
              Clear All
            </button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => {
              const date = new Date(story.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <Link
                  key={story.id}
                  href="/read"
                  onClick={() => handleStoryClick(story)}
                  className="group block bg-background hover:translate-x-1 transition-all duration-500 ease-out relative"
                >
                  <div className="p-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-light text-foreground/80 group-hover:text-foreground transition-colors duration-500">
                        {story.title}
                      </h3>
                      <p className="text-xs text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-500">
                        {date}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, story.id)}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 p-2 hover:bg-muted/50"
                      aria-label="Delete story"
                    >
                      <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
