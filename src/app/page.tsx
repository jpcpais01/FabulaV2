'use client';

import { useState } from 'react';
import StoryTypeModal from '@/components/StoryTypeModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-12 px-6">
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-light tracking-wide">
            Welcome to Fabula
          </h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            Your personal AI story companion. Create and explore unique tales crafted just for you.
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group inline-block bg-foreground text-background hover:bg-foreground/90 font-normal py-2 px-6 rounded-lg text-center transition-all duration-200 ease-out min-w-[200px]"
          >
            <span className="inline-flex items-center">
              Begin Your Story
              <svg className="w-4 h-4 ml-2 transition-transform duration-200 ease-out transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      <StoryTypeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
