import type { Host } from "@/types/ui-types";

export function hostAvailability(host: Host): string {
  if (host.statsConfig?.statusCheckEnabled === false) return "unknown";
  return host.status ?? (host.online ? "online" : "unknown");
}
