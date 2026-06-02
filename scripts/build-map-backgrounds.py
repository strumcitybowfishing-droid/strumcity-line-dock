"""Download Esri satellite or OpenTopoMap tiles and stitch per-location map backgrounds.
Supports "satellite" (default, Esri World Imagery) and "topo" (OpenTopoMap contours + relief for cool topographical/fishing map look).
Run with: py scripts/build-map-backgrounds.py --style topo
For lake depth/topo fishing map backgrounds as requested.
"""

from __future__ import annotations

import argparse
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
# Includes new multi-state lakes (AR, TN/AL) + expanded central TX / Brazos.
# Run with --style topo for cool contour/relief "fishing map" look on new lakes.
SITES = {
    "conroe": (30.3569, -95.5922, 12),
    "samrayburn": (31.06, -94.12, 11),
    "toledobend": (31.02, -93.52, 10),
    "stillhouse": (31.63, -97.48, 12),
    "belton": (31.11, -97.47, 11),
    "whitney": (31.87, -97.37, 11),
    "waco": (31.56, -97.21, 11),
    "hubbard": (32.826, -98.571, 12),
    "brazos": (31.70, -97.32, 10),
    "trinity": (30.588, -95.129, 12),
    "surfside": (28.223, -94.92, 9),
    "ouachita": (34.60, -93.33, 10),
    "bullshoals": (36.48, -92.65, 10),
    "tablerock": (36.57, -93.30, 10),
    "pickwick": (34.99, -88.19, 10),
    "guntersville": (34.41, -86.26, 10),
    "wattsbar": (35.74, -84.71, 10),
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


def fetch_tile(z: int, x: int, y: int, style: str = "satellite") -> Image.Image:
    if style == "topo":
        # OpenTopoMap: cool topographic style with contours, good for "topographical fishing map" background
        # Note: lake interiors will be water blue; surrounding terrain shows topo relief/contours (fishing relevant)
        url = f"https://tile.opentopomap.org/{z}/{x}/{y}.png"
    else:
        # default satellite
        url = (
            "https://server.arcgisonline.com/ArcGIS/rest/services/"
            f"World_Imagery/MapServer/tile/{z}/{y}/{x}"
        )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    return Image.open(BytesIO(data)).convert("RGB")


def stitch_site(site_id: str, lat: float, lon: float, zoom: int, style: str = "satellite") -> None:
    cx, cy = lat_lon_to_tile(lat, lon, zoom)
    x0 = cx - GRID_W // 2
    y0 = cy - GRID_H // 2

    canvas = Image.new("RGB", (GRID_W * TILE, GRID_H * TILE))
    for row in range(GRID_H):
        for col in range(GRID_W):
            tx, ty = x0 + col, y0 + row
            try:
                tile = fetch_tile(zoom, tx, ty, style=style)
            except Exception as exc:
                print(f"  tile {zoom}/{tx}/{ty} failed: {exc}")
                tile = Image.new("RGB", (TILE, TILE), (20, 24, 30))
            canvas.paste(tile, (col * TILE, row * TILE))

    OUT.mkdir(parents=True, exist_ok=True)
    suffix = "" if style == "satellite" else f"-{style}"
    out_path = OUT / f"{site_id}{suffix}.jpg"
    canvas.save(out_path, "JPEG", quality=82, optimize=True)
    print(f"ok {site_id} ({style}) -> {out_path} ({out_path.stat().st_size // 1024} KB)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build map background images for StrumCity.")
    parser.add_argument(
        "--style",
        choices=["satellite", "topo"],
        default="satellite",
        help="Map style: 'satellite' (Esri imagery, current default) or 'topo' (OpenTopoMap for cool topographical fishing map look with contours/relief).",
    )
    args = parser.parse_args()

    style = args.style
    print(f"Building backgrounds with style={style} ...")
    for site_id, (lat, lon, zoom) in SITES.items():
        print(f"Building {site_id} (z{zoom}, {style})...")
        stitch_site(site_id, lat, lon, zoom, style=style)
    print("Done. For lake pages, consider using the -topo.jpg versions as static backgrounds for depth/topo fishing map vibe.")


if __name__ == "__main__":
    main()