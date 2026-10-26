import { Link } from 'react-router';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function HomePage() {
  useDocumentTitle('Home');
  return (
    <section aria-labelledby="home-heading" className="space-y-4">
      <h1 id="home-heading" className="text-3xl font-bold">
        React Starter
      </h1>
      <p className="max-w-prose text-slate-700">
        A React + TypeScript starter with routing, validated forms, RTK Query and a tested example
        feature.
      </p>
      <Link
        to="/feedback"
        className="inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
      >
        Try the feedback example
      </Link>
    </section>
  );
}
