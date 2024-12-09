import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  MapIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BookOpenIcon,
  FaceSmileIcon,
  RocketLaunchIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import StoryRequestModal from './StoryRequestModal';

interface StoryType {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: React.ElementType;
}

const storyTypes: StoryType[] = [
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Epic journeys and thrilling quests filled with discovery.',
    prompt: 'Write an adventurous story with elements of exploration, challenge, and discovery. Include vivid descriptions and engaging action sequences. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: MapIcon
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magical worlds with mythical creatures and enchanting tales.',
    prompt: 'Create a fantasy story with magical elements, unique creatures, and wonder. Include rich world-building and mystical elements. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: SparklesIcon
  },
  {
    id: 'mystery',
    name: 'Mystery',
    description: 'Intriguing puzzles and suspenseful investigations.',
    prompt: 'Write a mysterious story with clever clues, suspense, and an engaging puzzle to solve. Focus on building tension and curiosity. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: MagnifyingGlassIcon
  },
  {
    id: 'romance',
    name: 'Romance',
    description: 'Tales of love, relationships, and emotional journeys.',
    prompt: 'Create a heartwarming romance story that explores relationships and emotions. Focus on character development and meaningful connections. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: HeartIcon
  },
  {
    id: 'historical',
    name: 'Historical',
    description: 'Stories set in fascinating periods of history.',
    prompt: 'Write a story set in a historical period, weaving in authentic details and events. Create an immersive historical atmosphere while telling a compelling tale. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: BookOpenIcon
  },
  {
    id: 'comedy',
    name: 'Comedy',
    description: 'Humorous tales filled with wit and entertainment.',
    prompt: 'Create a lighthearted, humorous story with clever wit and entertaining situations. Include fun dialogue and amusing scenarios. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: FaceSmileIcon
  },
  {
    id: 'scifi',
    name: 'Sci-Fi',
    description: 'Futuristic tales of technology and space exploration.',
    prompt: 'Write a science fiction story with advanced technology, space exploration, or futuristic concepts. Include innovative ideas and thought-provoking scenarios. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: RocketLaunchIcon
  },
  {
    id: 'fable',
    name: 'Fable',
    description: 'Timeless tales with morals and life lessons.',
    prompt: 'Create a fable-like story with memorable characters and a meaningful moral lesson. Include creative storytelling and universal wisdom. This story must be completely unique, have completely unique names and locations, and unfold in a completely unique way. This is of utmost importance!',
    icon: StarIcon
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryTypeModal({ isOpen, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<StoryType | null>(null);

  if (!isOpen) return null;

  const handleTypeSelect = (storyType: StoryType) => {
    setSelectedType(storyType);
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="p-6">
            <h2 className="text-lg font-light mb-6 pr-8">Choose Your Story Type</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {storyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className="group text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <type.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <h3 className="text-base font-light group-hover:text-foreground transition-colors">
                      {type.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors line-clamp-2">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StoryRequestModal 
        isOpen={selectedType !== null}
        onClose={() => setSelectedType(null)}
        storyType={selectedType}
      />
    </>
  );
}
