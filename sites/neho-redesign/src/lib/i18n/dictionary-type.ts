export interface Dictionary {
  meta: {
    siteName: string;
    tagline: string;
    demoBadge: string;
  };
  nav: {
    sell: string;
    buy: string;
    discover: string;
    menu: {
      sellEstimate: string;
      sellEstimateDesc: string;
      sellHow: string;
      sellHowDesc: string;
      sellPricing: string;
      sellPricingDesc: string;
      buySearch: string;
      buySearchDesc: string;
      buyCapacity: string;
      buyCapacityDesc: string;
      buyAlerts: string;
      buyAlertsDesc: string;
      discoverAbout: string;
      discoverAboutDesc: string;
      discoverAgents: string;
      discoverAgentsDesc: string;
      discoverRegions: string;
      discoverRegionsDesc: string;
      discoverTestimonials: string;
      discoverTestimonialsDesc: string;
      discoverBlog: string;
      discoverBlogDesc: string;
      discoverPro: string;
      discoverProDesc: string;
    };
    contact: string;
    ctaEstimate: string;
    langSwitcher: string;
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
  };
  footer: {
    tagline: string;
    columns: {
      sell: { title: string; links: { label: string; href: string }[] };
      buy: { title: string; links: { label: string; href: string }[] };
      company: { title: string; links: { label: string; href: string }[] };
      legal: { title: string; links: { label: string; href: string }[] };
    };
    newsletter: {
      title: string;
      description: string;
      placeholder: string;
      cta: string;
      disclaimer: string;
    };
    social: string;
    rights: string;
    disclaimer: string;
  };
  common: {
    ctaEstimateFree: string;
    ctaDiscoverProperties: string;
    ctaContact: string;
    ctaSeeMore: string;
    ctaSeeAll: string;
    ctaBookVisit: string;
    ctaCall: string;
    ctaWriteEmail: string;
    demoNotice: string;
    demoNoticeShort: string;
    contentInFrench: string;
    loading: string;
    errorGeneric: string;
    back: string;
    next: string;
    previous: string;
    optional: string;
    minute: string;
    minutes: string;
    chf: string;
    perYear: string;
    from: string;
    breadcrumbHome: string;
  };
  home: {
    hero: {
      eyebrow: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
      stat1Value: string;
      stat1Label: string;
      stat2Value: string;
      stat2Label: string;
      stat3Value: string;
      stat3Label: string;
      scrollHint: string;
    };
    fixedFee: {
      eyebrow: string;
      title: string;
      description: string;
      points: { title: string; description: string }[];
    };
    calculator: {
      eyebrow: string;
      title: string;
      description: string;
      priceLabel: string;
      commissionLabel: string;
      formulaLabel: string;
      traditionalLabel: string;
      nehoLabel: string;
      savingsLabel: string;
      disclaimer: string;
      chartCaption: string;
    };
    offers: {
      eyebrow: string;
      title: string;
      description: string;
      ctaCompare: string;
    };
    steps: {
      eyebrow: string;
      title: string;
      description: string;
      items: { title: string; description: string; duration: string }[];
    };
    regionsMap: {
      eyebrow: string;
      title: string;
      description: string;
      ctaAll: string;
      statAgents: string;
      statRegions: string;
    };
    agents: {
      eyebrow: string;
      title: string;
      description: string;
      ctaAll: string;
    };
    properties: {
      eyebrow: string;
      title: string;
      description: string;
      ctaAll: string;
      newBadge: string;
    };
    digitalTools: {
      eyebrow: string;
      title: string;
      description: string;
      items: { title: string; description: string }[];
    };
    stats: {
      title: string;
      items: { value: string; label: string; verified: boolean }[];
    };
    testimonials: {
      eyebrow: string;
      title: string;
      description: string;
      ctaAll: string;
      verifiedBadge: string;
    };
    faq: {
      eyebrow: string;
      title: string;
      description: string;
      items: { question: string; answer: string }[];
    };
    estimationCta: {
      title: string;
      description: string;
      cta: string;
      timeHint: string;
    };
  };
  pricing: {
    hero: { eyebrow: string; title: string; description: string };
    table: {
      featureColumn: string;
      priceLabel: string;
      priceCaveat: string;
      recommended: string;
      ctaChoose: string;
      categories: { title: string; features: string[] }[];
    };
    faqTitle: string;
    disclaimer: string;
  };
  sell: {
    hero: { eyebrow: string; title: string; description: string; cta: string };
    why: { title: string; points: { title: string; description: string }[] };
    process: { title: string; description: string };
    ctaEstimate: { title: string; description: string; cta: string };
  };
  buy: {
    hero: { eyebrow: string; title: string; description: string; cta: string };
    capacity: {
      title: string;
      description: string;
      incomeLabel: string;
      downPaymentLabel: string;
      ratesLabel: string;
      resultLabel: string;
      disclaimer: string;
      cta: string;
    };
    alerts: { title: string; description: string; cta: string };
  };
  estimation: {
    hero: { title: string; description: string };
    stepLabels: string[];
    steps: {
      address: { title: string; description: string; placeholder: string };
      type: { title: string; description: string; options: string[] };
      surface: { title: string; description: string; label: string };
      rooms: { title: string; description: string; label: string };
      year: { title: string; description: string; label: string };
      condition: { title: string; description: string; options: string[] };
      land: {
        title: string;
        description: string;
        landLabel: string;
        parkingLabel: string;
      };
      contact: {
        title: string;
        description: string;
        nameLabel: string;
        emailLabel: string;
        phoneLabel: string;
      };
      appointment: {
        title: string;
        description: string;
        options: string[];
      };
    };
    submit: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
    successNote: string;
    backToHome: string;
    validationError: string;
  };
  properties: {
    hero: { title: string; description: string };
    filters: {
      title: string;
      location: string;
      radius: string;
      type: string;
      priceMin: string;
      priceMax: string;
      rooms: string;
      surfaceMin: string;
      land: string;
      amenities: string;
      availability: string;
      reset: string;
      apply: string;
      resultsCount: string;
    };
    sort: { label: string; options: string[] };
    view: { grid: string; list: string; map: string };
    empty: { title: string; description: string; cta: string };
    loading: string;
    error: string;
    favorites: { add: string; remove: string; title: string; empty: string };
    alert: { cta: string; title: string; description: string; email: string; submit: string; success: string };
    shareUrl: string;
    pagination: { loadMore: string; page: string };
    availability: { disponible: string; sousOffre: string; vendu: string };
    mapHint: string;
  };
  propertyDetail: {
    demoNotice: string;
    priceLabel: string;
    characteristics: string;
    description: string;
    virtualTour: string;
    floorPlans: string;
    location: string;
    financing: { title: string; cta: string; downPaymentLabel: string; rateLabel: string; monthlyLabel: string; perMonth: string };
    agent: { title: string; ctaVisit: string; ctaCall: string };
    similar: string;
    gallery: { photos: string; virtualTour: string; plans: string };
    characteristicsLabels: { rooms: string; surface: string; land: string; parking: string; year: string };
  };
  team: {
    hero: { title: string; description: string };
    agentCard: { properties: string; contact: string };
  };
  regions: {
    hero: { title: string; description: string };
    canton: {
      agentsTitle: string;
      statsTitle: string;
      communesTitle: string;
      faqTitle: string;
      propertiesTitle: string;
    };
  };
  testimonials: {
    hero: { title: string; description: string };
    verifiedBadge: string;
    filterAll: string;
  };
  blog: {
    hero: { title: string; description: string };
    searchPlaceholder: string;
    categoriesTitle: string;
    readTime: string;
    minRead: string;
    byAuthor: string;
    tableOfContents: string;
    relatedArticles: string;
    shareTitle: string;
    ctaEstimateTitle: string;
    ctaEstimateDescription: string;
    ctaEstimateButton: string;
    allCategory: string;
  };
  about: {
    hero: { eyebrow: string; title: string; description: string };
    story: { title: string; paragraphs: string[] };
    values: { title: string; items: { title: string; description: string }[] };
    timeline: { title: string; items: { year: string; label: string }[] };
  };
  contact: {
    hero: { title: string; description: string };
    form: {
      nameLabel: string;
      emailLabel: string;
      phoneLabel: string;
      subjectLabel: string;
      subjectOptions: string[];
      messageLabel: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successDescription: string;
      errorDescription: string;
    };
    info: { title: string; addressNote: string; hoursTitle: string; hours: string };
  };
  nehoPro: {
    hero: { eyebrow: string; title: string; description: string; cta: string };
    points: { title: string; description: string }[];
  };
  legal: {
    mentions: { title: string; updated: string; sections: { heading: string; body: string[] }[] };
    privacy: { title: string; updated: string; sections: { heading: string; body: string[] }[] };
    cookies: {
      title: string;
      updated: string;
      sections: { heading: string; body: string[] }[];
      manage: { title: string; description: string; necessary: string; necessaryDesc: string; analytics: string; analyticsDesc: string; save: string; acceptAll: string };
    };
  };
  notFound: {
    title: string;
    description: string;
    cta: string;
  };
  form: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    honeypotLabel: string;
  };
}
