#!/usr/bin/env python3
"""Serve the app and proxy TRA lake data (avoids browser CORS limits)."""

import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import urllib.parse
import urllib.request

PORT = int(os.environ.get("PORT", "3456"))
TRA_SYSTEM_KEY = "007ebaa8-6078-4ee3-abf3-11db1fa7ff36"
ONERAIN_URL = (
    "http://localhost:8080/OneRain/DataAPI"
    f"?method=GetSensorData&system_key={TRA_SYSTEM_KEY}"
)
TRA_PROXY = (
    "https://lakedata.traweb.net/export/proxy/?mode=native&url="
    + urllib.parse.quote(ONERAIN_URL, safe="")
)


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] == "/api/tra/livingston":
            self.serve_tra_proxy()
            return
        super().do_GET()

    def serve_tra_proxy(self):
        try:
            with urllib.request.urlopen(TRA_PROXY, timeout=20) as resp:
                body = resp.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/xml; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
        except Exception as exc:
            payload = f'{{"error":"{exc}"}}'.encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(payload)

    def log_message(self, fmt, *args):
        if args and str(args[0]).startswith("GET /api/tra"):
            return
        super().log_message(fmt, *args)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("", PORT), Handler)
    print(f"StrumCity Line & Dock → http://localhost:{PORT}")
    print("TRA dam discharge proxied at /api/tra/livingston")
    server.serve_forever()