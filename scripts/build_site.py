"""Package only public assets; do not publish scripts, settings, or credentials."""
import json
import hashlib
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
# Update browser caches whenever a public script or stylesheet changes.
index = (target / "index.html").read_text()
for name in ("styles.css", "content.js", "app.js", "news.js"):
    digest = hashlib.sha256((target / name).read_bytes()).hexdigest()[:12]
    index = index.replace(f'"{name}"', f'"{name}?v={digest}"')
(target / "index.html").write_text(index)
if (target / "data").exists():
    shutil.rmtree(target / "data")
shutil.copytree(ROOT / "data", target / "data")
(target / ".nojekyll").touch()
print("Public site built in dist/")
