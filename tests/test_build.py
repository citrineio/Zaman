#!/usr/bin/env python3
"""Exercise the editing workflow without changing the working website."""

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ContentBuildTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.root = Path(self.scratch.name)
        for name in ["content", "templates", "tools"]:
            shutil.copytree(ROOT / name, self.root / name)
        (self.root / "assets").mkdir()
        shutil.copy(ROOT / "assets/features.json", self.root / "assets/features.json")
        shutil.copy(ROOT / "demo.html", self.root / "demo.html")

    def build(self):
        subprocess.run(
            [sys.executable, str(self.root / "tools/build.py")],
            check=True,
            capture_output=True,
        )

    def test_copy_edits_reach_pages_and_keep_dynamic_blocks(self):
        home = self.root / "content/pages/home.html"
        home.write_text(
            home.read_text().replace("Meet Zaman OS.", "Explore our software.")
        )
        layout = self.root / "templates/layout.html"
        layout.write_text(
            layout.read_text().replace(
                "Play. Explore. Belong.", "Made to keep playing."
            )
        )
        metadata = self.root / "content/pages.json"
        pages = json.loads(metadata.read_text())
        pages[0]["title"] = 'Home & "play"'
        metadata.write_text(json.dumps(pages))
        roadmap = self.root / "assets/features.json"
        features = json.loads(roadmap.read_text())
        entry = next(item for item in features if item.get("show_in_preview"))
        entry["title"] = "A renamed feature & more"
        roadmap.write_text(json.dumps(features))

        self.build()
        output = (self.root / "index.html").read_text()
        self.assertIn("Explore our software.", output)
        self.assertIn("Home &amp; &quot;play&quot;", output)
        self.assertIn("Made to keep playing.", output)
        os_page = (self.root / "os.html").read_text()
        self.assertIn("A renamed feature &amp; more", os_page)
        self.assertIn("<video", os_page)
        self.assertNotIn("{{", os_page)
        for page in pages:
            self.assertIn(
                "Made to keep playing.", (self.root / page["output"]).read_text()
            )

    def test_rebuild_is_stable_and_preserves_the_hand_edited_demo(self):
        self.build()
        paths = list(self.root.glob("*.html"))
        before = {path.name: path.read_bytes() for path in paths}
        self.build()
        self.assertEqual(before, {path.name: path.read_bytes() for path in paths})
        self.assertEqual((ROOT / "demo.html").read_bytes(), before["demo.html"])


if __name__ == "__main__":
    unittest.main()
