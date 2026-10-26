import { useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useI18n } from '@/i18n/useI18n';
import type { CancelAvailability } from '../cancelAvailability';

interface CancelActionProps {
  availability: CancelAvailability;
  onConfirm: () => void;
}

/** The cancel control for one booking, or the reason it cannot be cancelled. */
export function CancelAction({ availability, onConfirm }: CancelActionProps) {
  const { t } = useI18n();
  switch (availability) {
    case 'cancellable':
      return <ConfirmableCancel onConfirm={onConfirm} />;
    case 'started':
      return (
        <p className="flex items-start gap-2 text-sm text-stone-700">
          <Icon name="info" className="mt-0.5 size-4 shrink-0 text-gold-800" />
          {t.myBookings.started}
        </p>
      );
    case 'cancelled':
      return null;
  }
}

/**
 * Inline two-step confirm: "Cancel booking" reveals the question with "Yes, cancel booking"
 * and "Keep booking". Focus moves to the safe choice and back, so keyboard users never lose it.
 */
function ConfirmableCancel({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useI18n();
  const [isConfirming, setIsConfirming] = useState(false);
  const promptId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  const handleStart = () => {
    // Render synchronously so the button to focus exists (see React docs on flushSync).
    flushSync(() => {
      setIsConfirming(true);
    });
    keepRef.current?.focus();
  };

  const handleKeep = () => {
    flushSync(() => {
      setIsConfirming(false);
    });
    cancelRef.current?.focus();
  };

  if (!isConfirming) {
    return (
      <Button ref={cancelRef} variant="secondary" onClick={handleStart}>
        {t.myBookings.cancel}
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-labelledby={promptId}
      className="space-y-3 rounded-xl border border-gold-200 bg-cream-100 p-4"
    >
      <p id={promptId} className="text-sm font-semibold text-stone-900">
        {t.myBookings.confirmPrompt}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onConfirm}>{t.myBookings.confirmCancel}</Button>
        <Button ref={keepRef} variant="secondary" onClick={handleKeep}>
          {t.myBookings.keep}
        </Button>
      </div>
    </div>
  );
}
