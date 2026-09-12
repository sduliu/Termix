# UI redesign references

This redesign borrows interaction patterns and visual cues from open-source
products. It does not copy their logos, screenshots, assets, or product
branding.

## References

- [Tabby](https://github.com/Eugeny/tabby) - MIT. Its connection manager,
  persistent terminal tabs, split panes, profiles, and theme system are good
  references for a desktop-first SSH workflow.
- [electerm](https://github.com/electerm/electerm) - MIT. Its combined
  terminal, SFTP, remote desktop, and selected-terminal-content AI workflow
  maps closely to Termix's existing capabilities.
- [Dockge](https://github.com/louislam/dockge) - MIT. Its direct status and
  action presentation is a useful reference for server-side operations without
  turning every action into a dashboard card.

## Termix direction

Termix keeps its existing backend, routes, connection models, terminal engine,
file manager, and feature permissions. The first visual pass changes the
application shell tokens and navigation density, and adds the user-selected
Operations console with root-level hosts, real activity and batch connection.
It uses a proportional
UI font for labels and keeps monospace typography for terminal output, code,
paths, and measurements. The blue accent is reserved for selection and primary
actions; connection health remains semantic green and errors remain semantic
red.

The Simple preset continues to control feature visibility and does not become a
second visual theme. This keeps layout, color theme, and feature complexity as
separate user choices.
