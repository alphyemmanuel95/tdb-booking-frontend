/** Details shown in the booking confirmation; dates and times arrive already formatted. */
export interface BookingConfirmation {
  tickets: number;
  name: string;
  templeName: string;
  date: string;
  time: string;
  bookingId: string;
}

/**
 * Every interface string. Add a key here first: `ml` is typed as `Messages`, so a missing
 * translation fails typecheck. Use functions for interpolation and plurals, never concatenation.
 */
export interface Messages {
  app: {
    brand: string;
    documentTitle: (pageTitle: string) => string;
    skipToMain: string;
    mainNav: string;
    language: string;
  };
  nav: {
    bookDarshan: string;
  };
  common: {
    loading: string;
    somethingWentWrong: string;
    tryAgain: string;
  };
  booking: {
    title: string;
    chooseTemplePrompt: string;
    confirmation: (booking: BookingConfirmation) => string;
  };
  filters: {
    temple: string;
    selectTemple: string;
    date: string;
    loadingTemples: string;
    templesError: string;
    noTemples: string;
  };
  slots: {
    legend: string;
    loading: string;
    error: string;
    empty: string;
    remaining: (remaining: number, capacity: number) => string;
    full: string;
    started: string;
  };
  bookingForm: {
    heading: string;
    allRequired: string;
    name: string;
    phone: string;
    phoneHint: string;
    tickets: string;
    ticketsHint: (max: number) => string;
    failed: string;
    submit: string;
    submitting: string;
  };
  validation: {
    nameTooShort: string;
    nameTooLong: string;
    phoneInvalid: string;
    ticketsRequired: string;
    ticketsWhole: string;
    ticketsMin: string;
    ticketsMax: (max: number) => string;
  };
  notFound: {
    title: string;
    body: string;
    home: string;
  };
}

const tickets = (count: number) => (count === 1 ? '1 ticket' : `${count} tickets`);

export const en: Messages = {
  app: {
    brand: 'TDB Darshan',
    documentTitle: (pageTitle) => `${pageTitle} | TDB Darshan Booking`,
    skipToMain: 'Skip to main content',
    mainNav: 'Main',
    language: 'Language',
  },
  nav: {
    bookDarshan: 'Book darshan',
  },
  common: {
    loading: 'Loading…',
    somethingWentWrong: 'Something went wrong',
    tryAgain: 'Try again',
  },
  booking: {
    title: 'Book darshan',
    chooseTemplePrompt: 'Choose a temple to see its darshan slots.',
    confirmation: (b) =>
      `Booked ${tickets(b.tickets)} for ${b.name} at ${b.templeName} on ${b.date}, ${b.time}. Booking ID ${b.bookingId}.`,
  },
  filters: {
    temple: 'Temple',
    selectTemple: 'Select a temple',
    date: 'Date',
    loadingTemples: 'Loading temples…',
    templesError: 'Could not load temples',
    noTemples: 'No temples are open for booking right now.',
  },
  slots: {
    legend: 'Choose a slot',
    loading: 'Loading slots…',
    error: 'Could not load slots',
    empty: 'No darshan slots on this day. Try another date.',
    remaining: (remaining, capacity) => `${remaining} of ${capacity} tickets remaining`,
    full: 'Full, no tickets left',
    started: 'Already started, booking closed',
  },
  bookingForm: {
    heading: 'Devotee details',
    allRequired: 'All fields are required.',
    name: 'Name',
    phone: 'Phone number',
    phoneHint: '10-digit mobile number',
    tickets: 'Number of tickets',
    ticketsHint: (max) => `Up to ${tickets(max)}`,
    failed: 'Booking failed',
    submit: 'Book tickets',
    submitting: 'Booking…',
  },
  validation: {
    nameTooShort: 'Name must be at least 2 characters',
    nameTooLong: 'Name must be 60 characters or fewer',
    phoneInvalid: 'Enter a 10-digit Indian mobile number',
    ticketsRequired: 'Enter the number of tickets',
    ticketsWhole: 'Tickets must be a whole number',
    ticketsMin: 'Book at least 1 ticket',
    ticketsMax: (max) => `You can book at most ${tickets(max)} in this slot`,
  },
  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist.',
    home: 'Go back home',
  },
};
