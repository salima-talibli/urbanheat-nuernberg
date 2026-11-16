# UrbanHeat Nürnberg

**Mapping road-adjacent land surface temperature with Landsat 9 and QGIS**

How did surface temperature vary across Nürnberg on 26 August 2025, and which statistical districts had the highest mean values? This project explores those questions using a Landsat 9 satellite observation, OpenStreetMap roads and the city's statistical district boundaries. A QGIS poster presents the citywide pattern, and an interactive Leaflet map lets readers inspect individual road segments and districts.

**[Open the interactive map](https://salima-talibli.github.io/urbanheat-nuernberg/)** · **[View the full-resolution QGIS poster](./UrbanHeat_Nuernberg_Poster.png)**

![QGIS poster showing road-adjacent land surface temperatures across Nürnberg on 26 August 2025 and the five statistical districts with the highest mean temperatures](./UrbanHeat_Nuernberg_Poster.png)

## Results at a glance

The **pixel-weighted mean land surface temperature (LST) was 30.68 °C** across the clipped satellite scene. At district level, Gugelstraße recorded the highest mean at **36.92 °C**, followed by Katzwanger Straße at **36.64 °C**. The difference between them was **0.28 °C**. The ranking is preliminary because district-level coverage and uncertainty checks are still pending.

| Rank | Statistical district | Mean LST on 26 August 2025 |
| ---: | --- | ---: |
| 1 | Gugelstraße | 36.92 °C |
| 2 | Katzwanger Straße | 36.64 °C |
| 3 | Dianastraße | 36.01 °C |
| 4 | Höfen | 35.65 °C |
| 5 | Sandreuth | 35.27 °C |

## How to read the map

The project reports temperature at three spatial scales. Each answers a different question.

| Spatial scale | What the value represents |
| --- | --- |
| Clipped satellite scene | The headline **30.68 °C** is the pixel-weighted mean across the clipped scene. It describes the observed surface and uses no population weighting. |
| Statistical district | Each of the **89 districts** has a mean, minimum, maximum and standard deviation from zonal statistics. The ranking uses the district mean. |
| Road segment | Each line is coloured by the mean valid LST sampled within a **15 m buffer** around that segment. A grey line indicates that the buffer returned no valid observation. |

The road layer contains **72,646 segments**. Of these, **72,142** have a valid mean LST and **504** have no valid observation. The map uses five temperature classes in °C: **0–25, 25–30, 30–35, 35–40 and 40–50**. Segments with missing values have their own optional grey class.

## Data sources

| Dataset | Provider | Role in the project |
| --- | --- | --- |
| Landsat 9 Collection 2 Level-2 surface temperature | USGS / NASA Landsat | Surface temperature observations and pixel quality information for 26 August 2025 |
| Road network | © OpenStreetMap contributors | Road centreline geometries used to define sampling buffers |
| Statistical district boundaries | Stadt Nürnberg | Polygon boundaries used to summarise and compare district temperatures |

**Landsat product ID:** `LC09_L2SP_194026_20250826_20250902_02_T1`

## GIS methodology

1. **Prepare the satellite observation.** The Landsat surface temperature product was quality-screened, scaled and converted to degrees Celsius in QGIS. The clipped scene provided the basis for the pixel-weighted headline mean.
2. **Sample temperatures along roads.** A 15 m buffer was created around each road segment. The mean of the valid LST pixels sampled within the buffer was assigned to the corresponding road line. Segments with `heat_road_count = 0` retained a null `heat_road_mean`.
3. **Summarise temperature by district.** Zonal statistics produced the mean, minimum, maximum and standard deviation for each statistical district. Districts were ranked by mean LST for the poster and web map.
4. **Prepare the maps.** The QGIS poster shows the road temperature classes alongside the five highest district means. For the web version, road lines were simplified with a **2 m tolerance in EPSG:25832**, and coordinates were rounded for export. The original analysis geometries and statistics are held in the QGIS GeoPackages.

## Explore the interactive map

- **Click a road segment** to inspect its road-adjacent temperature estimate.
- **Search for a district** and open its popup to compare the mean with the minimum, maximum and standard deviation.
- **Toggle temperature classes** to see where warmer segments cluster. Enable the grey class to inspect gaps in observation coverage.
- **Switch on the OpenStreetMap basemap** to locate a feature relative to streets and landmarks.

## Interpretation and limitations

**Observation date.** The map captures conditions during one satellite overpass on 26 August 2025. Establishing whether a district stays warmer throughout the summer would require observations from additional dates.

**Surface temperature and human exposure.** Landsat measures land surface temperature. Assessing pedestrian heat exposure would require additional information, including near-surface air temperature and shade.

**Road-buffer interpretation.** The effective spatial resolution of the thermal observation is coarser than the 15 m sampling buffer. A pixel can include pavement, roofs, vegetation and other nearby surfaces. Some segments have few valid contributing pixels, and adjacent segments may draw on the same observation.

**Coverage and uncertainty.** Missing road values are preserved explicitly. The percentage of valid observation coverage within each district and the uncertainty of district summaries have yet to be evaluated. Small differences between district means should be interpreted with that limitation in mind.

## Run locally in VS Code

1. Open the project folder containing `index.html` in Visual Studio Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and select **Open with Live Server**.

Alternatively, run the following command from the project folder:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` in a browser. Use a local server so the browser can load the GeoJSON files through `fetch()`. The road and district data are included in `data/`. An internet connection is needed to load Leaflet from its public CDN and to display the optional OpenStreetMap basemap.

## Repository files

| File or folder | Purpose |
| --- | --- |
| `index.html` | Main page for the interactive heat explorer |
| `style.css` | Map layout, typography and responsive styling |
| `script.js` | Leaflet map, data loading, search, popups and layer controls |
| `data/districts.geojson` | 89 district polygons with LST summary statistics |
| `data/roads_*.geojson` | Road segments grouped into five temperature classes and one missing-data class |
| `UrbanHeat_Nuernberg_Poster.png` | Full-resolution QGIS poster displayed above |

## GitHub Pages deployment

Keep `index.html`, `style.css`, `script.js` and the complete `data/` folder at the repository root. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save. After deployment, open the site and check a road popup and a district popup to confirm that both datasets load. The GeoJSON files total approximately 14 MB, so the first load may take longer on slower connections.

## Author and attribution

**Salima Talibli** · GIS analysis and cartography

Satellite imagery from USGS / NASA Landsat. Road data © OpenStreetMap contributors, available under the [Open Database License](https://www.openstreetmap.org/copyright). Statistical district boundaries from Stadt Nürnberg. The interactive map uses Leaflet, JavaScript, HTML and CSS.
