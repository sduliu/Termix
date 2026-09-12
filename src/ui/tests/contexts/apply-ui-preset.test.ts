import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultHostSidebarPreferences } from "@/types/host-sidebar-preferences";
import { defaultCredentialSidebarPreferences } from "@/types/credential-sidebar-preferences";

const api = vi.hoisted(() => ({
  getUserPreferences: vi.fn(),
  saveUserPreferences: vi.fn(),
  getHostSidebarPreferences: vi.fn(),
  saveHostSidebarPreferences: vi.fn(),
  getCredentialSidebarPreferences: vi.fn(),
  saveCredentialSidebarPreferences: vi.fn(),
}));
vi.mock("@/main-axios", () => api);
vi.mock("@/sidebar/rail-preferences", () => ({ setRailPreference: vi.fn() }));
import { applyPresetSideEffects } from "@/lib/apply-ui-preset";

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  api.getHostSidebarPreferences.mockResolvedValue({
    ...defaultHostSidebarPreferences(),
    sort: { key: "name-asc", pinnedFirst: true },
    openFolders: ["existing"],
  });
  api.getCredentialSidebarPreferences.mockResolvedValue(
    defaultCredentialSidebarPreferences(),
  );
  api.saveUserPreferences.mockResolvedValue({});
});
describe("personal Simple preset persistence", () => {
  it.each(["local", "cloud"])(
    "preserves sorting while flattening the %s view and retaining AI navigation",
    async (storageMode) => {
      api.getUserPreferences.mockResolvedValue({ storageMode });
      await applyPresetSideEffects("simple");
      const hosts = JSON.parse(localStorage.getItem("hostSidebarPreferences")!);
      expect(hosts.groupKey).toBe("none");
      expect(hosts.sort).toEqual({ key: "name-asc", pinnedFirst: true });
      expect(hosts.openFolders).toEqual(["existing"]);
      expect(JSON.parse(localStorage.getItem("hiddenRailTabs")!)).not.toContain(
        "ai",
      );
      expect(localStorage.getItem("dashboardView")).toBe("operations");
      if (storageMode === "cloud")
        expect(api.saveHostSidebarPreferences).toHaveBeenCalledWith(hosts);
      else expect(api.saveHostSidebarPreferences).not.toHaveBeenCalled();
    },
  );
});
