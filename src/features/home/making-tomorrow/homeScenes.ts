/**
 * The three cinematic peaks on the home page.  This is deliberately data-only:
 * route composition, video lifecycle, and GSAP each read the same identifiers
 * without importing one another.
 */
export type HomeSceneName = "hero" | "proof" | "closing";
export type FilmSceneName = Exclude<HomeSceneName, "hero">;

export interface HomeScene {
  id: string;
  /** Key used by the dot rail; the proof film keeps its DOM anchor distinct. */
  presenceId: string;
  narration: string;
  /** Extra viewport heights held by the desktop pin. */
  pinVh: number;
  media?: {
    poster: string;
    sources: readonly { src: string; type: "video/webm" | "video/mp4" }[];
  };
}

export const HOME_SCENES: Readonly<Record<HomeSceneName, HomeScene>> = {
  hero: {
    id: "hero-sequence",
    presenceId: "hero",
    narration: "Tomorrow is already in the making.",
    pinVh: 4,
  },
  proof: {
    id: "proof-film",
    presenceId: "proof",
    narration: "An idea is only the beginning.",
    pinVh: 1.5,
    media: {
      poster: "/videos/daily-life-services-loop-poster.jpg",
      sources: [
        { src: "/videos/daily-life-services-loop.mp4", type: "video/mp4" },
      ],
    },
  },
  closing: {
    // `closing` is intentionally retained: it is an existing public anchor
    // and stage-presence key used by the home-page rail.
    id: "closing",
    presenceId: "closing",
    narration: "Bring us the question that comes next.",
    pinVh: 2,
    media: {
      poster: "/videos/we-build-the-future-poster.jpg",
      sources: [
        { src: "/videos/we-build-the-future-delivery.mp4", type: "video/mp4" },
      ],
    },
  },
} as const;

export function filmScene(scene: FilmSceneName): HomeScene & { media: NonNullable<HomeScene["media"]> } {
  const config = HOME_SCENES[scene];
  if (!config.media) throw new Error(`Film scene ${scene} is missing media.`);
  return config as HomeScene & { media: NonNullable<HomeScene["media"]> };
}
