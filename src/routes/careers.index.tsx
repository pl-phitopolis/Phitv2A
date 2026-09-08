import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { SpecularButton as Button, SpecularIconButton as IconButton } from "@/shared/components/ui/specular";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";

// api + components imported directly (not the barrel) so the eager loader
// doesn't pull the components into the main bundle.
import { careersPostsQuery } from "@/features/careers/api";
import type { CareersListParams, JobPostingSummary } from "@/features/careers/api";
import { Reveal } from "@/shared/components/Reveal";
import { Section } from "@/shared/components/Section";
import { RouterButton } from "@/shared/components/RouterLink";
import { BrochureDrawer } from "@/shared/components/BrochureDrawer";
import { pageHead } from "@/shared/seo";
import { MONO, DISPLAY_FONT, BODY_FONT, TYPE_SCALE, LINE_HEIGHT, TRACKING } from "@/shared/theme/theme";
import { NOIR } from "@/shared/theme/palette";
import { NAV_ANCHORS } from "@/shared/components/NavbarContext";
import { useNavbarAnchor } from "@/shared/components/navbarHooks";
import { VideoPageHero } from "@/shared/components/VideoPageHero";
import { CAREERS_LOOP } from "@/shared/components/useBackgroundVideo";
// Relocated from /about: the graduate cohorts and the culture around them
// belong beside the job register, not inside the company story. The category
// chips above already read "Graduate Program" and "Internships".
import { GraduateHallOfFameSection } from "@/features/careers/components/GraduateHallOfFameSection";
import { FuntopolisSection } from "@/features/careers/components/FuntopolisSection";

const PAGE_SIZE = 9;

// Mirrors Heimdall's `JobPostingCreate.category` enum (schema.d.ts) — the
// only categories the backend accepts as a filter.
const CATEGORIES = [
  "Graduate Program",
  "Internships",
  "Engineering & Quant",
  "Cloud & Infrastructure",
] as const;

function isCareersCategory(value: unknown): value is (typeof CATEGORIES)[number] {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

/** All params optional so plain links to /careers need no search object. */
interface CareersSearch {
  offset?: number | undefined;
  category?: (typeof CATEGORIES)[number] | undefined;
}

function paramsFromSearch(search: CareersSearch): CareersListParams {
  return {
    limit: PAGE_SIZE,
    offset: search.offset ?? 0,
    ...(search.category !== undefined ? { category: search.category } : {}),
  };
}

export const Route = createFileRoute("/careers/")({
  validateSearch: (search: Record<string, unknown>): CareersSearch => {
    const rawOffset = search["offset"];
    const offset =
      typeof rawOffset === "number" && Number.isInteger(rawOffset) && rawOffset > 0
        ? rawOffset
        : undefined;
    const rawCategory = search["category"];
    const category = isCareersCategory(rawCategory) ? rawCategory : undefined;
    return {
      ...(offset !== undefined ? { offset } : {}),
      ...(category !== undefined ? { category } : {}),
    };
  },
  head: () =>
    pageHead(
      "Careers & Graduate Programs | Phitopolis R&D",
      "Join Phitopolis R&D in Manila to explore paid engineering internships, full-time technical graduate fellowships, and senior engineering roles."
    ),
  loaderDeps: ({ search }) => search,
  // Warm the cache without blocking or failing the route — the page renders
  // its empty state immediately and swaps in live posts on arrival.
  loader: ({ context, deps }) => {
    void context.queryClient
      .ensureQueryData(careersPostsQuery(paramsFromSearch(deps)))
      .catch(() => undefined);
  },
  component: CareersIndexPage,
});

/**
 * Dark cinematic video header, unified with /blog and /services via
 * `VideoPageHero`. The headline is a `<p>`, not a heading — the page's real
 * `<h1>` stays in the register section below.
 */
function CareersVideoHero() {
  return (
    <VideoPageHero
      anchor={NAV_ANCHORS.CAREERS_HERO}
      loop={CAREERS_LOOP}
      eyebrow="Careers · Phitopolis R&D Manila"
      headline="See a day here before you decide to spend years."
      headingComponent="p"
      lead="Paid engineering internships, technical graduate fellowships, and senior roles — building the platforms Phitopolis runs on."
    />
  );
}

export function CareersIndexPage() {
  const anchorRef = useNavbarAnchor(NAV_ANCHORS.CAREERS_PAGE, { dark: false });
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [brochureOpen, setBrochureOpen] = useState(false);

  const page = useQuery(careersPostsQuery(paramsFromSearch(search)));
  const data = page.data;

  const selectedCategory = search.category ?? "All";
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const currentPage = data ? Math.floor(data.offset / data.limit) + 1 : 1;

  // The backend's `/api/v1/job-postings` list only accepts `category` +
  // pagination — there's no free-text `q` search (unlike /blog-posts). So this
  // filters only the CURRENTLY LOADED page of results, client-side, rather
  // than querying the full category — a deliberate scope trade-off, not a bug.
  const q = searchQuery.toLowerCase().trim();
  const visiblePositions: JobPostingSummary[] = (data?.items ?? []).filter((position) => {
    if (q === "") return true;
    return (
      position.title.toLowerCase().includes(q) ||
      position.department.toLowerCase().includes(q) ||
      position.summary.toLowerCase().includes(q) ||
      position.stack.some((tech) => tech.toLowerCase().includes(q))
    );
  });

  const toggleExpanded = (id: string) => {
    setExpandedJobId((curr) => (curr === id ? null : id));
  };

  const onCategoryChange = (label: (typeof CATEGORIES)[number] | "All") => {
    void navigate({
      search: {
        ...(label !== "All" ? { category: label } : {}),
      },
    });
  };

  const onPageChange = (pageNumber: number) => {
    const offset = (pageNumber - 1) * PAGE_SIZE;
    void navigate({
      search: {
        ...(search.category !== undefined ? { category: search.category } : {}),
        ...(offset > 0 ? { offset } : {}),
      },
    });
  };

  return (
    <>
    <CareersVideoHero />
    <Box
      ref={anchorRef}
      data-ground="light"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--g-void)",
        background: "var(--g-page)",
        color: "var(--text-1)",
        pt: { xs: 6, md: 9 },
        pb: { xs: 10, md: 16 },
        position: "relative",
      }}
    >
      <Section>
        <Stack spacing={{ xs: 6, md: 8 }} sx={{ position: "relative", zIndex: 1 }}>
          {/* ── Archival Register Header & Meta-bar ── */}
          <Box>
            <Reveal>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.2, mb: 2 }}>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: MONO,
                    fontSize: TYPE_SCALE.micro,
                    fontWeight: 700,
                    letterSpacing: TRACKING.meta,
                    color: "var(--accent-ink)",
                    textTransform: "uppercase",
                  }}
                >
                  REGISTER · PHITOPOLIS R&D MANILA
                </Typography>
              </Box>
            </Reveal>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "flex-end" },
                gap: 3,
              }}
            >
              <Box sx={{ maxWidth: "70ch" }}>
                <Reveal delay={0.05}>
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontFamily: DISPLAY_FONT,
                      fontSize: { xs: "2.2rem", sm: "3rem", md: "3.75rem" },
                      fontWeight: 700,
                      letterSpacing: TRACKING.display,
                      lineHeight: 1.06,
                      color: "var(--text-1)",
                      mb: 2,
                    }}
                  >
                    Active Engineering Positions & Graduate Fellowships
                  </Typography>
                </Reveal>
                <Reveal delay={0.1}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: BODY_FONT,
                      fontSize: { xs: "1rem", md: "1.125rem" },
                      color: "var(--text-2)",
                      lineHeight: LINE_HEIGHT.relaxed,
                      maxWidth: "65ch",
                    }}
                  >
                    Open engineering roles, quantitative research fellowships, and paid R&D internships at our Manila development center. Explore file dossiers below.
                  </Typography>
                </Reveal>
              </Box>

              {/* Quiet Tertiary Utility: Program Brochure Trigger */}
              <Reveal delay={0.15}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setBrochureOpen(true)}
                  startIcon={<PictureAsPdfIcon sx={{ fontSize: "1rem" }} />}
                  sx={{
                    fontFamily: MONO,
                    fontSize: TYPE_SCALE.caption,
                    letterSpacing: "0.06em",
                    color: "var(--text-2)",
                    borderColor: "var(--glass-border-1)",
                    bgcolor: "var(--glass-fill-1)",
                    borderRadius: "var(--r-control)",
                    px: 2.2,
                    py: 0.9,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      borderColor: "var(--glass-border-2)",
                      bgcolor: "var(--glass-fill-2)",
                      color: "var(--text-1)",
                    },
                    "&:focus-visible": {
                      outline: "2px solid var(--accent-fg)",
                      boxShadow: "0 0 0 4px var(--focus-halo)",
                    },
                  }}
                >
                  PROGRAM BROCHURE (PDF)
                </Button>
              </Reveal>
            </Box>
          </Box>

          {/* ── Search & Category Filter Rail ── */}
          <Reveal delay={0.2}>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", md: "center" },
                  gap: 2.5,
                }}
              >
                {/* Search Input Well — filters the currently loaded page only;
                    the backend has no free-text search on this endpoint. */}
                <Box sx={{ width: { xs: "100%", md: "380px" } }}>
                  <TextField
                    placeholder="Search by role, stack (e.g. C++, Python, AWS)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "var(--text-3)", fontSize: "1.1rem" }} />
                          </InputAdornment>
                        ),
                        endAdornment: searchQuery ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setSearchQuery("")}
                              aria-label="Clear search query"
                              sx={{ color: "var(--text-3)", p: 0.5, "&:hover": { color: "var(--text-1)" } }}
                            >
                              <CloseIcon sx={{ fontSize: "0.95rem" }} />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "var(--r-control)",
                        bgcolor: "var(--glass-fill-1)",
                        fontFamily: MONO,
                        fontSize: TYPE_SCALE.caption,
                        color: "var(--text-1)",
                        "& fieldset": { borderColor: "var(--glass-border-1)" },
                        "&:hover fieldset": { borderColor: "var(--glass-border-2)" },
                        "&.Mui-focused fieldset": {
                          borderColor: "var(--accent-fg)",
                          boxShadow: "0 0 0 3px var(--focus-halo)",
                        },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "var(--text-3)",
                        opacity: 1,
                      },
                    }}
                  />
                </Box>

                {/* Category Chips — each sets/clears the `category` search
                    param (server-side filter) and resets to page 1. */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                  {(["All", ...CATEGORIES] as const).map((label) => {
                    const isSelected = selectedCategory === label;
                    return (
                      <Chip
                        key={label}
                        label={
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
                            <Typography
                              component="span"
                              sx={{
                                fontFamily: MONO,
                                fontSize: TYPE_SCALE.micro,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                              }}
                            >
                              {label.toUpperCase()}
                            </Typography>
                          </Box>
                        }
                        onClick={() => onCategoryChange(label)}
                        sx={{
                          cursor: "pointer",
                          height: 32,
                          px: 0.5,
                          borderRadius: "var(--r-control)",
                          bgcolor: isSelected ? "var(--accent-15)" : "var(--glass-fill-1)",
                          color: isSelected ? "var(--accent-ink)" : "var(--text-2)",
                          border: "1px solid",
                          borderColor: isSelected ? "var(--accent-border)" : "var(--glass-border-1)",
                          transition: "all var(--dur) var(--ease-out)",
                          "&:hover": {
                            bgcolor: isSelected ? "var(--accent-20)" : "var(--glass-fill-2)",
                            borderColor: isSelected ? "var(--accent-fg)" : "var(--glass-border-2)",
                            color: isSelected ? "var(--accent-ink)" : "var(--text-1)",
                          },
                          "&:focus-visible": {
                            outline: "2px solid var(--accent-fg)",
                            boxShadow: "0 0 0 4px var(--focus-halo)",
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </Reveal>

          {/* ── Register: one homogeneous list (a single page can't reliably
              hold every category's full contents once paginated, so grouping
              by category only makes sense while a single category is
              selected) ── */}
          <Box>
            {visiblePositions.length === 0 ? (
              <Reveal>
                <Box
                  sx={{
                    p: { xs: 4, sm: 6 },
                    borderRadius: "var(--r-card)",
                    border: "1px dashed var(--glass-border-2)",
                    bgcolor: "var(--glass-fill-1)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: TYPE_SCALE.micro,
                      letterSpacing: TRACKING.meta,
                      color: "var(--accent-ink)",
                      mb: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    ARCHIVE STATUS // 0 MATCHES
                  </Typography>
                  <Typography
                    variant="h4"
                    component="p"
                    sx={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 600,
                      color: "var(--text-1)",
                      mb: 1.5,
                    }}
                  >
                    No positions match your search query
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "var(--text-2)",
                      maxWidth: "45ch",
                      mx: "auto",
                      mb: 3,
                    }}
                  >
                    No active register files found for &ldquo;{searchQuery}&rdquo;. Try searching for alternative skills or resetting your filters.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSearchQuery("");
                      onCategoryChange("All");
                    }}
                    sx={{
                      fontFamily: MONO,
                      fontSize: TYPE_SCALE.caption,
                      borderRadius: "var(--r-control)",
                      borderColor: "var(--accent-border)",
                      color: "var(--accent-ink)",
                      bgcolor: "var(--accent-15)",
                      "&:hover": {
                        bgcolor: "var(--accent-25)",
                        borderColor: "var(--accent-fg)",
                      },
                    }}
                  >
                    RESET REGISTERS
                  </Button>
                </Box>
              </Reveal>
            ) : (
              <Box>
                {/* One hairline rule for the whole register, not per group —
                    a page holds a single category (or an unfiltered mix). */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 1.5,
                    pb: 1.2,
                    mb: 2.5,
                    borderBottom: "1px solid var(--divider)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: TYPE_SCALE.micro,
                      fontWeight: 700,
                      letterSpacing: TRACKING.meta,
                      color: "var(--text-2)",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedCategory === "All" ? "ALL POSITIONS" : selectedCategory}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: TYPE_SCALE.micro,
                      color: "var(--text-3)",
                    }}
                  >
                    {`[${String(data?.total ?? 0)}]`}
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {visiblePositions.map((position, index) => {
                    const isExpanded = expandedJobId === position.slug;

                    return (
                      <Reveal key={position.slug} delay={0.04 * index}>
                        {/* Flat File Card */}
                        <Box
                          sx={{
                            borderRadius: "var(--r-card)",
                            bgcolor: "var(--g-panel)",
                            border: "1px solid",
                            borderColor: "var(--glass-border-1)",
                            boxShadow: isExpanded ? "var(--glass-shadow-2)" : "var(--glass-shadow-1)",
                            transition: "background-color var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out), box-shadow var(--dur) var(--ease-out)",
                            overflow: "hidden",
                          }}
                        >
                  {/* Clickable Folder Header Trigger */}
                  <Box
                    component="button"
                    type="button"
                    id={`job-tab-${position.slug}`}
                    aria-expanded={isExpanded}
                    aria-controls={`job-peek-${position.slug}`}
                    onClick={() => toggleExpanded(position.slug)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExpanded(position.slug);
                      }
                    }}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "flex-start", md: "center" },
                      justifyContent: "space-between",
                      gap: { xs: 2, md: 3 },
                      p: { xs: 2.5, sm: 3, md: 3.5 },
                      bgcolor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      outline: "none",
                      color: "inherit",
                      "&:focus-visible": {
                        outline: "2px solid var(--accent-fg)",
                        boxShadow: "0 0 0 4px var(--focus-halo)",
                        borderRadius: "var(--r-card)",
                      },
                      "&:hover": {
                        "& .job-title": {
                          color: "var(--accent-ink)",
                        },
                        "& .expand-indicator": {
                          borderColor: "var(--accent-fg)",
                          color: "var(--accent-ink)",
                        },
                      },
                    }}
                  >
                    {/* Left: Title & Meta Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h3"
                        component="h2"
                        className="job-title"
                        sx={{
                          fontFamily: DISPLAY_FONT,
                          fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.6rem" },
                          fontWeight: 700,
                          color: "var(--text-1)",
                          lineHeight: LINE_HEIGHT.snug,
                          letterSpacing: TRACKING.display,
                          wordBreak: "break-word",
                          transition: "color var(--dur) var(--ease-out)",
                        }}
                      >
                        {position.title}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mt: 1.2 }}
                      >
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: "0.95rem", color: "var(--text-3)" }} />
                          <Typography
                            sx={{
                              fontFamily: BODY_FONT,
                              fontSize: TYPE_SCALE.body2,
                              color: "var(--text-2)",
                              fontWeight: 500,
                            }}
                          >
                            {position.location}
                          </Typography>
                        </Box>
                        <Box component="span" sx={{ color: "var(--glass-border-2)", userSelect: "none" }}>•</Box>
                        <Typography
                          sx={{
                            fontFamily: BODY_FONT,
                            fontSize: TYPE_SCALE.body2,
                            color: "var(--text-3)",
                          }}
                        >
                          {position.department}
                        </Typography>
                        <Chip
                          label={position.employment_type}
                          size="small"
                          sx={{
                            fontFamily: MONO,
                            fontSize: TYPE_SCALE.micro,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            bgcolor: "var(--glass-fill-2)",
                            color: "var(--text-2)",
                            border: "1px solid var(--glass-border-1)",
                            height: 22,
                            "& .MuiChip-label": { px: 1 },
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Right: Expand Affordance Button/Indicator */}
                    <Box
                      className="expand-indicator"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 0.8,
                        borderRadius: "var(--r-pill)",
                        bgcolor: "var(--glass-fill-2)",
                        border: "1px solid",
                        borderColor: isExpanded ? "var(--glass-border-2)" : "var(--glass-border-1)",
                        color: isExpanded ? "var(--text-1)" : "var(--text-2)",
                        fontFamily: MONO,
                        fontSize: TYPE_SCALE.micro,
                        fontWeight: 700,
                        letterSpacing: TRACKING.meta,
                        transition: "all var(--dur) var(--ease-out)",
                        flexShrink: 0,
                      }}
                    >
                      <Box component="span">
                        {isExpanded ? "COLLAPSE" : "PEEK DOSSIER"}
                      </Box>
                      <KeyboardArrowDownIcon
                        sx={{
                          fontSize: "1.1rem",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform var(--dur) var(--ease-out)",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* In-Place Peek Expansion (Motion v12) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`job-peek-${position.slug}`}
                        role="region"
                        aria-labelledby={`job-tab-${position.slug}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <Box
                          sx={{
                            px: { xs: 2.5, sm: 3, md: 3.5 },
                            pb: { xs: 3, sm: 3.5, md: 4 },
                            pt: 2.5,
                            borderTop: "1px solid var(--glass-border-1)",
                          }}
                        >
                          {/* Datasheet Meta-Rail — no surface, mono label treatment carries it */}
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: { xs: 1, md: 2.5 },
                              alignItems: "baseline",
                              mb: 3.5,
                            }}
                          >
                            <Typography sx={{ fontFamily: MONO, fontSize: TYPE_SCALE.micro, letterSpacing: TRACKING.meta, color: "var(--text-3)" }}>
                              DEPT // <Box component="span" sx={{ color: "var(--text-1)", fontWeight: 700 }}>{position.department.toUpperCase()}</Box>
                            </Typography>
                            <Box component="span" sx={{ color: "var(--glass-border-2)", userSelect: "none" }}>|</Box>
                            <Typography sx={{ fontFamily: MONO, fontSize: TYPE_SCALE.micro, letterSpacing: TRACKING.meta, color: "var(--text-3)" }}>
                              LOC // <Box component="span" sx={{ color: "var(--text-1)", fontWeight: 700 }}>{position.location.toUpperCase()}</Box>
                            </Typography>
                            <Box component="span" sx={{ color: "var(--glass-border-2)", userSelect: "none", display: { xs: "none", sm: "inline" } }}>|</Box>
                            <Typography sx={{ fontFamily: MONO, fontSize: TYPE_SCALE.micro, letterSpacing: TRACKING.meta, color: "var(--text-3)" }}>
                              TYPE // <Box component="span" sx={{ color: "var(--text-1)", fontWeight: 700 }}>{position.employment_type.toUpperCase()}</Box>
                            </Typography>
                          </Box>

                          {/* Summary Prose (45-75ch measure) */}
                          <Box sx={{ mb: 3.5 }}>
                            <Typography
                              sx={{
                                fontFamily: MONO,
                                fontSize: TYPE_SCALE.micro,
                                letterSpacing: TRACKING.meta,
                                color: "var(--text-3)",
                                mb: 0.8,
                                textTransform: "uppercase",
                              }}
                            >
                              ROLE SPECIFICATION SUMMARY
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                color: "var(--text-2)",
                                lineHeight: LINE_HEIGHT.relaxed,
                                fontSize: TYPE_SCALE.body1,
                                maxWidth: "65ch",
                              }}
                            >
                              {position.summary}
                            </Typography>
                          </Box>

                          {/* Tech Stack Chips */}
                          <Box sx={{ mb: 4 }}>
                            <Typography
                              sx={{
                                fontFamily: MONO,
                                fontSize: TYPE_SCALE.micro,
                                letterSpacing: TRACKING.meta,
                                color: "var(--text-3)",
                                mb: 0.8,
                                textTransform: "uppercase",
                              }}
                            >
                              ENGINEERING STACK
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {position.stack.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    fontFamily: MONO,
                                    fontSize: TYPE_SCALE.micro,
                                    fontWeight: 600,
                                    bgcolor: "var(--glass-fill-2)",
                                    color: "var(--text-1)",
                                    border: "1px solid var(--glass-border-1)",
                                    borderRadius: "var(--r-control)",
                                    height: 26,
                                    "& .MuiChip-label": { px: 1.2 },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>

                          {/* Sole Primary Action: Navigate to Canonical Detail Route */}
                          <RouterButton
                            to="/careers/$jobId"
                            params={{ jobId: position.slug }}
                            variant="contained"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: "1rem" }} />}
                            sx={{
                              py: 1.2,
                              px: 3.5,
                              fontFamily: MONO,
                              fontWeight: 800,
                              fontSize: TYPE_SCALE.caption,
                              letterSpacing: "0.08em",
                              bgcolor: NOIR.gold,
                              color: NOIR.navyInk,
                              borderRadius: "var(--r-control)",
                              boxShadow: "0 4px 14px rgba(var(--accent-rgb), 0.25)",
                              "&:hover": {
                                bgcolor: NOIR.goldLight,
                                boxShadow: "0 6px 20px rgba(var(--accent-rgb), 0.4)",
                                transform: "translateY(-1px)",
                              },
                              "&:focus-visible": {
                                outline: "2px solid var(--accent-fg)",
                                boxShadow: "0 0 0 4px var(--focus-halo)",
                              },
                              transition: "all var(--dur) var(--ease-out)",
                            }}
                          >
                            OPEN FULL ROLE
                          </RouterButton>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                        </Box>
                      </Reveal>
                    );
                  })}
                </Stack>

                {pageCount > 1 ? (
                  <Box sx={{ display: "flex", justifyContent: "center", pt: 5 }}>
                    <Pagination
                      count={pageCount}
                      page={currentPage}
                      onChange={(_event, value) => {
                        onPageChange(value);
                      }}
                      size="large"
                    />
                  </Box>
                ) : null}
              </Box>
            )}
          </Box>
        </Stack>
      </Section>

      {/* Both sit outside the register's <Section> but inside the page's
          data-ground="light" Box, so neither needs an ABOUT_SECTIONS entry or a
          ground stop — SectionBeat throws on an unknown id, and these are not
          part of that system. */}
      <FuntopolisSection />
      <GraduateHallOfFameSection />

      {/* Program Brochure Modal Drawer */}
      <BrochureDrawer
        open={brochureOpen}
        onClose={() => setBrochureOpen(false)}
      />
    </Box>
    </>
  );
}
