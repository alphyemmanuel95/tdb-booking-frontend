import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Shows a decorative step number on the card's top edge; the heading inside names the step. */
  step?: number;
}

/** White surface for a page section, with an optional numbered-step badge. */
export function Card({ step, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-gold-200 bg-white p-5 shadow-sm sm:p-6 ${
        step === undefined ? '' : 'pt-7 sm:pt-8'
      } ${className}`}
      {...props}
    >
      {step !== undefined && (
        <span
          aria-hidden="true"
          className="absolute -top-4 left-5 flex size-8 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white ring-4 ring-cream-50 sm:left-6"
        >
          {step}
        </span>
      )}
      {children}
    </div>
  );
}
