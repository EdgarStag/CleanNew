import fs from 'fs';
import * as d3 from 'd3-geo';
import topojson from 'topojson-client';

async function generate() {
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  const world = await res.json();
  const countries = topojson.feature(world, world.objects.countries);

  const width = 1000;
  const height = 500;
  
  // Use Equirectangular or Mercator. Equirectangular is flat and simple.
  const projection = d3.geoEquirectangular().fitSize([width, height], countries);
  const path = d3.geoPath().projection(projection);

  let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  for (const feature of countries.features) {
    const d = path(feature);
    if (d) {
      svg += `  <path d="${d}" fill="#139D69" opacity="0.8" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />\n`;
    }
  }
  svg += `</svg>`;
  fs.writeFileSync('public/images/world-map.svg', svg);

  const locations = [
    { name: 'Estados Unidos', region: 'Norteamérica', lat: 39.8283, lon: -98.5795 },
    { name: 'México', region: 'Norteamérica', lat: 23.6345, lon: -102.5528 },
    { name: 'Colombia', region: 'Sudamérica', lat: 4.5709, lon: -74.2973 },
    { name: 'Brasil', region: 'Sudamérica', lat: -14.235, lon: -51.9253 },
    { name: 'Argentina', region: 'Sudamérica', lat: -38.4161, lon: -63.6167 },
    { name: 'España', region: 'Europa', lat: 40.4637, lon: -3.7492 },
    { name: 'Francia', region: 'Europa', lat: 46.2276, lon: 2.2137 },
    { name: 'Andorra', region: 'Europa', lat: 42.5063, lon: 1.5218 },
    { name: 'Kuwait', region: 'Medio Oriente', lat: 29.3117, lon: 47.4818 },
    { name: 'Arabia Saudita', region: 'Medio Oriente', lat: 23.8859, lon: 45.0792 },
    { name: 'Emiratos Árabes', region: 'Medio Oriente', lat: 23.4241, lon: 53.8478 },
    { name: 'Angola', region: 'África', lat: -11.2027, lon: 17.8739 },
  ];

  console.log("Coordinate Percentages for page.tsx:");
  for (const loc of locations) {
    const [x, y] = projection([loc.lon, loc.lat]);
    const left = ((x / width) * 100).toFixed(2) + '%';
    const top = ((y / height) * 100).toFixed(2) + '%';
    console.log(`{ top: '${top}', left: '${left}', name: '${loc.name}', region: '${loc.region}' },`);
  }
}
generate();
