import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  Code2,
  Copy,
  File,
  Folder,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  Link2,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import "../src/ui/index.css";
import "./web-ui-preview.css";

type Page =
  | "overview"
  | "hosts"
  | "credentials"
  | "connections"
  | "snippets"
  | "terminal"
  | "files"
  | "ai"
  | "settings";
const hosts = [
  {
    name: "Azure",
    address: "100.98.172.64",
    status: "online",
    meta: "Ubuntu 22.04 · SSH",
  },
  {
    name: "Oracle",
    address: "100.109.52.32",
    status: "online",
    meta: "Debian · SSH",
  },
  {
    name: "Legion",
    address: "100.96.29.76",
    status: "reachable",
    meta: "Ubuntu 24.04 · SSH",
  },
  {
    name: "HP",
    address: "100.78.72.17",
    status: "offline",
    meta: "Windows · RDP",
  },
];
const nav: [Page, typeof Server, string][] = [
  ["overview", LayoutDashboard, "运维控制台"],
  ["hosts", Server, "主机"],
  ["credentials", KeyRound, "凭据"],
  ["connections", Link2, "连接"],
  ["snippets", Code2, "片段"],
  ["ai", Sparkles, "AI 助手"],
];
const activity = [
  ["Azure", "终端会话", "09:42", Terminal],
  ["Oracle", "文件管理", "09:38", FolderOpen],
  ["Legion", "主机监控", "09:31", Activity],
] as const;

function Status({ kind }: { kind: string }) {
  return (
    <span className="status">
      <i className={`dot ${kind}`} />
      {kind === "online" ? "可用" : kind === "reachable" ? "可达" : "离线"}
    </span>
  );
}
function PageTitle({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </header>
  );
}
function Metric({
  label,
  value,
  tone = "",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function Overview({ go }: { go: (p: Page) => void }) {
  return (
    <>
      <PageTitle
        title="运维控制台"
        copy="主机、连接与最近活动"
        action={
          <button className="primary" onClick={() => go("hosts")}>
            <Plus size={16} />
            添加主机
          </button>
        }
      />
      <div className="metrics">
        <Metric label="主机总数" value="4" />
        <Metric label="当前可用" value="2" tone="green" />
        <Metric label="活动连接" value="3" />
        <Metric label="最近活动" value="12" />
      </div>
      <div className="overview-grid">
        <section className="panel host-panel">
          <div className="panel-head">
            <h2>
              <Server size={17} />
              主机状态
            </h2>
            <button className="text-button" onClick={() => go("hosts")}>
              查看全部 <ArrowUpRight size={14} />
            </button>
          </div>
          {hosts.map((h) => (
            <button
              className="host-row"
              key={h.name}
              onClick={() => go("terminal")}
            >
              <span className="host-icon">
                <Server size={17} />
              </span>
              <span className="host-info">
                <strong>{h.name}</strong>
                <small>
                  {h.address} · {h.meta}
                </small>
              </span>
              <Status kind={h.status} />
              <ChevronRight size={16} className="row-chevron" />
            </button>
          ))}
        </section>
        <section className="panel activity-panel">
          <div className="panel-head">
            <h2>
              <Activity size={17} />
              最近活动
            </h2>
            <button className="icon-button">
              <MoreHorizontal size={17} />
            </button>
          </div>
          {activity.map(([host, event, time, Icon]) => (
            <button
              className="activity-row"
              key={time}
              onClick={() => go("terminal")}
            >
              <span className="event-icon">
                <Icon size={14} />
              </span>
              <span>
                <strong>{host}</strong>
                <small>{event}</small>
              </span>
              <time>{time}</time>
            </button>
          ))}
        </section>
      </div>
      <div className="quick-strip">
        <button onClick={() => go("terminal")}>
          <Terminal size={17} />
          <span>
            <strong>快速连接</strong>
            <small>打开最近主机终端</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
        <button onClick={() => go("snippets")}>
          <Play size={17} />
          <span>
            <strong>运行片段</strong>
            <small>执行常用命令片段</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
        <button onClick={() => go("ai")}>
          <Sparkles size={17} />
          <span>
            <strong>AI 助手</strong>
            <small>分析日志或生成命令</small>
          </span>
          <ArrowUpRight size={15} />
        </button>
      </div>
    </>
  );
}
function Hosts({ go }: { go: (p: Page) => void }) {
  return (
    <>
      <PageTitle
        title="主机"
        copy="直接管理个人服务器与连接状态"
        action={
          <button className="primary">
            <Plus size={16} />
            添加主机
          </button>
        }
      />
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input placeholder="搜索主机或地址" />
        </label>
        <button className="secondary">
          筛选 <ChevronRight size={15} />
        </button>
        <button className="secondary">
          排序 <ChevronRight size={15} />
        </button>
      </div>
      <section className="panel table-panel">
        <div className="table-head">
          <span>主机</span>
          <span>状态</span>
          <span>资源</span>
          <span>操作</span>
        </div>
        {hosts.map((h) => (
          <div className="table-row" key={h.name}>
            <div className="host-cell">
              <span className="host-icon">
                <Server size={17} />
              </span>
              <span>
                <strong>{h.name}</strong>
                <small>{h.address}</small>
              </span>
            </div>
            <Status kind={h.status} />
            <span className="resources">
              <i style={{ width: h.status === "online" ? "38%" : "0%" }} />
              <small>
                {h.status === "online" ? "CPU 38% · 内存 62%" : "暂无数据"}
              </small>
            </span>
            <span className="row-actions">
              <button className="secondary" onClick={() => go("terminal")}>
                <Terminal size={14} />
                连接
              </button>
              <button className="icon-button">
                <MoreHorizontal size={16} />
              </button>
            </span>
          </div>
        ))}
      </section>
    </>
  );
}
function Credentials() {
  return (
    <>
      <PageTitle
        title="凭据"
        copy="集中管理连接认证信息"
        action={
          <button className="primary">
            <Plus size={16} />
            添加凭据
          </button>
        }
      />
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input placeholder="搜索名称、用户名或类型" />
        </label>
        <button className="secondary">
          全部类型 <ChevronRight size={15} />
        </button>
      </div>
      <section className="panel table-panel">
        <div className="table-head">
          <span>名称</span>
          <span>类型</span>
          <span>关联主机</span>
          <span>操作</span>
        </div>
        {[
          ["生产 SSH 密钥", "SSH Key", "Azure · Oracle", "密钥"],
          ["个人密码", "Password", "Legion", "密码"],
          ["HP 远程凭据", "Credential", "HP", "凭据"],
        ].map((row) => (
          <div className="table-row" key={row[0]}>
            <div className="host-cell">
              <span className="credential-icon">
                <KeyRound size={17} />
              </span>
              <span>
                <strong>{row[0]}</strong>
                <small>最后使用：今天</small>
              </span>
            </div>
            <span className="chip">{row[1]}</span>
            <span className="muted">{row[2]}</span>
            <span className="row-actions">
              <button className="icon-button">
                <MoreHorizontal size={16} />
              </button>
            </span>
          </div>
        ))}
      </section>
    </>
  );
}
function Connections() {
  return (
    <>
      <PageTitle
        title="连接"
        copy="查看活动会话、隧道与共享连接"
        action={
          <button className="primary">
            <Plus size={16} />
            新建连接
          </button>
        }
      />
      <div className="metrics compact">
        <Metric label="活动会话" value="3" tone="green" />
        <Metric label="SSH 隧道" value="1" />
        <Metric label="共享会话" value="0" />
      </div>
      <section className="panel table-panel">
        <div className="table-head">
          <span>连接</span>
          <span>主机</span>
          <span>建立时间</span>
          <span>状态</span>
        </div>
        {[
          ["Azure · Terminal", "Azure", "09:42", "活动"],
          ["Oracle · Files", "Oracle", "09:38", "活动"],
          ["Legion · Metrics", "Legion", "09:31", "监控"],
        ].map((row) => (
          <div className="table-row" key={row[0]}>
            <div className="host-cell">
              <span className="event-icon">
                <Link2 size={15} />
              </span>
              <span>
                <strong>{row[0]}</strong>
                <small>当前工作区</small>
              </span>
            </div>
            <span>{row[1]}</span>
            <time>{row[2]}</time>
            <Status kind={row[3] === "活动" ? "online" : "reachable"} />
          </div>
        ))}
      </section>
    </>
  );
}
function Snippets() {
  return (
    <>
      <PageTitle
        title="片段"
        copy="保存并执行常用命令，减少重复操作"
        action={
          <button className="primary">
            <Plus size={16} />
            新建片段
          </button>
        }
      />
      <div className="snippet-grid">
        {[
          ["检查磁盘空间", "df -h", "系统"],
          ["查看服务状态", "systemctl status", "Linux"],
          ["更新容器", "docker compose pull", "Docker"],
          ["查看最近日志", "journalctl -n 100", "诊断"],
        ].map((row) => (
          <button className="snippet-card" key={row[0]}>
            <div>
              <span className="snippet-icon">
                <Play size={15} />
              </span>
              <span>
                <strong>{row[0]}</strong>
                <small>{row[2]}</small>
              </span>
            </div>
            <code>{row[1]}</code>
            <span className="snippet-run">
              运行 <ArrowUpRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
function TerminalPage() {
  return (
    <div className="terminal-page">
      <div className="terminal-toolbar">
        <span className="terminal-tab active">
          <span className="dot online" />
          Azure / shell <X size={14} />
        </span>
        <button className="icon-button">
          <Plus size={16} />
        </button>
        <span className="toolbar-spacer" />
        <button className="secondary">分屏</button>
        <button className="icon-button">
          <MoreHorizontal size={17} />
        </button>
      </div>
      <div className="terminal-body">
        <div>
          <span className="term-blue">azure@server</span>
          <span className="term-muted">:~$</span> systemctl status termix
        </div>
        <div className="term-muted">● termix.service - Termix backend</div>
        <div className="term-green"> Active: active (running) since today</div>
        <div className="term-muted"> Main PID: 842 · Memory: 128.4M</div>
        <br />
        <div>
          <span className="term-blue">azure@server</span>
          <span className="term-muted">:~$</span> <span className="cursor" />
        </div>
      </div>
      <div className="terminal-status">
        Azure · SSH · Connected <span>UTF-8 · 80 × 24</span>
      </div>
    </div>
  );
}
function Files() {
  return (
    <>
      <PageTitle
        title="文件"
        copy="浏览远程文件并管理服务器内容"
        action={
          <button className="primary">
            <ArrowUpToLine size={16} />
            上传文件
          </button>
        }
      />
      <div className="filebar">
        <span>
          <FolderOpen size={16} /> /var/www/termix
        </span>
        <label className="search">
          <Search size={15} />
          <input placeholder="搜索文件" />
        </label>
        <button className="icon-button">
          <MoreHorizontal size={17} />
        </button>
      </div>
      <section className="panel file-panel">
        <div className="file-head">
          <span>名称</span>
          <span>大小</span>
          <span>修改时间</span>
        </div>
        {[
          ["termix", "文件夹", Folder],
          ["docker-compose.yml", "4.2 KB", File],
          [".env.example", "1.1 KB", File],
          ["logs", "文件夹", Folder],
          ["README.md", "8.6 KB", File],
        ].map(([name, info, Icon]) => (
          <button className="file-row" key={name}>
            <span>
              <Icon size={17} className="file-icon" />
              {name}
            </span>
            <small>{info}</small>
            <small>今天 09:42</small>
            <MoreHorizontal size={16} />
          </button>
        ))}
      </section>
    </>
  );
}
function Ai() {
  return (
    <>
      <PageTitle
        title="AI 助手"
        copy="分析终端输出、生成命令并辅助处理运维任务"
        action={
          <span className="configured">
            <Check size={14} />
            已配置
          </span>
        }
      />
      <div className="ai-layout">
        <section className="panel chat-panel">
          <div className="chat-head">
            <span className="ai-avatar">
              <Sparkles size={16} />
            </span>
            <span>
              <strong>Termix Assistant</strong>
              <small>当前工作区 · 只读分析</small>
            </span>
            <button className="icon-button">
              <MoreHorizontal size={17} />
            </button>
          </div>
          <div className="chat-message assistant">
            你好，我可以帮你分析主机状态、解释终端输出，或生成需要确认后执行的命令。
          </div>
          <div className="chat-message user">检查 Azure 上最近的服务异常</div>
          <div className="chat-message assistant">
            我会先查看最近活动和服务状态。当前检测到 1 个需要关注的服务：
            <div className="proposal">
              <ShieldCheck size={15} />
              <span>
                <strong>termix.service</strong>
                <small>当前运行正常 · 最近一次重启：今天 08:12</small>
              </span>
            </div>
          </div>
          <div className="chat-input">
            <input placeholder="询问主机状态或粘贴终端输出..." />
            <button className="primary">
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
        <aside className="panel ai-context">
          <h2>
            <Server size={16} />
            当前上下文
          </h2>
          <span className="context-row">
            <span>主机</span>
            <strong>Azure</strong>
          </span>
          <span className="context-row">
            <span>活动标签页</span>
            <strong>Terminal</strong>
          </span>
          <span className="context-row">
            <span>权限</span>
            <strong>只读</strong>
          </span>
          <button className="secondary full">
            切换主机 <ChevronRight size={15} />
          </button>
        </aside>
      </div>
    </>
  );
}
function SettingsPage() {
  return (
    <>
      <PageTitle title="设置" copy="配置外观、默认行为和服务连接" />
      <div className="settings-layout">
        <nav className="settings-nav">
          <button className="selected">界面与布局</button>
          <button>主题与颜色</button>
          <button>连接默认值</button>
          <button>AI 服务</button>
          <button>数据与同步</button>
        </nav>
        <section className="panel settings-panel">
          <h2>界面与布局</h2>
          <p className="muted">调整 Termix 的导航方式和信息密度。</p>
          <label className="setting-row">
            <span>
              <strong>运维控制台首页</strong>
              <small>打开应用时显示主机状态与活动记录</small>
            </span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="setting-row">
            <span>
              <strong>紧凑主机列表</strong>
              <small>在更小空间内显示更多主机</small>
            </span>
            <input type="checkbox" />
          </label>
          <label className="setting-row">
            <span>
              <strong>悬停显示行操作</strong>
              <small>仅在需要时显示连接和更多操作</small>
            </span>
            <input type="checkbox" defaultChecked />
          </label>
          <div className="settings-actions">
            <button className="secondary">恢复默认</button>
            <button className="primary">保存设置</button>
          </div>
        </section>
      </div>
    </>
  );
}
function App() {
  const [page, setPage] = useState<Page>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const go = (p: Page) => {
    setPage(p);
    setMobileNav(false);
  };
  const current = nav.find((n) => n[0] === page);
  const title =
    current?.[2] ??
    (page === "terminal" ? "终端" : page === "files" ? "文件" : "设置");
  return (
    <div className="web-shell">
      <aside className={`web-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Terminal size={18} />
          </span>
          <strong>Termix</strong>
          <span className="web-badge">WEB</span>
        </div>
        <button className="workspace-switch">
          <span>
            <small>工作区</small>个人服务器
          </span>
          <ChevronRight size={15} />
        </button>
        <nav className="web-nav">
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              className={page === id ? "selected" : ""}
              onClick={() => go(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
          <div className="nav-divider" />
          <button
            onClick={() => go("terminal")}
            className={page === "terminal" ? "selected" : ""}
          >
            <Terminal size={17} />
            终端
          </button>
          <button
            onClick={() => go("files")}
            className={page === "files" ? "selected" : ""}
          >
            <FolderOpen size={17} />
            文件
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button
            onClick={() => go("settings")}
            className={page === "settings" ? "selected" : ""}
          >
            <Settings size={17} />
            设置
          </button>
          <span>Termix Web · 2.7.1</span>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="scrim"
          onClick={() => setMobileNav(false)}
          aria-label="关闭导航"
        />
      )}
      <main className="web-main">
        <header className="web-topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileNav(!mobileNav)}
          >
            <Menu size={18} />
          </button>
          <span className="breadcrumbs">
            个人服务器 <ChevronRight size={14} /> {title}
          </span>
          <span className="topbar-spacer" />
          <button className="topbar-icon">
            <Search size={17} />
          </button>
          <button className="topbar-icon">
            <Bot size={17} />
          </button>
          <span className="user-avatar">L</span>
        </header>
        <div className="page-content">
          {page === "overview" && <Overview go={go} />}
          {page === "hosts" && <Hosts go={go} />}
          {page === "credentials" && <Credentials />}
          {page === "connections" && <Connections />}
          {page === "snippets" && <Snippets />}
          {page === "terminal" && <TerminalPage />}
          {page === "files" && <Files />}
          {page === "ai" && <Ai />}
          {page === "settings" && <SettingsPage />}
        </div>
        <div className="preview-ribbon">
          <Sparkles size={13} />
          Web UI preview · 示例数据 · 未连接真实服务器
        </div>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
