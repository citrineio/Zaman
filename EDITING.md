# Editing Zaman's website

Page copy is separate from build logic. All files use UTF-8, normal line breaks
and indentation. A text editor is enough; no frontend packages are needed to
edit or build the site.

## Find the text

| What you want to change | File |
| --- | --- |
| Homepage, including Meet Zaman OS | `content/pages/home.html` |
| Core, Wing, Nest and specifications | `content/pages/hardware.html` |
| Prices and configurations | `content/pages/pricing.html` |
| Zaman OS introduction and foundation | `content/pages/os.html` |
| Dukkan and its calls to action | `content/pages/dukkan.html` |
| Development introduction and milestones | `content/pages/development.html` |
| Contribution opportunities | `content/pages/contribute.html` |
| Hardware/image availability | `content/pages/downloads.html` |
| Founder, lab and contact details | `content/pages/lab.html` |
| Page titles, search/social descriptions, top navigation labels | `content/pages.json` |
| Header, shared footer and footer links | `templates/layout.html` |
| Shared video caption | `templates/media.html` |
| Feature roadmap entries | `assets/features.json` |
| Demo's static controls and help | `demo.html` |
| Demo game descriptions, menus and notifications | `assets/demo.js` |
| Dukkan sample catalog, store screens and copy | `assets/dukkan-demo.js` |
| Dukkan store appearance | `assets/dukkan-demo.css` |

For example, open `content/pages/home.html`, search for `Meet Zaman OS.`, and edit
only the text between its tags:

```html
<h2>Meet Zaman OS.</h2>
<p class="lead">Your games up front. Your system one button away.</p>
```

Change a button's visible words between `<a ...>` and `</a>`. Change its `href`
only when you intend to change the destination. Keep classes, IDs and `data-*`
attributes: styling, links and controls use them. In HTML text, write `&amp;` for
an ampersand and `&lt;` for a literal less-than sign. Arabic can be typed directly.

The `{{media}}`, `{{roadmap_all}}` and `{{roadmap_preview}}` lines insert shared
content. Leave them in place; edit their source files in the table above.

## Rebuild and preview in a Git checkout

From the repository folder:

```sh
python3 tools/preview.py
python3 -m http.server 8001 --bind 0.0.0.0 --directory dist
```

Open `http://localhost:8001/` on that PC, or `http://YOUR-PC-LAN-IP:8001/` on
another device on the same network. Use `--bind 127.0.0.1` for local-only access.
After saving another edit, run `python3 tools/preview.py` again in a second
terminal, then refresh the browser. The server can stay running.

The root `index.html`, `hardware.html`, `os.html` and other content-page outputs
are generated. Edit the files under `content/` instead: rebuilding overwrites
those outputs. `demo.html` is maintained directly and is not overwritten.

## Editing the downloadable publication package

Inside the ZIP, the `site/` directory contains the editable source as well as the
built website. Prefix paths in the table with `site/`; for example:
`site/content/pages/home.html`.

After saving, run this from the folder containing `publish.py`:

```sh
python3 publish.py preview --port 8001 --bind 0.0.0.0
```

This rebuilds the edited pages before serving them. To update the preview while
it is running, use a second terminal:

```sh
python3 site/tools/build.py
```

Refresh the browser to see the changes. Expected edits under `site/` do not cause
package verification to fail; the publication script and Git bundle remain
integrity checked. `python3 publish.py verify` still performs a strict check of
the original package and reports intentional changes as differences.

To bring your edits into the review Git checkout:

```sh
python3 publish.py apply-edits
```

This prepares the bundled branch, rebuilds your pages and copies your edited
source and generated pages into a clean `review-checkout`. It does not commit
or push your edits. Review and publish them with:

```sh
git -C review-checkout diff
git -C review-checkout add --all
git -C review-checkout commit -m "Update website copy"
git -C review-checkout push -u origin website/zaman-os-experience
```

The ordinary `publish.py push` publishes the bundled revision only and refuses
when local website edits are present, so your edits cannot be silently omitted.
Use a fresh checkout directory if your existing review branch has diverged.

## Roadmap entries

Edit the JSON values in `assets/features.json`, keeping JSON quotes and commas.
`title` and `detail` are plain text, not HTML. `status` accepts `working`,
`validation`, `planned` or `exploring`. Working entries need a `source` URL.
`show_in_preview: true` includes an eligible planned/validation entry in the OS
page's shorter roadmap; renaming its title will not remove it from that preview.

## Formatting and checks

The normal build uses only Python's standard library. Formatting tools are
optional development tools; versions used for this revision are recorded in
`docs/VALIDATION.md`. `.editorconfig` and `.prettierrc.json` record the conventions.

Run site validation after an edit if Python and Node are available:

```sh
python3 tests/check_site.py
```

For deployment, run `python3 tools/preview.py` and upload `dist/`, which contains
only the public HTML and assets. Source files and editing instructions stay out
of that deployment directory.
