"""Bakes the ground under Starbase from open data. Run by hand when the data should be refreshed:

    python starship-catch/scripts/bake-site.py            # everything
    python starship-catch/scripts/bake-site.py --preview  # also writes gridded previews to .scratch/site-preview/

Needs Python 3.11+ with numpy, Pillow, pyproj and rasterio (GDAL). No logins or keys.

Sources
- Imagery: USDA NAIP, 0.6 m, four-band, read as cloud-optimised GeoTIFFs from Microsoft's
  Planetary Computer (public domain). The newest flight wins at each pixel: 14 October 2024
  over the launch site and Boca Chica, 2022 north of 26.0 degrees, where 2024 is not published.
- One clear Sentinel-2 L2A day (21 November 2024), 10 m true colour: the whole widest layer,
  including Mexico and the open Gulf, and open water in the middle two (Copernicus Sentinel data
  licence: free use with attribution).
- Elevation: USGS 3DEP seamless DEM from the National Map's 3DEPElevation image service
  (public domain). Over the site it comes from the 2023 TX Lower Rio Grande lidar.

Outputs, in starship-catch/public/site/
- pad.webp, site.webp, area.webp, region.webp: square photographs, north up, on the UTM zone 14N grid,
  centred on the Pad 1 tower.
- pad.dem, site.dem, area.dem: little-endian int16 heights in centimetres above the pad, row 0 at the north.
- site.json: where each file sits in the game's frame, the flight dates and the sources.

The game's frame: x east and z south in metres, y up, with the catch point at the origin and
the centre of the Pad 1 tower at x = -15 (TUNING.towerFace - TUNING.towerWidth / 2).

NAIP photographs are not true orthophotos: tall structures lean away from the camera, so each
tower appears as a lattice lying on the ground, east of its base. Those images are painted out
with the colour of the ground around them, and the models stand there instead. The shadows
stay: the game's Sun stands where it stood when the photograph was flown, so they agree. The polygons are listed in MASKS, in metres east and north of the tower.
"""

from __future__ import annotations

import argparse
import json
import math
import struct
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
import rasterio
from rasterio.windows import from_bounds
from PIL import Image, ImageDraw, ImageFilter
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'site'
PREVIEW = ROOT.parent / '.scratch' / 'site-preview'

# The centre of the Pad 1 (Pad A) tower base, read off the 2024 NAIP photograph and its shadow.
TOWER = {'lat': 25.996143, 'lon': -97.154735}
# Where that centre sits in the game's frame, m east of the catch point.
TOWER_X = -15.0

STAC = 'https://planetarycomputer.microsoft.com/api/stac/v1/search'
SAS = 'https://planetarycomputer.microsoft.com/api/sas/v1/token/naip'
DEM = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage'
DEM_INDEX = 'https://index.nationalmap.gov/arcgis/rest/services/3DEPElevationIndex/MapServer/11/query'

# name, square size m, image pixels, DEM pixels (0 = no heights), where Sentinel-2 is used (see mosaic)
LAYERS = [
    ('pad', 1_200, 2048, 256, 'none'),
    ('site', 3_000, 2048, 256, 'water'),
    ('area', 10_000, 2048, 200, 'water'),
    ('region', 44_000, 2048, 0, 'all'),
]

# One clear Sentinel-2 day: the whole region layer, and open water in the site and area layers, where
# NAIP flights of different days show the sea in different colours and stop a few kilometres out.
SENTINEL_DATE = '2024-11-21T00:00:00Z/2024-11-21T23:59:59Z'

# Painted out of the photographs: the leaning images of both towers.
# Polygons in metres east and north of the Pad 1 tower centre.
MASKS: list[list[tuple[float, float]]] = [
    # Pad 1 tower and its launch mount, leaning east over the pad.
    [(-6, 14), (82, 14), (82, -24), (10, -26), (-6, -12)],
    # Pad 2 tower, leaning east-south-east from its base.
    [(-338, 121), (-278, 106), (-280, 87), (-340, 95)],
]

WEBP_QUALITY = 80


def get_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=60) as response:
        return json.load(response)


def utm() -> tuple[Transformer, Transformer, float, float]:
    to_utm = Transformer.from_crs('EPSG:4326', 'EPSG:26914', always_xy=True)
    to_geo = Transformer.from_crs('EPSG:26914', 'EPSG:4326', always_xy=True)
    e, n = to_utm.transform(TOWER['lon'], TOWER['lat'])
    return to_utm, to_geo, e, n


def stac_items(to_geo: Transformer, bounds: tuple[float, float, float, float], collection: str, datetime: str) -> list[dict]:
    """Every item of a collection over the bounds (UTM), oldest first."""
    west, south = to_geo.transform(bounds[0], bounds[1])
    east, north = to_geo.transform(bounds[2], bounds[3])
    params = {'collections': collection, 'bbox': f'{west:.5f},{south:.5f},{east:.5f},{north:.5f}', 'datetime': datetime, 'limit': 200}
    items = get_json(f'{STAC}?{urllib.parse.urlencode(params)}')['features']
    items.sort(key=lambda f: f['properties']['datetime'])
    return items


def paint(canvas: np.ndarray, href: str, bounds: tuple[float, float, float, float], bands: tuple[int, ...] = (1, 2, 3)) -> int:
    """Reads one cloud-optimised GeoTIFF into the canvas where it has data. Returns the pixels painted."""
    pixels = canvas.shape[0]
    size = bounds[2] - bounds[0]
    with rasterio.open(href) as ds:
        # NAIP is on NAD83 and Sentinel-2 on WGS 84, both UTM zone 14N: under a metre apart, well inside a pixel here.
        if ds.crs.to_epsg() not in (26914, 32614):
            print(f'  skip {href.split("?")[0]}: {ds.crs}', file=sys.stderr)
            return 0
        left, bottom, right, top = ds.bounds
        x0 = max(0, math.ceil((left - bounds[0]) / size * pixels))
        x1 = min(pixels, math.floor((right - bounds[0]) / size * pixels))
        y0 = max(0, math.ceil((bounds[3] - top) / size * pixels))
        y1 = min(pixels, math.floor((bounds[3] - bottom) / size * pixels))
        if x1 <= x0 or y1 <= y0:
            return 0
        px = size / pixels
        win = from_bounds(bounds[0] + x0 * px, bounds[3] - y1 * px, bounds[0] + x1 * px, bounds[3] - y0 * px, ds.transform)
        data = ds.read(list(bands), window=win, out_shape=(len(bands), y1 - y0, x1 - x0), resampling=rasterio.enums.Resampling.average)
    tile = np.moveaxis(data, 0, -1)
    valid = tile.max(axis=2) > 6 if canvas.dtype == np.uint8 else tile.max(axis=2) > 0
    canvas[y0:y1, x0:x1][valid] = tile[valid]
    return int(valid.sum())


def match(source: np.ndarray, reference: np.ndarray, water: np.ndarray) -> np.ndarray:
    """Matches one flight's colour to another's, band by band, over the dry ground both cover.
    Flights months apart differ in light and haze; without this their edges show as squares."""
    both = (source.max(axis=2) > 6) & (reference.max(axis=2) > 6) & ~water
    if both.sum() < 1000:
        return source
    out = source.astype(np.float32)
    for band in range(3):
        s = source[..., band][both].astype(np.float32)
        r = reference[..., band][both].astype(np.float32)
        gain = r.std() / max(1e-3, s.std())
        out[..., band] = (out[..., band] - s.mean()) * gain + r.mean()
    out[~(source.max(axis=2) > 6)] = 0
    return np.clip(out, 0, 255).astype(np.uint8)


def mosaic(to_geo: Transformer, bounds: tuple[float, float, float, float], pixels: int, satellite: str) -> tuple[np.ndarray, dict[str, int]]:
    """One RGB square. `satellite` is 'none' (NAIP only), 'water' (Sentinel-2 for open water, NAIP on land)
    or 'all' (Sentinel-2 only: at 20 m a pixel it has all the detail and one consistent day).
    Every source is matched in colour to the newest NAIP flight over dry ground."""
    water = np.zeros((pixels, pixels), bool)
    s2 = None
    if satellite != 'none':
        s2_token = get_json(SAS.replace('naip', 'sentinel-2-l2a'))['token']
        s2 = np.zeros((pixels, pixels, 3), np.uint8)
        nir_green = np.zeros((pixels, pixels, 2), np.uint16)
        for item in stac_items(to_geo, bounds, 'sentinel-2-l2a', SENTINEL_DATE):
            n = paint(s2, f'{item["assets"]["visual"]["href"]}?{s2_token}', bounds)
            green = np.zeros((pixels, pixels, 1), np.uint16)
            nir = np.zeros((pixels, pixels, 1), np.uint16)
            paint(green, f'{item["assets"]["B03"]["href"]}?{s2_token}', bounds, (1,))
            paint(nir, f'{item["assets"]["B08"]["href"]}?{s2_token}', bounds, (1,))
            have = green[..., 0] > 0
            nir_green[have, 0] = green[have, 0]
            nir_green[have, 1] = nir[have, 0]
            print(f'  {item["id"]}: {n} px')
        g = nir_green[..., 0].astype(np.float32)
        r = nir_green[..., 1].astype(np.float32)
        # Open water: green brighter than near infrared (McFeeters' NDWI above zero).
        water = (g + r > 0) & ((g - r) / np.maximum(1, g + r) > 0.05)
        # Wet sand and surf read as water for a pixel or two; grow the dry land back over them.
        water = np.asarray(Image.fromarray(water.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(3))) > 0

    naip_token = get_json(SAS)['token']
    flights: dict[str, np.ndarray] = {}
    if satellite != 'all':
        for item in stac_items(to_geo, bounds, 'naip', '2020-01-01/2026-12-31'):
            date = item['properties']['datetime'][:10]
            canvas = flights.setdefault(date, np.zeros((pixels, pixels, 3), np.uint8))
            n = paint(canvas, f'{item["assets"]["image"]["href"]}?{naip_token}', bounds)
            print(f'  {item["id"]}: {n} px')
    else:
        # The reference colour still comes from the newest NAIP flight, read coarsely.
        for item in stac_items(to_geo, bounds, 'naip', '2024-01-01/2024-12-31'):
            canvas = flights.setdefault('2024-10-14', np.zeros((pixels, pixels, 3), np.uint8))
            paint(canvas, f'{item["assets"]["image"]["href"]}?{naip_token}', bounds)
    dates = sorted(d for d in flights if (flights[d].max(axis=2) > 6).any())
    reference = flights[dates[-1]]
    image = np.zeros((pixels, pixels, 3), np.uint8)
    owner = np.full((pixels, pixels), '', object)
    if s2 is not None:
        s2 = match(s2, reference, water)
        has = s2.max(axis=2) > 6
        image[has] = s2[has]
        owner[has] = 'sentinel-2 ' + SENTINEL_DATE[:10]
    if satellite != 'all':
        for date in dates:
            flight = flights[date] if date == dates[-1] else match(flights[date], reference, water)
            has = (flight.max(axis=2) > 6) & ~water
            image[has] = flight[has]
            owner[has] = date
    counts = {str(k): int((owner == k).sum()) for k in set(owner.ravel()) if k}
    return image, counts


def paint_out(image: np.ndarray, bounds: tuple[float, float, float, float], tower_e: float, tower_n: float) -> np.ndarray:
    """Fills each mask polygon with the median colour of a ring of ground around it, plus the photo's own fine grain."""
    if not MASKS:
        return image
    pixels = image.shape[0]
    size = bounds[2] - bounds[0]
    out = Image.fromarray(image)
    grain = np.asarray(out.convert('L'), np.float32)
    grain = grain - np.asarray(Image.fromarray(grain.astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)), np.float32)
    for polygon in MASKS:
        points = [((tower_e + e - bounds[0]) / size * pixels, (bounds[3] - tower_n - n) / size * pixels) for e, n in polygon]
        mask = Image.new('L', (pixels, pixels), 0)
        ImageDraw.Draw(mask).polygon(points, fill=255)
        inside = np.asarray(mask) > 0
        ring = np.asarray(mask.filter(ImageFilter.MaxFilter(15))) > 0
        ring &= ~inside
        colour = np.median(image[ring], axis=0)
        soft = np.asarray(mask.filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
        fill = np.clip(colour[None, None, :] + grain[..., None] * 0.35, 0, 255)
        image = (image * (1 - soft) + fill * soft).astype(np.uint8)
    return image


def dem(bounds: tuple[float, float, float, float], pixels: int, pad_metres: float) -> tuple[np.ndarray, float]:
    """Heights over the bounds, m, north row first. Also returns the height at the centre of the pad."""
    query = urllib.parse.urlencode({
        'bbox': ','.join(f'{v:.2f}' for v in bounds),
        'bboxSR': 26914,
        'imageSR': 26914,
        'size': f'{pixels},{pixels}',
        'format': 'tiff',
        'pixelType': 'F32',
        'interpolation': 'RSP_BilinearInterpolation',
        'f': 'image',
    })
    with urllib.request.urlopen(f'{DEM}?{query}', timeout=120) as response:
        raw = response.read()
    with rasterio.MemoryFile(raw) as memory, memory.open() as ds:
        heights = ds.read(1).astype(np.float32)
    heights[~np.isfinite(heights)] = 0
    heights[heights < -50] = 0
    return heights, pad_metres


def dem_source(lon: float, lat: float) -> list[str]:
    query = urllib.parse.urlencode({
        'geometry': f'{lon},{lat}', 'geometryType': 'esriGeometryPoint', 'inSR': 4326,
        'spatialRel': 'esriSpatialRelIntersects', 'outFields': 'project,collect_start,collect_end', 'returnGeometry': 'false', 'f': 'json',
    })
    found = []
    for feature in get_json(f'{DEM_INDEX}?{query}').get('features', []):
        a = feature['attributes']
        found.append(a.get('project') or '')
    return sorted({f for f in found if f})


def preview(image: np.ndarray, bounds: tuple[float, float, float, float], tower_e: float, tower_n: float, name: str, step: float) -> None:
    """A copy with a grid in the game's metres, for placing models by eye. Not shipped."""
    PREVIEW.mkdir(parents=True, exist_ok=True)
    pixels = image.shape[0]
    size = bounds[2] - bounds[0]
    im = Image.fromarray(image)
    draw = ImageDraw.Draw(im)
    k = math.ceil((bounds[0] - tower_e) / step) * step
    while tower_e + k <= bounds[2]:
        x = (tower_e + k - bounds[0]) / size * pixels
        draw.line([(x, 0), (x, pixels)], fill=(255, 0, 0) if k % (step * 5) == 0 else (255, 255, 0), width=1)
        draw.text((x + 2, 2), f'{k:.0f}', fill=(255, 0, 0))
        k += step
    k = math.ceil((bounds[1] - tower_n) / step) * step
    while tower_n + k <= bounds[3]:
        y = (bounds[3] - tower_n - k) / size * pixels
        draw.line([(0, y), (pixels, y)], fill=(255, 0, 0) if k % (step * 5) == 0 else (255, 255, 0), width=1)
        draw.text((2, y + 2), f'{k:.0f}', fill=(255, 0, 0))
        k += step
    im.save(PREVIEW / f'{name}.jpg', quality=90)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--preview', action='store_true')
    parser.add_argument('--only', help='bake one layer')
    args = parser.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    _, to_geo, tower_e, tower_n = utm()
    meta_path = OUT / 'site.json'
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    layers = {layer['name']: layer for layer in meta.get('layers', [])}
    pad_height = meta.get('padHeight') if args.only and args.only != 'pad' else None

    for name, metres, pixels, dem_pixels, satellite in LAYERS:
        if args.only and name != args.only:
            continue
        half = metres / 2
        bounds = (tower_e - half, tower_n - half, tower_e + half, tower_n + half)
        print(f'{name}: {metres} m, {pixels} px')
        image, counts = mosaic(to_geo, bounds, pixels, satellite)
        image = paint_out(image, bounds, tower_e, tower_n)
        Image.fromarray(image).save(OUT / f'{name}.webp', quality=WEBP_QUALITY, method=6)
        if args.preview:
            preview(image, bounds, tower_e, tower_n, name, 10 if metres <= 2_000 else 100 if metres <= 10_000 else 1_000)
        entry = {
            'name': name,
            'metres': metres,
            'image': f'{name}.webp',
            'flown': {date: round(count / image.shape[0] ** 2, 3) for date, count in sorted(counts.items()) if count and not date.startswith('sentinel')},
            'satellite': {date: round(count / image.shape[0] ** 2, 3) for date, count in sorted(counts.items()) if date.startswith('sentinel')},
        }
        if dem_pixels:
            heights, _ = dem(bounds, dem_pixels, 0)
            if pad_height is None and name == 'pad':
                # The pad deck: the median height within 12 m of the tower centre.
                c = dem_pixels / 2
                r = max(1, int(12 / (metres / dem_pixels)))
                pad_height = float(np.median(heights[int(c - r):int(c + r), int(c - r):int(c + r)]))
            centimetres = np.clip(np.round((heights - pad_height) * 100), -32_000, 32_000).astype('<i2')
            (OUT / f'{name}.dem').write_bytes(centimetres.tobytes())
            entry['dem'] = f'{name}.dem'
            entry['demPixels'] = dem_pixels
            print(f'  dem {heights.min():.2f} to {heights.max():.2f} m, pad {pad_height:.2f} m')
        layers[name] = entry

    meta = {
        'tower': TOWER,
        'towerX': TOWER_X,
        'grid': 'UTM zone 14N (EPSG:26914), north up',
        'padHeight': round(pad_height if pad_height is not None else meta.get('padHeight', 0), 2),
        'layers': [layers[n] for n, *_ in LAYERS if n in layers],
        'sources': {
            'imagery': 'USDA NAIP via Microsoft Planetary Computer, public domain',
            'elevation': 'USGS 3DEP via the National Map, public domain',
            'satellite': 'Contains modified Copernicus Sentinel data 2024, via Microsoft Planetary Computer',
            'lidar': dem_source(TOWER['lon'], TOWER['lat']),
        },
    }
    meta_path.write_text(json.dumps(meta, indent=2) + '\n')
    print(f'pad {meta["padHeight"]} m above NAVD88')


if __name__ == '__main__':
    main()
