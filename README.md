# Minecraft News Extension

Generated with `create-sjmcl-extension`.

## Scripts

- `npm install`
- `npm run build`
- `npm run bump -- 1.2.3`

## Output

`npm run build` creates:

- `dist/net.bugjump.news.sjmcl-extension/`
- `dist/net.bugjump.news.sjmcl-extension-<version>.sjmclx`

The bundled frontend is written to `frontend/index.js`, matching `sjmcl.ext.json`.
You can split the implementation across as many local files as you want under `src/`; the build step bundles them into that single runtime entry.

## Project Layout

- `src/index.ts`
  Entry point for your extension source tree. Registers the factory with the SJMCL host.
- `src/widgets/`
  Home widget components.
- `src/pages/`
  Example settings page, custom page, and standalone custom page.
- `src/types/sjmcl.ts`
  Minimal local typings for the injected SJMCL extension API.

## Notes

- Put optional static files under `assets/`.
- Add an optional `icon.png` at the project root.
- Add optional persistent files under `data/`.
- The build script copies `sjmcl.ext.json`, `icon.png`, `assets/`, and `data/` when present.
