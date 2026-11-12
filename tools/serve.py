#!/usr/bin/env python3
"""Local preview server for the site. Run from the repo root:  python3 tools/serve.py [port]

The same as `python3 -m http.server`, except every response tells the browser not to keep a copy.
Without that, browsers go on showing an old version of a page after the file has changed.
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
