export default function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}
