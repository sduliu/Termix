import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Host } from "@/types/ui-types";
import { OperationsConsole } from "@/dashboard/OperationsConsole";
import { hostAvailability } from "@/dashboard/operations-hosts";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
afterEach(cleanup);
const hosts = [
  {
    id: "1",
    name: "Linux",
    ip: "192.0.2.1",
    port: 22,
    status: "online",
    enableSsh: true,
  },
  {
    id: "2",
    name: "Windows",
    ip: "192.0.2.2",
    port: 3389,
    status: "reachable",
    enableRdp: true,
  },
  {
    id: "3",
    name: "Disabled",
    ip: "192.0.2.3",
    port: 22,
    online: true,
    statsConfig: { statusCheckEnabled: false },
  },
] as Host[];

describe("OperationsConsole", () => {
  it("keeps unmonitored hosts unknown", () => {
    expect(hostAvailability(hosts[2])).toBe("unknown");
    expect(hostAvailability({ online: false } as Host)).toBe("unknown");
  });
  it("batch connects enabled protocols and clears selection after a filter change", () => {
    const open = vi.fn();
    render(
      <OperationsConsole
        hosts={hosts}
        hostMetrics={new Map()}
        activity={[]}
        loading={false}
        error={null}
        onOpenTab={open}
        onOpenSingletonTab={vi.fn()}
        onCustomize={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("operations.selectAll"));
    fireEvent.click(
      screen.getByRole("button", { name: /operations.connectSelected/ }),
    );
    expect(open.mock.calls.map((call) => call[1])).toEqual(["terminal", "rdp"]);
    fireEvent.click(screen.getByLabelText("operations.selectAll"));
    fireEvent.change(screen.getByLabelText("operations.search"), {
      target: { value: "Windows" },
    });
    expect(
      screen.getByRole("button", { name: /operations.connectSelected/ }),
    ).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByLabelText("operations.select Windows"));
    open.mockClear();
    fireEvent.click(
      screen.getByRole("button", { name: /operations.connectSelected/ }),
    );
    expect(open).toHaveBeenCalledExactlyOnceWith(hosts[1], "rdp");
  });
});
