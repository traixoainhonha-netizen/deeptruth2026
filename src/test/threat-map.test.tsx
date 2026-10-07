import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// A tiny stand-in for the Supabase client: every query-builder call chains, and
// awaiting the chain resolves to the canned response for that table or RPC.
const db = vi.hoisted(() => ({
  tables: {} as Record<string, { data: unknown; error: unknown }>,
}));

vi.mock("@/integrations/supabase/client", () => {
  const respond = (key: string) => {
    const response = Promise.resolve(db.tables[key] ?? { data: null, error: { code: "PGRST205" } });
    const chain: object = new Proxy(response, {
      get: (target, prop) =>
        prop === "then" || prop === "catch" || prop === "finally"
          ? target[prop].bind(target)
          : () => chain,
    });
    return chain;
  };
  const channel = {
    on: () => channel,
    subscribe: (cb?: (state: string) => void) => {
      cb?.("SUBSCRIBED");
      return channel;
    },
  };
  return {
    supabase: {
      from: (table: string) => respond(table),
      rpc: (fn: string) => respond(`rpc:${fn}`),
      channel: () => channel,
      removeChannel: () => Promise.resolve(),
    },
  };
});

import { ThreatMapSection } from "@/components/deeptruth/threat-map/ThreatMapSection";

function renderSection() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ThreatMapSection />
    </QueryClientProvider>,
  );
}

const missing = {
  data: null,
  error: { code: "PGRST205", message: "Could not find the table in the schema cache" },
};

beforeEach(() => {
  db.tables = {};
  // jsdom has no WebGL; make the probe fail quietly instead of logging "not implemented".
  HTMLCanvasElement.prototype.getContext = () => null;
});

describe("ThreatMapSection", () => {
  it("degrades gracefully before the database migration is applied", async () => {
    for (const t of [
      "threat_regions",
      "threat_reports",
      "threat_region_stats",
      "threat_category_stats",
    ]) {
      db.tables[t] = missing;
    }
    renderSection();
    expect(await screen.findByText("Bản đồ cảnh báo đang được khởi tạo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Báo cáo vụ việc/ })).toBeDisabled();
    expect(screen.queryByText("Trực tiếp")).not.toBeInTheDocument();
  });

  it("shows live reports, the hottest region and a WebGL fallback", async () => {
    const now = new Date().toISOString();
    db.tables["threat_regions"] = {
      data: [{ code: "ha-noi", name: "Hà Nội", area: "north", latitude: 21.03, longitude: 105.85 }],
      error: null,
    };
    db.tables["threat_reports"] = {
      data: [
        {
          id: "r1",
          created_at: now,
          category: "money_transfer",
          channel: "video_call",
          region_code: "ha-noi",
          title: "Giả mạo người thân gọi video vay tiền",
          description: "Kẻ gian dùng khuôn mặt giả của anh trai để vay tiền gấp.",
          vote_count: 3,
          danger_total: 12,
        },
      ],
      error: null,
    };
    db.tables["threat_region_stats"] = {
      data: [
        {
          region_code: "ha-noi",
          name: "Hà Nội",
          area: "north",
          latitude: 21.03,
          longitude: 105.85,
          report_count: 1,
          reports_last_7d: 1,
          avg_danger: 4,
          last_reported_at: now,
        },
      ],
      error: null,
    };
    db.tables["threat_category_stats"] = {
      data: [{ category: "money_transfer", report_count: 1, reports_last_7d: 1, avg_danger: 4 }],
      error: null,
    };

    renderSection();

    expect(await screen.findByText("Giả mạo người thân gọi video vay tiền")).toBeInTheDocument();
    expect(screen.getByText("4.0/5 · Cao")).toBeInTheDocument();
    expect(screen.getByText("Trực tiếp")).toBeInTheDocument();
    // "Điểm nóng tuần này" KPI and the top-regions list both name Hà Nội.
    expect(screen.getAllByText("Hà Nội").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/không hỗ trợ WebGL/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Báo cáo vụ việc/ })).toBeEnabled();
  });
});
