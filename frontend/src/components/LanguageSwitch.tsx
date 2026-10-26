import type { HTMLAttributes } from 'react';
import type { Language, LanguageOption } from '@/i18n/languages';
import { Button } from './Button';

export interface LanguageSwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Accessible name of the group, in the current language (e.g. "Language"). */
  label: string;
  value: Language;
  options: readonly LanguageOption[];
  onChange: (language: Language) => void;
}

/**
 * Toggle buttons for the interface language. The pressed state is exposed with `aria-pressed`
 * and shown by the filled style, and each name carries its own `lang` so it is pronounced correctly.
 */
export function LanguageSwitch({
  label,
  value,
  options,
  onChange,
  className = '',
  ...props
}: LanguageSwitchProps) {
  return (
    <div role="group" aria-label={label} className={`flex gap-1 ${className}`} {...props}>
      {options.map((option) => (
        <Button
          key={option.value}
          lang={option.value}
          variant={option.value === value ? 'primary' : 'secondary'}
          aria-pressed={option.value === value}
          className="min-h-11 px-3"
          onClick={() => {
            onChange(option.value);
          }}
        >
          {option.name}
        </Button>
      ))}
    </div>
  );
}
