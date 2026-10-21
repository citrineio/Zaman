# Zaman website

Static, multi-page product and software website for Zaman by Kawn Electro.
No frontend framework, package installation, account service or backend is needed.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Product introduction, software feature section and embedded loop |
| `hardware.html` | Core/Wing/Nest, interactive concept diagram, specifications and target pricing |
| `os.html` | Software experience, open foundations, interactive-demo entry points and roadmap preview |
| `demo.html` | Interactive browser simulation and original Dune Runner mini-game |
| `development.html` | All feature statuses, filters, milestones and prototype photos |
| `contribute.html` | Hardware ports, reliability work, feature contributions and repository entry points |
| `downloads.html` | Reference platform and planned image status; no fictitious downloads |
| `lab.html` | Founder, lab and existing contact/waitlist links |

The scope of this repository is `zaman.kawnelectro.com`. It does not change the
separate corporate or Uqab websites. Existing image originals and HTML archives
remain in the repository. Broken browser-save font/beacon references were removed
from the active pages; fonts are now served locally.

## Build and preview

The committed HTML is ready to serve. To change shared content, edit
`tools/build.py`, `templates/*.html`, `assets/features.json`, or the shared assets.
Then regenerate and check:

```sh
python3 tools/build.py
python3 tests/check_site.py
```

To prepare a clean static output directory:

```sh
python3 tools/preview.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/`. Static hosting can publish `dist/` after the prepare
step, or deploy the committed HTML and `assets/` directly. This works at a domain
root or a repository subpath; internal routes are relative. No SPA fallback is
required. Legacy Home hashes for system/specs/pricing/progress/lab/contact are
forwarded to their corresponding pages.

## Interactive preview

- Browse Home, Library, Favorites and Preferences; search/filter/sort games.
- M toggles the menu; Escape backs out; Q/E switches tabs; arrows navigate;
  Enter selects. Ordinary keyboard editing remains available inside fields.
- On-screen controls support pointer/touch. Standard browser gamepads are handled
  after activation, but physical-controller qualification remains outstanding.
- Dune Runner: arrows or touch buttons move; Space / south gamepad button jumps.
  Reach the flag. Opening the menu pauses the game and releases held input.
- Transfer: receive Pocket Voyage, select its destination, import it, optionally
  run recommended artwork lookup, close the menu and find it in Library.
- Dukkan: install/remove fictional Ember Trail. Installation continues with the
  menu closed and publishes a sample Native games entry.
- Audio, network, Bluetooth, controllers, display preview/revert, notifications,
  Do Not Disturb and power confirmations are simulations. They do not control
  the host computer, run native applications or contact hardware services.
- Settings/favorites/imported sample state persist in localStorage when available;
  jobs are session-local timers. Reset Preview clears only this demo's state.
- Direct entry: `demo.html?scene=library|game|transfer|artwork|audio|store|settings|notifications|controllers|power`.

All game titles/artwork in the preview are fictional fixtures; no ROMs, BIOS,
commercial game artwork, scraper account or real upload is used. See
`docs/CONTENT-SOURCES.md` for implementation evidence and asset attribution.

## Video

`assets/media/preview.mp4` is a 12.8-second, 720p H.264 loop assembled from browser
preview states (library, settings and simulated gameplay). Its captions explicitly
identify it as a demonstration, not device footage. The muted inline video has
native controls and a separate pause button. Reduced-motion users start paused.

To rebuild from four ordered interface captures with ffmpeg installed:

```sh
python3 tools/build_video.py --frames /path/to/frames
```

For the real hardware film, replace the MP4/poster and update `media()`'s caption
in `tools/build.py`. Suggested sequence: controller navigation → launch a tested
game → open menu → adjust volume → resume → exit to library. Keep footage honest
about development hardware, emulator settings and actual game performance.

## Updating the roadmap

`assets/features.json` is the single feature inventory. Working entries carry a
source link. Statuses are `working`, `validation`, `planned`, `exploring`.
Regenerate the HTML after editing. Keep published-source presence, owner acceptance
and broad hardware qualification distinct. Image links are added only when an
actual release exists with installation, compatibility and recovery instructions.

## Validation

See `docs/VALIDATION.md` for browser journeys and outstanding hardware checks.
The site does not add analytics tracking or send feedback automatically. Existing
waitlist/contact destinations are preserved.
