import { useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/Button';
import type { CancelAvailability } from '../cancelAvailability';

interface CancelActionProps {
  availability: CancelAvailability;
  onConfirm: () => void;
}

/** The cancel control for one booking, or the reason it cannot be cancelled. */
export function CancelAction({ availability, onConfirm }: CancelActionProps) {
  switch (availability) {
    case 'cancellable':
      return <ConfirmableCancel onConfirm={onConfirm} />;
    case 'started':
      return (
        <p className="text-sm text-slate-700">
          This darshan has already started, so the booking can no longer be cancelled.
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
        Cancel booking
      </Button>
    );
  }

  return (
    <div role="group" aria-labelledby={promptId} className="space-y-3">
      <p id={promptId} className="text-sm font-medium text-slate-900">
        Cancel this booking? The tickets will be released.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onConfirm}>Yes, cancel booking</Button>
        <Button ref={keepRef} variant="secondary" onClick={handleKeep}>
          Keep booking
        </Button>
      </div>
    </div>
  );
}
