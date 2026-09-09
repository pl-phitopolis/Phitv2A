import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";
import { makeTestQueryClient, renderWithProviders } from "./test-utils";

test("home finishes on a light footer with navigation, contact and legal links", async () => {
  const queryClient = makeTestQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  renderWithProviders(<RouterProvider router={router} />, queryClient);

  expect(await screen.findByText("PATHWAYS")).toBeInTheDocument();
  const footer = document.querySelector("footer")!;
  expect(within(footer).getByRole("link", { name: "Careers" })).toHaveAttribute("href", "/careers");
  expect(within(footer).getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  expect(within(footer).getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");

  // Navigation stays available without adding another interactive scene.
  expect(screen.queryByText("SIGNAL OR NOISE?")).not.toBeInTheDocument();
  expect(screen.queryByText(/CLASSIFY ANOMALY/i)).not.toBeInTheDocument();

  // The bright home footer has no decorative animation canvas.
  const field = footer?.querySelector("canvas");
  expect(field).toBeNull();
  expect(footer).toHaveAttribute("data-home-footer", "true");
  expect(footer).not.toHaveAttribute("data-ground", "dark");
  expect(screen.getAllByText("ABOUT PHITOPOLIS").length).toBeGreaterThan(0);
  expect(screen.queryByText("ENTERPRISE ENCRYPTED")).not.toBeInTheDocument();
});
