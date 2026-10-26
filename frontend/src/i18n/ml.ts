import type { Messages } from './en';

// Malayalam keeps the noun singular after a number ("3 ടിക്കറ്റ്"), so no plural forms are needed.
// Temple names and booking details come from the server and are placed in neutral positions,
// so they need no Malayalam case endings.
export const ml: Messages = {
  app: {
    brand: 'ടി.ഡി.ബി. ദർശനം',
    documentTitle: (pageTitle) => `${pageTitle} | ടി.ഡി.ബി. ദർശന ബുക്കിംഗ്`,
    skipToMain: 'പ്രധാന ഉള്ളടക്കത്തിലേക്ക് പോകുക',
    mainNav: 'പ്രധാന മെനു',
    language: 'ഭാഷ',
  },
  nav: {
    bookDarshan: 'ദർശനം ബുക്ക് ചെയ്യുക',
  },
  common: {
    loading: 'ലോഡ് ചെയ്യുന്നു…',
    somethingWentWrong: 'എന്തോ പിശക് സംഭവിച്ചു',
    tryAgain: 'വീണ്ടും ശ്രമിക്കുക',
  },
  booking: {
    title: 'ദർശനം ബുക്ക് ചെയ്യുക',
    chooseTemplePrompt: 'ദർശന സമയങ്ങൾ കാണാൻ ഒരു ക്ഷേത്രം തിരഞ്ഞെടുക്കുക.',
    confirmation: (b) =>
      `${b.tickets} ടിക്കറ്റ് ബുക്ക് ചെയ്തു: ${b.name}, ${b.templeName}, ${b.date}, ${b.time}. ബുക്കിംഗ് ഐഡി ${b.bookingId}.`,
  },
  filters: {
    temple: 'ക്ഷേത്രം',
    selectTemple: 'ഒരു ക്ഷേത്രം തിരഞ്ഞെടുക്കുക',
    date: 'തീയതി',
    loadingTemples: 'ക്ഷേത്രങ്ങൾ ലോഡ് ചെയ്യുന്നു…',
    templesError: 'ക്ഷേത്രങ്ങൾ ലോഡ് ചെയ്യാനായില്ല',
    noTemples: 'ഇപ്പോൾ ബുക്കിംഗിനായി ക്ഷേത്രങ്ങളൊന്നും ലഭ്യമല്ല.',
  },
  slots: {
    legend: 'ഒരു സമയം തിരഞ്ഞെടുക്കുക',
    loading: 'സമയങ്ങൾ ലോഡ് ചെയ്യുന്നു…',
    error: 'സമയങ്ങൾ ലോഡ് ചെയ്യാനായില്ല',
    empty: 'ഈ ദിവസം ദർശന സമയങ്ങളൊന്നുമില്ല. മറ്റൊരു തീയതി തിരഞ്ഞെടുക്കുക.',
    remaining: (remaining, capacity) => `${capacity}-ൽ ${remaining} ടിക്കറ്റ് ബാക്കിയുണ്ട്`,
    full: 'നിറഞ്ഞു, ടിക്കറ്റുകൾ ബാക്കിയില്ല',
    started: 'ആരംഭിച്ചു, ബുക്കിംഗ് അവസാനിച്ചു',
  },
  bookingForm: {
    heading: 'ഭക്തന്റെ വിവരങ്ങൾ',
    allRequired: 'എല്ലാ വിവരങ്ങളും നിർബന്ധമാണ്.',
    name: 'പേര്',
    phone: 'ഫോൺ നമ്പർ',
    phoneHint: '10 അക്ക മൊബൈൽ നമ്പർ',
    tickets: 'ടിക്കറ്റുകളുടെ എണ്ണം',
    ticketsHint: (max) => `പരമാവധി ${max} ടിക്കറ്റ്`,
    failed: 'ബുക്കിംഗ് പരാജയപ്പെട്ടു',
    submit: 'ടിക്കറ്റ് ബുക്ക് ചെയ്യുക',
    submitting: 'ബുക്ക് ചെയ്യുന്നു…',
  },
  validation: {
    nameTooShort: 'പേരിൽ കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ വേണം',
    nameTooLong: 'പേര് 60 അക്ഷരങ്ങളിൽ കൂടരുത്',
    phoneInvalid: 'സാധുവായ 10 അക്ക ഇന്ത്യൻ മൊബൈൽ നമ്പർ നൽകുക',
    ticketsRequired: 'ടിക്കറ്റുകളുടെ എണ്ണം നൽകുക',
    ticketsWhole: 'ടിക്കറ്റുകളുടെ എണ്ണം ഒരു പൂർണ്ണസംഖ്യ ആയിരിക്കണം',
    ticketsMin: 'കുറഞ്ഞത് 1 ടിക്കറ്റ് ബുക്ക് ചെയ്യുക',
    ticketsMax: (max) => `ഈ സമയത്ത് പരമാവധി ${max} ടിക്കറ്റ് ബുക്ക് ചെയ്യാം`,
  },
  notFound: {
    title: 'പേജ് കണ്ടെത്തിയില്ല',
    body: 'നിങ്ങൾ തിരയുന്ന പേജ് നിലവിലില്ല.',
    home: 'ഹോം പേജിലേക്ക് മടങ്ങുക',
  },
};
