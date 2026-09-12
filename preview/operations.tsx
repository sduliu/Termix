import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import {
  Activity,
  ChevronsUpDown,
  Code,
  KeyRound,
  LayoutDashboard,
  Link,
  Server,
  Settings,
  Sparkles,
  Terminal,
} from "lucide-react";
import { OperationsConsole } from "../src/ui/dashboard/OperationsConsole";
import type { Host } from "../src/types/ui-types";
import en from "../src/ui/locales/en.json";
import zh from "../src/ui/locales/translated/zh_CN.json";
import "../src/ui/index.css";
import "./operations-preview.css";

await i18next.use(initReactI18next).init({
  lng: "zh-CN",
  fallbackLng: "en",
  resources: { en: { translation: en }, "zh-CN": { translation: zh } },
  interpolation: { escapeValue: false },
});
const hosts = [
  {
    id: "1",
    name: "Azure",
    ip: "192.0.2.10",
    status: "online",
    enableSsh: true,
    enableFileManager: true,
  },
  {
    id: "2",
    name: "Oracle",
    ip: "192.0.2.20",
    status: "online",
    enableSsh: true,
    enableFileManager: true,
  },
  {
    id: "3",
    name: "Legion",
    ip: "192.0.2.30",
    status: "reachable",
    enableSsh: true,
    enableFileManager: true,
  },
  { id: "4", name: "HP", ip: "192.0.2.40", status: "offline", enableRdp: true },
].map((host) => ({ ...host, port: host.enableRdp ? 3389 : 22 })) as Host[];
export function Preview() {
  const [notice, setNotice] = useState(
    "演示数据 · 本页复用真实控制台组件，不连接服务器",
  );
  const nav = [
    [LayoutDashboard, "运维控制台"],
    [Server, "主机"],
    [KeyRound, "凭据"],
    [Link, "连接"],
    [Code, "片段"],
    [Sparkles, "AI 助手"],
  ] as const;
  return (
    <div className="preview-shell">
      <aside className="preview-nav">
        <div className="preview-brand">
          <img src="/icon.png" alt="" />
          <strong>Termix</strong>
        </div>
        <button
          className="preview-workspace"
          onClick={() => setNotice("预览仅含个人工作区")}
        >
          <span>个人工作区</span>
          <ChevronsUpDown size={14} />
        </button>
        <nav>
          {nav.map(([Icon, name], index) => (
            <button
              key={name}
              className={index === 0 ? "active" : ""}
              onClick={() => setNotice(`${name}：正式应用中打开现有功能面板`)}
            >
              <Icon size={17} />
              {name}
            </button>
          ))}
        </nav>
        <div className="preview-nav-bottom">
          <button onClick={() => setNotice("正式应用中打开设置")}>
            <Settings size={17} />
            设置
          </button>
          <span>Termix 2.7.1</span>
        </div>
      </aside>
      <main className="preview-main">
        <div className="preview-tabs">
          <span>
            <Activity size={14} />
            运维控制台
          </span>
          <span className="preview-tab-muted">
            <Terminal size={14} />
            个人服务器
          </span>
        </div>
        <OperationsConsole
          hosts={hosts}
          hostMetrics={
            new Map([
              ["1", { cpu: 12, ram: 38, disk: 24 }],
              ["2", { cpu: 4, ram: 26, disk: 18 }],
            ])
          }
          activity={[
            {
              id: 1,
              userId: "demo",
              hostId: 1,
              hostName: "Azure",
              type: "terminal",
              timestamp: "2026-09-12T01:42:00Z",
            },
            {
              id: 2,
              userId: "demo",
              hostId: 2,
              hostName: "Oracle",
              type: "file_manager",
              timestamp: "2026-09-12T01:38:00Z",
            },
            {
              id: 3,
              userId: "demo",
              hostId: 3,
              hostName: "Legion",
              type: "server_stats",
              timestamp: "2026-09-12T01:31:00Z",
            },
          ]}
          loading={false}
          error={null}
          onOpenTab={(host, type) =>
            setNotice(`演示操作：${host.name} / ${type}，未发起真实连接`)
          }
          onOpenSingletonTab={() => setNotice("演示操作：添加主机，未写入数据")}
          onCustomize={() => setNotice("正式应用中可切回原有自定义仪表盘")}
        />
        <footer className="preview-notice" role="status">
          {notice}
        </footer>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
