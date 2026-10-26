import { useI18n } from '@/i18n/useI18n';

type SpinnerSize = 'sm' | 'md';

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  // 3px: border-2 looks too thin at this size and border-4 too heavy.
  md: 'h-6 w-6 border-[3px]',
};

interface SpinnerProps {
  /** Defaults to "Loading…" in the current language. */
  label?: string;
  size?: SpinnerSize;
  /** Hide from assistive tech when a parent already announces the busy state. */
  decorative?: boolean;
}

export function Spinner({ label, size = 'md', decorative = false }: SpinnerProps) {
  const { t } = useI18n();
  const circle = (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-current border-r-transparent motion-reduce:animate-none ${sizeClasses[size]}`}
    />
  );
  if (decorative) return circle;
  return (
    <div role="status" className="flex items-center gap-3 py-2 text-stone-700">
      <span className="flex text-brand-700">{circle}</span>
      <span className="text-sm">{label ?? t.common.loading}</span>
    </div>
  );
}
