// 1. Inisialisasi Peta Leaflet (FMIPA UNIMED)
const map = L.map('map').setView([3.6074, 98.7143], 18);

let currentPolyline = null;
let startMarker = null;
let finishMarker = null;

// Objek penampung data Graf dari routes.json
let routeDatabase = { nodes: {}, graph: {} };

// Tile Layer Google Satellite
L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  attribution: '&copy; Google Maps'
}).addTo(map);

// 2. Load File routes.json secara Asynchronous
fetch('routes.json')
  .then(response => {
    if (!response.ok) throw new Error("Gagal memuat routes.json");
    return response.json();
  })
  .then(data => {
    routeDatabase = data;
    console.log("Data Graf berhasil dimuat:", routeDatabase);
  })
  .catch(error => console.error("Error loading routes:", error));

// 3. Formula Haversine (Hitung Jarak Koordinat dalam km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 4. Algoritma Dijkstra Pencarian Rute Terpendek
function dijkstra(startNode, targetNode, nodes, graph) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(nodes));

  for (let node in nodes) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;

  while (unvisited.size > 0) {
    let current = null;
    for (let node of unvisited) {
      if (current === null || distances[node] < distances[current]) {
        current = node;
      }
    }

    if (current === targetNode || distances[current] === Infinity) break;

    unvisited.delete(current);

    const neighbors = graph[current] || [];
    for (let neighbor of neighbors) {
      if (unvisited.has(neighbor)) {
        const p1 = nodes[current];
        const p2 = nodes[neighbor];
        const dist = calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
        const alt = distances[current] + dist;

        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
        }
      }
    }
  }

  const path = [];
  let curr = targetNode;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return { path, totalDist: distances[targetNode] };
}

// 5. Fungsi Pencarian Rute
function findRoute() {
  const start = document.getElementById('startNode').value;
  const target = document.getElementById('targetNode').value;

  if (start === target) {
    alert("Gedung asal dan tujuan tidak boleh sama!");
    return;
  }

  if (!routeDatabase.nodes[start] || !routeDatabase.nodes[target]) {
    alert("Titik gedung ini belum terdaftar di routes.json!");
    return;
  }

  const { path, totalDist } = dijkstra(start, target, routeDatabase.nodes, routeDatabase.graph);

  if (path.length <= 1 || totalDist === Infinity) {
    alert("Jalur antar gedung ini belum terhubung di graf jalan!");
    return;
  }

  // Bersihkan layer lama
  if (currentPolyline) map.removeLayer(currentPolyline);
  if (startMarker) map.removeLayer(startMarker);
  if (finishMarker) map.removeLayer(finishMarker);

  // Ambil koordinat titik yang dilewati
  const latLngs = path.map(nodeKey => [
    routeDatabase.nodes[nodeKey].lat,
    routeDatabase.nodes[nodeKey].lng
  ]);

  // Render Garis Rute Berkelok
  currentPolyline = L.polyline(latLngs, { color: '#e74c3c', weight: 5, opacity: 0.85 }).addTo(map);

  startMarker = L.circleMarker(latLngs[0], {
    radius: 9, fillColor: "#2ecc71", color: "#ffffff", weight: 2, fillOpacity: 0.95
  }).addTo(map).bindPopup(`<b>Start:</b> ${routeDatabase.nodes[start].name}`);

  finishMarker = L.circleMarker(latLngs[latLngs.length - 1], {
    radius: 9, fillColor: "#e74c3c", color: "#ffffff", weight: 2, fillOpacity: 0.95
  }).addTo(map).bindPopup(`<b>Finish:</b> ${routeDatabase.nodes[target].name}`);

  map.fitBounds(currentPolyline.getBounds(), { padding: [60, 60] });

  // Update Detail UI
  document.getElementById('routeName').innerHTML = `${routeDatabase.nodes[start].name} <br>➔ ${routeDatabase.nodes[target].name}`;
  document.getElementById('totalDistance').textContent = (totalDist * 1000).toFixed(0) + " meter (" + totalDist.toFixed(2) + " km)";
  document.getElementById('stats').style.display = 'block';
}