import type { ReactNode, SVGAttributes } from 'react';

export type IconName =
  'check' | 'checkCircle' | 'alert' | 'info' | 'chevronDown' | 'lamp' | 'share';

const paths: Record<IconName, ReactNode> = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.8" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13M12 16.5h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5h.01" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" />
    </>
  ),
  // A nilavilakku (Kerala oil lamp): flame, bowl, stem and base.
  lamp: (
    <>
      <path
        d="M12 2.5c1.6 1.9 2.2 3.3 2.2 4.4a2.2 2.2 0 0 1-4.4 0c0-1.1.6-2.5 2.2-4.4z"
        className="fill-gold-400 stroke-gold-400"
      />
      <path d="M5 11h14a7 3.5 0 0 1-14 0zM12 14.5V19M9.5 19h5M7.5 21.5h9" />
    </>
  ),
};

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  name: IconName;
}

/** Decorative 24×24 line icon. Always hidden from assistive tech; pair it with visible text. */
export function Icon({ name, className = 'size-5', ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
