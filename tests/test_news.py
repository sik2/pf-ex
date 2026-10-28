import importlib.util
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("collector", Path(__file__).resolve().parents[1] / "scripts/collect_news.py")
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)
NOW = datetime(2026, 10, 28, 0, tzinfo=timezone.utc)
SOURCE = {"name": "Test", "url": "https://example.com/feed", "category": "개발"}


class NewsTests(unittest.TestCase):
    def test_rss_dates_tracking_and_html(self):
        raw = b'''<rss><channel>
        <item><title>Current</title><link>https://example.com/a?utm_source=x&amp;id=1#top</link><pubDate>Tue, 27 Oct 2026 10:00:00 GMT</pubDate><description>&lt;p&gt;Hello&lt;/p&gt;&lt;script&gt;bad()&lt;/script&gt;</description></item>
        <item><title>Old</title><link>https://example.com/old</link><pubDate>Tue, 20 Oct 2026 10:00:00 GMT</pubDate></item>
        <item><title>Future</title><link>https://example.com/future</link><pubDate>Tue, 30 Oct 2026 10:00:00 GMT</pubDate></item>
        <item><title>No date</title><link>https://example.com/no-date</link></item>
        </channel></rss>'''
        items = collector.parse_feed(raw, SOURCE, NOW, 72)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["url"], "https://example.com/a?id=1")
        self.assertEqual(items[0]["excerpt"], "Hello")

    def test_atom_and_unsafe_links(self):
        raw = b'''<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom</title><link rel="alternate" href="https://example.com/atom"/><published>2026-10-27T23:00:00Z</published><summary>New release</summary></entry><entry><title>Unsafe</title><link href="javascript:alert(1)"/><updated>2026-10-27T23:00:00Z</updated></entry></feed>'''
        items = collector.parse_feed(raw, SOURCE, NOW, 72)
        self.assertEqual([x["title"] for x in items], ["Atom"])

    def test_html_doctype_in_cdata_is_not_an_xml_declaration(self):
        raw = b'<rss><channel><item><title>Valid</title><link>https://example.com/a</link><pubDate>Tue, 27 Oct 2026 10:00:00 GMT</pubDate><description><![CDATA[<!DOCTYPE html><p>Example</p>]]></description></item></channel></rss>'
        self.assertEqual(len(collector.parse_feed(raw, SOURCE, NOW, 72)), 1)
        with self.assertRaises(ValueError):
            collector.parse_feed(b'<!DOCTYPE rss [<!ENTITY x "bad">]><rss/>', SOURCE, NOW, 72)

    def test_deduplication(self):
        a = {"title": "Same news!", "url": "https://example.com/a", "published_at": NOW.isoformat()}
        b = dict(a, title="same news", url="https://example.com/b")
        self.assertEqual(len(collector.deduplicate([a, b, a], 12)), 1)

    def test_all_sources_fail_preserves_existing_edition(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "news.config.json").write_text(json.dumps({"sources": [SOURCE], "max_age_hours": 72, "max_items": 12}))
            latest = root / "data/news/latest.json"
            latest.parent.mkdir(parents=True)
            latest.write_text('{"items":[{"title":"keep"}]}')
            before = latest.read_bytes()
            def fail(*args):
                raise TimeoutError()
            self.assertEqual(collector.run(root, NOW, fail), 1)
            self.assertEqual(latest.read_bytes(), before)
            self.assertFalse(json.loads((latest.parent / "status.json").read_text())["ok"])

    def test_partial_failure_and_korean_date_archive(self):
        with tempfile.TemporaryDirectory() as folder, patch.dict("os.environ", {"OPENAI_API_KEY": "", "OPENAI_MODEL": ""}):
            root = Path(folder)
            other = dict(SOURCE, name="Failed")
            (root / "news.config.json").write_text(json.dumps({"sources": [SOURCE, other], "max_age_hours": 72, "max_items": 12, "archive_days": 30}))
            def fetch(source, *args):
                if source["name"] == "Failed":
                    raise TimeoutError()
                return [{"id": "a", "title": "News", "url": "https://example.com/a", "published_at": NOW.isoformat(), "excerpt": "test"}]
            self.assertEqual(collector.run(root, NOW, fetch), 0)
            self.assertTrue((root / "data/news/2026-10-28.json").exists())
            status = json.loads((root / "data/news/status.json").read_text())
            self.assertTrue(status["ok"])
            self.assertFalse(status["sources"][1]["ok"])


if __name__ == "__main__":
    unittest.main()
