import { Link } from 'react-router';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <section aria-labelledby="not-found-heading" className="space-y-4">
      <h1 id="not-found-heading" className="text-3xl font-bold">
        Page not found
      </h1>
      <p className="text-slate-700">The page you are looking for does not exist.</p>
      <Link to="/" className="font-medium text-blue-700 underline hover:text-blue-900">
        Go back home
      </Link>
    </section>
  );
}
