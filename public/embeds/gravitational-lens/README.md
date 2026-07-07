# Gravitational Lens Telescope embed (vendored build)

This is **built output**, not hand-written source. It is the static `dist/`
of the standalone **550-AU** project (Solar Gravitational Lens mission
simulation), vendored here so cosmos-collective can serve it same-origin
inside an iframe at `/gravitational-lens`.

- **Source repo:** https://github.com/m4cd4r4/550-AU (`I:/Scratch/550-AU`), MIT.
- **Stack:** Vite + vanilla TypeScript + Three.js (NOT React/Next). Do not
  edit these files by hand and do not try to port them into `src/` - they
  are a compiled bundle.
- **Runtime:** fully offline. All assets (star catalogue baked into the JS,
  Sun texture, corona image) are bundled; no external network calls.

## Rebuilding after an upstream change

```bash
cd I:/Scratch/550-AU
git pull
npm install && npm run build
# then re-vendor, dropping the dev-only spike files:
cp -r dist/. <cosmos>/public/embeds/gravitational-lens/
rm -f <cosmos>/public/embeds/gravitational-lens/spike.html \
      <cosmos>/public/embeds/gravitational-lens/assets/spike-*
```

`vite.config.ts` in 550-AU sets `base: './'`, so the bundle is subpath-portable
and needs no path fixes. The `spike.html` dev artifact is intentionally excluded.
