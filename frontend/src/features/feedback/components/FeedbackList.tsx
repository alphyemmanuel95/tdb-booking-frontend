import { getErrorMessage } from '@/api/errors';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Spinner } from '@/components/Spinner';
import { useGetFeedbackQuery } from '../feedbackApi';

export function FeedbackList() {
  const { data, error, isLoading, refetch } = useGetFeedbackQuery(undefined);

  if (isLoading) return <Spinner label="Loading feedback…" />;
  if (error) {
    return (
      <ErrorMessage
        title="Could not load feedback"
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!data || data.length === 0) {
    return <p className="text-slate-600">No feedback yet. Be the first to share some!</p>;
  }

  return (
    <ul aria-label="Feedback" className="space-y-3">
      {data.map((item) => (
        <li key={item.id} className="rounded-md border border-slate-200 bg-white p-4">
          <p className="font-medium">{item.name}</p>
          <p className="mt-1 text-sm text-slate-700">{item.message}</p>
        </li>
      ))}
    </ul>
  );
}
