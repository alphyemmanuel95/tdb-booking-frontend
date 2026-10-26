import type { HTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type BannerTone = 'success' | 'error' | 'info';

const toneClasses: Record<BannerTone, string> = {
  success: 'border-green-300 bg-green-50 text-green-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-dashed border-gold-300 bg-cream-100 text-stone-700',
};

const toneIcons: Record<BannerTone, IconName> = {
  success: 'checkCircle',
  error: 'alert',
  info: 'info',
};

const iconClasses: Record<BannerTone, string> = {
  success: 'text-green-700',
  error: 'text-red-700',
  info: 'text-gold-800',
};

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone: BannerTone;
  title?: ReactNode;
}

/**
 * Message box with a tone icon, so the meaning never relies on colour alone. It sets no live
 * region role: callers add `role="alert"`/`"status"` (or wrap it in a persistent live region).
 */
export function Banner({ tone, title, className = '', children, ...props }: BannerProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${toneClasses[tone]} ${className}`}
      {...props}
    >
      <Icon name={toneIcons[tone]} className={`mt-0.5 size-5 shrink-0 ${iconClasses[tone]}`} />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="text-base font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
