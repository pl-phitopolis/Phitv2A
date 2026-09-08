import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import { unwrap } from "@/shared/api/errors";
import { keyRoots } from "@/shared/api/keys";
import type { components, operations } from "@/shared/api/schema";

export type JobPostingSummary = components["schemas"]["JobPostingSummary"];
export type JobPostingOut = components["schemas"]["JobPostingOut"];
export type JobPostingPage = components["schemas"]["JobPostingPage"];

export interface CareersListParams {
  limit: number;
  offset: number;
  category?: string;
}

export const careersKeys = {
  all: keyRoots.careers,
  list: (params: CareersListParams) => [...careersKeys.all, "list", params] as const,
  detail: (slug: string) => [...careersKeys.all, "detail", slug] as const,
};

// Editor-latency policy: careers content is managed live in Heimdall CMS
// (same as blog), so these queries opt OUT of the global 30s staleTime /
// no-focus-refetch defaults. Any open tab refetches the moment it regains
// focus — a newly published/unpublished posting appears as soon as anyone
// looks, with zero sync infrastructure.
const CONTENT_FRESHNESS = {
  staleTime: 0,
  refetchOnWindowFocus: true,
} as const;

export const careersPostsQuery = (params: CareersListParams) =>
  queryOptions({
    ...CONTENT_FRESHNESS,
    // Page/filter changes swap the queryKey; keep the previous page rendered
    // during the fetch instead of flashing an empty list.
    // (List only — on the detail query this would show the WRONG posting.)
    placeholderData: keepPreviousData,
    queryKey: careersKeys.list(params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/job-postings", {
          params: {
            query: {
              limit: params.limit,
              offset: params.offset,
              // exactOptionalPropertyTypes: omit the key entirely when absent.
              ...(params.category !== undefined ? { category: params.category } : {}),
            } satisfies operations["list_job_postings"]["parameters"]["query"],
          },
        }),
      ),
  });

export const careersPostQuery = (slug: string) =>
  queryOptions({
    ...CONTENT_FRESHNESS,
    queryKey: careersKeys.detail(slug),
    queryFn: async () =>
      unwrap(await api.GET("/api/v1/job-postings/{slug}", { params: { path: { slug } } })),
  });
