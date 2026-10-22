# Dukkan browser preview — QML comparison

Reference: `citrineio/dukkan`, commit
`98830fdc72d5a90e88646babf0a41c098eb9a0ff`. The default-branch `qml/Main.qml`
was checked through GitHub on 22 October 2026 and matches local blob
`e66be99ae7022c2d0cbcb7de7b5f6ff0eeaa1e6a`.

The former single-game card inside the system menu did not represent Dukkan's
interface. The browser now launches a separate application surface.

| Native source | Browser behavior |
| --- | --- |
| `Main.qml`: section/focus state and `changeSection` | Opens Discover; separate Discover/Library/Activity navigation; section changes clear search and selection |
| `Main.qml`: featured panel and horizontal shelf | Focused game updates the hero; Up reaches View Game; Left at the first tile reaches the navigation rail |
| `GameTile.qml`, `GameArt.qml` | Surface/elevated tile states, gold focus border, contained artwork, genre, installed/Flathub badge and sample download size |
| `Main.qml`, `GameIdentity.qml` | Separate two-column game details with title, description, metadata, size, gallery and install/play/uninstall actions |
| `ScreenshotView.qml`, gallery surface | Thumbnails, previous/next controls, image counter, fullscreen gallery and Back to the same detail/image state |
| `Main.qml`: modal state | Install, uninstall, cancel and retry confirmations default to the safe choice; uninstall retains simulated saves |
| `TransactionList.qml`, `TransactionProgress.qml` | Separate Activity view, per-job IDs and states, queue, current-step progress, cancellation and retry; one progress surface per page |
| `Main.qml`: keyboard layer | Four rows, lowercase/uppercase/symbols, Space/Clear/Delete/Done, physical typing and filtered catalog results |
| `gamepadbridge.cpp` | A selects, B backs out, X refreshes/cancels/deletes by context, Y switches Library/opens gallery/changes keyboard, Start opens search, shoulders change screenshots |
| Native session ownership | Guide/M opens the system menu over Dukkan; closing the menu restores the store's context; leaving Discover returns to Zaman's library |

The palette uses the QML fallback tokens and the bundled appearance example:
background `#0C1018`, rail `#12161E`, surface `#171D28`, elevated `#202A37`,
accent `#EAC28D`, strong accent `#F0D4A8`, installed `#88A8C9`, text `#F0E5D6`
and muted `#BBC6D3`. The shopfront logo is the native repository's asset.

## Browser-specific scope

The browser translates the QML interface into HTML/CSS/JavaScript; it does not
execute Qt or a native package manager. Sample titles, sizes, availability and
transaction progress are fixtures, labelled in the UI. Gallery scenes are original
SVG illustrations for the fictional Ember Trail fixture. Real Flathub content,
network errors, package installation, game launching, input handoff and save files
are not exercised. Play shows this limitation and offers returning to Zaman.

Jobs continue while the storefront is closed inside the same browser page. History
and installed fixtures persist locally when storage is available. Reloading a page
marks unfinished jobs interrupted, with Retry; this is distinct from the native
worker's persistent recovery. Jobs do not run after closing the browser page.

The phone layout adapts the rail to a horizontal navigation row and stacks the
native two-column detail layout. The desktop layout retains the QML hierarchy.
Keyboard convenience aliases Y/X and an on-screen Done button supplement native
shortcuts. Physical gamepad and cross-browser qualification remain outstanding.

Implementation: `assets/dukkan-demo.js`, `assets/dukkan-demo.css` and the
integration points in `assets/demo.js`. Editable fixture descriptions are near
the top of `dukkan-demo.js`; source files retain readable HTML template formatting.
