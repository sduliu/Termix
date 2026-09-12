# Personal Windows build

## Build and download

In your fork, enable Actions and select **Windows Personal x64** > **Run
workflow**. Choose the branch containing this change. Download the artifact
named `termix-windows-x64-nsis-<commit>` from the completed run. It contains the
NSIS installer, SHA256SUMS.txt and build-info.json. The workflow does not publish
a release or use third-party runners.

The workflow pins action commits, Node 24.15.0 and npm 11.12.1, installs using
package-lock.json, and records source and runner versions. This is a repeatable
build procedure, not a promise of byte-identical binaries: hosted runner images,
MSVC installation feeds, download services and build timestamps can change.

Only NSIS x64 is built. MSI is useful for enterprise deployment but unnecessary
for this personal installer; portable mode has different data-directory behavior.
The upstream MSI/ia32/portable scripts remain available, but are not outputs of
this workflow. Standard windows-2022 supplies C++ tooling; the workflow installs
Spectre libraries needed by node-pty. electron-builder rebuilds native modules
for Electron rather than shipping Node's native ABI.

## Branding and installation

Reviewed package.json, electron-builder.json, public icons and electron/main.cjs.
Product, executable, shortcuts and uninstall entry remain **Termix**;
appId remains `com.karmaa.termix`. NSIS uses `public/icon.ico`, which exists.
The Electron window and tray retain the supplied Termix assets. No third-party
reference-product assets are bundled.

This build is unsigned. No certificate is configured and automatic certificate
discovery is disabled. Windows may show an unknown publisher/SmartScreen warning.
Verify the repository, run and SHA-256 before deciding whether to install.
This is not an official upstream release. Keeping the existing identity may
share the installed application/data location with an official Termix install;
back up data before replacing it. A separate product name, appId, icon and data
directory remain an optional branding decision.

## Interface and AI

The Operations view is the default for a fresh dashboard; existing saved
Dashboard/Homepage selections remain intact. Existing users can select
Operations in the dashboard view switcher. Applying Simple also selects
Operations, pins the navigation labels, and sets host grouping to None without
rewriting stored host folders. Reapplying Simple clears its older hidden-AI
preset value; explicit custom navigation remains user-controlled.

Hosts, Credentials, Connections, Snippets and AI are Simple's visible IDs. AI
still requires the instance and user permission gates. Its provider, endpoint,
model and credential configuration remain separate requirements.

Fixed source-level issues:

- Transient status fetch failures no longer erase confirmed AI visibility;
  stale status responses cannot overwrite a newer permission decision. Focus
  retries availability. Failed initial checks still default to hidden.
- Stopping/replacing/resetting chat no longer lets an older request clear the
  new request's state. Incomplete streams and two minutes without semantic
  progress produce an error; heartbeat comments do not hide a stuck model.
- Backend cancellation follows response disconnect, not completion of the POST
  request body. Final completion is sent after assistant history is persisted.
- Operations shows real host/activity data, explicit refresh errors, unknown
  state for disabled monitoring, and blank metrics when unavailable. Batch
  connect only acts on selected visible hosts with an enabled protocol.

No live AI credentials were supplied or exercised. A visible AI entry does not
prove a provider/key/model is valid. A 400 model error, 401/403 access error, 404
provider error, unreachable private endpoint or provider failure still needs
the corresponding configuration corrected; do not paste keys into logs/issues.

## Local preview

Run `npm run dev -- --host 127.0.0.1 --port 5174`, then open
`http://127.0.0.1:5174/preview/operations.html`. It uses the production Operations
component inside a demonstration shell. Its addresses, metrics and activity
are fixtures; no connection or write is made. The fixture shell is excluded
from the production entry point.
