import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input, Textarea } from '@/components/Input';
import { useCreateFeedbackMutation } from '../feedbackApi';
import { feedbackSchema, type FeedbackInput } from '../schema';

const emptyValues: FeedbackInput = { name: '', email: '', message: '' };

export function FeedbackForm() {
  const [createFeedback, { isLoading, error, reset: resetMutation }] = useCreateFeedbackMutation();
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackInput>({ resolver: zodResolver(feedbackSchema), defaultValues: emptyValues });

  const handleValidSubmit = async (values: FeedbackInput) => {
    setSubmittedName(null);
    try {
      const created = await createFeedback(values).unwrap();
      setSubmittedName(created.name);
      reset(emptyValues);
    } catch {
      // The mutation's `error` state renders the message below.
    }
  };

  return (
    <form
      noValidate
      aria-labelledby="feedback-form-heading"
      onSubmit={(event) => void handleSubmit(handleValidSubmit)(event)}
      onChange={() => {
        if (error) resetMutation();
      }}
      className="space-y-4"
    >
      <h2 id="feedback-form-heading" className="text-lg font-semibold">
        Send feedback
      </h2>
      <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Textarea
        label="Message"
        hint="10–500 characters"
        error={errors.message?.message}
        {...register('message')}
      />
      {error && <ErrorMessage title="Could not send feedback" message={getErrorMessage(error)} />}
      {submittedName && (
        <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          Thanks, {submittedName}! Your feedback was sent.
        </p>
      )}
      <Button type="submit" isLoading={isLoading}>
        {isLoading ? 'Sending…' : 'Send feedback'}
      </Button>
    </form>
  );
}
