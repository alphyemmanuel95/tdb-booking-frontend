import { useState } from 'react';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useI18n } from '@/i18n/useI18n';

interface ShareSelectionButtonProps {
  /** The link to share: the temple and date only, so recipients open the same selection. */
  url: string;
  /** Short description of the link, e.g. "Sabarimala darshan slots for Sat, 31 Oct". */
  title: string;
}

/** The browser APIs used here; both are missing in some browsers or outside secure contexts. */
interface SharingNavigator {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
}

/**
 * Shares the current temple and date. Uses the native share sheet where available (phones,
 * WhatsApp), otherwise copies the link and says so in a status message screen readers announce.
 */
export function ShareSelectionButton({ url, title }: ShareSelectionButtonProps) {
  const { t } = useI18n();
  // Stored as an outcome, not text, so the message follows a language switch.
  const [outcome, setOutcome] = useState<'copied' | 'copyFailed' | null>(null);

  const handleShare = async (browser: SharingNavigator) => {
    setOutcome(null);
    if (browser.share) {
      try {
        await browser.share({ title, text: title, url });
      } catch {
        // The devotee closed the share sheet; nothing to report.
      }
      return;
    }
    try {
      if (!browser.clipboard) throw new Error('Clipboard unavailable');
      await browser.clipboard.writeText(url);
      setOutcome('copied');
    } catch {
      setOutcome('copyFailed');
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={() => void handleShare(navigator)}>
        <Icon name="share" className="size-4" />
        {t.share.button}
      </Button>
      <p role="status" className="text-sm text-stone-700">
        {outcome && t.share[outcome]}
      </p>
    </div>
  );
}
