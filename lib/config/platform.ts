export const platformConfig = {
  island: {
    name: "Thoddoo",
    atoll: "Alif Alif Atoll",
    country: "Maldives",
    coordinates: {
      latitude: 4.4376,
      longitude: 72.9596
    }
  },
  brand: {
    name: "iThoddoo Maldives",
    legalName: "iThoddoo Maldives",
    tagline: "Local island stays, experiences, transfers, and growth partnerships",
    domain: "ithoddoo.com"
  },
  currency: {
    code: "USD",
    symbol: "$",
    locale: "en-US"
  },
  timezone: "Indian/Maldives",
  whatsappNumbers: {
    concierge: "+9609142538",
    partnerships: "+9609142538",
    support: "+9609142538"
  },
  companyContact: {
    address: "Thoddoo, Alif Alif Atoll, Maldives",
    phone: "+960 914 2538",
    email: "hello@ithoddoo.com"
  },
  supportEmail: "support@ithoddoo.com",
  socialLinks: {
    instagram: "https://instagram.com/ithoddoomaldive",
    facebook: "https://facebook.com/ithoddoomaldive",
    tiktok: "https://tiktok.com/@ithoddoomaldive"
  },
  expansion: {
    enableMultiIsland: false,
    enablePartnerPortal: true,
    enableAdminCms: true,
    enableBookingPersistence: false,
    enableRealPayments: false,
    targetVersion: "1.0"
  }
} as const;

export type PlatformConfig = typeof platformConfig;
