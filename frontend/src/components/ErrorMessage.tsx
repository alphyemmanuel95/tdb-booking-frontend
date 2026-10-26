import { useI18n } from '@/i18n/useI18n';
import { Button } from './Button';

interface ErrorMessageProps {
  /** Defaults to "Something went wrong" in the current language. */
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  const { t } = useI18n();
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">{title ?? t.common.somethingWentWrong}</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          {t.common.tryAgain}
        </Button>
      )}
    </div>
  );
}
