import { Link } from "@tanstack/react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { MONO, DISPLAY_FONT, TYPE_SCALE, TRACKING } from "@/shared/theme/theme";
import { NOIR, SOFT } from "@/shared/theme/palette";

import type { MediaFrameItem, MediaFrameProps, MediaFramePattern } from "./mediaFrameTypes";

/**
 * `MediaFrame` — the layout family for every media pattern in the design
 * reference doc (`Fresko Media Layouts.html`) except pattern 01, the
 * full-bleed video hero with scrim + one gold CTA already implemented by
 * `VideoPageHero` — reach for that component for a hero band, this one for
 * everything below it.
 *
 * Cross-cutting rules from the reference doc, encoded here:
 *  - Text sits ON media only in `section-break` and `stats-over-media` (plus
 *    `VideoPageHero`'s own pattern, outside this family). `overlayContent`
 *    passed to any other pattern is dropped with a dev-time `console.warn`.
 *  - Full-bleed vs. in-band media is one `fullBleed` prop for the whole
 *    instance, never mixed per item.
 *  - At most one `goldRule` accent bar and one `cta` slot per instance —
 *    both are single optional props rather than free-form children so a
 *    consumer can't accidentally stack two.
 *  - `section-break` and `offset-glass` are "once per page" per the
 *    reference doc; this component does not enforce that across a page
 *    (that's a composition-time concern), it only documents it here and on
 *    each pattern's render function below.
 *  - One autoplay video loop per viewport is likewise a page-composition
 *    rule the reference doc calls out — nothing here tracks other
 *    `MediaFrame` instances at runtime to enforce it; that would be runtime
 *    cross-instance bookkeeping this component has no business doing.
 */
export function MediaFrame({
  pattern,
  items,
  overlayContent,
  scrim = "base",
  fullBleed = false,
  goldRule = false,
  cta,
  aspectRatio,
  mediaSide = "left",
  steps,
  stats,
  attribution,
  sx,
  mediaSx,
}: MediaFrameProps) {
  // Patterns whose own renderer has a real slot for `overlayContent`: the two
  // literal text-ON-media patterns (section-break, stats-over-media), plus
  // three patterns that use it as their copy/caption pane rather than an
  // image overlay (split's second column, offset-glass's card body,
  // portrait-quote's blockquote). Every other pattern has no such slot.
  const OVERLAY_CONSUMING_PATTERNS: ReadonlySet<MediaFramePattern> = new Set([
    "section-break",
    "stats-over-media",
    "split",
    "offset-glass",
    "portrait-quote",
  ]);
  const overlayAllowed = OVERLAY_CONSUMING_PATTERNS.has(pattern);
  if (overlayContent && !overlayAllowed && import.meta.env.DEV) {
    console.warn(
      `MediaFrame: "overlayContent" was passed to pattern "${pattern}", which has no content slot for it ` +
        `(see Fresko Media Layouts.html). It will not render.`,
    );
  }
  if (pattern === "portrait-quote" && !attribution && import.meta.env.DEV) {
    console.warn('MediaFrame: pattern "portrait-quote" is missing "attribution" — it is effectively mandatory.');
  }

  return (
    <Box sx={{ width: "100%", ...sx }}>
      {renderPattern({ pattern, items, overlayContent: overlayAllowed ? overlayContent : undefined, scrim, fullBleed, aspectRatio, mediaSide, steps, stats, attribution, mediaSx })}
      <Accents goldRule={goldRule} {...(cta ? { cta } : {})} />
    </Box>
  );
}

/** Shared gold-rule + CTA footer, rendered at most once per instance. */
function Accents({ goldRule, cta }: { goldRule: boolean; cta?: { label: string; to: string } }) {
  if (!goldRule && !cta) return null;
  return (
    <Stack spacing={2} sx={{ mt: 3, alignItems: "flex-start" }}>
      {goldRule && (
        <Box aria-hidden sx={{ width: 56, height: 3, borderRadius: 1, bgcolor: NOIR.gold }} />
      )}
      {cta && (
        <Button
          component={Link}
          to={cta.to}
          variant="contained"
          sx={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: TYPE_SCALE.caption,
            letterSpacing: TRACKING.meta,
            textTransform: "uppercase",
            bgcolor: NOIR.gold,
            color: NOIR.navyInk,
            "&:hover": { bgcolor: NOIR.goldLight },
          }}
        >
          {cta.label}
        </Button>
      )}
    </Stack>
  );
}

function warnMissingCaption(pattern: string, item: MediaFrameItem, index: number) {
  if (!item.caption && import.meta.env.DEV) {
    console.warn(`MediaFrame: pattern "${pattern}" item[${index}] ("${item.alt}") is missing a mandatory caption.`);
  }
}

/** Renders one media item: the real asset if `src` is present, otherwise the
 *  shared `ImagePlaceholder`. Never duplicates the placeholder's own logic. */
function MediaTile({
  item,
  aspectRatio,
  sx,
  imgSx,
}: {
  item: MediaFrameItem;
  aspectRatio: number | string;
  sx?: object;
  imgSx?: object;
}) {
  if (!item.src) {
    return (
      <ImagePlaceholder
        aspectRatio={aspectRatio}
        label={item.alt}
        dimensions={`${item.width}x${item.height}`}
        {...(sx ? { sx } : {})}
      />
    );
  }
  return (
    <Box sx={{ aspectRatio, width: "100%", overflow: "hidden", ...sx }}>
      <Box
        component="img"
        src={item.src}
        alt={item.alt}
        width={item.width}
        height={item.height}
        loading={item.loading ?? "lazy"}
        decoding="async"
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...imgSx }}
      />
    </Box>
  );
}

interface RenderArgs {
  pattern: MediaFrameProps["pattern"];
  items: MediaFrameItem[];
  overlayContent?: React.ReactNode;
  scrim: NonNullable<MediaFrameProps["scrim"]>;
  fullBleed: boolean;
  aspectRatio?: MediaFrameProps["aspectRatio"];
  mediaSide: NonNullable<MediaFrameProps["mediaSide"]>;
  steps?: MediaFrameProps["steps"];
  stats?: MediaFrameProps["stats"];
  attribution?: MediaFrameProps["attribution"];
  mediaSx?: MediaFrameProps["mediaSx"];
}

function renderPattern(args: RenderArgs) {
  switch (args.pattern) {
    case "split":
      return <SplitPattern {...args} />;
    case "grid-3up":
      return <Grid3UpPattern {...args} />;
    case "gallery":
      return <GalleryPattern {...args} />;
    case "section-break":
      return <SectionBreakPattern {...args} />;
    case "offset-glass":
      return <OffsetGlassPattern {...args} />;
    case "sticky-pinned":
      return <StickyPinnedPattern {...args} />;
    case "portrait-quote":
      return <PortraitQuotePattern {...args} />;
    case "stats-over-media":
      return <StatsOverMediaPattern {...args} />;
    case "inline-editorial":
      return <InlineEditorialPattern {...args} />;
    case "filmstrip":
      return <FilmstripPattern {...args} />;
    case "mosaic":
      return <MosaicPattern {...args} />;
    default:
      return null;
  }
}

/** 02 — media + copy side by side. Media is always clean, never scrimmed.
 *  `mediaSide` alternates which column the media sits in; below `md` it
 *  always stacks media-first regardless of side. */
function SplitPattern({ items, overlayContent, aspectRatio, mediaSide, mediaSx }: RenderArgs) {
  const item = items[0];
  if (!item) return null;
  const mediaFirst = mediaSide === "left";
  return (
    <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{ order: { xs: 0, md: mediaFirst ? 0 : 1 } }}
      >
        <MediaTile item={item} aspectRatio={aspectRatio ?? 16 / 9} {...(mediaSx ? { sx: mediaSx } : {})} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 1, md: mediaFirst ? 1 : 0 } }}>
        {overlayContent}
      </Grid>
    </Grid>
  );
}

/** 03 — three equal 16:9 tiles in a row, each caption mandatory (dev-warned). */
function Grid3UpPattern({ items }: RenderArgs) {
  return (
    <Grid container spacing={{ xs: 3, md: 4 }}>
      {items.map((item, i) => {
        warnMissingCaption("grid-3up", item, i);
        return (
          <Grid key={item.alt + i} size={{ xs: 12, sm: 4 }}>
            <MediaTile item={item} aspectRatio={16 / 9} />
            {item.caption && (
              <Typography sx={{ mt: 1, fontSize: TYPE_SCALE.caption, color: "text.secondary" }}>
                {item.caption}
              </Typography>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}

/** 04 — one large lead frame + up to 4 smaller support frames, support
 *  frames desaturated per the reference doc's own CSS. Free aspect ratio. */
function GalleryPattern({ items }: RenderArgs) {
  const [lead, ...support] = items;
  if (!lead) return null;
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <MediaTile item={lead} aspectRatio={lead.width / lead.height} />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {support.slice(0, 4).map((item, i) => (
            <Grid key={item.alt + i} size={{ xs: 6 }}>
              <MediaTile
                item={item}
                aspectRatio={item.width / item.height}
                imgSx={{ filter: "grayscale(.72) contrast(1.02)" }}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

/** 05 — full-bleed 21:9 duotone image, one centered headline only, no CTA.
 *  ONCE PER PAGE per the reference doc — not enforced here, document only. */
function SectionBreakPattern({ items, overlayContent, scrim }: RenderArgs) {
  const item = items[0];
  if (!item) return null;
  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <MediaTile
        item={item}
        aspectRatio={21 / 9}
        imgSx={{ filter: "grayscale(1) contrast(1.06)", mixBlendMode: "luminosity" }}
      />
      {scrim !== "none" && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: NOIR.navyInk,
            opacity: scrim === "strong" ? 0.6 : 0.4,
          }}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: { xs: "1.8rem", md: "2.6rem" },
            color: NOIR.frost,
            maxWidth: "24ch",
          }}
        >
          {overlayContent}
        </Typography>
      </Box>
    </Box>
  );
}

/** 06 — 4:5 portrait media + an overlapping glass card (headline + body).
 *  ONCE PER PAGE per the reference doc — not enforced here, document only. */
function OffsetGlassPattern({ items, overlayContent }: RenderArgs) {
  const item = items[0];
  if (!item) return null;
  return (
    <Box sx={{ position: "relative", pb: { xs: 6, md: 0 } }}>
      <MediaTile item={item} aspectRatio={4 / 5} />
      <Box
        sx={{
          position: { xs: "static", md: "absolute" },
          left: { md: "auto" },
          right: { md: -64 },
          bottom: { md: -64 },
          mt: { xs: -6, md: 0 },
          mx: { xs: 3, md: 0 },
          maxWidth: { xs: "auto", md: 360 },
          p: 3,
          borderRadius: 2,
          border: `1px solid ${SOFT.mist}`,
          bgcolor: `rgba(${NOIR.frostRgb}, 0.10)`,
          backdropFilter: "blur(18px)",
          boxShadow: "0 20px 60px rgba(6, 24, 59, 0.35)",
        }}
      >
        {overlayContent}
      </Box>
    </Box>
  );
}

/** 07 — a sticky (CSS `position: sticky`, never a ScrollTrigger) media frame
 *  beside a vertical stack of numbered step blocks. Releases to plain
 *  stacked layout — media above, steps below, no longer sticky — below the
 *  `md` breakpoint. */
function StickyPinnedPattern({ items, steps, aspectRatio }: RenderArgs) {
  const item = items[0];
  if (!item) return null;
  return (
    <Grid container spacing={{ xs: 4, md: 6 }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Box sx={{ position: { xs: "static", md: "sticky" }, top: { md: 96 } }}>
          <MediaTile item={item} aspectRatio={aspectRatio ?? 4 / 5} />
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={{ xs: 4, md: 6 }}>
          {(steps ?? []).map((step, i) => (
            <Stack key={step.label + i} direction="row" spacing={2}>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: TYPE_SCALE.h4,
                  fontWeight: 700,
                  color: NOIR.gold,
                  minWidth: "1.6em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </Typography>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{step.label}</Typography>
                <Typography sx={{ color: "text.secondary" }}>{step.body}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
}

/** 08 — a circular portrait image beside a blockquote + attribution.
 *  `attribution` is effectively mandatory (dev-warned in `MediaFrame`). */
function PortraitQuotePattern({ items, overlayContent, attribution }: RenderArgs) {
  const item = items[0];
  if (!item) return null;
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 3, sm: 4 }} alignItems="center">
      <Box sx={{ width: { xs: 120, sm: 160 }, flexShrink: 0 }}>
        <MediaTile item={item} aspectRatio={1} sx={{ borderRadius: "50%" }} imgSx={{ borderRadius: "50%" }} />
      </Box>
      <Box component="blockquote" sx={{ m: 0 }}>
        <Typography sx={{ fontFamily: DISPLAY_FONT, fontSize: { xs: "1.15rem", md: "1.4rem" }, lineHeight: 1.5 }}>
          {overlayContent}
        </Typography>
        {attribution && (
          <Typography
            sx={{ mt: 1.5, fontFamily: MONO, fontSize: TYPE_SCALE.caption, letterSpacing: TRACKING.meta, color: "text.secondary" }}
          >
            {attribution}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

/** 09 — full-bleed 21:9 desaturated image, flat scrim, 3-4 stat blocks laid
 *  out in a row on top. Text-on-media like `section-break`. */
function StatsOverMediaPattern({ items, overlayContent, scrim, stats }: RenderArgs) {
  const item = items[0];
  if (!item) return null;
  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <MediaTile item={item} aspectRatio={21 / 9} imgSx={{ filter: "grayscale(1) contrast(1.04)" }} />
      {scrim !== "none" && (
        <Box
          aria-hidden
          sx={{ position: "absolute", inset: 0, bgcolor: NOIR.navyInk, opacity: scrim === "strong" ? 0.65 : 0.45 }}
        />
      )}
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", px: { xs: 3, md: 6 } }}>
        {overlayContent && <Box sx={{ mb: 3, color: NOIR.frost, textAlign: "center" }}>{overlayContent}</Box>}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, sm: 4 }} justifyContent="center">
          {(stats ?? []).slice(0, 4).map((stat, i) => (
            <Box key={stat.label + i} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: { xs: "1.8rem", md: "2.4rem" }, color: NOIR.gold }}>
                {stat.value}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: TYPE_SCALE.micro, letterSpacing: TRACKING.meta, textTransform: "uppercase", color: NOIR.frost }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

/** 10 — a 16:9 image capped to the article/text column width (never
 *  full-bleed), caption mandatory (dev-warned), meant to sit between
 *  paragraphs of body copy. */
function InlineEditorialPattern({ items }: RenderArgs) {
  const item = items[0];
  if (!item) return null;
  warnMissingCaption("inline-editorial", item, 0);
  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <MediaTile item={item} aspectRatio={16 / 9} />
      {item.caption && (
        <Typography sx={{ mt: 1, fontSize: TYPE_SCALE.caption, color: "text.secondary", textAlign: "center" }}>
          {item.caption}
        </Typography>
      )}
    </Box>
  );
}

/** 11 — a horizontally scrollable row of 16:9 frames, scroll-snap, keyboard
 *  focusable, never autoplaying/auto-advancing. Items are not shrunk to
 *  fit, so the last frame can sit partially cut off at the right edge as a
 *  scroll affordance, per the reference doc. */
function FilmstripPattern({ items }: RenderArgs) {
  return (
    <Box
      tabIndex={0}
      role="region"
      aria-label="Scrollable image filmstrip"
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        scrollSnapType: "x proximity",
        pb: 1,
        "&:focus-visible": { outline: `2px solid ${NOIR.gold}`, outlineOffset: 2 },
      }}
    >
      {items.map((item, i) => (
        <Box key={item.alt + i} sx={{ flex: "0 0 auto", width: { xs: 280, md: 420 }, scrollSnapAlign: "start" }}>
          <MediaTile item={item} aspectRatio={16 / 9} />
        </Box>
      ))}
    </Box>
  );
}

/** 12 — a 4-column grid mixing 1:1 tiles and 2:1 wide tiles (`item.wide`),
 *  no captions, no text overlay, dense (team/culture pages). */
function MosaicPattern({ items }: RenderArgs) {
  return (
    <Grid container spacing={{ xs: 1.5, md: 2 }}>
      {items.map((item, i) => (
        <Grid key={item.alt + i} size={{ xs: item.wide ? 12 : 6, sm: item.wide ? 6 : 3 }}>
          <MediaTile item={item} aspectRatio={item.wide ? 2 / 1 : 1} />
        </Grid>
      ))}
    </Grid>
  );
}
