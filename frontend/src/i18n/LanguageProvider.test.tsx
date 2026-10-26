import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import { useI18n } from './useI18n';

const STORAGE_KEY = 'tdb-darshan.language';

/** Shows a message and a date in the current language, with a button to switch language. */
function Probe() {
  const { t, language, setLanguage, formatDate } = useI18n();
  return (
    <div>
      <p>{t.filters.temple}</p>
      <p>{formatDate('2026-10-31')}</p>
      <button
        type="button"
        onClick={() => {
          setLanguage(language === 'en' ? 'ml' : 'en');
        }}
      >
        Toggle
      </button>
    </div>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LanguageProvider', () => {
  it('defaults to English and switches messages, dates, <html lang> and storage', async () => {
    const { user } = renderWithProviders(<Probe />);
    expect(screen.getByText('Temple')).toBeInTheDocument();
    expect(screen.getByText('Sat, 31 Oct')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));

    expect(screen.getByText('ക്ഷേത്രം')).toBeInTheDocument();
    expect(screen.queryByText('Sat, 31 Oct')).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'ml');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('ml');
  });

  it('starts in the remembered language', () => {
    localStorage.setItem(STORAGE_KEY, 'ml');
    renderWithProviders(<Probe />);

    expect(screen.getByText('ക്ഷേത്രം')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'ml');
  });

  it('ignores an invalid remembered value', () => {
    localStorage.setItem(STORAGE_KEY, 'fr');
    renderWithProviders(<Probe />);

    expect(screen.getByText('Temple')).toBeInTheDocument();
  });

  it('still switches language when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    const { user } = renderWithProviders(<Probe />);
    expect(screen.getByText('Temple')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Toggle' }));

    expect(screen.getByText('ക്ഷേത്രം')).toBeInTheDocument();
  });
});
