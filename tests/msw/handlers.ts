import { HttpResponse, http } from "msw";

import type { components } from "@/shared/api/schema";

type Schemas = components["schemas"];

export const servicesFixture: Schemas["ServiceOut"][] = [
  {
    id: "1",
    slug: "development",
    name: "Development",
    tagline: "Systems leveraging data science, machine learning and big data.",
    description: "C++, Python and MERN systems on public and private cloud.",
    icon: "hub",
    highlights: ["C++/Python/MERN in production", "AWS cloud", "Global clients"],
    display_order: 1,
  },
  {
    id: "2",
    slug: "research",
    name: "Research",
    tagline: "Statistics, machine learning, and AI against large, noisy data.",
    description: "Modeling large, noisy, and complex data sets.",
    icon: "query_stats",
    highlights: ["Statistical modeling", "Reproducible methodology", "Deployable findings"],
    display_order: 2,
  },
];

export const contactCreatedFixture: Schemas["ContactMessageOut"] = {
  id: "41",
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Partnership question",
  message: "We would like to explore a research partnership with your lab.",
  created_at: "2026-06-30T12:00:00Z",
};

export const blogPostFixture: Schemas["BlogPostOut"] = {
  id: "1",
  slug: "titan-an-execution-engine-measured-in-microseconds",
  title: "Titan: an execution engine measured in microseconds",
  category: "Engineering",
  excerpt: "How we built an order router that drinks millions of market ticks per second.",
  body: "Titan is our execution engine.\n\nBuilt in C++ with low-latency discipline.",
  image_url: null,
  author: null,
  published_on: "2026-07-01",
  featured: true,
  // `status` is a new required field on the regenerated BlogPostOut/Summary
  // schema (Heimdall's ContentStatus enum) — added here so this pre-existing
  // fixture keeps typechecking after `yarn typegen` picked it up.
  status: "published",
};

export const blogPageFixture: Schemas["BlogPostPage"] = {
  items: [
    {
      id: blogPostFixture.id,
      slug: blogPostFixture.slug,
      title: blogPostFixture.title,
      category: blogPostFixture.category,
      excerpt: blogPostFixture.excerpt,
      image_url: blogPostFixture.image_url,
      author: blogPostFixture.author,
      published_on: blogPostFixture.published_on,
      featured: blogPostFixture.featured,
      status: blogPostFixture.status,
    },
    {
      id: "2",
      slug: "dataflow-markets-as-a-living-globe",
      title: "DataFlow: markets as a living globe",
      category: "Design",
      excerpt: "WebGL storytelling for global liquidity.",
      image_url: null,
      author: null,
      published_on: "2026-04-22",
      featured: false,
      status: "published",
    },
  ],
  total: 2,
  limit: 20,
  offset: 0,
};

// Summary rows for the /careers list — mirrors the shape of the 7 real
// positions that used to live in the now-deleted src/shared/careersData.ts,
// spread across all 4 backend categories so category-filter tests have
// something to filter.
export const jobPostingsFixture: Schemas["JobPostingSummary"][] = [
  {
    id: "1",
    slug: "technical-graduate-program",
    title: "Technical Graduate Program",
    employment_type: "Full-Time Fellowship",
    category: "Graduate Program",
    department: "Engineering & Quant R&D",
    location: "BGC Office, Manila (Hybrid Schedule)",
    badge: "GRADUATE FELLOWSHIP",
    summary:
      "Our premier 12-month paid fellowship for outstanding computer science, engineering, and mathematics graduates.",
    stack: ["C++", "Python", "TypeScript", "Linux", "Docker", "AWS"],
    published_on: "2026-01-01",
    display_order: 1,
    status: "published",
  },
  {
    id: "2",
    slug: "rd-internship-program",
    title: "R&D Internship Program",
    employment_type: "Paid Internship",
    category: "Internships",
    department: "Software & Data Systems",
    location: "BGC Office, Manila (Hybrid Schedule)",
    badge: "PAID INTERNSHIP",
    summary: "Immersive 3 to 6-month paid engineering internship for top undergraduate students.",
    stack: ["React", "TypeScript", "Node.js", "Python", "Git"],
    published_on: "2026-01-02",
    display_order: 2,
    status: "published",
  },
  {
    id: "3",
    slug: "quant-researcher",
    title: "Quantitative Researcher",
    employment_type: "Full-Time",
    category: "Engineering & Quant",
    department: "Quantitative Research",
    location: "BGC Office, Manila (Hybrid Schedule)",
    badge: "QUANT & AI",
    summary: "Hunt for tradeable signals in petabytes of financial market noise.",
    stack: ["Python", "Deep Learning", "Statistics", "Big Data", "Machine Learning", "Git"],
    published_on: "2026-01-03",
    display_order: 3,
    status: "published",
  },
  {
    id: "4",
    slug: "software-engineer",
    title: "Systems Software Engineer (C++ / Low Latency)",
    employment_type: "Full-Time",
    category: "Engineering & Quant",
    department: "Core Systems R&D",
    location: "BGC Office, Manila (Hybrid Schedule)",
    badge: "LOW-LATENCY CORE",
    summary: "Build the ultra-low latency backbone of global trading systems.",
    stack: ["C++", "Rust", "Go", "Python", "Linux", "Performance Profiling"],
    published_on: "2026-01-04",
    display_order: 4,
    status: "published",
  },
  {
    id: "5",
    slug: "full-stack-developer",
    title: "Full Stack Web Developer",
    employment_type: "Full-Time",
    category: "Engineering & Quant",
    department: "Web & Enterprise SaaS",
    location: "BGC Office, Manila (Hybrid Schedule)",
    badge: "FULL-STACK SAAS",
    summary: "Architect our cloud-native SaaS platforms and responsive user interfaces.",
    stack: ["TypeScript", "React", "GraphQL", "NestJS", "PostgreSQL", "Docker", "CI/CD"],
    published_on: "2026-01-05",
    display_order: 5,
    status: "published",
  },
  {
    id: "6",
    slug: "data-scientist",
    title: "Data Scientist & Pipeline Engineer",
    employment_type: "Full-Time",
    category: "Engineering & Quant",
    department: "Data Engineering & Analytics",
    location: "BGC Office, Manila (Hybrid Schedule)",
    badge: "DATA LAKES & ETL",
    summary: "Design the ETL pipelines, quality gates, and data lakes that become new trading products.",
    stack: ["Python", "ETL", "AWS", "Docker", "SQL / NoSQL", "Linux"],
    published_on: "2026-01-06",
    display_order: 6,
    status: "published",
  },
  {
    id: "7",
    slug: "devops-engineer",
    title: "DevOps & Cloud SRE Engineer",
    employment_type: "Full-Time",
    category: "Cloud & Infrastructure",
    department: "Site Reliability & Ops",
    location: "BGC Office, Manila (24x7 Shift Environment)",
    badge: "CLOUD & SRE",
    summary: "Keep high-frequency trading systems and cloud platforms running flawlessly around the clock.",
    stack: ["Kubernetes", "CI/CD", "Prometheus", "Grafana", "AWS / GCP", "Linux"],
    published_on: "2026-01-07",
    display_order: 7,
    status: "published",
  },
];

/** Full detail bodies, keyed by slug, for `GET /api/v1/job-postings/{slug}`. */
export const jobPostingDetailFixtures: Record<string, Schemas["JobPostingOut"]> = {
  "technical-graduate-program": {
    ...jobPostingsFixture[0]!,
    description:
      "The Phitopolis Technical Graduate Program transitions exceptional university graduates into software engineers and quantitative researchers.",
    responsibilities: [
      "Design, implement, and maintain high-performance software modules and quantitative data pipelines.",
      "Collaborate directly with principal staff engineers on C++, Rust, Python, and TypeScript production stacks.",
    ],
    requirements: [
      "Recent graduate or final-year student in Computer Science, Computer Engineering, Mathematics, Physics, or related STEM fields.",
      "Solid proficiency in at least one modern language: C++, Python, TypeScript, Rust, or Go.",
    ],
    benefits: [
      "Competitive starting salary and annual performance bonuses.",
      "1-on-1 dedicated mentorship with principal staff engineers.",
    ],
  },
  "rd-internship-program": {
    ...jobPostingsFixture[1]!,
    description:
      "The R&D Internship Program gives high-achieving undergraduate students early exposure to enterprise software development.",
    responsibilities: [
      "Build production features for web portals, analytics dashboards, and automated test suites.",
      "Write clean, well-tested code in React, Node.js, Python, or Go under senior guidance.",
    ],
    requirements: [
      "Currently enrolled undergraduate student in Computer Science, IT, Engineering, or relevant technical discipline.",
      "Available for a 3 to 6-month internship period (full-time or part-time hybrid).",
    ],
    benefits: [
      "Competitive paid internship allowance.",
      "Direct priority fast-track evaluation for our full-time Technical Graduate Program.",
    ],
  },
  "quant-researcher": {
    ...jobPostingsFixture[2]!,
    description:
      "Apply mathematical and statistical techniques and engineering software to develop, analyze, and implement models that produce financial trading signals.",
    responsibilities: [
      "Analyze and implement academic research literature to create and refine quantitative investment strategies.",
      "Explore datasets and implement Machine Learning algorithms to produce signals for profitable trading opportunities.",
    ],
    requirements: [
      "Strong quantitative abilities (degree in a quantitative field such as Math, Physics, CS, Engineering, Stats).",
      "Proficiency in developing data-related software in Python.",
    ],
    benefits: [
      "Competitive quantitative compensation and annual profit-sharing incentive.",
      "Direct exposure to global hedge fund strategies and petabyte-scale market data.",
    ],
  },
  "software-engineer": {
    ...jobPostingsFixture[3]!,
    description:
      "Develop infrastructure that makes modern data-driven applications in financial services possible, enabling ingestion, processing, storage, and analytics of financial data at scale.",
    responsibilities: [
      "Implement core system functionality according to agreed high-performance software architecture.",
      "Write production quality code: correct, ultra-performant, maintainable, with high unit test coverage.",
      "Participate in rigorous peer code reviews and architectural discussions.",
      "Support and optimize deployed high-frequency systems and market data pipelines.",
    ],
    requirements: [
      "Experience in writing and debugging high-performance systems applications.",
      "Experience writing production code in systems development languages (C++, Java, Python, Rust, Go).",
      "Knowledgeable in measuring code performance, latency profiling, and memory management.",
      "Must be comfortable working in a Linux terminal environment.",
    ],
    benefits: [
      "Market-leading salary package with performance bonuses.",
      "Hands-on exposure to microsecond-level C++/Rust trading engines.",
      "Full HMO health coverage for employee and dependents.",
      "Relocation and remote work flexibility options.",
    ],
  },
  "full-stack-developer": {
    ...jobPostingsFixture[4]!,
    description:
      "Build and maintain production-level software applications, including responsive user interfaces, reliable backend API services, and high-performance database architectures.",
    responsibilities: [
      "Understand business needs and translate them into technical specifications.",
      "Build and maintain web applications across the front end and the back end.",
    ],
    requirements: [
      "Ability to design software with production-ready software engineering standards.",
      "Proficiency in JavaScript and TypeScript.",
    ],
    benefits: [
      "Competitive salary package with annual appraisal and performance bonuses.",
      "Comprehensive HMO coverage for employee and dependents.",
    ],
  },
  "data-scientist": {
    ...jobPostingsFixture[5]!,
    description:
      "Use problem-solving skills and software engineering practices to design, develop, and deploy data pipelines and data products for researchers and quantitative traders.",
    responsibilities: [
      "Build and optimize ETL environments supporting quantitative research and automated trading.",
      "Implement automated data quality and validation checks for data integrity.",
    ],
    requirements: [
      "Prior experience in designing, building, and deploying software solutions.",
      "Proficiency in developing data-related software in Python.",
    ],
    benefits: [
      "Competitive compensation package with growth incentives.",
      "Hands-on experience processing petabytes of market tick data.",
    ],
  },
  "devops-engineer": {
    ...jobPostingsFixture[6]!,
    description:
      "Code, build, test, release, configure, administer, and monitor cloud and on-premise infrastructure using automation, CI/CD pipelines, and Prometheus/Grafana monitoring.",
    responsibilities: [
      "Operations and support for High-Frequency Trading systems and Financial Market Data Pipelines across AWS/GCP/Azure.",
      "Work with the Development, Data, and Research teams to improve IT operations.",
    ],
    requirements: [
      "1-2 years experience supporting Linux environments with strong command line skills.",
      "Fundamental UNIX/Linux knowledge and detail-oriented personality.",
    ],
    benefits: [
      "Shift allowance and competitive base salary package.",
      "Comprehensive HMO coverage for employee and family.",
    ],
  },
};

function jobPostingsPageFor(url: URL): Schemas["JobPostingPage"] {
  const category = url.searchParams.get("category");
  const limit = Number(url.searchParams.get("limit") ?? "9");
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const filtered = category
    ? jobPostingsFixture.filter((posting) => posting.category === category)
    : jobPostingsFixture;
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit,
    offset,
  };
}

export const handlers = [
  http.get("*/api/v1/services", () => HttpResponse.json(servicesFixture)),
  http.post("*/api/v1/contact-messages", () =>
    HttpResponse.json(contactCreatedFixture, { status: 201 }),
  ),
  http.get("*/api/v1/blog-posts", () => HttpResponse.json(blogPageFixture)),
  http.get("*/api/v1/blog-posts/:slug", () => HttpResponse.json(blogPostFixture)),
  http.get("*/api/v1/job-postings", ({ request }) =>
    HttpResponse.json(jobPostingsPageFor(new URL(request.url))),
  ),
  http.get("*/api/v1/job-postings/:slug", ({ params }) => {
    const slug = params["slug"] as string;
    const detail = jobPostingDetailFixtures[slug];
    if (!detail) {
      return HttpResponse.json(
        { type: "about:blank", title: "Not Found", status: 404, detail: "Job posting not found." },
        { status: 404 },
      );
    }
    return HttpResponse.json(detail);
  }),
];
