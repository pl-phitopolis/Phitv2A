import type { ReactNode } from "react";

import type { HomeAct, Hv3Shot } from "../homeV3Motion";
import type { AskStage } from "../useActTransition";

/**
 * The act-boundary marker `useHomeV3Motion` pins a `ScrollTrigger` to.
 *
 * Deliberately no visual content of its own (design-bar rule 8: motion must be
 * motivated, and an un-motivated decorative marker is the opposite of that) —
 * it exists only as a scroll-flow anchor roughly `50vh` tall so the trigger has
 * a stable, centered crossing point between two settled acts. `aria-hidden`
 * because it carries no information; the acts on either side are still in
 * normal document order for a screen reader or a keyboard user, boundary or
 * not.
 */
export function ActBoundary({
  from,
  to,
  shot,
  stageTo,
  stageBack,
  children,
}: {
  from: HomeAct;
  to: HomeAct;
  shot: Hv3Shot;
  /**
   * Act IV's finale is the one transition that does not move between acts:
   * `from` and `to` are both "ask", and what changes is which half of the
   * closing section is showing. Without a stage the DOM write would be a
   * no-op and nothing would morph, so the finale boundary is the only one
   * that passes these.
   */
  stageTo?: AskStage;
  stageBack?: AskStage;
  /**
   * Optional visual occupying the marker.
   *
   * These markers were originally empty, which meant four half-viewports of
   * blank navy between the acts. A boundary is already a full-width element
   * sitting at a deliberate pause in the narrative, so it is the right place
   * for a visual beat rather than dead space. Anything passed here must take
   * its size FROM the marker and add none of its own: the marker's height is
   * the crossing point a ScrollTrigger is anchored to, and content that grows
   * it moves that trigger underneath itself.
   */
  children?: ReactNode;
}) {
  return (
    <div
      data-hv3-boundary
      data-hv3-from={from}
      data-hv3-to={to}
      data-hv3-shot={shot}
      data-hv3-stage-to={stageTo}
      data-hv3-stage-back={stageBack}
      aria-hidden="true"
      className="hv3-boundary"
    >
      {children}
    </div>
  );
}
