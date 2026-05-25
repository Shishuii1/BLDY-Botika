import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'No data', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
      {message && <p className="text-gray-500 mt-2 max-w-sm">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
