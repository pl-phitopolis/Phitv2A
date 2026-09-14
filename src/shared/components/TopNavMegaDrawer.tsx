import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SpecularIconButton as IconButton } from "@/shared/components/ui/specular";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

import { MONO } from "@/shared/theme/theme";
import { NOIR, SOFT } from "@/shared/theme/palette";
import { EASE_OUT_EXPO } from "@/shared/motion/easing";
import { useReducedMotion } from "@/shared/motion";
import { useTransitionCurtain } from "./transitionCurtainContext";
import { MEGA_NAV_ITEMS, NAV_GROUPS } from "./megaNavItems";

interface TopNavMegaDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Glassmorphism's hover-intent open: keeps the card open while the
   *  cursor is over it, and starts the close delay once it leaves. */
  onPaperMouseEnter?: (() => void) | undefined;
  onPaperMouseLeave?: (() => void) | undefined;
}

/**
 * The site's one navigation surface, shared by both the desktop and mobile
 * hamburger triggers (see AppShell — both drive the same `open` state).
 *
 * Grows out of the hamburger button's corner as a card rather than sliding
 * in from a viewport edge — MUI `Drawer` is no longer used here, so the
 * backdrop, ESC/backdrop-click close, focus handling and `role="dialog"`
 * are hand-rolled below instead of inherited from it.
 */
export function TopNavMegaDrawer({ open, onClose, onPaperMouseEnter, onPaperMouseLeave }: TopNavMegaDrawerProps) {
  const location = useLocation();
  const { navigateWithCurtain } = useTransitionCurtain();
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const handleNavigate = (to: string) => {
    onClose();
    navigateWithCurtain(to);
  };

  // Escape closes; focus moves into the card on open and returns to
  // whichever trigger button opened it on close (both hamburger instances
  // share this one card, so `document.activeElement` at open time is
  // whichever of the two was actually clicked).
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;
    const firstLink = cardRef.current?.querySelector<HTMLElement>("[data-nav-row]");
    firstLink?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            key="nav-card-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(10, 24, 51, 0.32)",
              zIndex: (theme) => theme.zIndex.modal + 9,
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <Box
            component={motion.div}
            ref={cardRef}
            key="nav-card"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -12 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -8 }}
            transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
            sx={{
              position: "fixed",
              zIndex: (theme) => theme.zIndex.modal + 10,
              top: { xs: 0, sm: 16 },
              right: { xs: 0, sm: 16 },
              left: { xs: 0, sm: "auto" },
              bottom: { xs: 0, sm: "auto" },
              width: { xs: "100%", sm: 400 },
              maxWidth: "100vw",
              height: { xs: "100%", sm: "auto" },
              maxHeight: { xs: "100%", sm: "min(640px, calc(100vh - 32px))" },
              transformOrigin: "top right",
              bgcolor: SOFT.mist,
              color: NOIR.navyField,
              borderRadius: { xs: 0, sm: 3 },
              border: { xs: "none", sm: `1px solid ${SOFT.frost}` },
              boxShadow: "0 24px 60px rgba(10, 24, 51, 0.18)",
              display: "flex",
              flexDirection: "column",
              px: { xs: 3, sm: 4 },
              py: { xs: 3, sm: 4 },
              overflow: "hidden",
            }}
            onMouseEnter={onPaperMouseEnter}
            onMouseLeave={onPaperMouseLeave}
          >
            {/* Beat 2 — content settles in a beat after the card's own shape
                (beat 1, the scale/fade above) has mostly formed. `delay` is
                relative to this element's own mount, not the card's, so it
                lines up with the card's animation regardless of duration. */}
            <Box
              component={motion.div}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO, delay: reduced ? 0 : 0.18 }}
              sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
            >
            {/* Grouped nav sections — no separate "Menu" header row; the close
                button sits level with the first group's own label instead. */}
            <Box sx={{ flex: 1, overflow: "hidden", py: 1, mx: -1 }}>
              {NAV_GROUPS.map((group, groupIndex) => (
                <Box key={group.id} sx={{ mt: groupIndex === 0 ? 0 : 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 1, mb: 0.5, ...(groupIndex === 0 && { pb: 1.5, borderBottom: `1px solid ${SOFT.frost}` }) }}
                  >
                    <Typography
                      component="p"
                      sx={{
                        fontFamily: MONO,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: NOIR.goldDark,
                      }}
                    >
                      {group.label}
                    </Typography>
                    {groupIndex === 0 && (
                      <IconButton
                        onClick={onClose}
                        aria-label="Close menu"
                        sx={{
                          color: NOIR.navyField,
                          bgcolor: "rgba(10, 42, 102, 0.06)",
                          border: `1px solid ${SOFT.frost}`,
                          p: 0.75,
                          transition: "all 0.25s ease",
                          "&:hover": {
                            bgcolor: "secondary.main",
                            color: "secondary.contrastText",
                            transform: "rotate(90deg)",
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                  <Stack
                    component="nav"
                    aria-label={group.label}
                    spacing={0.25}
                  >
                    {MEGA_NAV_ITEMS.filter((item) => item.group === group.id).map((item) => {
                      const isActiveRoute = location.pathname === item.to;
                      return (
                        <Box
                          key={item.to}
                          component="button"
                          type="button"
                          data-nav-row
                          aria-current={isActiveRoute ? "page" : undefined}
                          onClick={() => handleNavigate(item.to)}
                          sx={{
                            appearance: "none",
                            background: "none",
                            border: 0,
                            font: "inherit",
                            color: "inherit",
                            textAlign: "left",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            py: 1.25,
                            px: 1,
                            borderRadius: 2,
                            cursor: "pointer",
                            transition: "all 0.22s ease",
                            bgcolor: isActiveRoute ? "rgba(255, 199, 44, 0.12)" : "transparent",
                            "&:hover, &:focus-visible": {
                              bgcolor: "rgba(255, 199, 44, 0.16)",
                              transform: "translateX(6px)",
                            },
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "1.35rem",
                              fontWeight: 800,
                              letterSpacing: "-0.02em",
                              color: NOIR.navyField,
                            }}
                          >
                            {item.label}
                          </Typography>
                          <ArrowForwardIcon
                            sx={{
                              color: NOIR.goldDark,
                              fontSize: "1.2rem",
                              opacity: isActiveRoute ? 1 : 0,
                              transform: isActiveRoute ? "translateX(0)" : "translateX(-12px)",
                              transition: "all 0.22s ease",
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Box>

            {/* Footer */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ pt: 2, borderTop: `1px solid ${SOFT.frost}`, flexShrink: 0 }}
            >
              <Typography
                variant="caption"
                sx={{ fontFamily: MONO, color: "rgba(10, 42, 102, 0.55)", fontSize: "0.7rem" }}
              >
                PHITOPOLIS R&D FIRM • BGC MANILA
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: MONO, color: NOIR.goldDark, fontSize: "0.7rem", fontWeight: 700 }}
              >
                [ESC]
              </Typography>
            </Stack>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
}
