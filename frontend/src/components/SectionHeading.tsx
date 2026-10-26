import type { HTMLAttributes } from 'react';

/** Second-level heading for a page section or card, in the shared type scale. */
export function SectionHeading({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-lg font-semibold text-stone-900 sm:text-xl ${className}`} {...props}>
      {children}
    </h2>
  );
}
