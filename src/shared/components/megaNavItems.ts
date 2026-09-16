export type NavGroupId = "work" | "people";

export interface NavGroup {
  id: NavGroupId;
  label: string;
}

/** Two sections, not named after any single page (avoids literally calling
 *  one "Services" when that's already a page label) — "what the firm does"
 *  vs. "who you'd be reaching / joining / meeting". */
export const NAV_GROUPS: NavGroup[] = [
  { id: "work", label: "What We Do" },
  { id: "people", label: "Meet The People" },
];

export interface NavSectionItem {
  to: string;
  label: string;
  sub: string;
  tag: string;
  group: NavGroupId;
}

export const MEGA_NAV_ITEMS: NavSectionItem[] = [
  {
    to: "/",
    label: "Home",
    sub: "Signal Core & High-Performance Platforms",
    tag: "01",
    group: "work",
  },
  {
    to: "/services",
    label: "Services",
    sub: "Full-Stack, Quant Research, Data & SRE Ops",
    tag: "02",
    group: "work",
  },
  {
    to: "/contact",
    label: "Contact",
    sub: "BGC Manila R&D Office",
    tag: "03",
    group: "work",
  },
  {
    to: "/about",
    label: "About",
    sub: "Who We Are, Principles & Manila R&D Firm",
    tag: "04",
    group: "people",
  },
  {
    to: "/careers",
    label: "Careers",
    sub: "Graduate Fellowships & Paid R&D Internships",
    tag: "05",
    group: "people",
  },
  {
    to: "/blog",
    label: "Blog",
    sub: "Engineering Research & Tech Articles",
    tag: "06",
    group: "people",
  },
  {
    to: "/team",
    label: "Team",
    sub: "Leadership Across Engineering & Data",
    tag: "07",
    group: "people",
  },
];
