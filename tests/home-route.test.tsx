import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";

import { routeTree } from "@/routeTree.gen";
import { CONTENT } from "@/shared/content";
import { makeTestQueryClient, renderWithProviders } from "./test-utils";

test("home tells the three-climax story in readable document order", async () => {
  const queryClient = makeTestQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  renderWithProviders(<RouterProvider router={router} />, queryClient);
  await screen.findByRole("heading", { level: 1, name: /phitopolis/i });

  const home = document.getElementById("home-main")!;
  const ids = [...home.querySelectorAll("section[id]")].map((section) => section.id);
  expect(ids).toEqual(expect.arrayContaining([
    "hero-sequence", "hero-mission", "global-markets", "hero-pillars", "proof-film",
    "use-cases", "process", "reach", "closing",
  ]));
  const storyOrder = ["hero-sequence", "hero-mission", "hero-pillars", "proof-film", "use-cases", "process", "reach", "closing"];
  expect(storyOrder.map((id) => ids.indexOf(id))).toEqual([...storyOrder.map((id) => ids.indexOf(id))].sort((a, b) => a - b));
  expect(document.querySelectorAll("main")).toHaveLength(1);

  for (const line of [
    "Tomorrow is already in the making.",
    "An idea is only the beginning.",
    "Bring us the question that comes next.",
  ]) expect(within(home).getByText(line)).toBeInTheDocument();

  for (const item of CONTENT.useCases) {
    expect(within(home).getByRole("heading", { name: item.title })).toBeInTheDocument();
  }
  for (const id of ["hero-mission", "closing"]) {
    expect(within(document.getElementById(id)!).getByRole("link", { name: /start a conversation/i })).toHaveAttribute("href", "/contact");
  }
  expect(home.querySelector("#daily-life")).toBeNull();
  expect(home.querySelector("#testimonials")).toBeNull();
});
