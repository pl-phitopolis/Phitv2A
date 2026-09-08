import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { HttpResponse, http } from "msw";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, beforeEach } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { makeTestQueryClient, renderWithProviders } from "./test-utils";
import { jobPostingsFixture } from "./msw/handlers";
import { server } from "./msw/server";

function renderCareersRoute(initialEntry = "/careers") {
  const queryClient = makeTestQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  return renderWithProviders(<RouterProvider router={router} />, queryClient);
}

describe("CareersIndexPage — Archival Engineering Register", () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  test("renders archival register header and classification in MONO", async () => {
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Active Engineering Positions & Graduate Fellowships/i,
        level: 1,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Open engineering roles, quantitative research fellowships, and paid R&D internships/i)
    ).toBeInTheDocument();
  });

  test("renders all fetched position files with offset tab ears and closed state", async () => {
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();

    for (const posting of jobPostingsFixture) {
      expect(await screen.findByRole("heading", { name: posting.title, level: 2 })).toBeInTheDocument();
    }
    // No client-side facet counts on category chips — the backend has no
    // per-category count endpoint for job postings.
    expect(screen.getByText("ALL")).toBeInTheDocument();
  });

  test("filters positions by category chips (server-side `category` param)", async () => {
    const user = userEvent.setup();
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();

    // Click Graduate Program filter
    const gradChip = screen.getByText("GRADUATE PROGRAM");
    await user.click(gradChip);

    expect(await screen.findByRole("heading", { name: "Technical Graduate Program", level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Quantitative Researcher", level: 2 })).not.toBeInTheDocument();

    // Click All filter
    const allChip = screen.getByText("ALL");
    await user.click(allChip);

    expect(await screen.findByRole("heading", { name: "Technical Graduate Program", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quantitative Researcher", level: 2 })).toBeInTheDocument();
  });

  test("filters the currently loaded page by keyword search query (client-side only)", async () => {
    const user = userEvent.setup();
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();
    await screen.findByRole("heading", { name: "DevOps & Cloud SRE Engineer", level: 2 });

    const searchInput = screen.getByPlaceholderText(/Search by role, stack/i);
    await user.type(searchInput, "Kubernetes");

    expect(screen.getByRole("heading", { name: "DevOps & Cloud SRE Engineer", level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Technical Graduate Program", level: 2 })).not.toBeInTheDocument();
  });

  test("renders archival 0 MATCHES empty state when search returns no hits", async () => {
    const user = userEvent.setup();
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();
    await screen.findByRole("heading", { name: "Technical Graduate Program", level: 2 });

    const searchInput = screen.getByPlaceholderText(/Search by role, stack/i);
    await user.type(searchInput, "nonexistent-quantum-stack-xyz");

    expect(screen.getByText(/ARCHIVE STATUS \/\/ 0 MATCHES/i)).toBeInTheDocument();
    expect(screen.getByText(/No positions match your search query/i)).toBeInTheDocument();

    // Reset button clears search
    const resetBtn = screen.getByRole("button", { name: /RESET REGISTERS/i });
    await user.click(resetBtn);

    expect(await screen.findByRole("heading", { name: "Technical Graduate Program", level: 2 })).toBeInTheDocument();
  });

  test("expands folder tab in place to reveal mono meta-rail, summary, stack, and single Open full role CTA", async () => {
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();

    const targetPos = jobPostingsFixture[0]!;
    const folderTrigger = await screen.findByRole("button", { name: new RegExp(targetPos.title, "i") });

    expect(folderTrigger).toHaveAttribute("aria-expanded", "false");

    // Click to expand
    await userEvent.setup().click(folderTrigger);

    expect(folderTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(targetPos.department.toUpperCase())).toBeInTheDocument();
    expect(screen.getByText(/ROLE SPECIFICATION SUMMARY/i)).toBeInTheDocument();
    expect(screen.getByText(targetPos.summary)).toBeInTheDocument();

    // Single Open full role CTA link
    const ctaButton = screen.getByRole("link", { name: /OPEN FULL ROLE/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute("href", `/careers/${targetPos.slug}`);

    // Click again to collapse
    await userEvent.setup().click(folderTrigger);
    expect(folderTrigger).toHaveAttribute("aria-expanded", "false");
  });

  test("keyboard navigation toggles folder expansion with Enter and Space", async () => {
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();

    const targetPos = jobPostingsFixture[0]!;
    const folderTrigger = await screen.findByRole("button", { name: new RegExp(targetPos.title, "i") });

    // Enter key expands
    fireEvent.keyDown(folderTrigger, { key: "Enter", code: "Enter" });
    expect(folderTrigger).toHaveAttribute("aria-expanded", "true");

    // Space key collapses
    fireEvent.keyDown(folderTrigger, { key: " ", code: "Space" });
    expect(folderTrigger).toHaveAttribute("aria-expanded", "false");
  });

  test("quiet brochure trigger opens brochure drawer", async () => {
    const user = userEvent.setup();
    renderCareersRoute();

    expect(await screen.findByText(/REGISTER · PHITOPOLIS R&D MANILA/i)).toBeInTheDocument();

    const brochureBtn = screen.getByRole("button", { name: /PROGRAM BROCHURE \(PDF\)/i });
    await user.click(brochureBtn);

    // BrochureDrawer displays heading
    expect(screen.getByText(/2026 Technical Graduate Program Brochure/i)).toBeInTheDocument();
  });

  test("paginates within a category once total exceeds the page size", async () => {
    // Override the list handler for this test only: 12 "Engineering & Quant"
    // postings so PAGE_SIZE (9) forces a second page.
    const manyPostings = Array.from({ length: 12 }, (_, i) => ({
      ...jobPostingsFixture[3]!,
      id: `overflow-${String(i)}`,
      slug: `overflow-engineer-${String(i)}`,
      title: `Overflow Engineer ${String(i)}`,
    }));
    server.use(
      http.get("*/api/v1/job-postings", ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") ?? "9");
        const offset = Number(url.searchParams.get("offset") ?? "0");
        return HttpResponse.json({
          items: manyPostings.slice(offset, offset + limit),
          total: manyPostings.length,
          limit,
          offset,
        });
      }),
    );

    renderCareersRoute();

    expect(await screen.findByRole("heading", { name: "Overflow Engineer 0", level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Overflow Engineer 9", level: 2 })).not.toBeInTheDocument();

    const user = userEvent.setup();
    const pageTwoButton = screen.getByRole("button", { name: /go to page 2/i });
    await user.click(pageTwoButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Overflow Engineer 9", level: 2 })).toBeInTheDocument();
    });
  });
});
