import importlib.util
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import translate_articles as articles


class FullArticleTests(unittest.TestCase):
    def test_chunking_keeps_every_paragraph_and_order(self):
        paragraphs = ["Paragraph " + str(i) + " details " * 20 for i in range(40)]
        batches = list(articles.chunks(paragraphs, size=500))
        self.assertEqual([p["text"] for batch in batches for p in batch], paragraphs)
        self.assertEqual([p["id"] for batch in batches for p in batch], list(range(40)))

    def test_partial_translation_cannot_be_published(self):
        batch = [{"id": 0, "text": "First"}, {"id": 1, "text": "Second"}]
        with self.assertRaises(ValueError):
            articles.validate_translation({"paragraphs": [{"id": 0, "text": "첫 문단"}]}, batch)
        with self.assertRaises(ValueError):
            articles.validate_translation({"paragraphs": [{"id": 1, "text": "둘째"}, {"id": 0, "text": "첫째"}]}, batch)
        self.assertEqual(articles.validate_translation({"paragraphs": [{"id": 0, "text": "첫 문단"}, {"id": 1, "text": "둘째 문단"}]}, batch), ["첫 문단", "둘째 문단"])

    def test_article_extraction_includes_later_body_paragraphs(self):
        body = " ".join(["This is original explanatory text about a software project."] * 8)
        html = f"<html><body><nav>Navigation links</nav><article><h1>Article</h1><p>{body}</p><h2>Second section</h2><p>{body} FINAL_BODY_MARKER</p></article><footer>Footer links</footer></body></html>"
        paragraphs = articles.extract_paragraphs(html, "https://example.com/article")
        self.assertIn("FINAL_BODY_MARKER", " ".join(paragraphs))
        self.assertNotIn("Navigation links", " ".join(paragraphs))


if __name__ == "__main__":
    unittest.main()
