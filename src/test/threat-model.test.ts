import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  THREAT_CATEGORIES,
  THREAT_CHANNELS,
  containsPersonalInfo,
  dangerColor,
  dangerLabel,
  dangerRgb,
  dangerScoreOf,
  getVoterToken,
  readVotes,
  rememberVote,
  shortRegionName,
} from "@/components/deeptruth/threat-map/model";
import { threatReportSchema } from "@/components/deeptruth/threat-map/schema";

const migration = readFileSync(
  path.resolve(__dirname, "../../drizzle/migrations/0002_threat_map_review_archive.sql"),
  "utf8",
);

function checkList(column: string) {
  const match = migration.match(
    new RegExp(`${column} text NOT NULL CHECK \\(${column} IN \\(([^)]*)\\)\\)`),
  );
  if (!match?.[1]) throw new Error(`CHECK list for ${column} not found`);
  return match[1].split(",").map((s) => s.trim().replace(/'/g, ""));
}

describe("threat model ↔ database contract", () => {
  it("category values match the SQL CHECK constraint", () => {
    expect([...THREAT_CATEGORIES]).toEqual(checkList("category"));
  });

  it("channel values match the SQL CHECK constraint", () => {
    expect([...THREAT_CHANNELS]).toEqual(checkList("channel"));
  });
});

describe("containsPersonalInfo (mirrors public.contains_personal_info)", () => {
  // Same cases as the SQL test suite, so both guards stay in agreement.
  const cases: [string, boolean][] = [
    ["gọi 0912 345 678 ngay", true],
    ["sđt 0912.345.678", true],
    ["+84 912 345 678", true],
    ["số máy 0912-345-678", true],
    ["email a.b@gmail.com nhé", true],
    ["CCCD 001203004567", true],
    ["STK 1903 4567 8901 23", true],
    ["lừa 100.000.000 đồng", false],
    ["mất 50 triệu", false],
    ["ngày 12/03/2025 lúc 21:30", false],
    ["năm 2025 có 3 vụ", false],
    ["chuyển 84 triệu", false],
  ];
  it.each(cases)("%s → %s", (text, expected) => {
    expect(containsPersonalInfo(text)).toBe(expected);
  });
});

describe("danger scale", () => {
  it("labels scores and handles missing values", () => {
    expect(dangerLabel(null)).toBe("Chưa chấm");
    expect(dangerLabel(1)).toBe("Thấp");
    expect(dangerLabel(4.4)).toBe("Cao");
    expect(dangerLabel(4.6)).toBe("Nghiêm trọng");
    expect(dangerLabel(9)).toBe("Nghiêm trọng");
  });

  it("maps scores to colour tokens", () => {
    expect(dangerColor(null)).toBe("var(--muted-foreground)");
    expect(dangerColor(2.4)).toBe("var(--danger-2)");
    expect(dangerColor(0)).toBe("var(--danger-1)");
  });

  it("interpolates globe colours within 0..1", () => {
    for (const s of [1, 1.5, 2.25, 3, 4.9, 5]) {
      for (const c of dangerRgb(s)) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
    }
    expect(dangerRgb(1)).toEqual([0.32, 0.85, 0.62]);
    expect(dangerRgb(5)).toEqual([0.95, 0.28, 0.3]);
  });

  it("computes the average from counters (as realtime payloads carry them)", () => {
    expect(dangerScoreOf({ vote_count: 0, danger_total: 0 })).toBeNull();
    expect(dangerScoreOf({ vote_count: 3, danger_total: 11 })).toBe(3.67);
  });
});

describe("shortRegionName", () => {
  it("shortens only the online bucket", () => {
    expect(shortRegionName({ name: "Trên mạng / không rõ vị trí", area: "online" })).toBe(
      "Trên mạng",
    );
    expect(shortRegionName({ name: "TP. Hồ Chí Minh", area: "south" })).toBe("TP. Hồ Chí Minh");
  });
});

describe("threatReportSchema", () => {
  const valid = {
    category: "voice_clone",
    channel: "phone_call",
    regionCode: "ha-noi",
    title: "Giả giọng con gọi xin tiền",
    description: "Kẻ gian dùng giọng nói giống hệt con tôi để xin chuyển tiền học phí gấp.",
    danger: 4,
  };

  it("accepts a well-formed report", () => {
    expect(threatReportSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects personal information on the description field", () => {
    const result = threatReportSchema.safeParse({
      ...valid,
      description: "Số gọi đến là 0912 345 678, xưng là con tôi đang cấp cứu.",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["description"]);
  });

  it("explains missing choices in Vietnamese", () => {
    const result = threatReportSchema.safeParse({ ...valid, category: "", danger: 0 });
    const messages = result.error?.issues.map((i) => i.message) ?? [];
    expect(messages).toContain("Chọn thủ đoạn Deepfake");
    expect(messages).toContain("Chọn mức độ nguy hiểm");
  });
});

describe("anonymous voter identity", () => {
  beforeEach(() => localStorage.clear());

  it("creates one stable UUID per browser", () => {
    const token = getVoterToken();
    expect(token).toMatch(/^[0-9a-f-]{36}$/);
    expect(getVoterToken()).toBe(token);
  });

  it("remembers votes and ignores corrupted storage", () => {
    rememberVote("a", 3);
    rememberVote("b", 5);
    expect(readVotes()).toEqual({ a: 3, b: 5 });
    localStorage.setItem("deeptruth:threat-votes", '{"x": 9, "y": "bad", "z": 2}');
    expect(readVotes()).toEqual({ z: 2 });
    localStorage.setItem("deeptruth:threat-votes", "not json");
    expect(readVotes()).toEqual({});
  });
});
