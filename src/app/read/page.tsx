'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Story } from '@/types/story';
import { 
  saveCurrentStory, 
  getCurrentStory, 
  saveStoryToHistory,
  generateStoryTitle 
} from '@/utils/storyManager';

const WORDS_PER_PAGE = 100; // Approximate words per page, will adjust based on screen size

export default function ReadPage() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTransition, setPageTransition] = useState<'previous' | 'active' | 'next'>('active');
  const generationAttempted = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const splitIntoPages = (text: string) => {
    if (!contentRef.current) return [text];

    const containerHeight = contentRef.current.clientHeight;
    const words = text.split(/\s+/);
    const pages: string[] = [];
    let currentPage = '';
    let tempDiv = document.createElement('div');
    tempDiv.style.cssText = window.getComputedStyle(contentRef.current).cssText;
    tempDiv.style.height = 'auto';
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.width = `${contentRef.current.clientWidth}px`;
    tempDiv.className = 'story-content';
    document.body.appendChild(tempDiv);

    for (const word of words) {
      tempDiv.textContent = (currentPage + ' ' + word).trim();
      
      if (tempDiv.offsetHeight > containerHeight && currentPage !== '') {
        pages.push(currentPage.trim());
        currentPage = word;
        tempDiv.textContent = word;
      } else {
        currentPage = (currentPage + ' ' + word).trim();
      }
    }

    if (currentPage) {
      pages.push(currentPage.trim());
    }

    document.body.removeChild(tempDiv);
    return pages;
  };

  useEffect(() => {
    if (story?.content && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        const newPages = splitIntoPages(story.content);
        setPages(newPages);
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [story?.content]);

  const generateStory = async () => {
    if (generationAttempted.current) return;
    generationAttempted.current = true;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const newStory: Story = {
        id: Date.now().toString(),
        title: generateStoryTitle(data.content),
        content: data.content,
        currentPage: 1,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const storyPages = splitIntoPages(data.content);
      setStory(newStory);
      setPages(storyPages);
      saveCurrentStory(newStory);
      saveStoryToHistory(newStory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story');
      generationAttempted.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isNewStory = searchParams.get('new') === 'true';
    const existingStory = getCurrentStory();

    if (isNewStory && !generationAttempted.current) {
      setStory(null);
      setPages([]);
      setCurrentPage(1);
      generateStory();
    } else if (existingStory?.content) {
      setStory(existingStory);
      setPages(splitIntoPages(existingStory.content));
      setCurrentPage(existingStory.currentPage || 1);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const turnPage = (direction: 'next' | 'prev') => {
    if (isLoading || !story) return;
    
    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, pages.length)
      : Math.max(currentPage - 1, 1);
    
    if (newPage !== currentPage) {
      setPageTransition(direction === 'next' ? 'next' : 'previous');
      
      // Wait for the exit animation
      setTimeout(() => {
        setCurrentPage(newPage);
        setPageTransition('active');
        
        if (story) {
          const updatedStory = { ...story, currentPage: newPage };
          setStory(updatedStory);
          saveCurrentStory(updatedStory);
        }
      }, 400); // Match the CSS transition duration
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full h-[calc(100vh-8rem)]">
        <div className="bg-[var(--card)] h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col justify-center">
              {!story && !isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Click "Start Reading" on the home page to begin a new story
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-blue-600 dark:text-blue-400">
                    Generating your story...
                  </div>
                </div>
              ) : error ? (
                <div className="text-red-500 dark:text-red-400 text-center">
                  {error}
                </div>
              ) : pages.length > 0 ? (
                <>
                  <div className="story-container">
                    <div 
                      ref={contentRef} 
                      className={`story-content ${pageTransition}`}
                    >
                      {pages[currentPage - 1]}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 sm:gap-8 py-4 bg-[var(--card)] border-t border-[var(--border)]">
                    <button
                      onClick={() => turnPage('prev')}
                      disabled={currentPage === 1 || isLoading || !story}
                      className={`p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] transition-colors 
                        ${currentPage === 1 || !story ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
                    </button>
                    
                    <div className="text-sm text-[var(--muted-foreground)]">
                      Page {currentPage} of {pages.length}
                    </div>

                    <button
                      onClick={() => turnPage('next')}
                      disabled={isLoading || !story || currentPage === pages.length}
                      className={`p-2 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] transition-colors 
                        ${!story || currentPage === pages.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Next page"
                    >
                      <ChevronRightIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
