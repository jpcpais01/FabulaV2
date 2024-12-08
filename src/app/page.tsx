import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Fabula
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your personal AI story companion. Create and explore unique tales crafted just for you.
        </p>
        
        <Link
          href="/read?new=true"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center mb-4 transition-colors"
        >
          Start Reading
        </Link>
        
        <Link
          href="/history"
          className="block w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
        >
          View History
        </Link>
      </div>
    </div>
  );
}
