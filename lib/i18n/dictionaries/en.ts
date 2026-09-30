import type { Dictionary } from '../types';

/**
 * English UI strings — the source of truth for the site's copy.
 *
 * Wording here is lifted verbatim from the components it replaced, so English
 * mode renders exactly as it did before the i18n layer existed.
 */
export const en = {
  langPrompt: { question: 'తెలుగులో చూడాలా?', yes: 'అవును', no: 'English' },

  toggle: { switchTo: 'తెలుగు', ariaLabel: 'Switch to Telugu' },

  nav: {
    home: 'Home',
    products: 'Products',
    doctors: 'Doctors',
    diagnostics: 'Diagnostics',
    about: 'About',
    contact: 'Contact',
    callUs: 'Call us',
    call: 'Call',
    whatsapp: 'WhatsApp',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    homeAria: 'The Pharma Generic House — home',
  },

  hero: {
    estTagline: 'Vijayawada · Est. 2018',
    eyebrow: 'Vijayawada · Trusted Neighbourhood Pharmacy',
    headline: 'Medicines, doctors, and lab tests — under one trusted roof.',
    subhead:
      'Everyday medicines, Ayurvedic care, doctor consultations, Sunday lab tests. Vijayawada, since 2018.',
    sendRx: 'Send prescription on WhatsApp',
    rxHelper:
      "Photograph your prescription, tap the button, and attach it in WhatsApp — we'll reply with availability and price.",
    browse: 'Browse Products',
    bookAppt: 'Book an appointment →',
    photoAlt: 'Inside The Pharma Generic House pharmacy',
  },

  trustbar: {
    builtOnTrust: 'Pharmacy built on trust since 2018',
    thyro: 'ThyroCare associate',
    homeCollection: 'Home test collection',
  },

  offer: {
    eyebrow: 'What we offer',
    heading: 'One counter. Four kinds of care.',
    learnMore: 'Learn more',
    cards: [
      {
        title: 'General & Pharma Medicines',
        body: 'Branded and generic medicines for everyday and prescription needs.',
      },
      {
        title: 'Ayurvedic Care',
        body: 'Traditional remedies, classical formulations, and daily wellness products.',
      },
      {
        title: 'Cosmetic & Personal Care',
        body: 'Trusted skincare, hair care, and personal hygiene brands.',
      },
      {
        title: 'Doctor Consultations',
        body: 'Visiting doctors — physician, physiotherapy, homeopathy, and Nadi — by appointment.',
      },
    ],
  },

  dock: {
    heading: 'What do you need today?',
    tiles: [
      { label: 'Order medicines', helper: 'Browse and send an enquiry' },
      { label: 'Book a doctor', helper: 'In-shop consultations' },
      { label: 'Book a lab test', helper: 'Sunday at the shop, or at home' },
      { label: 'Ask a question', helper: 'We reply on WhatsApp' },
    ],
  },

  today: {
    eyebrow: 'Today at the shop',
    noDoctors: 'No doctor visits today',
    testDayToday: 'Today is Test Day · 9 AM – 1 PM',
    testDayTomorrow: 'Test Day tomorrow',
    testDayIn: 'Sunday Test Day in {n} days',
    book: 'Book →',
  },

  stats: {
    eyebrow: 'By the numbers',
    customersDaily: 'customers every day',
    rxDaily: 'prescriptions filled daily',
    rxSince: 'prescriptions since 2018',
    years: 'years serving Vijayawada',
    caption: 'Real numbers, real trust.',
  },

  founder: {
    eyebrow: 'Our story',
    heading: 'The person behind the shop',
    subhead:
      'Uma Shankar Alapati brings 27 years of medical experience to Vijayawada — one prescription, one honest conversation at a time.',
    photoComingSoon: 'Photograph coming soon',
    closingLine: 'One prescription. One honest conversation. Every day since 2018.',
  },

  contrast: {
    line1: "At a chain pharmacy, you're a bill number.",
    line2: "Here, the person at the counter knows your family's prescriptions.",
  },

  rx: {
    eyebrow: 'Prescription',
    forLabel: 'For',
    forValue: 'You and your family',
    fromLabel: 'From',
    fromValue: 'The Pharma Generic House, Governerpeta',
    directionsLabel: 'Directions',
    visitAnyDay: 'Visit any day',
    refillsLabel: 'Refills',
    refillsValue: 'Always',
    signature: 'Uma Shankar Alapati',
    founderLabel: 'Founder',
  },

  doctors: {
    eyebrow: 'Consultations',
    heading: 'Our practitioners. By appointment.',
    sub: 'Visit on scheduled days for in-shop consultations, or request a slot for on-request doctors.',
    availableToday: 'Available today',
    next: 'Next',
    byRequest: 'By Request',
    book: 'Book Appointment',
    request: 'Request Appointment',
    none: 'No doctors are listed at the moment.',
    pageEyebrow: 'Consultations',
    pageHeading: 'Doctors in residence.',
    pageSub: 'Book a slot on a scheduled day, or send a request.',
    days: 'Days:',
    time: 'Time:',
    fee: 'Fee:',
    onRequestNote: "Available on request — we'll confirm a time.",
    prevAria: 'Previous doctors',
    nextAria: 'More doctors',
    scrollLeft: 'Scroll left',
    scrollRight: 'Scroll right',
    closeAria: 'Close',
    prevBanner: 'Previous banner',
    nextBanner: 'Next banner',
    bannerNav: 'Banner navigation',
    whatsappFloat: 'Chat with us on WhatsApp',
    availableTodayAt: 'Available today',
    nextAvailable: 'Next available',
    suggestedNote: 'Suggested time — we confirm on WhatsApp.',
    bookEyebrow: 'Book appointment',
    requestEyebrow: 'Request appointment',
  },

  videos: {
    loadError: 'Could not load this video.',
    eyebrow: 'Videos',
    heading: 'Inside our shop.',
    sub: 'Short videos from the pharmacy — products, services, and updates.',
    customerStory: 'Customer story',
    product: 'Product',
    shopUpdate: 'Shop update',
    playAria: 'Play video',
    closeAria: 'Close video',
  },

  reviews: {
    eyebrow: 'From Google',
    heading: 'What our customers say.',
    sub: 'Verified reviews from people who trust us with their health.',
    readAll: 'Read all reviews on Google →',
    reviewsOnGoogle: 'reviews on Google',
    onGoogle: 'on Google',
  },

  diagnostics: {
    sceneOpener: 'Sunday, 9 AM.',
    eyebrow: 'Diagnostics · Associated with ThyroCare',
    heading: 'Lab tests, every Sunday at our shop.',
    body:
      'Walk in any Sunday between 9 AM and 1 PM and our certified ThyroCare technician will collect your samples on-site. Need a test on another day? The technician arrives at the shop within 45 minutes — or visits your home anywhere in Vijayawada. Reports are delivered to you on WhatsApp.',
    bookTest: 'Book a Test',
    showing: 'Showing {shown} of {total} tests.',
    viewAll: 'View all diagnostics →',
    pageHeading: 'Lab tests at the shop or your home.',
    sundayEyebrow: 'Sunday is Test Day',
    sundayHeading: 'Walk-in collection from 9 AM to 1 PM.',
    sundayBody:
      'Every Sunday, our certified ThyroCare technician collects samples right at the shop. Need a test on another day? The technician arrives within 45 minutes — or visits your home anywhere in Vijayawada. Reports are delivered on WhatsApp within 24–48 hours.',
    seeAllTests: 'See all tests',
    availableEyebrow: 'Available Tests',
    availableHeading: 'All tests offered.',
    availableSub: "Tap any test to book your slot. We'll confirm by WhatsApp.",
    howEyebrow: 'How it works',
    howHeading: 'Getting a test is simple.',
    howSub: "Three steps. That's it.",
    steps: [
      {
        title: 'Book online',
        body: 'Pick a test, tell us if you want it done at the shop or at your home. We reply on WhatsApp to confirm a slot.',
      },
      {
        title: 'Sunday walk-in or home visit',
        body: 'Every Sunday 9 AM to 1 PM, walk in for on-site sample collection. Any other day, our ThyroCare technician arrives within 45 minutes — or comes to your home.',
      },
      {
        title: 'Reports on WhatsApp',
        body: 'Your results arrive directly on your phone. No trips back, no waiting. Fast, private, and easy to share with your doctor.',
      },
    ],
    associatedWith: 'Associated with',
    thyroBody:
      "Samples collected at our shop are processed at ThyroCare — one of India's largest accredited diagnostic labs. Reports arrive on WhatsApp within 24–48 hours. If a specific test isn't listed, just ask — we can almost always arrange it.",
    none: 'No tests are listed at the moment.',
    testDay: 'Test day',
    walkIn: 'Walk-in',
  },

  shelves: {
    eyebrow: 'Our Shelves',
    heading: 'Browse what we keep in store.',
    sub: "Tap a category to see products. Add items to your enquiry list, then send them to us on WhatsApp — we'll confirm availability and you can pick up at the shop.",
    browseLink: 'Browse',
    tiles: [
      {
        title: 'General Medicine',
        body: 'Daily essentials, fevers, antacids, and over-the-counter care.',
      },
      {
        title: 'Pharma (Prescription)',
        body: 'Branded prescription medicines, including cold-chain stored items.',
      },
      {
        title: 'Ayurvedic',
        body: 'Classical formulations — Chyawanprash, Triphala, herbal oils.',
      },
      {
        title: 'Cosmetic & Personal Care',
        body: 'Sunscreens, serums, lip balms, and dermatologically sound brands.',
      },
    ],
  },

  aboutTeaser: {
    eyebrow: 'About us',
    heading: 'A neighbourhood pharmacy, built on trust.',
    body1:
      "We're a trusted pharmacy in Vijayawada, serving the same community since 2018. Our shelves carry general and prescription medicines, classical Ayurvedic preparations, and trusted personal care brands — chosen with care.",
    body2:
      'Alongside the shelves, we host visiting doctors and run a Sunday lab day with ThyroCare. Everything you need to stay well, in one place.',
    readMore: 'Read more about us →',
    photoAlt: 'Inside The Pharma Generic House',
  },

  contactCta: {
    heading: "Have a question? We're here to help.",
    sub: 'Call us, message on WhatsApp, or visit the shop. We respond quickly.',
    visit: 'Visit',
    hoursLine: 'Mon–Sat 9 AM – 10 PM · Sun 9 AM – 2 PM',
  },

  footer: {
    shop: 'Shop',
    browse: 'Browse',
    services: 'Services',
    getInTouch: 'Get in touch',
    tagline: 'Your trusted neighbourhood pharmacy. Vijayawada.',
    bottomTagline: 'Medicines, doctors, tests — under one roof.',
    whatsappUs: 'WhatsApp us',
    contactForm: 'Contact form',
    privacy: 'Privacy',
    terms: 'Terms',
    call: 'Call',
    rights: '© 2026 The Pharma Generic House',
    categories: {
      general: 'General Medicine',
      pharma: 'Pharma',
      ayurvedic: 'Ayurvedic',
      cosmetic: 'Cosmetic',
    },
  },

  products: {
    eyebrow: 'Catalogue',
    heading: 'Browse our shelves.',
    sub: "Add what you need to your enquiry list and we'll confirm availability on WhatsApp. Pick up from the shop or arrange home delivery.",
    searchPlaceholder: 'Search products…',
    all: 'All Products',
    general: 'General Medicine',
    pharma: 'Pharma',
    ayurvedic: 'Ayurvedic',
    cosmetic: 'Cosmetics',
    outOfStock: 'Out of stock',
    inStock: 'In stock',
    none: 'No products listed yet.',
    noneFiltered: 'No products match your search.',
    outOfStockLong: 'Currently out of stock',
    askOnWhatsapp: 'Ask about this on WhatsApp',
    askMessage: 'Hi, is {product} available? What is the price?',
    quickViewClose: 'Close product',
  },

  about: {
    eyebrow: 'Our story',
    heading: 'A trusted pharmacy, with you for the long term.',
    p1: 'The Pharma Generic House began as a small neighbourhood medical store in Vijayawada with one simple goal — to make trusted medicines, honest advice, and quality healthcare accessible to everyone who walks in.',
    p2: "Today, the shop is run by people who know most of their customers by name, remember which children need the cherry-flavoured cough syrup, and won't hesitate to suggest a generic when it works just as well as the brand.",
    p3: 'Our shelves carry general medicines for everyday needs, prescription pharma including cold-chain stored items, classical Ayurvedic preparations, and a curated selection of cosmetic and personal care brands — all chosen with care.',
    p4: 'Alongside the shelves, we host visiting doctors through the week — a Nadi specialist on Mondays, Wednesdays, and Fridays; a physiotherapist on Tuesdays, Thursdays, and Saturdays; and a homeopath available on request. Sundays are for diagnostics — a certified ThyroCare technician runs our Sunday Test Day from 9 AM to 1 PM, and can visit homes across Vijayawada on other days too.',
    p5: "We're here for the long term — same shop, same people, same shelves you can rely on.",
    valuesEyebrow: 'What we stand for',
    valuesHeading: "Three things we don't compromise on.",
    values: [
      {
        title: 'Trust',
        body: 'We stock only verified, properly sourced medicines from reputable suppliers.',
      },
      {
        title: 'Care',
        body: 'Personal advice from people who know you by name. Not a chain. Not a website.',
      },
      {
        title: 'Access',
        body: 'Medicines, doctors, and lab tests — all in one place, in your neighbourhood.',
      },
    ],
    closingHeading: 'Come visit, or send us a message.',
    closingBody:
      "We're open six days a week, with doctors on rotation through the week and a Sunday lab day.",
    contactUs: 'Contact us',
    browseShelves: 'Browse the shelves →',
  },

  contact: {
    eyebrow: 'Get in touch',
    heading: 'Reach us anytime.',
    sub: 'Call, message on WhatsApp, or visit the shop. We reply quickly during shop hours.',
    callEyebrow: 'Call the shop',
    whatsappEyebrow: 'Message on WhatsApp',
    visitEyebrow: 'Come to the shop',
    callUsEyebrow: 'Call us',
    whatsappMsgEyebrow: 'Message on WhatsApp',
    tapToCall: 'Tap to call',
    chatOnWhatsapp: 'Chat on WhatsApp',
    openChat: 'Open chat',
    openInMaps: 'Open in Google Maps',
    openWhatsapp: 'Open WhatsApp',
    getDirections: 'Get directions',
    sendEyebrow: 'Send a message',
    sendHeading: 'Send us a message.',
    sendSub:
      "We'll reply on WhatsApp or by phone within a few hours during shop hours. For urgent needs, please call directly.",
    shopHours: 'Shop hours',
    mapTitle: 'Map showing The Pharma Generic House location',
  },

  forms: {
    name: 'Your name',
    fullName: 'Full name',
    phone: 'Phone',
    phonePlaceholder: '10-digit mobile',
    emailOpt: 'Email (optional)',
    age: 'Age (optional)',
    address: 'Address',
    message: 'Message',
    messagePlaceholder: 'How can we help?',
    date: 'Preferred date',
    time: 'Preferred time',
    pickDate: 'Pick a date',
    pickTime: 'Pick a time',
    notes: 'Notes (optional)',
    notesPlaceholder: "Anything you'd like us to know",
    atShop: 'At the shop',
    homeCollection: 'Home collection',
    send: 'Send',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    submit: 'Submit',
    cancel: 'Cancel',
    required: 'This is required',
    invalidPhone: 'Please enter a valid Indian phone number',
    invalidAge: 'Enter a valid age',
    nameRequired: 'Please enter your full name',
    messageRequired: 'Please write a message',
    unavailable: 'unavailable',
    whereCollect: 'Where to collect samples?',
    homeAddress: 'Home address',
    agePlaceholder: 'e.g. 42',
    emailPlaceholder: 'you@example.com',
    addressPlaceholder: 'House number, street, landmark, area',
    addressRequired: 'Please add an address for home collection.',
    sendAndWhatsapp: 'Send & WhatsApp',
    successAppointment: "Appointment requested. We'll confirm on WhatsApp shortly.",
    successTest: "Test booked. We'll confirm on WhatsApp shortly.",
    successMessage: "Message sent. We'll get back to you shortly.",
    successEnquiry: "Enquiry sent. We'll confirm availability shortly.",
    errorGeneric: 'Could not send. Please try again or WhatsApp us.',
  },

  cart: {
    enquiry: 'Enquiry',
    yourEnquiry: 'Your enquiry',
    addToEnquiry: 'Add to Enquiry',
    added: 'Added',
    sendWhatsApp: 'Send on WhatsApp',
    submitEnquiry: 'Submit enquiry',
    reserve: 'Reserve for pickup',
    empty: 'Your enquiry list is empty.',
    noItems: 'No items yet',
    addFromProducts: 'Add items from the products page.',
    openAria: 'Open enquiry',
    closeAria: 'Close enquiry',
    yourEnquiryAria: 'Your enquiry',
    increaseAria: 'Increase',
    decreaseAria: 'Decrease',
    removeAria: 'Remove',
    itemsLabel: 'items',
    whatsappIntro:
      "Hello, I'd like to enquire about the following from The Pharma Generic House:",
  },

  whatsappHelper: {
    online: "We're online",
    offlineAt: 'We reply when we open at {time}',
    greeting: 'Hi 👋 Need help?',
    replyNoteDefault: 'We usually reply within 15 minutes.',
    chipOrder: 'Order medicines',
    chipTest: 'Book a test',
    chipDoctor: 'Ask about a doctor',
    startChat: 'Start a chat →',
    close: 'Close',
    openHelper: 'Chat with us on WhatsApp',
    msgTest: "Hi, I'd like to book a lab test.",
    msgDoctor: 'Hi, I have a question about doctor consultations.',
    msgGeneric: 'Hello, I have a question.',
  },

  search: {
    open: 'Search',
    placeholder: 'Search medicines, tests, doctors…',
    products: 'Products',
    tests: 'Tests',
    doctors: 'Doctors',
    empty: 'No results. Ask us on WhatsApp →',
    close: 'Close search',
  },

  banner: { dismiss: 'Dismiss announcement', regionLabel: 'Site announcement' },

  status: {
    openNow: 'Open now · closes {time}',
    closingSoon: 'Closing soon · {time}',
    closed: 'Closed',
    opensAt: 'Closed · opens {time}',
    opensTomorrow: 'Closed · opens tomorrow {time}',
    opensOn: 'Closed · opens {day} {time}',
  },

  common: {
    bookATest: 'Book a test →',
    everyDay: 'Every day',
    today: 'Today',
    suggestedTimes: 'Suggested times',
    closedLabel: 'Closed',
    days: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
    fullDays: {
      monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
      friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
    },
    specialties: { nadi: 'Nadi', physiotherapy: 'Physiotherapy', homeopathy: 'Homeopathy' },
  },

  callback: {
    heading: 'Order medicines on call',
    sub: "Call us at {phone}, or drop your number — we'll call you back.",
    placeholder: 'Enter phone number',
    submit: 'Get a callback',
    submitting: 'Sending…',
    invalid: 'Please enter a valid 10-digit mobile number.',
    successOpen: "Thanks! We'll call you shortly.",
    successClosed: "Thanks! We'll call you when we open at {time}.",
    slideHeading: 'Want to order medicines?',
    slideSub: 'Call {phone} or get a callback.',
    dismiss: 'Dismiss',
  },

  faq: { eyebrow: 'Questions', heading: 'Things people ask us.' },

  legal: {
    teNotice: '',
    eyebrow: 'Legal',
    privacyTitle: 'Privacy.',
    termsTitle: 'Terms.',
  },

  notFound: {
    heading: 'This page has moved on.',
    line: "The medicines are still here — let's get you back.",
    home: 'Home',
    products: 'Products',
    contact: 'Contact',
    whatsappCta: 'Message us on WhatsApp',
  },
} satisfies Dictionary;
