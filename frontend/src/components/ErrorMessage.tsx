import { useI18n } from '@/i18n/useI18n';
import { Banner } from './Banner';
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
    <Banner role="alert" tone="error" title={title ?? t.common.somethingWentWrong}>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          {t.common.tryAgain}
        </Button>
      )}
    </Banner>
  );
}
