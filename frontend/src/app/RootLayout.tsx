import { NavLink, Outlet } from 'react-router';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { LANGUAGES } from '@/i18n/languages';
import { useI18n } from '@/i18n/useI18n';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-blue-100 text-blue-800' : 'text-slate-700 hover:bg-slate-100'
  }`;

export function RootLayout() {
  const { t, language, setLanguage } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        {t.app.skipToMain}
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3">
          <nav aria-label={t.app.mainNav} className="mr-auto flex flex-wrap items-center gap-2">
            <span className="mr-2 text-base font-bold text-slate-900">{t.app.brand}</span>
            <NavLink to="/" end className={navLinkClass}>
              {t.nav.bookDarshan}
            </NavLink>
          </nav>
          <LanguageSwitch
            label={t.app.language}
            value={language}
            options={LANGUAGES}
            onChange={setLanguage}
          />
        </div>
      </header>
      {/* Focused by the skip link only; it is not interactive, so it needs no focus outline. */}
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 focus:outline-none"
      >
        <Outlet />
      </main>
    </div>
  );
}
