import { FeedbackForm } from '@/features/feedback/components/FeedbackForm';
import { FeedbackList } from '@/features/feedback/components/FeedbackList';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function FeedbackPage() {
  useDocumentTitle('Feedback');
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Feedback</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <section aria-labelledby="recent-feedback-heading" className="space-y-4">
          <h2 id="recent-feedback-heading" className="text-lg font-semibold">
            Recent feedback
          </h2>
          <FeedbackList />
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <FeedbackForm />
        </section>
      </div>
    </div>
  );
}
