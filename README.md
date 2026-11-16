# UrbanHeat Nürnberg — Interactive Heat Explorer

A responsive, GitHub Pages–ready interactive web map built from QGIS-derived Landsat 9 land surface temperature (LST) and OpenStreetMap road networks for Nürnberg, Germany.

## What it contains
- **72,646** road line segments, styled by estimated road-adjacent satellite-derived surface temperature.
- **89** statistical districts, with mean/min/max/standard deviation from zonal statistics.
- Interactive road clicks, district exploration, a searchable district selector, class toggles and optional OpenStreetMap basemap.
- Top-five ranking and transparent methodology/caveats.
- **504 road segments** lack valid temperature observations and are shown as a separate optional grey class.

## Run locally in VS Code

1. Extract the ZIP to a folder.
2. Open that folder in **Visual Studio Code**.
3. Install the **Live Server** extension (if you don't already have it).
4. Right-click `index.html` and choose **Open with Live Server**.

Alternative with Python installed:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

**Do not just double-click `index.html`** — many browsers block `fetch()` requests to local GeoJSON under the `file://` protocol.

Leaflet is loaded from a public CDN, and the optional OpenStreetMap basemap needs internet access. The road and district data load from the included local `data/` directory.

## Publish on GitHub Pages

1. Create a GitHub repository (e.g. `urbanheat-nuernberg`).
2. Upload **all files and the entire `data/` folder** to the repository root (don't upload only `index.html`).
3. In repository **Settings → Pages**, select **Deploy from a branch**, `main`, `/ (root)` and save.
4. When GitHub finishes deploying, the website URL typically has the pattern `https://YOUR-USERNAME.github.io/urbanheat-nuernberg/`.
5. Open the URL and check whether all road classes and district popups load.

The map contains ~14 MB of GeoJSON. Hosting it as static files is possible, but loading time may vary by device and connection. If you later need faster performance, migrate the roads to vector tiles or PMTiles.

## Scientific caveats

- Date: **26 August 2025** (single satellite observation), not a seasonal heat average.
- Source imagery: **USGS Landsat 9 Collection 2 Level-2** surface temperature product; originally QA-screened and scaled to degrees Celsius in the QGIS workflow.
- **Road line colours represent mean LST sampled within 15 m road buffers**, not an instrument reading of pavement or air temperature.
- Landsat thermal data has an effective spatial resolution much coarser than the buffer width. Some segments have only a few valid contributing pixels.
- **504 road segments have missing LST** (`heat_road_mean = NULL`; `heat_road_count = 0`) and are **not** treated as cool.
- District zonal statistics are shown as preliminary because percentage of valid observation coverage and uncertainty checks have not yet been completed.
- The `30.68°C` headline is the previously computed pixel-weighted average for the clipped scene; it is not a population-weighted metric.
- Web geometry coordinates have been rounded and road lines visually simplified by **2 metres** in EPSG:25832 before web export; the original uploaded GeoPackages remain the analysis source of truth.

## Files

- `index.html` — page structure
- `style.css` — editorial visual style and responsive design
- `script.js` — Leaflet interactions, loading and map functions
- `data/districts.geojson` — 89 district polygons with LST summary fields
- `data/roads_*.geojson` — six groups of road geometries (five temperature classes and one missing category)

## Credits

USGS / NASA Landsat; © OpenStreetMap contributors; Stadt Nürnberg boundaries. Analysis from user-provided QGIS GeoPackage files. Web development: HTML, CSS, JavaScript and Leaflet. Include applicable original municipal/OSM licensing notices in public project metadata.
