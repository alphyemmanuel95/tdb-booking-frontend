import { useId } from 'react';
import { Link } from 'react-router';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useI18n } from '@/i18n/useI18n';

export function NotFoundPage() {
  const { t } = useI18n();
  const headingId = useId();
  useDocumentTitle(t.notFound.title);
  return (
    <section aria-labelledby={headingId}>
      <Card className="space-y-4 text-center">
        <Icon name="lamp" className="mx-auto size-12 text-brand-700" />
        <h1 id={headingId} className="text-3xl font-bold text-stone-900">
          {t.notFound.title}
        </h1>
        <p className="text-stone-700">{t.notFound.body}</p>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
        >
          {t.notFound.home}
        </Link>
      </Card>
    </section>
  );
}
