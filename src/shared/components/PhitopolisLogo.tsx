import React from 'react';

import { NOIR } from '@/shared/theme/palette';

import { PHITOPOLIS_MARK_PATHS, PHITOPOLIS_MARK_VIEWBOX } from './phitopolisMarkPaths';

interface PhitopolisLogoProps {
  className?: string;
  style?: React.CSSProperties;
  /** Color for the outer "P" shape paths (originally white). */
  color?: string;
  /** Color for the inner phi accent path. Defaults to brand gold. */
  accentColor?: string;
  title?: string;
}

/**
 * Inline SVG rendition of the Phitopolis mark. Kept as an inline component
 * so the two white paths and the gold accent path can be recoloured
 * independently (e.g. when the nav sits over a light background).
 */
const PhitopolisLogo: React.FC<PhitopolisLogoProps> = ({
  className,
  style,
  color = NOIR.white,
  accentColor = NOIR.gold,
  title = 'Phitopolis Logo',
}) => {
  return (
    <svg
      width="320"
      height="320"
      viewBox={PHITOPOLIS_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      style={style}
    >
      {PHITOPOLIS_MARK_PATHS.map((p, i) => (
        <path
          key={i}
          fill={p.accent ? accentColor : color}
          style={{ transition: 'fill 300ms ease' }}
          transform={p.transform}
          d={p.d}
        />
      ))}
    </svg>
  );
};

export default PhitopolisLogo;
