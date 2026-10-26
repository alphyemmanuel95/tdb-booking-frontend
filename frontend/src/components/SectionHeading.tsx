import type { HTMLAttributes, Ref } from 'react';

interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>;
}

/** Second-level heading for a page section or card, in the shared type scale. */
export function SectionHeading({ className = '', children, ...props }: SectionHeadingProps) {
  return (
    <h2 className={`text-lg font-semibold text-stone-900 sm:text-xl ${className}`} {...props}>
      {children}
    </h2>
  );
}
