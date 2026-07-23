#!/usr/bin/env python3
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class SpaRequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        requested_path = Path(self.translate_path(urlsplit(self.path).path))
        if not requested_path.exists() and "text/html" in self.headers.get("Accept", ""):
            self.path = "/index.html"
        return super().send_head()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--directory", required=True)
    parser.add_argument("--port", type=int, default=8080)
    args = parser.parse_args()

    handler = partial(SpaRequestHandler, directory=args.directory)
    server = ThreadingHTTPServer(("0.0.0.0", args.port), handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
