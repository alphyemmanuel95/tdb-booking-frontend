import { NavLink, Outlet } from 'react-router';
import { Icon } from '@/components/Icon';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { LANGUAGES } from '@/i18n/languages';
import { useI18n } from '@/i18n/useI18n';

// The active link is marked by weight and an underline as well as colour.
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm transition-colors motion-reduce:transition-none ${
    isActive
      ? 'bg-brand-50 font-semibold text-brand-800 underline decoration-gold-400 decoration-2 underline-offset-4'
      : 'font-medium text-stone-700 hover:bg-cream-100 hover:text-brand-800'
  }`;

export function RootLayout() {
  const { t, language, setLanguage } = useI18n();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:font-semibold focus:text-brand-800 focus:shadow-md"
      >
        {t.app.skipToMain}
      </a>
      <header className="border-b border-gold-200 bg-white shadow-sm">
        <div
          aria-hidden="true"
          className="h-1 bg-linear-to-r from-brand-700 via-gold-400 to-brand-700"
        />
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <nav
            aria-label={t.app.mainNav}
            className="mr-auto flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <span className="flex items-center gap-2 text-lg font-bold text-brand-800">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-gold-200">
                <Icon name="lamp" className="size-6" />
              </span>
              {t.app.brand}
            </span>
            <NavLink to="/" end className={navLinkClass}>
              {t.nav.bookDarshan}
            </NavLink>
            <NavLink to="/my-bookings" className={navLinkClass}>
              {t.nav.myBookings}
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
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 focus:outline-none sm:py-10"
      >
        <Outlet />
      </main>
      <footer className="border-t border-gold-200 bg-cream-100">
        <div className="mx-auto flex max-w-4xl items-start gap-2 px-4 py-6 text-sm text-stone-700">
          <Icon name="lamp" className="size-5 shrink-0 text-brand-700" />
          <p>
            <span className="font-semibold text-brand-800">{t.app.brand}</span> · {t.app.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
