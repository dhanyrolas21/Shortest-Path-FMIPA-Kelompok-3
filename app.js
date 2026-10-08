// ============================================================
// app.js  -  Peta Leaflet + UI
// Logika graf/algoritma ada di algorithm.js (harus dimuat lebih dulu di index.html)
// Data gedung/ruangan ada di buildings.js (hanya untuk nama tampilan & UI tujuan)
// ============================================================

// 1. Inisialisasi Peta Leaflet (FMIPA UNIMED)
const map = L.map('map').setView([3.6074, 98.7143], 18);

let currentPolyline = null;
let startMarker = null;
let finishMarker = null;

// Data mentah dari routes.json dan graf tak berarah hasil buildGraph()
let routeDatabase = { nodes: {}, graph: {} };
let adj = null;

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
    // Ganti NAMA TAMPILAN gedung (mis. "Gedung Biologi (005)"). ID node & graph tidak berubah.
    if (typeof applyBuildingNames === 'function') applyBuildingNames(data);
    routeDatabase = data;
    validateDatabase(data);   // laporan masalah data ke console (edge satu arah, node terisolasi, dll.)
    adj = buildGraph(data);   // graf dua arah + bobot dalam meter
    if (typeof initDebugLayer === 'function') initDebugLayer(map, data);  // aktif hanya jika ?debug=1
    console.log("Data Graf berhasil dimuat:", routeDatabase);
  })
 .catch(error => {
  console.error("Error loading routes:", error);
  alert("Terjadi error saat memuat data peta:\n" + error.message);
});

// 3. Fungsi Pencarian Rute
// Mengembalikan true jika rute berhasil digambar, false jika gagal/ditolak.
function findRoute() {
  const start = document.getElementById('startNode').value;
  const target = document.getElementById('targetNode').value;

  if (!adj) {
    alert("Data peta belum siap atau gagal dimuat. Buka Console (F12) untuk melihat penyebabnya.");
    return false;
  }

  if (start === target) {
    alert("Gedung asal dan tujuan tidak boleh sama!");
    return false;
  }

  if (!routeDatabase.nodes[start] || !routeDatabase.nodes[target]) {
    alert("Titik gedung ini belum terdaftar di routes.json!");
    return false;
  }

  // Ganti ke `true` untuk memakai A* (hasil jarak sama, node yang diproses lebih sedikit)
  const result = shortestPath(adj, routeDatabase.nodes, start, target, false);
  const { path, distanceMeters } = result;

  if (path.length <= 1 || distanceMeters === Infinity) {
    alert("Jalur antar gedung ini belum terhubung di graf jalan!");
    return false;
  }

  console.log(
    `[${result.algorithm}] ${distanceMeters.toFixed(1)} m, ` +
    `${result.nodesProcessed} node diproses, ${result.timeMs.toFixed(3)} ms`
  );

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
  const meters = Math.round(distanceMeters);
  const minutes = Math.max(1, Math.round(walkingTimeSeconds(distanceMeters) / 60));
  document.getElementById('routeName').innerHTML = `${routeDatabase.nodes[start].name} <br>➔ ${routeDatabase.nodes[target].name}`;
  document.getElementById('totalDistance').textContent = `${meters} meter (± ${minutes} menit jalan kaki)`;
  document.getElementById('stats').style.display = 'block';
  return true;
}
