'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { Story } from '@/types/story';
import { 
  saveCurrentStory, 
  getCurrentStory, 
  saveStoryToHistory,
  generateStoryTitle,
  updateStoryInHistory,
  clearCurrentStory
} from '@/utils/storyManager';

export default function ReadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ReadPageContent />
    </Suspense>
  );
}

function ReadPageContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const generationAttempted = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const splitIntoPages = (text: string) => {
    if (!contentRef.current) return [text];

    const containerHeight = contentRef.current.clientHeight;
    const containerWidth = contentRef.current.clientWidth;
    
    // Create a temporary div with the same styling
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = window.getComputedStyle(contentRef.current).cssText;
    tempDiv.style.height = 'auto';
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.width = `${containerWidth}px`;
    tempDiv.style.columnCount = '1'; // Ensure single column for accurate height calculation
    tempDiv.className = 'story-content';
    document.body.appendChild(tempDiv);

    // Split text into sentences
    const sentences = text.split(/(?<=\.|\?|\!)\s+/).filter(Boolean);
    const pages: string[] = [];
    let currentPage = '';

    for (const sentence of sentences) {
      // Add sentence to temp div
      tempDiv.textContent = currentPage + (currentPage ? ' ' : '') + sentence;
      const newHeight = tempDiv.offsetHeight;

      if (newHeight > containerHeight && currentPage !== '') {
        // Current sentence would overflow, start new page
        pages.push(currentPage);
        currentPage = sentence;
      } else {
        // Sentence fits, add it to current page
        currentPage = tempDiv.textContent;
      }
    }

    // Add the last page if there's content
    if (currentPage) {
      pages.push(currentPage);
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
      setCurrentPage(1); // Reset to page 1 when generating new story
      clearCurrentStory(); // Clear any existing story from localStorage

      const storyType = searchParams.get('type');
      const prompt = searchParams.get('prompt');
      const title = searchParams.get('title');

      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: storyType,
          prompt: prompt,
          title: title
        })
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
        title: title || generateStoryTitle(data.content),
        content: data.content,
        currentPage: 1, // Ensure new story starts at page 1
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        type: storyType || 'general'
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

  const continueStory = async () => {
    if (!story || isContinuing) return;

    try {
      setIsContinuing(true);
      setError(null);

      // Get last 1000 words (roughly 1500 tokens) to stay well within context window
      const words = story.content.split(/\s+/);
      const contextWindow = words.slice(-1000).join(' ');

      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: contextWindow
        })
      });

      if (!response.ok) {
        throw new Error('Failed to continue story');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update the existing story with new content
      const updatedStory: Story = {
        ...story,
        content: story.content + '\n\n' + data.content,
        lastModified: new Date().toISOString(),
      };

      const storyPages = splitIntoPages(updatedStory.content);
      setStory(updatedStory);
      setPages(storyPages);
      // Stay on current page, don't jump to the end
      saveCurrentStory(updatedStory);
      updateStoryInHistory(updatedStory); // Update instead of save new
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue story');
    } finally {
      setIsContinuing(false);
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
      // Only set currentPage from existingStory if we're not generating a new story
      if (!isNewStory) {
        setCurrentPage(existingStory.currentPage || 1);
      }
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNavigation = (direction: 'next' | 'prev' | 'continue') => {
    if (isLoading || isContinuing || !story) return;
    
    if (direction === 'continue') {
      continueStory();
      return;
    }

    const newPage = direction === 'next' 
      ? Math.min(currentPage + 1, pages.length)
      : Math.max(currentPage - 1, 1);
    
    if (newPage !== currentPage) {
      setSlideDirection(direction === 'next' ? 'left' : 'right');
      
      setTimeout(() => {
        setCurrentPage(newPage);
        setSlideDirection(null);
        
        if (story) {
          const updatedStory = { ...story, currentPage: newPage };
          setStory(updatedStory);
          saveCurrentStory(updatedStory);
        }
      }, 300);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full h-[calc(100vh-8rem)]">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col justify-center">
              {!story && !isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground text-center px-4">
                    Click &quot;Start Reading&quot; on the home page to begin a new story
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-foreground/80">
                    Generating your story...
                  </div>
                </div>
              ) : error ? (
                <div className="text-xs text-destructive text-center px-4">
                  {error}
                </div>
              ) : pages.length > 0 ? (
                <>
                  <div className="story-container">
                    <div 
                      ref={contentRef} 
                      className={`story-content ${slideDirection ? `slide-${slideDirection}` : ''}`}
                    >
                      {pages[currentPage - 1]}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-8 sm:gap-12 py-4 bg-background">
                    <button
                      onClick={() => handleNavigation('prev')}
                      disabled={currentPage === 1 || isLoading || !story}
                      className={`p-3 hover:bg-muted/50 transition-colors duration-200 rounded-full ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div className="text-sm font-light tracking-wider">
                      {currentPage}/{pages.length}
                    </div>
                    <button
                      onClick={() => handleNavigation(currentPage === pages.length ? 'continue' : 'next')}
                      disabled={isLoading || isContinuing || !story}
                      className={`p-3 hover:bg-muted/50 transition-colors duration-200 rounded-full ${
                        (isLoading || isContinuing) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label={currentPage === pages.length ? "Continue story" : "Next page"}
                    >
                      {currentPage === pages.length ? (
                        <SparklesIcon className={`h-6 w-6 ${isContinuing ? 'animate-pulse' : ''}`} />
                      ) : (
                        <ChevronRightIcon className="h-6 w-6" />
                      )}
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
