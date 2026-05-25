import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message = 'Failed to load', onRetry }) {
  return (
    <div className="flex flex-col items-center py-12">
      <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
      <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  );
}
