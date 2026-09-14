import type { ReactNode } from "react";

/** The 11 non-hero media layouts from the design reference doc
 *  (`Fresko Media Layouts.html`, pattern 01 excluded — that's `VideoPageHero`). */
export type MediaFramePattern =
  | "split"
  | "grid-3up"
  | "gallery"
  | "section-break"
  | "offset-glass"
  | "sticky-pinned"
  | "portrait-quote"
  | "stats-over-media"
  | "inline-editorial"
  | "filmstrip"
  | "mosaic";

export interface MediaFrameItem {
  /** Absent = renders `ImagePlaceholder` internally instead of an `<img>`. */
  src?: string;
  alt: string;
  width: number;
  height: number;
  /** Mandatory (dev-warned, not enforced) on `grid-3up` and `inline-editorial`. */
  caption?: string;
  /** `mosaic` only — spans 2 columns at a 2:1 ratio instead of a 1:1 tile. */
  wide?: boolean;
  loading?: "eager" | "lazy";
}

/** `sticky-pinned` only — one numbered step in the copy stack beside the
 *  sticky media frame. */
export interface MediaFrameStep {
  label: string;
  body: string;
}

/** `stats-over-media` only — one `{value, label}` block in the stat row. */
export interface MediaFrameStat {
  value: string;
  label: string;
}

export interface MediaFrameProps {
  pattern: MediaFramePattern;
  items: MediaFrameItem[];
  /** Text-on-media slot. Valid only for `section-break` and `stats-over-media`
   *  (VideoPageHero's pattern 01 owns the third text-on-media case, outside
   *  this component); passing it to any other pattern gets a dev-time
   *  `console.warn` and is not rendered. */
  overlayContent?: ReactNode;
  /** Scrim strength over the media, for the text-on-media patterns. */
  scrim?: "none" | "base" | "strong";
  /** Edge-to-edge vs. visually capped media. One prop for the whole
   *  instance — never mix full-bleed and in-band media within one
   *  `MediaFrame`. Default `false` (in-band/capped). */
  fullBleed?: boolean;
  /** Renders one short horizontal gold accent bar (`NOIR.gold`). */
  goldRule?: boolean;
  /** Single optional CTA slot — a link styled as a MUI `Button`, routed via
   *  TanStack Router's `Link`. Deliberately not free-form `children`, so a
   *  consumer can't stack more than one CTA into an instance. */
  cta?: { label: string; to: string };
  /** Overrides the pattern's default aspect ratio (e.g. widen a `split`
   *  media pane from 16:9 to 1:1). Ignored by `gallery`, which is
   *  free-aspect by design, and by `mosaic`, whose ratio is per-item
   *  (1:1 / 2:1 via `wide`). */
  aspectRatio?: number | string;
  /** `split` only. Default `"left"`. */
  mediaSide?: "left" | "right";
  /** `sticky-pinned` only. */
  steps?: MediaFrameStep[];
  /** `stats-over-media` only. */
  stats?: MediaFrameStat[];
  /** `portrait-quote` only. Effectively mandatory for that pattern (dev-warned
   *  if absent) — kept optional in the type so every other pattern doesn't
   *  have to pass an unused prop. */
  attribution?: string;
  sx?: object;
  /** `split` only — optional style passthrough to the split media tile,
   *  e.g. `{ maxWidth: 440, mx: "auto" }` to cap the image so it doesn't
   *  fill the half-column. Every other pattern ignores it. */
  mediaSx?: object;
}
