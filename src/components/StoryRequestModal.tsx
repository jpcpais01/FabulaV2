import { XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storyType: {
    id: string;
    prompt: string;
  } | null;
}

export default function StoryRequestModal({ isOpen, onClose, storyType }: Props) {
  const router = useRouter();
  const [request, setRequest] = useState('');

  if (!isOpen || !storyType) return null;

  const handleSubmit = () => {
    const finalPrompt = request 
      ? `${storyType.prompt} Additionally, ${request}`
      : storyType.prompt;
      
    router.push(`/read?new=true&type=${storyType.id}&prompt=${encodeURIComponent(finalPrompt)}`);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="p-6">
          <h2 className="text-lg font-light mb-6 pr-8">Any Final Requests?</h2>
          
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Optional: Add specific elements or themes you'd like to see in your story..."
            className="w-full h-32 p-3 bg-background border border-border rounded-lg resize-none text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-colors duration-200"
            >
              Begin Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
