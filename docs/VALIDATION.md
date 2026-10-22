# Validation — 21 October 2026

## Automated checks

- Python standard-library build completes and regenerates nine content pages.
- Ten active HTML pages checked for local assets, valid internal fragments,
  duplicate IDs and content-page h1 structure.
- All 26 roadmap entries have a recognized status; working features have evidence
  links.
- `node --check` passes for both JavaScript files.
- ffprobe confirms H.264, 1280 × 720, 12.79 seconds, approximately 246 KB for the
  embedded video.

## Observed browser journeys

Verified in the managed Chromium preview:

- Desktop homepage and OS page visual review; library resembles the actual Pegasus
  theme with the same palette, art fixtures, logo treatment and navigation layout.
- First-visit controls dialog opens and can be dismissed.
- M opens the system menu; navigation excludes the inert background library.
- A sample transfer progresses after closing the menu, waits for destination,
  imports Pocket Voyage and adds it to the library with missing-art fallback.
- Manual recommended artwork lookup progresses and updates the same library game.
- Search finds the imported game; details allow favoriting; Favorites shows it.
- Volume keyboard adjustment changes the displayed percentage, mute preserves
  volume, and output selection displays a headphone-route notification.
- A sample Dukkan installation continues after closing the menu and adds Ember
  Trail to Native games.
- The original platform game moves under held on-screen input and jumps; menu
  opens in game with Resume/Exit and game exit requires confirmation.
- A stale exit-confirmation location was found when reopening after exit and fixed
  by resetting the Home context when the session ends. Browser retest confirmed
  reopening shows Return to library and Storefronts, with no stale Exit Game action.
- Phone-sized iframes at 390 × 844 reviewed for homepage, library and audio menu.
  Content width equals available width (375 CSS px after the scrollbar); no
  horizontal overflow was observed. Mobile menu occupies the viewport and the
  menu button stays accessible while scrolling.
- Embedded video reports readyState 4, muted and loop true, playing with advancing
  currentTime. Separate Pause control changes to Play.
- Roadmap Planned filter shows the eight planned entries and hides other states.

Visual browser checks are not a device acceptance test. Browser-extension metadata errors observed in console output are
external to the website.

## Revision checks

- Demo links open a separate browser tab, preserving the website tab; static checks
  cover every generated demo link and its opener protection.
- All active pages use زمان; the original incorrect spelling is rejected by checks.
- Pricing and Dukkan have dedicated routes. Pricing is no longer embedded in Hardware.
- Desktop Dukkan and the rebuilt footer reviewed visually. Phone-sized Dukkan and
  Pricing layouts have 375 px content width in 375 px available width; footer reviewed
  in its two-column phone layout.
- Home hardware teaser shows Wing and Nest. Public copy uses system menu and
  streamlined transfers, with plain descriptions of library and launching behavior.
- Keyboard focus moves through vertically stacked menu controls with Up/Down;
  Left/Right adjusts volume and output selection. Back restores the opening row.
  Shutdown confirmation moves from Cancel to Confirm with Down.
- Selecting Neon Circuit then pressing Left focuses Garden and updates the Home
  hero. Neon Circuit no longer retains a selected highlight.

## Source readability and editing workflow

- HTML, CSS, JavaScript and JSON formatted with Prettier 3.9.10; Python scripts
  formatted with Black 26.10.1. No formatting package is required for normal builds.
- Nine page bodies moved into `content/pages/`, metadata/navigation into
  `content/pages.json`, and the shared shell and video into two HTML templates.
- Semantic comparison of all ten pages preserves text and element/attribute
  structure, ignoring indentation and equivalent inline style/handler formatting.
- Build tests change homepage copy, shared footer text, metadata with quotes and
  a preview-roadmap title; all changes reach the expected generated outputs.
- Repeated builds are deterministic and leave the directly maintained demo intact.
- Formatting checks, page checks and JavaScript syntax checks pass after refactoring.
- Publication-package editing is checked locally: preview rebuilds edited content,
  occupied ports give an actionable message, apply-edits copies source and generated
  pages into a clean checkout, dirty checkouts are refused, and bundled push refuses
  to omit local edits. No remote push is performed by these checks.

## Dukkan QML correction — 22 October 2026

- Verified the current Main.qml blob against the local published source; read the
  full window, detail/gallery, keyboard and transaction QML components, plus the
  native SDL gamepad action map. See `DUKKAN-DEMO.md` for the correspondence.
- Replaced the menu install card with a separate storefront. Desktop Discover and
  game details reviewed visually against the QML hierarchy and palette.
- Browser checks cover shelf focus/hero changes, pointer selection, safe install
  confirmation, gallery previous/next/fullscreen and Enter isolation in fullscreen.
- Installed Ember Trail; Library showed it after reopening the store. Cancelled a
  Moss Postcard job from Activity, retried it and left Dukkan; the completed game
  subsequently appeared in Library. Queued Tidal Parcel behind running Signal
  Lantern; both had independent IDs and stages in Activity.
- Search keyboard accepts physical text including M without opening the system
  menu; query `ember` returned one result. Uninstall defaults to Go back and states
  that application saves are retained. Confirmed removal completed and changed
  Ember Trail back to a Flathub entry. Tab selected the confirmation action correctly.
- System menu opens over Dukkan and restores its Library context on close.
- Phone-sized Discover/details reviewed in a 390 × 844 iframe; available and
  content widths both measured 375 CSS px, without horizontal page overflow.
- Gamepad action routing is implemented from source; physical controller testing
  has not been performed. Browser jobs are simulations, not package-manager tests.

## Directional navigation follow-up — 22 October 2026

- Found and fixed a phone-layout mismatch: the horizontal navigation row retained
  the desktop vertical mapping. Desktop Up/Down and phone Left/Right now both
  follow their visible axis. Phone Up leaves the focused Library tab selected;
  Down moves into the catalog.
- Confirmed the horizontal shelf uses Left/Right, Play/Uninstall uses Left/Right,
  and Down does not switch the focused action. Confirmation Down preserves the
  safe choice; Right moves to confirmation.
- Fullscreen gallery Left/Right changes images; Down does not change images.
  Search-keyboard Down then Right moves from q to s.
- Fixed thumbnail movement to start from the actually focused thumbnail. From
  thumbnail 2, Right focuses/selects thumbnail 3. Previous/Next buttons navigate
  horizontally, and Enter advances the image without opening an install prompt.
- These checks used real browser keyboard input. Physical gamepad testing is
  still outstanding; it shares the same directional action handler.

## Remaining validation

- Physical gamepad testing: mappings, analog deadzones, shoulder navigation and
  input handoff on real desktop/mobile browsers.
- Safari/iOS and Firefox testing, and low-end phone performance.
- Fresh real-device recording to replace the labelled browser-preview loop.
- OS image builds, boot testing, emulator performance and native hardware services
  are outside this website change. The Pi image is planned, not downloadable.

The browser's fake background jobs are not evidence of native job durability.
