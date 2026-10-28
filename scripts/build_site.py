"""Package only public assets; do not publish scripts, settings, or credentials."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
target = ROOT / "dist"
news = ROOT / "data" / "news" / "latest.json"
if not news.exists() or not json.loads(news.read_text()).get("items"):
    raise SystemExit("No news available; refusing to deploy an empty edition")
target.mkdir(exist_ok=True)
for name in ("index.html", "styles.css", "content.js", "app.js", "news.js"):
    shutil.copy2(ROOT / name, target / name)
if (target / "data").exists():
    shutil.rmtree(target / "data")
shutil.copytree(ROOT / "data", target / "data")
(target / ".nojekyll").touch()
print("Public site built in dist/")
