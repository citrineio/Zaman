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

## Remaining validation

- Physical gamepad testing: mappings, analog deadzones, shoulder navigation and
  input handoff on real desktop/mobile browsers.
- Safari/iOS and Firefox testing, and low-end phone performance.
- Fresh real-device recording to replace the labelled browser-preview loop.
- OS image builds, boot testing, emulator performance and native hardware services
  are outside this website change. The Pi image is planned, not downloadable.

The browser's fake background jobs are not evidence of native job durability.
