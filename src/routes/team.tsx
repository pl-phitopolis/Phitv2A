import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link, createFileRoute } from "@tanstack/react-router";

import { TeamMemberCard } from "@/features/team";
import { CONTENT } from "@/shared/content";
import { NAV_ANCHORS } from "@/shared/components/NavbarContext";
import { MagneticBox } from "@/shared/components/MagneticBox";
import { PageHeader } from "@/shared/components/PageHeader";
import { Reveal, StaggerGroup, StaggerItem } from "@/shared/components/Reveal";
import { Section } from "@/shared/components/Section";
import { SpecularButton as Button } from "@/shared/components/ui/specular";
import { useNavbarAnchor } from "@/shared/components/navbarHooks";
import { pageHead } from "@/shared/seo";
import { NOIR } from "@/shared/theme/palette";

export const Route = createFileRoute("/team")({
  head: () =>
    pageHead(
      "Team · Phitopolis",
      "Leadership at Phitopolis — the practitioners behind our quantitative research, engineering, and data platforms.",
    ),
  component: TeamPage,
});

function TeamPage() {
  // Single light-ground page, no ground-per-section stage — same rationale
  // as CONTACT_PAGE/SERVICES_PAGE (see navbarAnchors.ts).
  const anchorRef = useNavbarAnchor(NAV_ANCHORS.TEAM_PAGE, { dark: false });

  return (
    <Section ref={anchorRef}>
      <PageHeader overline={CONTENT.team.overline} title={CONTENT.team.title} lead={CONTENT.team.lead} />

      <StaggerGroup>
        <Grid container spacing={{ xs: 6, md: 8 }} sx={{ mb: 10 }}>
          {CONTENT.team.members.map((member) => (
            <Grid key={member.name} size={{ xs: 12, md: 6 }}>
              <StaggerItem>
                <MagneticBox>
                  <TeamMemberCard member={member} />
                </MagneticBox>
              </StaggerItem>
            </Grid>
          ))}
        </Grid>
      </StaggerGroup>

      <Reveal>
        <Box
          data-ground="dark"
          sx={{
            bgcolor: NOIR.navyDeep,
            borderRadius: "20px",
            p: { xs: 4, md: 6 },
            textAlign: "center",
          }}
        >
          <Stack spacing={2.5} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--text-1)" }}>
              Want to join our global team?
            </Typography>
            <Typography sx={{ color: "var(--text-2)", maxWidth: 560 }}>
              We&rsquo;re always looking for brilliant minds who obsess over building the next generation of
              financial and enterprise technology.
            </Typography>
            <Button
              component={Link}
              to="/careers"
              variant="contained"
              sx={{ bgcolor: NOIR.gold, color: NOIR.navyInk, fontWeight: 700, "&:hover": { bgcolor: NOIR.goldLight } }}
            >
              View Career Opportunities
            </Button>
          </Stack>
        </Box>
      </Reveal>
    </Section>
  );
}
