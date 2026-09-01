/**
 * The shape of a complete UI dictionary.
 *
 * Every public-facing string lives here. Both dictionaries are declared with
 * `satisfies Dictionary`, so a key added to English but forgotten in Telugu is
 * a compile error rather than a stray English word on a Telugu page.
 *
 * What is deliberately NOT in here: admin-entered content (product names,
 * doctor bios, review text, announcement copy), brand names, phone numbers,
 * times, and currency — those stay exactly as stored.
 */
export type Locale = 'en' | 'te';

export const LOCALES: Locale[] = ['en', 'te'];
export const DEFAULT_LOCALE: Locale = 'en';

export interface Dictionary {
  langPrompt: {
    question: string;
    yes: string;
    no: string;
  };

  toggle: {
    /** Label shown on the pill — the language it switches TO. */
    switchTo: string;
    ariaLabel: string;
  };

  nav: {
    home: string;
    products: string;
    doctors: string;
    diagnostics: string;
    about: string;
    contact: string;
    callUs: string;
    call: string;
    whatsapp: string;
    openMenu: string;
    closeMenu: string;
    homeAria: string;
  };

  hero: {
    estTagline: string;
    eyebrow: string;
    headline: string;
    subhead: string;
    sendRx: string;
    rxHelper: string;
    browse: string;
    bookAppt: string;
    photoAlt: string;
  };

  trustbar: {
    builtOnTrust: string;
    thyro: string;
    homeCollection: string;
  };

  offer: {
    eyebrow: string;
    heading: string;
    learnMore: string;
    cards: { title: string; body: string }[];
  };

  dock: {
    heading: string;
    tiles: { label: string; helper: string }[];
  };

  today: {
    eyebrow: string;
    noDoctors: string;
    testDayToday: string;
    testDayTomorrow: string;
    testDayIn: string;
    book: string;
  };

  stats: {
    eyebrow: string;
    customersDaily: string;
    rxDaily: string;
    rxSince: string;
    years: string;
    caption: string;
  };

  founder: {
    eyebrow: string;
    heading: string;
    subhead: string;
    photoComingSoon: string;
  };

  doctors: {
    eyebrow: string;
    heading: string;
    sub: string;
    availableToday: string;
    next: string;
    byRequest: string;
    book: string;
    request: string;
    none: string;
    pageEyebrow: string;
    pageHeading: string;
    pageSub: string;
    days: string;
    time: string;
    fee: string;
    onRequestNote: string;
    prevAria: string;
    nextAria: string;
    scrollLeft: string;
    scrollRight: string;
    closeAria: string;
    prevBanner: string;
    nextBanner: string;
    bannerNav: string;
    whatsappFloat: string;
    availableTodayAt: string;
    nextAvailable: string;
    suggestedNote: string;
    bookEyebrow: string;
    requestEyebrow: string;
  };

  videos: {
    loadError: string;
    eyebrow: string;
    heading: string;
    sub: string;
    customerStory: string;
    product: string;
    shopUpdate: string;
    playAria: string;
    closeAria: string;
  };

  reviews: {
    eyebrow: string;
    heading: string;
    sub: string;
    readAll: string;
    reviewsOnGoogle: string;
    onGoogle: string;
  };

  diagnostics: {
    eyebrow: string;
    heading: string;
    body: string;
    bookTest: string;
    showing: string;
    viewAll: string;
    pageHeading: string;
    sundayEyebrow: string;
    sundayHeading: string;
    sundayBody: string;
    seeAllTests: string;
    availableEyebrow: string;
    availableHeading: string;
    availableSub: string;
    howEyebrow: string;
    howHeading: string;
    howSub: string;
    steps: { title: string; body: string }[];
    associatedWith: string;
    thyroBody: string;
    none: string;
    testDay: string;
    walkInFree: string;
  };

  shelves: {
    eyebrow: string;
    heading: string;
    sub: string;
    browseLink: string;
    tiles: { title: string; body: string }[];
  };

  aboutTeaser: {
    eyebrow: string;
    heading: string;
    body1: string;
    body2: string;
    readMore: string;
    photoAlt: string;
  };

  contactCta: {
    heading: string;
    sub: string;
    visit: string;
    hoursLine: string;
  };

  footer: {
    shop: string;
    browse: string;
    services: string;
    getInTouch: string;
    tagline: string;
    bottomTagline: string;
    whatsappUs: string;
    contactForm: string;
    privacy: string;
    terms: string;
    call: string;
    rights: string;
    categories: { general: string; pharma: string; ayurvedic: string; cosmetic: string };
  };

  products: {
    eyebrow: string;
    heading: string;
    sub: string;
    searchPlaceholder: string;
    all: string;
    general: string;
    pharma: string;
    ayurvedic: string;
    cosmetic: string;
    outOfStock: string;
    inStock: string;
    none: string;
    noneFiltered: string;
    outOfStockLong: string;
    askOnWhatsapp: string;
    askMessage: string;
    quickViewClose: string;
  };

  about: {
    eyebrow: string;
    heading: string;
    p1: string;
    p2: string;
    p3: string;
    p4: string;
    p5: string;
    valuesEyebrow: string;
    valuesHeading: string;
    values: { title: string; body: string }[];
    closingHeading: string;
    closingBody: string;
    contactUs: string;
    browseShelves: string;
  };

  contact: {
    eyebrow: string;
    heading: string;
    sub: string;
    callEyebrow: string;
    whatsappEyebrow: string;
    visitEyebrow: string;
    callUsEyebrow: string;
    whatsappMsgEyebrow: string;
    tapToCall: string;
    chatOnWhatsapp: string;
    openChat: string;
    openInMaps: string;
    openWhatsapp: string;
    getDirections: string;
    sendEyebrow: string;
    sendHeading: string;
    sendSub: string;
    shopHours: string;
    mapTitle: string;
  };

  forms: {
    name: string;
    fullName: string;
    phone: string;
    phonePlaceholder: string;
    emailOpt: string;
    age: string;
    address: string;
    message: string;
    messagePlaceholder: string;
    date: string;
    time: string;
    pickDate: string;
    pickTime: string;
    notes: string;
    notesPlaceholder: string;
    atShop: string;
    homeCollection: string;
    send: string;
    sendMessage: string;
    sending: string;
    submit: string;
    cancel: string;
    required: string;
    invalidPhone: string;
    invalidAge: string;
    nameRequired: string;
    messageRequired: string;
    unavailable: string;
    whereCollect: string;
    homeAddress: string;
    agePlaceholder: string;
    emailPlaceholder: string;
    addressPlaceholder: string;
    addressRequired: string;
    sendAndWhatsapp: string;
    successAppointment: string;
    successTest: string;
    successMessage: string;
    successEnquiry: string;
    errorGeneric: string;
  };

  cart: {
    enquiry: string;
    yourEnquiry: string;
    addToEnquiry: string;
    added: string;
    sendWhatsApp: string;
    submitEnquiry: string;
    reserve: string;
    empty: string;
    noItems: string;
    addFromProducts: string;
    openAria: string;
    closeAria: string;
    yourEnquiryAria: string;
    increaseAria: string;
    decreaseAria: string;
    removeAria: string;
    itemsLabel: string;
    whatsappIntro: string;
  };

  whatsappHelper: {
    online: string;
    offlineAt: string;
    greeting: string;
    replyNoteDefault: string;
    chipOrder: string;
    chipTest: string;
    chipDoctor: string;
    startChat: string;
    close: string;
    openHelper: string;
    msgTest: string;
    msgDoctor: string;
    msgGeneric: string;
  };

  search: {
    open: string;
    placeholder: string;
    products: string;
    tests: string;
    doctors: string;
    empty: string;
    close: string;
  };

  banner: {
    dismiss: string;
    regionLabel: string;
  };

  status: {
    openNow: string;
    closingSoon: string;
    closed: string;
    opensAt: string;
    opensTomorrow: string;
    opensOn: string;
  };

  common: {
    bookATest: string;
    everyDay: string;
    today: string;
    suggestedTimes: string;
    closedLabel: string;
    days: { mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string };
    fullDays: {
      monday: string; tuesday: string; wednesday: string; thursday: string;
      friday: string; saturday: string; sunday: string;
    };
    specialties: { nadi: string; physiotherapy: string; homeopathy: string };
  };

  faq: {
    eyebrow: string;
    heading: string;
  };

  legal: {
    teNotice: string;
    eyebrow: string;
    privacyTitle: string;
    termsTitle: string;
  };

  notFound: {
    heading: string;
    line: string;
    home: string;
    products: string;
    contact: string;
    whatsappCta: string;
  };
}
