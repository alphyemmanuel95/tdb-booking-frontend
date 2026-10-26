import type { BookingStatus } from '@/api/types';

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
    footer: string;
  };
  nav: {
    bookDarshan: string;
    myBookings: string;
  };
  common: {
    loading: string;
    somethingWentWrong: string;
    tryAgain: string;
  };
  booking: {
    title: string;
    intro: string;
    templeDateHeading: string;
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
    slotFull: string;
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
  myBookings: {
    title: string;
    intro: string;
    lookupForm: string;
    phone: string;
    phoneHint: string;
    find: string;
    loading: string;
    loadError: string;
    empty: string;
    listLabel: string;
    date: string;
    startTime: string;
    /** A formatted clock time marked as Indian Standard Time. */
    timeIst: (time: string) => string;
    tickets: string;
    status: string;
    statuses: Record<BookingStatus, string>;
    bookingId: string;
    cancel: string;
    confirmPrompt: string;
    confirmCancel: string;
    keep: string;
    cancelFailed: string;
    started: string;
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
    footer: 'Plan your temple visit and book darshan tickets online.',
  },
  nav: {
    bookDarshan: 'Book darshan',
    myBookings: 'My bookings',
  },
  common: {
    loading: 'Loading…',
    somethingWentWrong: 'Something went wrong',
    tryAgain: 'Try again',
  },
  booking: {
    title: 'Book darshan',
    intro: 'Choose a temple and date, pick a darshan time, then enter the devotee’s details.',
    templeDateHeading: 'Temple and date',
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
    slotFull: 'This slot is now full. Choose another slot.',
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
  myBookings: {
    title: 'My bookings',
    intro:
      'Enter the mobile number you booked with to see or cancel your bookings. All times are in IST.',
    lookupForm: 'Find your bookings',
    phone: 'Phone number',
    phoneHint: 'The 10-digit mobile number you booked with',
    find: 'Find bookings',
    loading: 'Loading bookings…',
    loadError: 'Could not load bookings',
    empty: 'No bookings found for this phone number.',
    listLabel: 'Your bookings',
    date: 'Date',
    startTime: 'Start time',
    timeIst: (time) => `${time} IST`,
    tickets: 'Tickets',
    status: 'Status',
    statuses: { confirmed: 'Confirmed', cancelled: 'Cancelled' },
    bookingId: 'Booking ID',
    cancel: 'Cancel booking',
    confirmPrompt: 'Cancel this booking? The tickets will be released.',
    confirmCancel: 'Yes, cancel booking',
    keep: 'Keep booking',
    cancelFailed: 'Cancellation failed',
    started: 'This darshan has already started, so the booking can no longer be cancelled.',
  },
  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist.',
    home: 'Go back home',
  },
};
