import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";
import { routeTree } from "@/routeTree.gen";
import { CONTENT } from "@/shared/content";
import { makeTestQueryClient, renderWithProviders } from "./test-utils";

// The unit project sets prefers-reduced-motion: reduce before modules load.
async function renderHome() {
  const queryClient = makeTestQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  renderWithProviders(<RouterProvider router={router} />, queryClient);
  await screen.findByRole("heading", { level: 1, name: /phitopolis/i });
  return document.getElementById("home-main")!;
}

test("reduced motion leaves every chapter readable without pins or a preloader", async () => {
  const home = await renderHome();
  expect(screen.queryByTestId("preloader")).not.toBeInTheDocument();
  expect(home.querySelector(".pin-spacer")).toBeNull();
  for (const id of ["hero-mission", "global-markets", "hero-pillars", "proof-film", "use-cases", "process", "reach", "closing"]) {
    const section = home.querySelector<HTMLElement>(`#${id}`)!;
    expect(section).toBeVisible();
    expect(section).not.toHaveAttribute("aria-hidden", "true");
    expect(section).not.toHaveAttribute("inert");
  }
  expect(document.documentElement.dataset.glass).toBe("off");
});

test("reduced motion shows film posters and keeps the closing contact action available", async () => {
  const home = await renderHome();
  for (const id of ["proof-film", "closing"]) {
    const section = home.querySelector<HTMLElement>(`#${id}`)!;
    const poster = section.querySelector("img");
    expect(poster).toBeInTheDocument();
    expect(poster).toHaveAttribute("src", expect.stringMatching(/poster\.(jpg|webp)$/));
    expect(section.querySelector("video[autoplay]")).toBeNull();
    expect(section.querySelector("video source")).toBeNull();
    expect(section.querySelector("video[src]")).toBeNull();
  }
  const contact = within(home.querySelector("#closing")!).getByRole("link", { name: /start a conversation/i });
  expect(contact).toBeVisible();
  expect(contact).toHaveAttribute("href", "/contact");
});

test("reduced motion exposes all applications once, including their images and details", async () => {
  const home = await renderHome();
  const applications = home.querySelector("#use-cases")!;
  for (const item of CONTENT.useCases) {
    expect(within(applications as HTMLElement).getByRole("heading", { name: item.title })).toBeVisible();
    expect(within(applications as HTMLElement).getByRole("img", { name: item.imageAlt })).toBeVisible();
    for (const spec of item.specs) expect(within(applications as HTMLElement).getByText(spec.name)).toBeVisible();
  }
  for (const el of home.querySelectorAll<HTMLElement>("h2, h3, p, a")) {
    expect(el.style.opacity).not.toBe("0");
    expect(el.style.visibility).not.toBe("hidden");
  }
});
