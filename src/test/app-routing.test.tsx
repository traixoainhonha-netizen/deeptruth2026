import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { JOURNEY, PAGES, nextPage } from "@/components/layout/site-nav";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it.each(PAGES.map((p) => p.to))(
    "matches a page for %s instead of falling back to not found",
    (to) => {
      const matches = router.matchRoutes(to);
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    },
  );

  it("falls back to not found for unknown paths", () => {
    const matches = router.matchRoutes("/khong-ton-tai");
    expect(matches.at(-1)?.routeId).toBe(rootRouteId);
  });
});

describe("Learning journey", () => {
  it("has five ordered steps", () => {
    expect(JOURNEY.map((p) => p.step.index)).toEqual([1, 2, 3, 4, 5]);
  });

  it("walks from each step to the next and ends at the last", () => {
    expect(nextPage("/")?.to).toBe("/cam-nang");
    expect(nextPage("/cam-nang")?.to).toBe("/thu-thach");
    expect(nextPage("/bao-cao")?.to).toBe("/danh-gia");
    expect(nextPage("/danh-gia")).toBeUndefined();
  });
});
