#!/usr/bin/env python3
"""Local preview server for the site. Run from the repo root:  python3 tools/serve.py [port]

The same as `python3 -m http.server`, with two differences. Every response tells the browser not to keep
a copy, because otherwise browsers go on showing an old version of a page after the file has changed.
And an address that doesn't exist gets the site's own 404.html, as it does on GitHub Pages.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_response(self, code, message=None):
        # never answer "not modified": always send the current file
        super().send_response(code, message)

    def send_error(self, code, message=None, explain=None):
        # like GitHub Pages: an address that doesn't exist gets the site's own 404 page
        page = Path(self.directory) / "404.html"
        if code == 404 and page.is_file():
            body = page.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def do_GET(self):
        for h in ("If-Modified-Since", "If-None-Match"):
            if h in self.headers:
                del self.headers[h]
        super().do_GET()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    root = Path(__file__).resolve().parent.parent
    with ThreadingHTTPServer(("127.0.0.1", port), partial(NoCache, directory=str(root))) as httpd:
        print(f"Serving {root} at http://localhost:{port} (no caching)")
        httpd.serve_forever()
