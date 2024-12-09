'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllStories, saveCurrentStory, deleteStory, clearAllStories } from '@/utils/storyManager';
import type { Story } from '@/types/story';
import { 
  TrashIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function HistoryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

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
    setStoryToDelete(storyId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (storyToDelete) {
      deleteStory(storyToDelete);
      setStories(stories.filter(story => story.id !== storyToDelete));
      setShowDeleteModal(false);
      setStoryToDelete(null);
    }
  };

  const handleClearAll = () => {
    setShowClearAllModal(true);
  };

  const confirmClearAll = () => {
    clearAllStories();
    setStories([]);
    setShowClearAllModal(false);
  };

  const getPreviewText = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  const filteredStories = stories
    .filter(story => 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (story.type && story.type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const DeleteModal = ({ isStory = true }) => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 text-foreground mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
        </div>
        <p className="text-muted-foreground mb-6">
          {isStory 
            ? "Are you sure you want to delete this story? This action cannot be undone."
            : "Are you sure you want to clear all stories? This action cannot be undone."}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => isStory ? setShowDeleteModal(false) : setShowClearAllModal(false)}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isStory ? confirmDelete : confirmClearAll}
            className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 transition-colors rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (stories.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-light mb-4 text-foreground">
            No Stories Yet
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your reading history will appear here once you start reading stories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background px-4 py-12 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-8">
            <h1 className="text-lg font-light tracking-wide">Your Reading History</h1>
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full md:w-64 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="bg-muted/50 border border-border rounded-md text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 rounded-md"
                  aria-label="Clear all history"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => {
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
                  className="group block bg-muted/30 rounded-lg hover:translate-y-[-2px] transition-all duration-300 ease-out relative overflow-hidden border border-border/50 hover:border-border"
                >
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-medium text-foreground group-hover:text-foreground transition-colors duration-300">
                          {story.title}
                        </h3>
                        <button
                          onClick={(e) => handleDelete(e, story.id)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 hover:bg-muted/50 rounded-full"
                          aria-label="Delete story"
                        >
                          <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </button>
                      </div>
                      {story.type && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                          {story.type}
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {getPreviewText(story.content)}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground space-x-4">
                        <span className="flex items-center space-x-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{date}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {showDeleteModal && <DeleteModal />}
      {showClearAllModal && <DeleteModal isStory={false} />}
    </div>
  );
}
