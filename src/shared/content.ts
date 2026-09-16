/** Site copy, sourced from sourceoftruthv2.md (Phitsite workspace root).
 *  Voice: cinematic but precise. One register: confident, declarative,
 *  quant-noir. Service and use-case ids are lookup keys for ServiceDrawer
 *  and UseCasesNarrative backgrounds; never change them without updating both.
 *
 *  THREE-LAYER CONTENT CONTRACT (home page). Every home section delivers:
 *    L0 `gunshot` — one claim, <=12 words, carries a number or a named
 *       specific. Set at display size. The only thing a scrolling reader is
 *       guaranteed to consume.
 *    L1 `tracer`  — 25-40 words naming the mechanism or the evidence that
 *       makes L0 survivable.
 *    L2 the existing `details` / drawer copy — never rendered on first pass.
 *  `gunshot`/`tracer` are ADDITIVE: /services and /about still read `summary`
 *  and `details`, so their copy is unaffected by home-page edits. */
import { CAREER_POSITIONS } from "./careersData";

// Small-number-to-word helper so copy can read "Seven open roles" instead of
// "7 open roles" (matching the spelled-out style used elsewhere in `ledes`,
// e.g. "Four disciplines") while still being computed from CAREER_POSITIONS —
// the actual list rendered on /careers — instead of hand-typed and driftable.
const COUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}
const OPEN_ROLES_COUNT = CAREER_POSITIONS.length;

export const CONTENT = {
  hero: {
    /** The hero motto, rendered by `SuperHeroSequence`'s `.hero-motto` block.
     *  Title case because that is how it is set on the page; this string is the
     *  single source, so editing it here changes what ships. It used to be dead
     *  data while the hero carried its own hardcoded literal. */
    tagline: "Making Tomorrow's Technology Available Today",
    /** Hero left-column intro line, rendered under the tagline by
     *  `SuperHeroSequence`'s `.hero-statement`. Single source — edit here. */
    statement:
      "We are an R&D firm built on three equal strengths — research, engineering, and operations. Working alongside clients worldwide, we turn hard problems into systems they can run for years.",
    /** Rendered by the hero left column instead of the full `statement`;
     *  `statement` stays for other readers. */
    lead: "We are an R&D firm built on three equal strengths — research, engineering, and operations.",
    /** Hero proof row (mono meta-labels). Facts only, each traceable to
     *  another CONTENT key — never a manufactured number. */
    proof: [
      "Est. 2019 · BGC, Metro Manila",
      "Clients in the US & UK",
      "Backed across the US, Europe & Hong Kong",
      "24/7 operations",
    ] as readonly string[],
    description:
      "At Phitopolis, we view global markets as the ultimate intellectual puzzle. As a R&D firm, we create technology and solutions driven by deep insights, modern engineering, and latest trends in Artificial Intelligence.",
    salesPitch: {
      heroLine: {
        title: "THE QUANTITATIVE R&D PARTNER FOR GLOBAL MARKETS",
        subheading:
          "Engineering cloud systems, machine learning, and AI for quantitative finance and financial technology.",
      },
      execSummary:
        "At Phitopolis, we view global markets as the ultimate intellectual puzzle. As a specialized R&D firm, we build cloud-native systems, data-science engines, and AI for international clients working in high-complexity environments.",
      capabilities: [
        {
          title: "QUANTITATIVE RESEARCH & AI",
          desc: "Statistical modeling, machine learning, and AI applied to large, noisy, complex financial datasets.",
        },
        {
          title: "PRODUCT & CLOUD ENGINEERING",
          desc: "High-performance systems that run in public and private cloud environments.",
        },
        {
          title: "TECHNICAL SUPPORT & OPERATIONS",
          desc: "Smart, efficient, communicative technical talent operating alongside client teams globally.",
        },
      ],
      // The three images below live in public/images/pillars/. OperatingPillars
      // falls back to a styled CSS placeholder via onError if one fails to load.
      pillars: [
        {
          id: "01",
          name: "Research Pillar",
          detail: "Data Science, Machine Learning, AI & High-Dimensional Statistics",
          image: "/images/pillars/research.webp",
          alt: "Quantitative researcher at a two-monitor workstation, seen from behind",
        },
        {
          id: "02",
          name: "Development Pillar",
          detail: "Public & Private Cloud Architecture, Big Data Systems & Software",
          image: "/images/pillars/development.webp",
          alt: "Software engineer typing at a laptop next to a server rack",
        },
        {
          id: "03",
          name: "Support & Delivery Pillar",
          detail: "Dedicated Technical Staff with Superior Communication & Global Operations",
          image: "/images/pillars/support.webp",
          alt: "Support technician on a headset call in front of a wall of monitors",
        },
      ],
      positioning: {
        target: "Quantitative Finance, Data Providers & Fintech Leaders",
      },
      differentiators: [
        {
          heading: "Technical Talent",
          body: "Smart, efficient engineers and data scientists with exceptional English communication skills.",
        },
        {
          heading: "International Backing",
          body: "Financed by institutional investors across the United States, Europe, and Hong Kong.",
        },
        {
          heading: "Wall St. & Banking Leadership",
          body: "Led by executives with senior tenure at Morgan Stanley, Merrill Lynch, JPMorgan, Deutsche Bank, and Macquarie Bank.",
        }
      ],
      /**
       * The mission beat's single primary action.
       *
       * `leadershipNote` and the deck's original `cta` lived here for the deck's
       * fourth beat ("Leadership credibility & consultative executive CTA"),
       * which was cut — at which point conversion on this beat was carried only
       * by the navbar Contact button and the footer, i.e. by chrome at the very
       * top and the very bottom of a page whose sales pitch is in the middle.
       * The beat states the claim, so the beat carries the ask.
       *
       * The Wall St. pedigree still lives in `differentiators[2]`, framed as a
       * market advantage rather than a bio.
       */
      cta: { label: "Start a conversation", to: "/contact" },
    },
  },
  /** Home-page section ledes (L0/L1). Chapters 0-2 address the institutional
   *  client; chapter 3 addresses the engineering recruit. `dailyLife` is the
   *  handover between the two voices. */
  ledes: {
    mission: {
      gunshot: "Engineered for high performance and reliability.",
      tracer:
        "We build resilient software and cloud infrastructure designed for complex, high-demand environments.",
    },
    reach: {
      gunshot: "Reliable Engineering Delivered Globally",
      // No tracer. The map below states the presence better than a caption can,
      // and "Arcs denote clients and investors" was explaining the diagram
      // rather than saying anything about the business.
      tracer: "",
    },
    dailyLife: {
      gunshot: "That is the work. These are the people who do it.",
      tracer:
        "Our culture, our R&D floor, and the ordinary days that produce the things above.",
    },
    careers: {
      // Derived from CAREER_POSITIONS.length (careersData.ts), the actual list
      // rendered on /careers, so this can never drift out of sync again the
      // way the old hardcoded "Six" did against the real count of seven.
      gunshot: `${countWord(OPEN_ROLES_COUNT)} open roles. One intake a year.`,
      tracer:
        "The Technical Graduate Program takes engineers straight into production systems: not a rotation, not a shadowing track.",
    },
    blog: {
      gunshot: "What the team actually did last quarter.",
      tracer:
        "Community work, onboarding weeks, and the occasional office tournament, written by the people who were there.",
    },
  },
  about: {
    title: "About Us",
    body: "The architectural backbone of modern quantitative engineering",
    sub: "Born where mathematics and modern engineering meet, backed by investors across the USA, Europe, and Hong Kong.",
    overline: "WHO WE ARE",
    /** Rendered two-tone by the /about hero: `headingAccent` in brand gold,
     *  `headingRest` in white. Split here rather than in the component so the
     *  copy stays in one place; the hero used to hardcode its own copy of this
     *  sentence while `heading` sat unread. */
    headingAccent: "Your Global R&D Partner,",
    headingRest: "Built on Trust and Innovation.",
    lead: "Accelerating Your Future with Manila's Top Technical Talent and International Expertise.",
  },
  principles: {
    values: [
      {
        label: "Integrity",
        definition:
          "We operate with honesty and transparency in every interaction. Our word is our bond.",
        valueToClient:
          "Trust and predictability: truthful reporting and ethical decisions that reduce risk and keep partnerships stable.",
      },
      {
        label: "Accountability",
        definition:
          "We take full ownership of our commitments and results, and stand behind our output without excuses.",
        valueToClient:
          "Reliability: by owning wins and setbacks alike, we manage outcomes proactively to hit every milestone.",
      },
      {
        label: "Forward Thinking",
        definition:
          "We don't just solve today's problems; we anticipate tomorrow's through deliberate strategy.",
        valueToClient:
          "A competitive edge: a proactive read on technology and market shifts keeps your business ready to scale.",
      },
      {
        label: "Excellence",
        definition:
          "We set a high bar for performance and continuously refine our process to deliver quality.",
        valueToClient:
          "Fewer errors, higher efficiency, and a product that exceeds expectations — maximizing return on every engagement.",
      },
    ],
  },
  /** Where our people come from — education and disciplines, as insight. */
  talent: {
    // "Equal-opportunity employer" used to sit here as a third "100%" figure —
    // that is a policy statement, not a metric, and placed beside two real
    // percentages it read as a manufactured stat. Removed rather than padded
    // back out to three.
    highlights: [
      { value: 37, suffix: "%", label: "QS Top 1000 educated" },
      { value: 15, suffix: "%", label: "Advanced or international degree" },
    ],
    // Named disciplines summed to 95%, not 100% — an "Other" row closes the
    // distribution honestly instead of presenting a partial breakdown as
    // exhaustive.
    disciplines: [
      { label: "Computer Science", pct: 45 },
      { label: "Sciences", pct: 12 },
      { label: "Mathematics & Statistics", pct: 10 },
      { label: "Engineering", pct: 10 },
      { label: "Business & Management", pct: 8 },
      { label: "Finance & Economics", pct: 5 },
      { label: "Accountancy", pct: 5 },
      { label: "Other", pct: 5 },
    ],
    // Eleven alma maters, carried over from the legacy data. `intl: true`
    // marks the two international schools (WS-16 #2b) so the talent section
    // can give them their own labelled sub-group instead of mixing them in
    // with the nine Philippine schools — the separation is itself a
    // credibility signal.
    schools: [
      { name: "U. of the Philippines", abbr: "UP", logo: "/logos/schools/up.png" },
      { name: "Ateneo de Manila", abbr: "ADMU", logo: "/logos/schools/admu.png" },
      { name: "De La Salle", abbr: "DLSU", logo: "/logos/schools/dlsu.png" },
      { name: "Mapúa", abbr: "Mapúa", logo: "/logos/schools/mapua-university.png" },
      { name: "U. of Santo Tomas", abbr: "UST", logo: "/logos/schools/ust.webp" },
      { name: "Polytechnic U. of the Philippines", abbr: "PUP", logo: "/logos/schools/pup.webp" },
      { name: "Adamson", abbr: "Adamson", logo: "/logos/schools/adamson.webp" },
      { name: "U. of Mindanao", abbr: "UMind", logo: "/logos/schools/mindanao.webp" },
      { name: "AIM", abbr: "AIM", logo: "/logos/schools/aim.webp" },
      { name: "Brunel", abbr: "Brunel", logo: "/logos/schools/brunel.webp", intl: true },
      { name: "Sophia", abbr: "Sophia", logo: "/logos/schools/sophia.webp", intl: true },
    ],
  },
  /** Professional certifications, grouped by provider — insight, not a badge wall. */
  certifications: {
    headline: "Certified across the stack",
    note: "Certifications spanning every cloud and the standards that govern them. The upskilling never stops.",
    groups: [
      {
        provider: "Amazon Web Services",
        items: [
          { name: "Solutions Architect - Professional", logo: "/logos/certs/aws-certs/solutions-architect-pro.webp" },
          { name: "Machine Learning - Specialty", logo: "/logos/certs/aws-certs/machine-learning.webp" },
          { name: "Security - Specialty", logo: "/logos/certs/aws-certs/security.webp" },
          { name: "Data Engineer - Associate", logo: "/logos/certs/aws-certs/data-engineer.webp" },
          { name: "DevOps Engineer - Professional", logo: "/logos/certs/aws-certs/dev-ops-engineer-pro.webp" },
        ],
      },
      {
        provider: "Google Cloud",
        items: [
          { name: "Cloud Architect - Professional", logo: "/logos/certs/more-certs/google-cloud-architect.webp" },
          { name: "Cloud Engineer - Associate", logo: "/logos/certs/more-certs/google-cloud-engineer.webp" },
          { name: "Generative AI Leader", logo: "/logos/certs/more-certs/google-generative-ai-leader.webp" }
        ],
      },
      {
        provider: "Microsoft Azure",
        items: [
          { name: "Solutions Architect - Expert", logo: "/logos/certs/more-certs/ms-azure-solutions-architect.webp" },
          { name: "Cybersecurity Architect - Expert", logo: "/logos/certs/more-certs/ms-cybersecurity-architect.webp" },
          { name: "Network Engineer - Associate", logo: "/logos/certs/more-certs/ms-azure-network-engineer.webp" },
        ],
      },
      {
        provider: "Standards & Governance",
        items: [
          { name: "ISO 27001 Lead Implementer & Auditor", logo: "/logos/certs/iso27001.webp" },
          { name: "PMP - Project Management", logo: "/logos/certs/pmp.webp" },
          { name: "ITIL - Foundation & Practitioner", logo: "/logos/certs/itil.webp" },
          { name: "Red Hat RHCSA", logo: "/logos/certs/redhat.webp" },
          { name: "CFA / CPA", logo: "/logos/certs/cpa.webp" },
        ],
      },
    ],
  },
  services: [
    {
      id: "development",
      title: "Software Engineering",
      gunshot: "High-performance web applications and cloud portals.",
      tracer:
        "We build secure web platforms and real-time dashboards that process large-scale data smoothly and reliably.",
      summary: "Cloud-native web applications and real-time dashboards designed for speed and reliability",
      details:
        "We architect secure web platforms using modern stacks, engineered for enterprise reliability and high availability. Our applications enable teams to visualize complex data and manage operations in real time.",
      techStack: ["TypeScript", "ReactJS", "NodeJS", "GraphQL", "Linux", "Docker", "AWS", "CI/CD"]
    },
    {
      id: "quant-research",
      title: "Quantitative Research",
      gunshot: "Data science, statistical modeling, and machine learning.",
      tracer:
        "We analyze complex datasets and build predictive models using statistical methods and artificial intelligence.",
      summary: "Data analytics and machine learning models built to process large datasets",
      details:
        "Our team processes complex datasets into actionable insights. We build data pipelines and machine learning models that analyze historical trends and real-time inputs with statistical precision.",
      techStack: ["Python", "Machine Learning", "Deep Learning", "Data Analytics"]
    },
    {
      id: "data-science",
      title: "Data Science",
      gunshot: "Automated data pipelines and data architectures.",
      tracer:
        "We design data systems with quality checks at every stage, ensuring engineering and analytics teams work with clean data.",
      summary: "Data pipelines and storage engineered for analytics",
      details:
        "We design automated ETL pipelines and data storage solutions with validation at every step, ensuring all downstream applications receive clean, reliable data.",
      techStack: ["Python", "AWS", "NoSQL", "Postgres", "Docker", "ETL"]
    },
    {
      id: "support",
      title: "Ops Support",
      gunshot: "24/7 technical operations and system monitoring.",
      tracer:
        "Our global engineering teams provide continuous system monitoring and operational support to maintain high uptime.",
      summary: "24/7 global operational continuity and site reliability",
      details:
        "Our global engineering teams monitor and support cloud platforms, data pipelines, and core infrastructure around the clock, proactively resolving issues to ensure continuous uptime.",
      techStack: ["Linux", "UNIX Shell", "Prometheus", "Grafana", "AWS/GCP/Azure"]
    }
  ],
  // Rendered by CandidatesAndCareersSection on the home page. This used to list
  // only 6 of the 7 real positions in CAREER_POSITIONS (careersData.ts) — missing
  // "Technical Graduate Program" — while the /careers route (which reads
  // CAREER_POSITIONS directly) showed all 7. Added the missing entry below so the
  // two counts agree; the other six are left as hand-tuned home-page copy since
  // their text already matches JOB_DETAILS (JobDetailsDrawer.tsx) verbatim.
  // NOTE: JobDetailsDrawer's JOB_DETAILS map (not owned by this fix) still has no
  // "Technical Graduate Program" entry, so clicking that new card currently falls
  // through to its "Full Stack Developer" fallback — flagged for whoever owns
  // that drawer to add the matching entry.
  careers: [
    {
      title: "Quantitative Researcher",
      role: "Hunt for signal in petabytes of market noise with advanced machine learning and statistics",
      stack: ["Python", "Deep Learning", "Statistics", "Big Data"]
    },
    {
      title: "Software Engineer",
      role: "Build the ultra-low latency backbone of global trading systems, where microseconds decide outcomes",
      stack: ["C++", "Rust", "Go", "Python", "Linux", "Performance"]
    },
    {
      title: "Full Stack Developer",
      role: "Architect our SaaS platforms and the interfaces that sit on top of them",
      stack: ["TypeScript", "React", "GraphQL", "Three.js", "CI/CD"]
    },
    {
      title: "Data Scientist",
      role: "Design the ETL pipelines and data lakes that become new products for researchers and traders",
      stack: ["Python", "ETL", "AWS", "Docker", "SQL / NoSQL"]
    },
    {
      title: "DevOps Engineer",
      role: "Keep high-frequency systems and cloud platforms alive around the clock, across every market session",
      stack: ["Kubernetes", "CI/CD", "Prometheus", "AWS / GCP / Azure"]
    },
    {
      title: "Technical Graduate Program",
      role: "A 12-month paid fellowship for outstanding computer science, engineering, and mathematics graduates",
      stack: ["C++", "Python", "TypeScript", "Linux", "Docker", "AWS"]
    },
    {
      title: "R&D Internship Program",
      role: "Paid engineering internship for top undergraduates — production systems, senior mentorship",
      stack: ["React", "TypeScript", "Node.js", "Python", "Git"]
    }
  ],
  // Three-phase growth model, not the old many-in/enclosed/one-out containment
  // metaphor. Each phase carries what it added, so the copy itself reads as
  // accumulation: phase two names what phase one produced as its starting point.
  process: {
    phases: [
      {
        id: "2019-foundation",
        name: "2019: The Foundation",
        caption: "A small, focused team laying the groundwork for resilient core infrastructure",
      },
      {
        id: "2022-expansion",
        name: "2020-2025: The Expansion",
        caption: "Deep data architecture and 24/7 operations, scaling with complex, high-demand datasets",
      },
      {
        id: "2026-powerhouse",
        name: "2026: The Powerhouse",
        caption: "Four unified disciplines—Research, Engineering, Data, and Ops—operating globally as a quantitative R&D partner",
      },
    ],
  },
  contact: {
    address: "27/F Ecotower Building, 32nd St. cor. 9th Avenue, Bonifacio Global City, Taguig, Philippines, 1634",
    offices: ["Bonifacio Global City, PH"],
    clients: ["United States", "United Kingdom"],
    careersEmail: "jobs@phitopolis.com",
    generalInquiries: "info@phitopolis.com"
  },
  /** /team route — leadership bios. Carried over from the legacy site's
   *  `/team` page (no equivalent existed here); see the rebuild carryover
   *  proposal, "port" item 1. */
  team: {
    overline: "The Collective",
    title: "Meet the practitioners.",
    lead: "At Phitopolis, caliber is our only currency. We are a team of global technologists and entrepreneurs dedicated to solving the most complex engineering challenges.",
    members: [
      {
        name: "Mark Walbaum",
        role: "Chief Technology Officer",
        bio: "Former Executive Director at Morgan Stanley with 20+ years of experience in distributed systems and high-frequency trading infrastructure.",
        expertise: ["Low Latency", "Distributed Systems", "FinTech"],
        image: "https://phitopolis.com/img/core-competencies/teamwork-and-leadership.jpg",
      },
      {
        name: "Ben Cilia",
        role: "Chief Data Officer",
        bio: "Data visionary specializing in quantitative analytics and machine learning strategies for large-scale financial institutions.",
        expertise: ["Data Science", "ML Ops", "Quant Strategy"],
        image: "https://phitopolis.com/img/core-competencies/innovation.jpg",
      },
    ],
  },
  /** Insight teasers drawn from the flagship projects in the source of truth. */
  blog: [
    {
      category: "Community & CSR",
      title: "LikhaPolis: Pagbibigay Kulay at Saya",
      blurb: "For the latest CSR day, we, the new interns, were given the responsibility to organize the event, and from that, Project LikhaPolis was born"
    },
    {
      category: "People",
      title: "Ready, Set, School: Brigada Eskwela at Pembo Elementary School",
      blurb: "Our team had the privilege of joining the Brigada Eskwela initiative at Pembo Elementary School, DepEd's annual school maintenance program"
    },
    {
      category: "People",
      title: "2026 Technical Graduate Batch 1 Onboarding Week",
      blurb: "We met our batchmates and future mentors, hyped each other up with group cheers, and then got handed a pile of LEGO bricks with a deceptively tricky challenge"
    },
    {
      category: "People",
      title: "AI Day 2.0: Smarter Systems, Faster Teams",
      blurb: "AI Day 2.0 kicked off the best way possible, with popcorn, juice, and a room full of curious minds ready to explore how AI is shaping the way we work"
    },
    {
      category: "People",
      title: "Sunshine, Stories, and School Kits: A CSR Day to Remember",
      blurb: "There's something truly special about a room full of kindergartners buzzing with excitement! For our latest CSR Day, we got to be right in the middle of it all"
    },
    {
      category: "People",
      title: "Out of Office: Phitopolis Summer 2026",
      blurb: "If summer had a personality, ours would definitely be that one friend who is loud, game for anything, always hungry, and somehow still full of energy"
    },
    {
      category: "People",
      title: "2026 Wellness Week",
      blurb: "After office hours, a few colleagues managed to run together around BGC, something we had been planning since our company's Wellness Week"
    },
    {
      category: "People",
      title: "2024 Technical Graduates Batch 1: Two Years, Milestones of Growth",
      blurb: "It started with iced tea, appetizers, and familiar faces walking in, then quickly turned into a night no one will forget"
    },
    {
      category: "People",
      title: "Game On: Boomerang Fu Brings the Heat (and the Chaos)",
      blurb: "What happens when you take a group of professionals fresh out of a monthly spotlight meeting and arm them with virtual boomerangs? Pure, glorious chaos"
    },
    // Carried over from the legacy site's two real fallback posts (rebuild
    // carryover proposal, "port" item 2) — appended after the existing nine
    // so the newest-first order holds; both predate every date above.
    {
      category: "Community & CSR",
      title: "Joy in Every Bag: Christmas Gift Giving at Brgy. Pinagsama",
      blurb: "It's that time of the year again when giving back takes center stage, as we bring Christmas cheer to the children of Barangay Pinagsama"
    },
    {
      category: "Events & Culture",
      title: "Riding into Our 6th Year: Phitopolis' Wild West Anniversary Celebration",
      blurb: "Phitopolis saddled up and rode into a new frontier, celebrating six remarkable years of growth, innovation, and camaraderie"
    }
  ],
  // Each use case is a vertical, near-full-viewport block on the home page; its
  // `image` sits in a centred morphing frame that crossfades/scales in as the
  // block reaches the middle of the viewport (see `UseCasesNarrative` /
  // `UseCaseMorphStage`). `imageAlt` is the accessible description that
  // replaced the old inline SignalDiagram / PipelineDiagram / FollowTheSunDiagram.
  useCases: [
    {
      id: "uc-1",
      title: "Algorithmic Signal Generation",
      tag: "Quantitative Finance",
      caseTag: "CASE 01 // QUANTITATIVE R&D",
      line: "Statistical models and machine learning on noisy market data, built to find signal that holds out of sample",
      stats: ["STATISTICAL MODELING", "APPLIED ML"],
      specs: [
        { num: "01", name: "High-Frequency Market Sampling" },
        { num: "02", name: "Multi-Factor Noise Filtering" },
        { num: "03", name: "Out-of-Sample Alpha Validation" }
      ],
      image: "/images/use-cases/uc-1.webp",
      imageAlt:
        "Soft isometric clay model of a quantitative research studio: navy data blocks stepping upward, a gold marker ribbon threading left to right into one rising line, frosted noise shapes clearing toward the right"
    },
    {
      id: "uc-2",
      title: "Cloud-Native Infrastructure",
      tag: "Full-Stack & Data",
      caseTag: "CASE 02 // DISTRIBUTED SYSTEMS",
      line: "Event-driven pipelines built to ingest, process, and serve high-volume market and operational data",
      stats: ["CLOUD-NATIVE", "DATA PIPELINES"],
      specs: [
        { num: "01", name: "Multi-Region Ingestion Mesh" },
        { num: "02", name: "Zero-Loss Event Stream Normalization" },
        { num: "03", name: "Sub-Millisecond Dissemination" }
      ],
      image: "/images/use-cases/uc-2.webp",
      imageAlt:
        "Soft isometric clay model of a data pipeline: navy intake pavilions on the left, pale channels merging into one causeway, rounded service pods fanning out on the right, two frost cloud slabs floating above"
    },
    {
      id: "uc-3",
      title: "Global Technical Operations",
      tag: "DevOps & Support",
      caseTag: "CASE 03 // TECHNICAL OPERATIONS",
      line: "Technical teams working with clients across time zones, keeping systems monitored around the clock",
      stats: ["24/7 COVERAGE", "SYSTEM MONITORING"],
      specs: [
        { num: "01", name: "Around-the-Clock Live Monitoring" },
        { num: "02", name: "Daily Shift Handover" },
        { num: "03", name: "Automated System Recovery" }
      ],
      image: "/images/use-cases/uc-3.webp",
      imageAlt:
        "Soft isometric clay model of a pale globe with navy continents on an off-white plinth, three small navy operations desks around it, a soft gold arc across the globe marking a working day"
    }
  ],
  /**
   * The closing section — rendered by `features/home/components/ClosingShelf`.
   *
   * `statement` used to be the hero tagline verbatim, which meant a reader who made
   * it to the bottom was told the same thing they were told at the top. A close has
   * to resolve the opening, not repeat it: the hero promises tomorrow's technology
   * *today*, and this answers where it is and where it runs.
   *
   * Resolved: the brief's original "four time zones" claim was checkable and wrong
   * — Manila (HQ) and Hong Kong are both UTC+8, and New York and Miami are both US
   * Eastern, so those five reach-map cities span THREE zones, not four. The shelf's
   * `people` line below says "global markets" instead, which makes no zone-count
   * claim at all.
   */
  closing: {
    statement: "Built for the People Who Move Markets",
    subline: "From quantitative research to production infrastructure — direct line to the team building it.",
    farewell: "Start a Conversation",
    /** Frames on the shelf, largest first. Order is the render order. */
    shelf: [
      {
        id: "capabilities",
        label: "What we build",
        line: "Four disciplines, one delivery contract: research, engineering, data, and 24/7 operations.",
        href: "/services",
        cta: "See the capabilities",
      },
      {
        id: "journey",
        label: "How we got here",
        line: "Founded in Manila in 2019. Eight chapters from a first small team to the partner clients came back to.",
        href: "/about",
        cta: "Read the journey",
      },
      {
        id: "people",
        label: "Who does the work",
        line: "Engineers and researchers in Manila, working alongside client teams across global markets.",
        href: "/careers",
        cta: "See open roles",
      },
      {
        id: "writing",
        label: "What we published",
        line: "Logs from the team: engineering, platforms, operations, written by the people doing the work.",
        href: "/blog",
        cta: "Read the feed",
      },
    ],
  }
};
