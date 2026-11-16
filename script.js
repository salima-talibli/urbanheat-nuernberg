/* UrbanHeat Nürnberg — interactive Leaflet visualization of user-supplied QGIS results.
   Data files are local; only the Leaflet library and optional OSM tiles use third-party servers. */
const CLASSES = [
  {key:'lt25',name:'Below 25°C',color:'#FFE4A3'},
  {key:'25to30',name:'25–30°C',color:'#FDB66B'},
  {key:'30to35',name:'30–35°C',color:'#F47746'},
  {key:'35to40',name:'35–40°C',color:'#D53E57'},
  {key:'gte40',name:'40°C and above',color:'#702759'},
  {key:'missing',name:'No valid observation',color:'#b4aca3'}
];
const $ = id => document.getElementById(id);
const fmt = n => n == null || !Number.isFinite(n) ? 'Not available' : n.toFixed(2)+'°C';
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const map = L.map('map', {preferCanvas:true, zoomControl:false, scrollWheelZoom:false, zoomSnap:0.25, zoomDelta:0.5});
L.control.zoom({position:'bottomright'}).addTo(map);
map.attributionControl.setPrefix('<a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>');
map.setView([49.45,11.09],11);
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'});
const districtOutline = L.geoJSON(null,{style:{color:'#a9a39a',weight:0.75,opacity:.65,fillOpacity:0,interactive:false}}).addTo(map);
const districtClickLayer = L.geoJSON(null,{style:{color:'#a9a39a',weight:1,opacity:.8,fillColor:'#D53E57',fillOpacity:.06},onEachFeature:(f,l)=>{
 l.on('click',()=>selectDistrict(f.properties));
 l.on('mouseover',()=>l.setStyle({weight:2,fillOpacity:.14}));
 l.on('mouseout',()=>districtClickLayer.resetStyle(l));
}});
const roadLayers={}; let districtData=[],activeMode='roads';
for(const c of CLASSES) roadLayers[c.key]=L.geoJSON(null,{renderer:L.canvas({padding:.4}),style:{color:c.color,weight:c.key==='missing'?0.9:1.55,opacity:c.key==='missing'?.45:.88},onEachFeature:(f,layer)=>{
 layer.on('click',()=>selectRoad(f.properties));
}});
const controlRoot=$('class-controls');
for(const c of CLASSES){const lab=document.createElement('label');lab.className='class-toggle';lab.innerHTML=`<span class="legend-stroke" style="background:${c.color}"></span><span>${escapeHTML(c.name)}</span><input type="checkbox" data-class="${c.key}" ${c.key==='missing'?'':'checked'}>`;controlRoot.appendChild(lab)}
function updateRoadVisibility(){for(const c of CLASSES){const input=document.querySelector(`[data-class="${c.key}"]`);if(!input)continue;const show=input.checked && activeMode==='roads';if(show && !map.hasLayer(roadLayers[c.key]))roadLayers[c.key].addTo(map);if(!show && map.hasLayer(roadLayers[c.key]))map.removeLayer(roadLayers[c.key]);}}
controlRoot.addEventListener('change',updateRoadVisibility);
$('all-classes').addEventListener('click',()=>{const boxes=[...document.querySelectorAll('[data-class]')];const enable=boxes.some(c=>!c.checked);boxes.forEach(b=>b.checked=enable);$('all-classes').textContent=enable?'Clear all':'Select all';updateRoadVisibility()});
function setMode(mode){activeMode=mode;const roads=mode==='roads';$('roads-mode').classList.toggle('selected',roads);$('district-mode').classList.toggle('selected',!roads);$('roads-mode').setAttribute('aria-pressed',String(roads));$('district-mode').setAttribute('aria-pressed',String(!roads));if(roads) map.removeLayer(districtClickLayer);else districtClickLayer.addTo(map);updateRoadVisibility();$('selection').innerHTML=roads?'<span class="eyebrow">FEATURE DETAILS</span><h3>Road-segment mode</h3><p>Click a coloured road line to inspect its temperature estimate.</p>':'<span class="eyebrow">FEATURE DETAILS</span><h3>District mode</h3><p>Click a district outline or choose its name from the menu.</p>'}
$('roads-mode').addEventListener('click',()=>setMode('roads'));
$('district-mode').addEventListener('click',()=>setMode('districts'));
$('borders-toggle').addEventListener('change',e=>{if(e.target.checked)districtOutline.addTo(map);else map.removeLayer(districtOutline)});
$('osm-toggle').addEventListener('change',e=>{if(e.target.checked)osm.addTo(map);else map.removeLayer(osm);if(e.target.checked)osm.bringToBack()});
function selectRoad(p){$('selection').innerHTML=`<span class="eyebrow">ROAD-ADJACENT LST</span><h3>${escapeHTML(p.n||p.h||'Unnamed road segment')}</h3><div class="stat">${fmt(p.t)}</div><p>Road segment #${escapeHTML(p.id)}${p.h?' · '+escapeHTML(p.h):''}</p><p class="muted">Valid pixels in 15 m buffer: ${p.c ?? 'Unknown'}. This is surrounding satellite surface temperature, not road-pavement temperature.</p>`;if(window.innerWidth<=760)$('selection').scrollIntoView({behavior:'smooth',block:'nearest'})}
function selectDistrict(p){$('selection').innerHTML=`<span class="eyebrow">STATISTICAL DISTRICT</span><h3>${escapeHTML(p.name)}</h3><div class="stat">${fmt(p.mean)}</div><p>Mean satellite land surface temperature</p><p class="muted">Valid pixels: ${p.count.toLocaleString()} · Min: ${fmt(p.min)} · Max: ${fmt(p.max)} · SD: ${p.sd.toFixed(2)}°C. Pixel coverage percentage has not been evaluated.</p>`;if(window.innerWidth<=760)$('selection').scrollIntoView({behavior:'smooth',block:'nearest'})}
$('district-search').addEventListener('change',e=>{const found=districtData.find(f=>f.properties.id===e.target.value);if(!found)return;setMode('districts');selectDistrict(found.properties);const match=L.geoJSON(found).getBounds();if(match.isValid())map.fitBounds(match.pad(.6),{maxZoom:13})});
function addRanking(){let ordered=[...districtData].sort((a,b)=>b.properties.mean-a.properties.mean);for(let i=0;i<5;i++){const p=ordered[i].properties;const row=document.createElement('div');row.className='rank-row';row.innerHTML=`<span class="rank-name"><span>0${i+1}</span>${escapeHTML(p.name)}</span><span class="rank-track"><span class="rank-bar" style="display:block;width:${Math.min(100,p.mean/40*100)}%"></span></span><span class="rank-temp">${p.mean.toFixed(2)}°C</span>`;$('ranking').appendChild(row)}}
async function getJSON(path){const res=await fetch(path);if(!res.ok)throw Error(`Failed to load ${path} (${res.status})`);return res.json()}
(async function init(){try{
 const districts=await getJSON('data/districts.geojson');districtData=districts.features;
 districtOutline.addData(districts);districtClickLayer.addData(districts);
 map.fitBounds(districtOutline.getBounds().pad(.08));
 const options=[...districtData].sort((a,b)=>a.properties.name.localeCompare(b.properties.name,'de'));
 for(const f of options){const el=document.createElement('option');el.value=f.properties.id;el.textContent=f.properties.name;$('district-search').appendChild(el)}
 addRanking();
 for(let i=0;i<CLASSES.length;i++){const c=CLASSES[i];$('load-progress').textContent=`Road class ${i+1} of ${CLASSES.length} — ${c.name}`;const json=await getJSON(`data/roads_${c.key}.geojson`);roadLayers[c.key].addData(json);if(c.key!=='missing' && activeMode==='roads')roadLayers[c.key].addTo(map);await new Promise(resolve=>setTimeout(resolve,15));}
 $('loading').hidden=true;
}catch(err){console.error(err);$('loading').hidden=true;$('load-error').hidden=false;}})();
