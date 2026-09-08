/**
 * Home page copy, package 4 (v3).
 *
 * A re-authoring of `../cinematic/content.ts` for the same six beats, organised
 * explicitly by the four acts of the page. The earlier version was accurate but
 * read like a capability statement; this version keeps every fact and rewrites
 * the sentences to sell. See docs/design-bar.md rules 1, 7, 9, and 11 for the
 * constraints this file is written against, and tests/copy-buzzwords.test.ts
 * for the enforced word list.
 *
 * Eyebrow budget (design-bar rule 9): allows ceil(6 / 3) = 2. The previous page
 * carried six labelled eyebrows. All six are demoted here: Act I (Opening) and
 * Act IV (Ask) carry no eyebrow at all. Act II and Act III's four sections carry
 * a bare running numeral ("01" through "04") with no label text, which is not a
 * labelled eyebrow. Applications' three panel labels ("Quantitative research",
 * "Software engineering", "Technical operations") function as in-track
 * navigation rather than section eyebrows and count as at most one against the
 * budget. Net usage: 0 to 1 against a budget of 2.
 */

export interface ActOpening {
  headline: string;
  subhead: string;
  microLine: string;
  primaryCta: { label: string; href: string };
  secondaryLink: { label: string; href: string };
}

export interface CapabilityRow {
  title: string;
  body: string;
  items: string[];
}

export interface ActCapabilities {
  kicker: string;
  headline: string;
  intro: string;
  rows: CapabilityRow[];
  link: { label: string; href: string };
}

export interface ApplicationPanel {
  id: string;
  label: string;
  title: string;
  problem: string;
  contribution: string;
  detail: string;
  /**
   * These panel images are atmosphere, not content: they carry no information a
   * screen-reader user needs, so `alt` is intentionally empty and the rendering
   * component marks the image `aria-hidden`. Describing a purely decorative
   * image ("Conceptual metallic data elements resolving into an ordered gold
   * line", etc.) tells an assistive-technology user they are missing content
   * that was never there. Do not restore descriptive alt text here.
   */
  image: { alt: "" };
}

export interface ActApplications {
  kicker: string;
  headline: string;
  intro: string;
  panels: ApplicationPanel[];
}

export interface DeliveryStep {
  title: string;
  body: string;
}

export interface ActDelivery {
  kicker: string;
  headline: string;
  intro: string;
  steps: DeliveryStep[];
  footnote: string;
}

export interface ActCompany {
  kicker: string;
  headline: string;
  bodies: string[];
  link: { label: string; href: string };
  /**
   * The old "14.5995° N / 120.9842° E" coordinate readout is deliberately
   * dropped. It read as engineered precision but carried no information a
   * reader could use, and it is a form of the fake-precision the design bar
   * flags (rule 7): a number with decimal places is not automatically a fact
   * that matters. "Manila, Philippines" says the same true thing plainly.
   */
  locationLine: string;
  videoAriaLabel: string;
}

export interface ActAsk {
  headline: string;
  subhead: string;
  cta: { label: string; href: string };
  microLine: string;
}

export const OPENING: ActOpening = {
  headline: "Quantitative research. Engineered into systems that run.",
  subhead:
    "Phitopolis pairs statistical research with the software and operations to put it into production, for firms trading and building in global markets.",
  microLine: "Manila. Built for global markets.",
  primaryCta: { label: "Start a conversation", href: "/contact" },
  secondaryLink: { label: "See how we work", href: "#capabilities" },
};

export const CAPABILITIES: ActCapabilities = {
  kicker: "01",
  headline: "Three disciplines. One team.",
  intro:
    "Most firms hire a research shop, a dev shop, and a support desk, then hope the handoffs hold. We run all three under one roof.",
  rows: [
    {
      title: "Research and AI",
      body: "We find structure in market data and test it against evidence, not intuition, before anything gets built around it.",
      items: ["Statistical modelling", "Machine learning", "Research validation"],
    },
    {
      title: "Software and cloud",
      body: "A promising model is not a product. We turn it into a system a trading desk or an operations team can depend on every day.",
      items: ["Data pipelines", "Cloud infrastructure", "Application engineering"],
    },
    {
      title: "Technical operations",
      body: "We keep the work running, with our engineers working alongside your own team, not handed off at the point of delivery.",
      items: ["System monitoring", "Production support", "Operational handover"],
    },
  ],
  link: { label: "Explore our capabilities", href: "/services" },
};

export const APPLICATIONS: ActApplications = {
  kicker: "02",
  headline: "Where the work runs.",
  intro: "Three problems we solve for clients every day.",
  panels: [
    {
      id: "signal",
      label: "Quantitative research",
      title: "Find the signal. Prove it holds.",
      problem:
        "Market data is noisy. A pattern only matters if it survives scrutiny outside the sample that found it.",
      contribution:
        "Statistical modelling and machine learning, with out-of-sample validation built into the research process itself, not bolted on after.",
      detail: "Algorithmic signal generation",
      image: { alt: "" },
    },
    {
      id: "cloud",
      label: "Software engineering",
      title: "Complex data. A clear path through it.",
      problem:
        "Market and operational data need to move between systems reliably, at volume, without losing a record along the way.",
      contribution:
        "Event-driven pipelines and cloud infrastructure built to ingest, process, and serve the data your applications actually need.",
      detail: "Cloud-native infrastructure",
      image: { alt: "" },
    },
    {
      id: "operations",
      label: "Technical operations",
      title: "Keep the system moving forward.",
      problem: "Production systems need attention long after the first release ships.",
      contribution:
        "Our technical teams work alongside yours across time zones, covering monitoring, investigation, and operational continuity.",
      detail: "Global technical operations",
      image: { alt: "" },
    },
  ],
};

export const DELIVERY: ActDelivery = {
  kicker: "03",
  headline: "Define. Build. Operate.",
  intro:
    "One connected process, from the first question you bring us to the system that keeps answering it.",
  steps: [
    {
      title: "Define",
      body: "We get specific about the problem, the data, and the constraints you are operating under, and agree on what success actually looks like.",
    },
    {
      title: "Build",
      body: "Research, engineering, and validation happen together, so the strongest approach is the one that ships, not the one that only worked in a notebook.",
    },
    {
      title: "Operate",
      body: "We bring the system into production and stay on it, supporting, learning, and improving it as your needs change.",
    },
  ],
  footnote: "Research informs what gets built. Operations inform what gets built next.",
};

export const COMPANY: ActCompany = {
  kicker: "04",
  headline: "Built in Manila. Working globally.",
  bodies: [
    "Phitopolis was founded in Manila in 2019. Today our engineers, researchers, and technical specialists work on the same problems financial technology firms face everywhere.",
    "Our leadership has worked inside global financial institutions. Our teams do the research and engineering to put that experience to work for you.",
  ],
  link: { label: "Meet Phitopolis", href: "/about" },
  locationLine: "Manila, Philippines",
  videoAriaLabel: "Inside Phitopolis, Manila",
};

export const ASK: ActAsk = {
  headline: "Bring us the hard problem.",
  subhead:
    "If it involves market data, a model that needs to survive contact with production, or a system that has to run correctly at 3 a.m. Manila time, that is the conversation we want to have.",
  cta: { label: "Start a conversation", href: "/contact" },
  microLine: "A person reads every message. You will hear back within 1 to 2 business days.",
};
