import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Section } from "@/shared/components/Section";
import { Reveal } from "@/shared/components/Reveal";
import { MONO } from "@/shared/theme/theme";

/**
 * Funtopolis — the life around the work, on the careers page.
 *
 * ── COPY STATUS: PLACEHOLDER ────────────────────────────────────────────────
 * There was no Funtopolis anywhere in this codebase when this section was
 * written — no component, no route, no content key; the only mention in the
 * whole tree was a passing line in `docs/blog-image-migration.md`. So the
 * structure here is real and the words are not yet.
 *
 * What is deliberately NOT in this file: event names, dates, headcounts,
 * "we have X every Y" claims, and anything else that would read as fact.
 * Inventing those is how a careers page ends up describing a company that does
 * not exist. The three cards below say only what the photographs already show.
 * Replace `MOMENTS` with the real programme when it is supplied — the shape is
 * a drop-in.
 *
 * Imagery is existing, already-optimised WebP from `/images/grads/`, so this
 * section adds no new asset weight to the route.
 */

interface Moment {
  id: string;
  label: string;
  title: string;
  body: string;
  image: string;
  alt: string;
}

const MOMENTS: readonly Moment[] = [
  {
    id: "campus",
    label: "ON CAMPUS",
    title: "We come to you",
    body: "Our engineers run the booth at university expos themselves, so the first person you talk to about the work is someone who does it.",
    image: "/images/grads/DLSUexpo.webp",
    alt: "Phitopolis engineers at a university expo booth",
  },
  {
    id: "floor",
    label: "ON THE FLOOR",
    title: "Desks that face each other",
    body: "Graduates sit inside delivery teams from week one, not in a separate cohort room. Questions get answered by turning around.",
    image: "/images/grads/Coordination.webp",
    alt: "Team gathered around a screen at the office window",
  },
  {
    id: "craft",
    label: "AFTER HOURS",
    title: "The room stays open",
    body: "Study groups, certification prep and side projects run in the same space, on the same machines, after the day's work is done.",
    image: "/images/grads/FocusedProgramming.webp",
    alt: "Engineers working together at a bank of monitors",
  },
];

export function FuntopolisSection() {
  return (
    <Section>
      <Stack spacing={{ xs: 5, md: 7 }}>
        <Reveal>
          <Stack spacing={1.5}>
            <Typography
              component="span"
              sx={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.18em", color: "text.secondary" }}
            >
              FUNTOPOLIS
            </Typography>
            <Typography variant="h3" component="h2" sx={{ maxWidth: "22ch" }}>
              The life around the work
            </Typography>
            <Typography sx={{ maxWidth: "58ch", color: "text.secondary" }}>
              What a year here looks like when you are not at a whiteboard.
            </Typography>
          </Stack>
        </Reveal>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 3, md: 4 },
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          {MOMENTS.map((moment, i) => (
            <Reveal key={moment.id} delay={i * 0.08}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    position: "relative",
                    aspectRatio: "4 / 3",
                    overflow: "hidden",
                    borderRadius: "12px",
                  }}
                >
                  <Box
                    component="img"
                    src={moment.image}
                    alt={moment.alt}
                    loading="lazy"
                    decoding="async"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </Box>
                <Typography
                  component="span"
                  sx={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", color: "text.secondary" }}
                >
                  {moment.label}
                </Typography>
                <Typography variant="h6" component="h3">
                  {moment.title}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>{moment.body}</Typography>
              </Stack>
            </Reveal>
          ))}
        </Box>
      </Stack>
    </Section>
  );
}
