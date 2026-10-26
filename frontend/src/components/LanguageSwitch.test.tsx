import { describe, expect, it, vi } from 'vitest';
import { LANGUAGES } from '@/i18n/languages';
import { renderWithProviders, screen } from '@/test/test-utils';
import { LanguageSwitch } from './LanguageSwitch';

describe('LanguageSwitch', () => {
  it('marks the current language as pressed and names each language in itself', () => {
    renderWithProviders(
      <LanguageSwitch label="Language" value="en" options={LANGUAGES} onChange={vi.fn()} />,
    );

    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
    const english = screen.getByRole('button', { name: 'English' });
    const malayalam = screen.getByRole('button', { name: 'മലയാളം' });
    expect(english).toHaveAttribute('aria-pressed', 'true');
    expect(english).toHaveAttribute('lang', 'en');
    expect(malayalam).toHaveAttribute('aria-pressed', 'false');
    expect(malayalam).toHaveAttribute('lang', 'ml');
  });

  it('reports the chosen language when activated from the keyboard', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <LanguageSwitch label="Language" value="en" options={LANGUAGES} onChange={onChange} />,
    );

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'മലയാളം' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('ml');
  });
});
