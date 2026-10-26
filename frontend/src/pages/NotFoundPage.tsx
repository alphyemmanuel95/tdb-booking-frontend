import { useId } from 'react';
import { Link } from 'react-router';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useI18n } from '@/i18n/useI18n';

export function NotFoundPage() {
  const { t } = useI18n();
  const headingId = useId();
  useDocumentTitle(t.notFound.title);
  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h1 id={headingId} className="text-3xl font-bold">
        {t.notFound.title}
      </h1>
      <p className="text-slate-700">{t.notFound.body}</p>
      <Link to="/" className="font-medium text-blue-700 underline hover:text-blue-900">
        {t.notFound.home}
      </Link>
    </section>
  );
}
