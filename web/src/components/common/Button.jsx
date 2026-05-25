export default function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const variants = {
    primary: 'bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-primary/30',
    secondary: 'bg-secondary hover:bg-blue-700 text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
  };
  return (
    <button
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
