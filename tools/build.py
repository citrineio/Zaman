#!/usr/bin/env python3
"""Build readable static HTML from content files using only Python's standard library.

Page text: content/pages/*.html
Page titles, descriptions and navigation labels: content/pages.json
Shared header/footer: templates/layout.html
Roadmap: assets/features.json
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATUS_LABELS = {
    "working": "Working on prototype",
    "validation": "Under validation",
    "planned": "Planned",
    "exploring": "Exploring",
}


def read_text(path):
    return (ROOT / path).read_text(encoding="utf-8").strip()


def insert_blocks(template, blocks):
    """Indent each inserted block to match its placeholder in the layout."""
    pattern = r"(?m)^([ \t]*)\{\{([a-z_]+)\}\}[ \t]*$"

    def replace(match):
        indentation, name = match.groups()
        return "\n".join(
            indentation + line if line else "" for line in blocks[name].splitlines()
        )

    rendered = re.sub(pattern, replace, template)
    for name, value in blocks.items():
        rendered = rendered.replace("{{" + name + "}}", value)
    return rendered


def demo_links_in_new_tab(markup):
    """Keep the website open when visitors launch the interactive preview."""
    return re.sub(
        r'(<a\b[^>]*href="demo\.html(?:\?[^"]*)?")',
        r'\1 target="_blank" rel="noopener noreferrer" title="Opens the interactive preview in a new tab"',
        markup,
    )


def roadmap(features, full=False):
    cards = []
    for feature in features:
        if not full and (
            feature["status"] not in {"planned", "validation"}
            or not feature.get("show_in_preview")
        ):
            continue

        links = []
        if feature.get("demo"):
            links.append(
                f'<a class="btn ghost" href="demo.html?scene={html.escape(feature["demo"], quote=True)}">Try this →</a>'
            )
        if feature.get("source"):
            links.append(
                f'<a class="text-link" href="{html.escape(feature["source"], quote=True)}">Source &amp; implementation ↗</a>'
            )
        if feature.get("help"):
            links.append(
                '<a class="text-link" href="contribute.html#opportunities">Help build this →</a>'
            )

        status = feature["status"]
        card = f"""<article class="roadmap-card" data-status="{status}">
  <div class="card-meta">
    <span>{html.escape(feature["group"])}</span>
    <span class="status {status}">{STATUS_LABELS[status]}</span>
  </div>
  <h3>{html.escape(feature["title"])}</h3>
  <p>{html.escape(feature["detail"])}</p>
  <div class="card-links">
{{{{links}}}}
  </div>
</article>"""
        cards.append(
            insert_blocks(card, {"links": "\n".join("    " + link for link in links)})
        )

    return (
        '<div class="roadmap-grid">\n'
        + "\n".join(
            "\n".join("  " + line for line in card.splitlines()) for card in cards
        )
        + "\n</div>"
    )


def build():
    pages = json.loads(read_text("content/pages.json"))
    features = json.loads(read_text("assets/features.json"))
    layout = read_text("templates/layout.html")
    shared = {
        "media": read_text("templates/media.html"),
        "roadmap_all": roadmap(features, full=True),
        "roadmap_preview": roadmap(features),
    }

    for page in pages:
        navigation = []
        for item in pages:
            if not item["show_in_nav"]:
                continue
            current = (
                ' aria-current="page" class="active"'
                if item["output"] == page["output"]
                else ""
            )
            navigation.append(
                f'<li><a href="{item["output"]}"{current}>{html.escape(item["nav_label"])}</a></li>'
            )

        body = insert_blocks(read_text("content/" + page["source"]), shared)
        rendered = insert_blocks(
            layout, {"body": body, "navigation": "\n".join(navigation)}
        )
        rendered = rendered.replace("{{title}}", html.escape(page["title"], quote=True))
        rendered = rendered.replace(
            "{{description}}", html.escape(page["description"], quote=True)
        )
        if re.search(r"\{\{[a-z_]+\}\}", rendered):
            raise ValueError(f"Unresolved content placeholder in {page['output']}")
        (ROOT / page["output"]).write_text(
            demo_links_in_new_tab(rendered) + "\n", encoding="utf-8"
        )

    print(f"Built {len(pages)} content pages plus the interactive demo.")


if __name__ == "__main__":
    build()
