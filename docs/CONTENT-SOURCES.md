# Content baseline — 21 October 2026

Website implementation uses the public component snapshots below, rather than
assuming that old README backlogs supersede later accepted sprint closeouts.

| Component | Commit | Evidence |
|---|---|---|
| zaman-sessiond | 531413e0f7f4c4e93f83ac93c6da74d581afaf9c | docs/sprint7-closeout.md, tools/transfer/README.md, docs/sprint6-steam-integration.md |
| zaman-menu | d94ba6fe376f2b6b0bb1053a2257f3dd87dd1948 | docs/sprint7-closeout.md, qml/shell.qml, qml/TransferPage.qml, qml/ScrapePage.qml |
| zaman-pegasus | 578121f0dc333e6069be0a81873d52b927e6d072 | README.md, components/Brand.qml, components/Shell.qml, theme.qml |
| dukkan | 98830fdc72d5a90e88646babf0a41c098eb9a0ff | README.md, background transaction implementation |

The owner-confirmed Sprint 7 baseline includes transfer, manual artwork lookup,
end-to-end GBA import with artwork/details, and the subsequent UI consistency
updates. ROM refresh is now present in published source. The older cumulative
report's unresolved-refresh item is superseded by this closeout and source.

## Planned work

The owner's deferred-features plan (19 October) covers component update/recovery,
screenshots/gallery, PC streaming, controller file browsing/USB import, general file
operations and recording. These follow hardening. Whole-system A/B is a separate
platform milestone. Native emulator-menu access remains backlog. The Pi 5 image
and community port invitation are the owner's decisions in this website brief.

No public image is assumed to exist. No general PS2/GameCube, Steam, autosave,
controller, driver or hardware compatibility guarantee is inferred from an
installed emulator, a synthetic test or a browser simulation.

## Media and assets

- `assets/demo/*.svg`: fictional library fixtures from `zaman-pegasus/preview/assets`.
- Fonts and branding: the owner's Pegasus theme assets. Font OFL notices are
  retained in `assets/fonts`; theme MIT notice is retained in `assets/demo`.
- `assets/*.webp`: optimized copies of the website's existing images and the
  owner's current theme branding. Original images are retained unchanged.
- `assets/media/preview.mp4`: a labelled interface demonstration assembled from
  the browser preview. It is not device footage or an emulation benchmark.
- Dune Runner: original canvas mini-game implemented for this website.
