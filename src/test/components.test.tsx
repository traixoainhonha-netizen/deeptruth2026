import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { chapters } from "@/components/deeptruth/data";
import { Handbook } from "@/components/deeptruth/Handbook";
import type { ThreatRegion, ThreatReport } from "@/components/deeptruth/threat-map/api";
import { ThreatFeed } from "@/components/deeptruth/threat-map/ThreatFeed";
import { Reveal } from "@/components/motion/Reveal";

function withQuery(ui: ReactNode) {
  return <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>;
}

describe("Reveal", () => {
  it("renders its content and reveals immediately without IntersectionObserver", () => {
    render(<Reveal as="p">Xin chào</Reveal>);
    const el = screen.getByText("Xin chào");
    expect(el.tagName).toBe("P");
    expect(el).toHaveAttribute("data-reveal", "up");
    expect(el).toHaveClass("is-revealed");
  });
});

describe("Handbook", () => {
  it("renders every chapter with a table of contents link", () => {
    render(<Handbook />);
    for (const c of chapters) {
      expect(screen.getByRole("heading", { level: 2, name: c.title })).toBeInTheDocument();
      expect(document.querySelector(`a[href="#chuong-${c.no}"]`)).not.toBeNull();
    }
  });
});

describe("ThreatFeed", () => {
  const regions = new Map<string, ThreatRegion>([
    ["ha-noi", { code: "ha-noi", name: "Hà Nội", area: "north", latitude: 21, longitude: 105 }],
  ]);
  const reports: ThreatReport[] = [
    {
      id: "r1",
      created_at: new Date().toISOString(),
      category: "voice_clone",
      channel: "phone_call",
      region_code: "ha-noi",
      title: "Giả giọng người thân",
      description: "Mô tả diễn biến vụ việc giả giọng nói để xin tiền.",
      vote_count: 4,
      danger_total: 18,
    },
  ];

  it("shows tactic, place, score and lets the visitor vote", () => {
    const onSelect = vi.fn();
    render(
      withQuery(
        <ThreatFeed
          reports={reports}
          regions={regions}
          votes={{}}
          selectedId={null}
          onSelect={onSelect}
        />,
      ),
    );
    expect(screen.getByText("Giả giọng người thân")).toBeInTheDocument();
    expect(screen.getByText("Giả giọng nói (audio)")).toBeInTheDocument();
    expect(screen.getByText("Hà Nội")).toBeInTheDocument();
    expect(screen.getByText("4.5/5 · Nghiêm trọng")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /điểm –/ })).toHaveLength(5);

    fireEvent.click(screen.getByText("Giả giọng người thân"));
    expect(onSelect).toHaveBeenCalledWith(reports[0]);
  });

  it("replaces the vote buttons once this browser has voted", () => {
    render(
      withQuery(
        <ThreatFeed
          reports={reports}
          regions={regions}
          votes={{ r1: 2 }}
          selectedId="r1"
          onSelect={() => {}}
        />,
      ),
    );
    expect(screen.getByText(/Bạn đã chấm/)).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /điểm –/ })).toHaveLength(0);
  });
});
