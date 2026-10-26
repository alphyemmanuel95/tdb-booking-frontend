import {
  useId,
  type InputHTMLAttributes,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
}

const controlClass = (hasError: boolean) =>
  `block w-full rounded-md border px-3 py-2 text-sm shadow-sm ${
    hasError ? 'border-red-600' : 'border-slate-500'
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
        <p id={hintId} className="mt-1 text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700">
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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">
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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">
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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${controlClass(Boolean(error))} bg-white`}
        {...props}
      >
        {children}
      </select>
      <FieldMessages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
