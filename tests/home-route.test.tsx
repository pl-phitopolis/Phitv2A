import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";

import { routeTree } from "@/routeTree.gen";
import { HOME_FLOW_IDS } from "@/features/home/rebuild/homeFlow";
import { CONTENT } from "@/shared/content";
import { makeTestQueryClient, renderWithProviders } from "./test-utils";

test("home tells its climax story in readable document order", async () => {
  const queryClient = makeTestQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  renderWithProviders(<RouterProvider router={router} />, queryClient);
  await screen.findByRole("heading", { level: 1, name: /quantitative R&D partner/i });

  const home = document.getElementById("home-main")!;
  const ids = [...home.querySelectorAll("section[id]")].map((section) => section.id);
  expect(ids).toEqual([...HOME_FLOW_IDS]);
  expect(document.querySelectorAll("main")).toHaveLength(1);

  expect(within(home).getByText("R&D since", { exact: false })).toBeInTheDocument();
  for (const item of CONTENT.useCases) {
    expect(within(home).getByRole("heading", { name: item.title })).toBeInTheDocument();
  }
  for (const id of ["hero-mission", "closing"]) {
    expect(within(document.getElementById(id)!).getByRole("link", { name: /start a conversation/i })).toHaveAttribute("href", "/contact");
  }
  expect(home.querySelector("#daily-life")).toBeNull();
  expect(home.querySelector("#testimonials")).toBeNull();
});
