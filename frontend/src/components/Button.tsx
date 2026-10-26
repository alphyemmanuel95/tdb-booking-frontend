import type { ButtonHTMLAttributes, Ref } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-brand-700 bg-brand-700 text-white shadow-sm hover:border-brand-800 hover:bg-brand-800 active:bg-brand-900',
  secondary: 'border-brand-700 bg-white text-brand-800 hover:bg-brand-50 active:bg-brand-100',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={(disabled ?? false) || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-center text-sm font-semibold transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Spinner size="sm" decorative />}
      {children}
    </button>
  );
}
