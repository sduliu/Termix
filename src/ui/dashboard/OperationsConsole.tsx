import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowUpRight,
  Check,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Search,
  Server,
  Terminal,
  X,
} from "lucide-react";
import type { Host, TabType } from "@/types/ui-types";
import type { RecentActivityItem } from "@/main-axios";
import { getDefaultConnectionTab } from "@/lib/host-connection-tabs";
import { hostAvailability } from "@/dashboard/operations-hosts";
import "./operations-console.css";

function canConnect(host: Host) {
  return (
    host.enableSsh || host.enableRdp || host.enableVnc || host.enableTelnet
  );
}

const activityTabs: Record<RecentActivityItem["type"], TabType> = {
  terminal: "terminal",
  file_manager: "files",
  server_stats: "host-metrics",
  tunnel: "tunnel",
  docker: "docker",
  rdp: "rdp",
  vnc: "vnc",
  telnet: "telnet",
};

export function OperationsConsole({
  hosts,
  hostMetrics,
  activity,
  loading,
  error,
  activityError,
  onOpenTab,
  onOpenSingletonTab,
  onCustomize,
}: {
  hosts: Host[];
  hostMetrics: Map<
    string,
    { cpu: number | null; ram: number | null; disk: number | null }
  >;
  activity: RecentActivityItem[];
  loading: boolean;
  error: string | null;
  activityError?: string | null;
  onOpenTab: (host: Host, type: TabType) => void;
  onOpenSingletonTab: (type: TabType, pendingEvent?: string) => void;
  onCustomize: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const visible = hosts.filter(
    (host) =>
      (filter === "all" || hostAvailability(host) === filter) &&
      `${host.name} ${host.ip} ${(host.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  // Selection is scoped to the visible rows; a filter never connects hidden hosts.
  const targets = visible.filter(
    (host) => selected.has(host.id) && canConnect(host),
  );
  const selectable = visible.filter(canConnect);
  const allSelected =
    selectable.length > 0 && targets.length === selectable.length;
  const toggle = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const label = (key: string) => t(`operations.${key}`);
  const statusLabel = (host: Host) =>
    label(loading ? "checking" : hostAvailability(host));
  const percent = (value: number | null | undefined) =>
    value == null || !Number.isFinite(value) ? "--" : `${Math.round(value)}%`;

  return (
    <div className="ops-console">
      <header className="ops-header">
        <div>
          <h1>{label("title")}</h1>
          <p>{label("subtitle")}</p>
        </div>
        <div className="ops-actions">
          <button
            className="ops-icon"
            onClick={onCustomize}
            title={label("customize")}
            aria-label={label("customize")}
          >
            <LayoutDashboard size={17} />
          </button>
          <button
            className="ops-primary"
            onClick={() =>
              onOpenSingletonTab("host-manager", "host-manager:add-host")
            }
          >
            <Plus size={16} />
            {t("hosts.addHost")}
          </button>
        </div>
      </header>
      <nav className="ops-status-strip" aria-label={label("filter")}>
        {["all", "online", "reachable", "offline", "unknown"].map((status) => (
          <button
            key={status}
            aria-pressed={filter === status}
            onClick={() => {
              setFilter(status);
              setSelected(new Set());
            }}
          >
            <span className={`ops-dot ops-${status}`} />
            {label(status)}
            <strong>
              {loading
                ? "--"
                : status === "all"
                  ? hosts.length
                  : hosts.filter((h) => hostAvailability(h) === status).length}
            </strong>
          </button>
        ))}
      </nav>
      {error && (
        <div role="alert" className="ops-error">
          {error}
        </div>
      )}
      <div className="ops-layout">
        <section className="ops-hosts" aria-label={t("nav.hosts")}>
          <div className="ops-toolbar">
            <label className="ops-search">
              <Search size={16} />
              <input
                aria-label={label("search")}
                placeholder={label("search")}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelected(new Set());
                }}
              />
            </label>
            <button
              className="ops-secondary"
              disabled={!targets.length || loading}
              onClick={() => {
                targets.forEach((host) =>
                  onOpenTab(host, getDefaultConnectionTab(host)),
                );
                setSelected(new Set());
              }}
            >
              <Terminal size={15} />
              {label("connectSelected")}
              {targets.length > 0 && ` (${targets.length})`}
            </button>
            {selected.size > 0 && (
              <button
                className="ops-icon"
                onClick={() => setSelected(new Set())}
                aria-label={label("clearSelection")}
                title={label("clearSelection")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="ops-table-scroll">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label={label("selectAll")}
                      checked={allSelected}
                      disabled={!selectable.length || loading}
                      onChange={() =>
                        setSelected(
                          allSelected
                            ? new Set()
                            : new Set(selectable.map((h) => h.id)),
                        )
                      }
                    />
                  </th>
                  <th>{t("nav.hosts")}</th>
                  <th>{label("status")}</th>
                  <th>CPU</th>
                  <th>{label("memory")}</th>
                  <th>{label("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((host) => (
                  <tr key={host.id} data-selected={selected.has(host.id)}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`${label("select")} ${host.name}`}
                        checked={selected.has(host.id)}
                        disabled={!canConnect(host) || loading}
                        onChange={() => toggle(host.id)}
                      />
                    </td>
                    <td>
                      <button
                        className="ops-host-name"
                        onClick={() => onOpenTab(host, "host-metrics")}
                      >
                        <span className="ops-host-icon">
                          <Server size={18} />
                        </span>
                        <span>
                          <strong>{host.name}</strong>
                          <code>
                            {host.ip}:{host.port}
                          </code>
                        </span>
                      </button>
                    </td>
                    <td>
                      <span className="ops-status">
                        <span
                          className={`ops-dot ops-${loading ? "unknown" : hostAvailability(host)}`}
                        />
                        {statusLabel(host)}
                      </span>
                    </td>
                    <td className="ops-number">
                      {percent(hostMetrics.get(host.id)?.cpu)}
                    </td>
                    <td className="ops-number">
                      {percent(hostMetrics.get(host.id)?.ram)}
                    </td>
                    <td>
                      <div className="ops-actions">
                        <button
                          className="ops-icon"
                          title={label("files")}
                          aria-label={`${label("files")} ${host.name}`}
                          disabled={!host.enableFileManager}
                          onClick={() => onOpenTab(host, "files")}
                        >
                          <FolderOpen size={16} />
                        </button>
                        <button
                          className="ops-connect"
                          disabled={!canConnect(host)}
                          onClick={() =>
                            onOpenTab(host, getDefaultConnectionTab(host))
                          }
                        >
                          {label("connect")}
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && (
            <p role="status" className="ops-empty">
              {label("checking")}
            </p>
          )}
          {!loading && !visible.length && (
            <p className="ops-empty">
              {label(search || filter !== "all" ? "noMatches" : "noHosts")}
            </p>
          )}
          <footer className="ops-table-footer">
            <span>
              {label("visible")}: {visible.length}
            </span>
            <span>
              <Check size={13} />
              {label("localWorkspace")}
            </span>
          </footer>
        </section>
        <aside
          className="ops-activity"
          aria-label={t("dashboard.recentActivity")}
        >
          <h2>
            <Activity size={17} />
            {t("dashboard.recentActivity")}
          </h2>
          <ol>
            {activity.slice(0, 12).map((item) => {
              const host = hosts.find((h) => h.id === String(item.hostId));
              const date = new Date(item.timestamp);
              return (
                <li key={item.id}>
                  <span className="ops-event-icon">
                    <Terminal size={14} />
                  </span>
                  <div>
                    <button
                      disabled={!host}
                      onClick={() =>
                        host && onOpenTab(host, activityTabs[item.type])
                      }
                    >
                      {item.hostName}
                      <ArrowUpRight size={12} />
                    </button>
                    <p>
                      {t(`operations.activity.${item.type}`, {
                        defaultValue: item.type,
                      })}
                    </p>
                    <time
                      title={
                        Number.isNaN(date.getTime())
                          ? ""
                          : date.toLocaleString(i18n.language)
                      }
                    >
                      {Number.isNaN(date.getTime())
                        ? "--"
                        : date.toLocaleTimeString(i18n.language, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
          {activityError && <p role="alert">{activityError}</p>}
          {!activityError && !activity.length && (
            <p className="ops-empty">{t("dashboard.noRecentActivity")}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
