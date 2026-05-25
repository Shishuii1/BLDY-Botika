import React from 'react';

const Input = React.forwardRef(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <input
          ref={ref}
          {...props}
          className={`
            w-full px-4 py-3 rounded-xl border
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${className}
          `}
        />

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;