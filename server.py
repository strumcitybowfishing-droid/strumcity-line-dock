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
        path = self.path.split("?")[0]
        if path == "/api/tra/livingston":
            self.serve_tra_proxy()
            return

        if path.startswith("/api/usgs"):
            self.serve_usgs_proxy()
            return

        # Lightweight ping endpoint for uptime monitors (UptimeRobot, health checks, etc.).
        # Returns instantly with a keyword so monitors can do "keyword contains" checks.
        # This helps keep free/Starter Render services awake (ping every 5-10 min) and provides
        # a reliable target for monitoring without loading the full app or images.
        if path in ("/ping", "/health", "/status"):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(b"StrumCity OK\n")
            return

        # For the PWA shell (root / index.html) always serve fresh.
        # This + the ?v= query on JS/CSS + the "⟳ Refresh app" button helps old bookmarks
        # and iOS Safari "Add to Home Screen" installs pick up updates without full cache clear.
        if path in ("/", "/index.html"):
            try:
                with open("index.html", "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.send_header("Pragma", "no-cache")
                self.send_header("Expires", "0")
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception:
                # fall through to normal 404 handling if file missing
                pass

        super().do_GET()

    def do_HEAD(self):
        """Support HEAD requests for ping/health (many monitors use HEAD) and shell.
        Without this, HEAD /ping falls to base class and returns 404 for non-file paths.
        """
        path = self.path.split("?")[0]
        if path in ("/ping", "/health", "/status"):
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            return
        if path in ("/", "/index.html"):
            # HEAD for the PWA shell: send headers only (no body), with no-cache
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            self.end_headers()
            return
        super().do_HEAD()

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

    def serve_usgs_proxy(self):
        """Proxy USGS NWIS Instantaneous Values (IV) JSON for river gauges.
        Client calls /api/usgs/iv/?format=json&sites=08066000,08067000&parameterCd=00060,00065&siteStatus=active
        We forward to waterservices.usgs.gov (public gov API) and return with CORS so browser JS can use it reliably.
        Keeps the same query flexibility. No key needed. 15-60 min updates typical.
        """
        try:
            # Extract everything after /api/usgs (including /iv/ and ?query)
            suffix = self.path[len("/api/usgs"):]  # e.g. /iv/?format=...
            if not suffix.startswith("/"):
                suffix = "/" + suffix
            target = "https://waterservices.usgs.gov/nwis" + suffix
            with urllib.request.urlopen(target, timeout=15) as resp:
                body = resp.read()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
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
        if args and (str(args[0]).startswith("GET /api/tra") or str(args[0]).startswith("GET /api/usgs")):
            return
        super().log_message(fmt, *args)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("", PORT), Handler)
    print(f"StrumCity Line & Dock → http://localhost:{PORT}")
    print("TRA dam discharge proxied at /api/tra/livingston")
    print("USGS river gauges (Trinity/Neches tabs) proxied at /api/usgs/iv/?...")
    server.serve_forever()