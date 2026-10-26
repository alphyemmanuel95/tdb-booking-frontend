import {
  useId,
  type InputHTMLAttributes,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Icon } from './Icon';

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
}

const controlClass = (hasError: boolean) =>
  `block min-h-11 w-full rounded-lg border px-3 py-2 text-base text-stone-900 shadow-sm transition-colors motion-reduce:transition-none sm:text-sm ${
    hasError ? 'border-red-600 bg-red-50/40' : 'border-stone-500 bg-white hover:border-stone-700'
  }`;

function useFieldIds(error?: string, hint?: string) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return { id, hintId, errorId, describedBy };
}

function FieldMessages({
  hint,
  hintId,
  error,
  errorId,
}: {
  hint?: string | undefined;
  hintId?: string | undefined;
  error?: string | undefined;
  errorId?: string | undefined;
}) {
  return (
    <>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-stone-600">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-700"
        >
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </>
  );
}

export interface InputProps extends FieldProps, InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

/** Labelled text input. Errors are linked with aria-describedby so assistive tech reads them. */
export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(error, hint);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-stone-800">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={controlClass(Boolean(error))}
        {...props}
      />
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}

export interface TextareaProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  rows = 4,
  ...props
}: TextareaProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(error, hint);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-stone-800">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={controlClass(Boolean(error))}
        {...props}
      />
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}

export interface SelectProps extends FieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

/** Labelled native select, with the same hint/error wiring as `Input`. */
export function Select({ label, error, hint, className = '', children, ...props }: SelectProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(error, hint);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-stone-800">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${controlClass(Boolean(error))} cursor-pointer appearance-none pr-10`}
          {...props}
        >
          {children}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-stone-600"
        />
      </div>
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
