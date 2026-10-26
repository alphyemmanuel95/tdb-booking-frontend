type SpinnerSize = 'sm' | 'md';

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  // 3px: border-2 looks too thin at this size and border-4 too heavy.
  md: 'h-6 w-6 border-[3px]',
};

interface SpinnerProps {
  label?: string;
  size?: SpinnerSize;
  /** Hide from assistive tech when a parent already announces the busy state. */
  decorative?: boolean;
}

export function Spinner({ label = 'Loading…', size = 'md', decorative = false }: SpinnerProps) {
  const circle = (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-current border-r-transparent motion-reduce:animate-none ${sizeClasses[size]}`}
    />
  );
  if (decorative) return circle;
  return (
    <div role="status" className="flex items-center gap-2 text-slate-700">
      {circle}
      <span className="text-sm">{label}</span>
    </div>
  );
}
