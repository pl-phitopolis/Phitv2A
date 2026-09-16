import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Code, Database, Cloud, Pulse
} from "@phosphor-icons/react";
import { Reveal, StaggerGroup, StaggerItem } from "@/shared/components/Reveal";
import { MONO, DISPLAY_FONT } from "@/shared/theme/theme";
import { NOIR, SOFT } from "@/shared/theme/palette";

const TECH_CATEGORIES = [
  {
    icon: Code,
    title: "LANGUAGES & FRAMEWORKS",
    description: "Typed, high-concurrency systems built for sub-millisecond execution.",
    tools: ["C++20", "Rust", "TypeScript", "React", "Python 3.12", "Go", "GraphQL", "Node.js"],
  },
  {
    icon: Database,
    title: "DATA PIPELINES & ML",
    description: "Petabyte-scale market data feeds, real-time analytics, feature extraction.",
    tools: ["PyTorch", "Polars", "PostgreSQL", "ClickHouse", "Apache Kafka", "Redis", "DuckDB", "Pandas"],
  },
  {
    icon: Cloud,
    title: "CLOUD & INFRASTRUCTURE",
    description: "Containerized, immutable infrastructure across global multi-cloud regions.",
    tools: ["AWS", "GCP", "Kubernetes", "Docker", "Terraform", "Helm", "Cloudflare", "Linux Kernel"],
  },
  {
    icon: Pulse,
    title: "SITE RELIABILITY & OPS",
    description: "Continuous telemetry, chaos engineering, automated disaster recovery.",
    tools: ["Prometheus", "Grafana", "OpenTelemetry", "PagerDuty", "Datadog", "ArgoCD", "Vault", "eBPF"],
  },
];

/**
 * The tech-stack band — the page's one deliberately `SOFT`-ground section:
 * a soft `mist` panel holding four `frost` category cards, so it reads as
 * a calm, distinct surface rather than another stretch of the page's own
 * off-white. Tag chips use a soft navy tint (`rgba(10,42,102,0.08)`), the same
 * accent treatment the category filter and drawer use for tags elsewhere on
 * this page — an all-blue palette, no warm accent.
 */
export function TechStackSection() {
  return (
    <Box
      sx={{
        mt: { xs: 8, md: 12 },
        mb: { xs: 8, md: 12 },
        p: { xs: 3, sm: 5, md: 6 },
        borderRadius: 6,
        bgcolor: SOFT.mist,
      }}
    >
      {/* Section Header */}
      <Reveal>
      <Box sx={{ mb: { xs: 5, md: 7 }, maxWidth: "720px" }}>
        <Typography
          variant="overline"
          sx={{
            fontFamily: MONO,
            fontSize: "0.82rem",
            letterSpacing: "0.18em",
            color: NOIR.navyField,
            fontWeight: 800,
            display: "block",
            mb: 1,
          }}
        >
          TECHNICAL ARCHITECTURE & TOOLING
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 900,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: NOIR.navyField,
            letterSpacing: "-0.02em",
            mb: 2,
          }}
        >
          The Engineering Matrix
        </Typography>

        <Typography
          sx={{
            fontSize: "1.05rem",
            color: "rgba(10, 42, 102, 0.8)",
            lineHeight: 1.65,
          }}
        >
          Production-proven, open-source stacks — built for determinism, resilience, and scale.
        </Typography>
      </Box>
      </Reveal>

      {/* Grid of Tech Stack Categories */}
      <StaggerGroup>
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {TECH_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Grid size={{ xs: 12, sm: 6 }} key={cat.title}>
              <StaggerItem>
              <Box
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: "var(--r-card)",
                  bgcolor: SOFT.frost,
                  border: "1px solid rgba(10, 42, 102, 0.08)",
                  boxShadow: "none",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(10, 42, 102, 0.1)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "var(--r-control)",
                      bgcolor: "transparent",
                      border: "1px solid rgba(10, 42, 102, 0.12)",
                      color: NOIR.navyField,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon size={20} weight="duotone" />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: MONO,
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      color: NOIR.navyField,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {cat.title}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    color: "rgba(10, 42, 102, 0.75)",
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  {cat.description}
                </Typography>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: "auto" }}>
                  {cat.tools.map((tool) => (
                    <Box
                      key={tool}
                      sx={{
                        fontFamily: MONO,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: NOIR.navyField,
                        bgcolor: "rgba(10, 42, 102, 0.08)",
                        border: "1px solid rgba(10, 42, 102, 0.16)",
                        borderRadius: "var(--r-control)",
                        px: 1.2,
                        py: 0.4,
                        transition: "background-color 0.15s ease",
                        "&:hover": { bgcolor: "rgba(10, 42, 102, 0.14)" },
                      }}
                    >
                      {tool}
                    </Box>
                  ))}
                </Stack>
              </Box>
              </StaggerItem>
            </Grid>
          );
        })}
      </Grid>
      </StaggerGroup>
    </Box>
  );
}
