import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import { MediaFrame } from "@/shared/components/media/MediaFrame";
import { CONTENT } from "@/shared/content";
import { StaggerGroup, StaggerItem } from "@/shared/components/Reveal";
import { NOIR, SOFT } from "@/shared/theme/palette";
import { MONO, TRACKING, TYPE_SCALE } from "@/shared/theme/theme";

type TeamMember = (typeof CONTENT.team.members)[number];

/** One leadership bio, via MediaFrame's `portrait-quote` pattern (circular
 *  portrait + blockquote + attribution) — the pattern the design reference
 *  doc already scopes to exactly this shape, rather than a bespoke card. */
export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Box>
      <MediaFrame
        pattern="portrait-quote"
        items={[{ src: member.image, alt: `${member.name}, ${member.role}`, width: 320, height: 320 }]}
        overlayContent={member.bio}
        attribution={`${member.name} — ${member.role}`}
      />
      {/* Chips settle in a beat after the card itself — delayChildren starts
          near the end of the card's own 0.7s StaggerItem reveal. */}
      <StaggerGroup delay={0.5}>
        <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}>
          {member.expertise.map((tag) => (
            <StaggerItem key={tag}>
              <Chip
                label={tag}
                size="small"
                sx={{
                  fontFamily: MONO,
                  fontSize: TYPE_SCALE.micro,
                  letterSpacing: TRACKING.meta,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  bgcolor: SOFT.sand,
                  color: NOIR.navyField,
                }}
              />
            </StaggerItem>
          ))}
        </Stack>
      </StaggerGroup>
    </Box>
  );
}
