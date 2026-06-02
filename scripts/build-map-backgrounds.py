"""Download Esri satellite tiles and stitch per-location map backgrounds."""

from __future__ import annotations

import math
import urllib.request
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Install Pillow: py -m pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images" / "maps"

# id -> lat, lon, zoom (match js/config.js centers)
SITES = {
    "conroe": (30.3569, -95.5922, 12),
    "samrayburn": (31.06, -94.12, 11),
    "toledobend": (31.02, -93.52, 10),
    "stillhouse": (31.63, -97.48, 12),
    "hubbard": (32.826, -98.571, 12),
    "trinity": (30.588, -95.129, 12),
    "surfside": (28.223, -94.92, 9),
}

TILE = 256
GRID_W = 5
GRID_H = 7
UA = "StrumCity-Line-Dock/1.0 (local dev map backgrounds)"


def lat_lon_to_tile(lat: float, lon: float, zoom: int) -> tuple[int, int]:
    n = 2**zoom
    x = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return x, y


def fetch_tile(z: int, x: int, y: int) -> Image.Image:
    url = (
        "https://server.arcgisonline.com/ArcGIS/rest/services/"
        f"World_Imagery/MapServer/tile/{z}/{y}/{x}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    return Image.open(BytesIO(data)).convert("RGB")


def stitch_site(site_id: str, lat: float, lon: float, zoom: int) -> None:
    cx, cy = lat_lon_to_tile(lat, lon, zoom)
    x0 = cx - GRID_W // 2
    y0 = cy - GRID_H // 2

    canvas = Image.new("RGB", (GRID_W * TILE, GRID_H * TILE))
    for row in range(GRID_H):
        for col in range(GRID_W):
            tx, ty = x0 + col, y0 + row
            try:
                tile = fetch_tile(zoom, tx, ty)
            except Exception as exc:
                print(f"  tile {zoom}/{tx}/{ty} failed: {exc}")
                tile = Image.new("RGB", (TILE, TILE), (20, 24, 30))
            canvas.paste(tile, (col * TILE, row * TILE))

    OUT.mkdir(parents=True, exist_ok=True)
    out_path = OUT / f"{site_id}.jpg"
    canvas.save(out_path, "JPEG", quality=82, optimize=True)
    print(f"ok {site_id} -> {out_path} ({out_path.stat().st_size // 1024} KB)")


def main() -> None:
    for site_id, (lat, lon, zoom) in SITES.items():
        print(f"Building {site_id} (z{zoom})...")
        stitch_site(site_id, lat, lon, zoom)
    print("Done.")


if __name__ == "__main__":
    main()