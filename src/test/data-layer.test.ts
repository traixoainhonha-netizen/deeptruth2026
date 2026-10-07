import { describe, expect, it } from "vitest";
import {
  ANON_NAME,
  computeReviewStats,
  displayName,
  reviewsToCsv,
  sanitizeSearch,
} from "@/components/deeptruth/reviews/api";
import { parseArchiveSearch } from "@/components/deeptruth/reviews/search";
import {
  parseThreatReport,
  parseVoteResult,
  toThreatError,
} from "@/components/deeptruth/threat-map/api";
import { isMissingRelationError } from "@/lib/db-errors";
import { pageNumbers } from "@/lib/pagination";

describe("database error handling", () => {
  it("recognises objects that are not migrated yet", () => {
    expect(isMissingRelationError({ code: "PGRST205", message: "" })).toBe(true);
    expect(isMissingRelationError({ code: "42P01", message: "" })).toBe(true);
    expect(
      isMissingRelationError({
        message: "Could not find the table 'public.x' in the schema cache",
      }),
    ).toBe(true);
    expect(isMissingRelationError({ code: "23514", message: "check violation" })).toBe(false);
    expect(isMissingRelationError(null)).toBe(false);
  });

  it("maps RPC failures to friendly error kinds", () => {
    expect(toThreatError({ code: "PGRST202", message: "" }).kind).toBe("unavailable");
    expect(toThreatError({ code: "22023", message: "personal_info_detected" }).kind).toBe(
      "personal_info",
    );
    expect(toThreatError({ code: "54000", message: "rate_limited" }).kind).toBe("rate_limited");
    expect(toThreatError({ code: "P0002", message: "threat_not_found" }).kind).toBe("not_found");
    expect(toThreatError({ code: "23503", message: "fk" }).kind).toBe("invalid");
    expect(toThreatError({ message: "TypeError: Failed to fetch" }).kind).toBe("network");
    expect(toThreatError({ code: "XX000", message: "boom" }).kind).toBe("unknown");
    expect(toThreatError(null).message).toMatch(/lỗi/);
  });
});

describe("parseThreatReport", () => {
  const row = {
    id: "1",
    created_at: "2026-10-07T10:00:00Z",
    category: "money_transfer",
    channel: "video_call",
    region_code: "ha-noi",
    title: "Tiêu đề",
    description: "Mô tả",
    vote_count: 2,
    danger_total: 7,
  };

  it("narrows realtime payloads", () => {
    expect(parseThreatReport(row)).toEqual(row);
  });

  it("falls back to 'other' for unknown enum values", () => {
    const parsed = parseThreatReport({ ...row, category: "future_value", channel: 42 });
    expect(parsed?.category).toBe("other");
    expect(parsed?.channel).toBe("other");
  });

  it("rejects rows missing required fields", () => {
    expect(parseThreatReport({ ...row, title: undefined })).toBeNull();
    expect(parseThreatReport({})).toBeNull();
  });
});

describe("parseVoteResult", () => {
  it("accepts the jsonb returned by vote_threat()", () => {
    expect(
      parseVoteResult({ status: "ok", vote_count: 2, danger_total: "7", danger_score: 3.5 }),
    ).toEqual({
      status: "ok",
      vote_count: 2,
      danger_total: 7,
    });
  });

  it("rejects unexpected shapes", () => {
    expect(parseVoteResult(null)).toBeNull();
    expect(parseVoteResult({ status: "maybe", vote_count: 1, danger_total: 1 })).toBeNull();
    expect(parseVoteResult({ status: "ok", vote_count: "x", danger_total: 1 })).toBeNull();
  });
});

describe("review helpers", () => {
  it("aggregates ratings and ignores out-of-range values", () => {
    expect(computeReviewStats([5, 5, 4, 3, 1, 9, 0])).toEqual({
      total: 5,
      average: 3.6,
      distribution: [1, 0, 1, 1, 2],
    });
    expect(computeReviewStats([])).toEqual({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0] });
  });

  it("falls back to the anonymous name", () => {
    expect(displayName("  ")).toBe(ANON_NAME);
    expect(displayName(" M.A ")).toBe("M.A");
  });

  it("strips characters that break PostgREST filters", () => {
    expect(sanitizeSearch('  hay%_quá, (rất)  "tốt"*  ')).toBe("hay quá rất tốt");
    expect(sanitizeSearch(undefined)).toBe("");
    expect(sanitizeSearch("a".repeat(150))).toHaveLength(100);
  });

  it("writes Excel-safe CSV", () => {
    const csv = reviewsToCsv([
      {
        id: "1",
        name: "",
        rating: 5,
        content: 'Rất "hay", nên dùng\nthử',
        created_at: "2026-10-07T03:04:05Z",
      },
      {
        id: "2",
        name: "=HYPERLINK()",
        rating: 1,
        content: "@cmd",
        created_at: "2026-10-07T03:04:05Z",
      },
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    const lines = csv.slice(1).split("\r\n");
    expect(lines[0]).toBe("Thời gian,Thời gian (ISO 8601),Biệt danh,Số sao,Nội dung");
    expect(lines[1]).toContain(`${ANON_NAME},5,"Rất ""hay"", nên dùng\nthử"`);
    // Formula injection is neutralised with a leading apostrophe.
    expect(csv).toContain("'=HYPERLINK()");
    expect(csv).toContain("'@cmd");
  });
});

describe("parseArchiveSearch", () => {
  it("keeps valid filters", () => {
    expect(parseArchiveSearch({ page: 3, rating: "5", q: " hay ", sort: "oldest" })).toEqual({
      page: 3,
      rating: 5,
      q: "hay",
      sort: "oldest",
    });
  });

  it("drops malformed values instead of failing the page", () => {
    expect(parseArchiveSearch({ page: 0, rating: 9, q: "   ", sort: "random" })).toEqual({
      page: undefined,
      rating: undefined,
      q: undefined,
      sort: undefined,
    });
    expect(parseArchiveSearch({ page: 2.5, rating: "abc" })).toMatchObject({
      page: undefined,
      rating: undefined,
    });
  });

  it("treats numeric search terms as text (the router JSON-parses params)", () => {
    expect(parseArchiveSearch({ q: 113 }).q).toBe("113");
  });
});

describe("pageNumbers", () => {
  it("lists every page when there are few", () => {
    expect(pageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses long ranges around the current page", () => {
    expect(pageNumbers(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
    expect(pageNumbers(1, 12)).toEqual([1, 2, "gap", 12]);
    expect(pageNumbers(12, 12)).toEqual([1, "gap", 11, 12]);
  });
});
