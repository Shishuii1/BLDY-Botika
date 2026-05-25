export default function Loader({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex justify-center items-center p-8">
      <span className={`${sizes[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin inline-block`} />
    </div>
  );
}
