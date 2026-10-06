// ============================================================
// ui.js - Peningkatan UI/UX (GPS, Animasi, Popup & Share Link)
// Tanpa mengubah algorithm.js & app.js
// ============================================================

let buildingMarkersGroup = L.layerGroup();
let pathAnimationGroup = L.layerGroup();
let baseTileLayers = {};

window.addEventListener('DOMContentLoaded', () => {
  setupUIEvents();
  
  // Tunggu data routes.json selesai dimuat di app.js
  const checkDataInterval = setInterval(() => {
    if (typeof routeDatabase !== 'undefined' && routeDatabase.nodes && Object.keys(routeDatabase.nodes).length > 0) {
      clearInterval(checkDataInterval);
      initUI();
    }
  }, 100);
});

function initUI() {
  setupBaseLayers();
  populateBuildingDropdowns();
  renderBuildingMarkers();
  checkUrlParamsAndAutoRoute();
}

// 1. Switch Layer Peta (Satelit & Street Map)
function setupBaseLayers() {
  const googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps'
  });

  const osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  });

  baseTileLayers = {
    "🌍 Satelit Google": googleSat,
    "🗺️ Street Map": osmStreet
  };

  L.control.layers(baseTileLayers, null, { position: 'topright' }).addTo(map);
}

// 2. Isikan Dropdown Gedung Otomatis (Hanya type === "building")
function populateBuildingDropdowns() {
  const startSelect = document.getElementById('startNode');
  const targetSelect = document.getElementById('targetNode');
  if (!startSelect || !targetSelect) return;

  startSelect.innerHTML = '';
  targetSelect.innerHTML = '';

  const buildings = Object.keys(routeDatabase.nodes)
    .filter(id => routeDatabase.nodes[id].type === 'building')
    .map(id => ({ id, ...routeDatabase.nodes[id] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  buildings.forEach((b) => {
    startSelect.add(new Option(b.name, b.id));
    targetSelect.add(new Option(b.name, b.id));
  });

  if (targetSelect.options.length > 1) {
    targetSelect.selectedIndex = 1;
  }
}

// 3. Render Custom Pin & Popup Gedung
function renderBuildingMarkers() {
  buildingMarkersGroup.clearLayers();

  Object.keys(routeDatabase.nodes).forEach(id => {
    const node = routeDatabase.nodes[id];
    if (node.type === 'building') {
      const marker = L.marker([node.lat, node.lng], {
        icon: L.divIcon({
          className: 'custom-building-pin',
          html: `<div class="pin-badge">🏢 <span>${node.name}</span></div>`,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        })
      });

      const popupContent = `
        <div class="popup-card-modern">
          <h4>${node.name}</h4>
          <p>Fakultas Matematika dan Ilmu Pengetahuan Alam</p>
          <div class="popup-actions">
            <button class="btn-pop-start" onclick="setAsLocation('${id}', 'start')">📍 Set Lokasi Awal</button>
            <button class="btn-pop-target" onclick="setAsLocation('${id}', 'target')">🎯 Set Tujuan</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      buildingMarkersGroup.addLayer(marker);
    }
  });

  buildingMarkersGroup.addTo(map);
}

function setAsLocation(id, type) {
  if (type === 'start') {
    document.getElementById('startNode').value = id;
  } else {
    document.getElementById('targetNode').value = id;
  }
  map.closePopup();
  if (typeof findRoute === 'function') findRoute();
}

function swapLocations() {
  const startSelect = document.getElementById('startNode');
  const targetSelect = document.getElementById('targetNode');
  const temp = startSelect.value;
  startSelect.value = targetSelect.value;
  targetSelect.value = temp;

  if (typeof findRoute === 'function') findRoute();
}

function setupUIEvents() {
  const swapBtn = document.getElementById('btnSwap');
  if (swapBtn) swapBtn.addEventListener('click', swapLocations);
}

// 4. Overwrite findRoute untuk Visual Rute Berpendar & Step-by-Step
const originalFindRoute = window.findRoute;
window.findRoute = function() {
  if (typeof originalFindRoute === 'function') {
    originalFindRoute();

    if (typeof currentPolyline !== 'undefined' && currentPolyline) {
      const latLngs = currentPolyline.getLatLngs();

      map.removeLayer(currentPolyline);
      pathAnimationGroup.clearLayers();

      // Garis Glow Belakang
      const glowLine = L.polyline(latLngs, {
        color: '#00f2fe',
        weight: 10,
        opacity: 0.4
      });

      // Garis Utama
      const mainLine = L.polyline(latLngs, {
        color: '#4facfe',
        weight: 5,
        opacity: 0.9,
        dashArray: '10, 10',
        dashOffset: '0'
      });

      pathAnimationGroup.addLayer(glowLine);
      pathAnimationGroup.addLayer(mainLine);
      pathAnimationGroup.addTo(map);

      // Render Pin Awal & Akhir Custom
      if (typeof startMarker !== 'undefined' && startMarker) map.removeLayer(startMarker);
      if (typeof finishMarker !== 'undefined' && finishMarker) map.removeLayer(finishMarker);

      startMarker = L.marker(latLngs[0], {
        icon: L.divIcon({
          className: 'route-flag-pin start-pin',
          html: '🟢 START',
          iconSize: [70, 26]
        })
      }).addTo(map);

      finishMarker = L.marker(latLngs[latLngs.length - 1], {
        icon: L.divIcon({
          className: 'route-flag-pin finish-pin',
          html: '🏁 FINISH',
          iconSize: [70, 26]
        })
      }).addTo(map);

      renderNavigationSteps(latLngs);
    }
  }
};

// Generasi Langkah Belokan / Waypoint
function renderNavigationSteps(latLngs) {
  const stepsContainer = document.getElementById('stepsList');
  if (!stepsContainer) return;

  stepsContainer.innerHTML = '';
  
  const startId = document.getElementById('startNode').value;
  const targetId = document.getElementById('targetNode').value;

  const startName = routeDatabase.nodes[startId]?.name || 'Lokasi Awal';
  const targetName = routeDatabase.nodes[targetId]?.name || 'Tujuan';

  let html = `
    <div class="step-item start">
      <span class="step-icon">🟢</span>
      <div class="step-text">Mulai dari <b>${startName}</b></div>
    </div>
    <div class="step-item walk">
      <span class="step-icon">🚶</span>
      <div class="step-text">Ikuti rute pedestrian sejauh <b>${document.getElementById('totalDistance').textContent}</b></div>
    </div>
    <div class="step-item finish">
      <span class="step-icon">🏁</span>
      <div class="step-text">Tiba di <b>${targetName}</b></div>
    </div>
  `;

  stepsContainer.innerHTML = html;
}

// 5. Fitur GPS: Cari Gedung Terdekat
function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolokasi tidak didukung oleh browser Anda.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      let nearestBuildingId = null;
      let minDistance = Infinity;

      Object.keys(routeDatabase.nodes).forEach(id => {
        const node = routeDatabase.nodes[id];
        if (node.type === 'building') {
          const dist = haversineMeters({ lat: userLat, lng: userLng }, node);
          if (dist < minDistance) {
            minDistance = dist;
            nearestBuildingId = id;
          }
        }
      });

      if (nearestBuildingId) {
        document.getElementById('startNode').value = nearestBuildingId;
        alert(`Lokasi awal diatur ke gedung terdekat: ${routeDatabase.nodes[nearestBuildingId].name} (${Math.round(minDistance)} m dari lokasi Anda)`);
        if (typeof findRoute === 'function') findRoute();
      }
    },
    (error) => {
      alert("Gagal mendapatkan lokasi GPS: " + error.message);
    }
  );
}

// 6. Fitur Bagikan Link Rute
function copyShareableLink() {
  const start = document.getElementById('startNode').value;
  const target = document.getElementById('targetNode').value;
  const url = `${window.location.origin}${window.location.pathname}?start=${start}&target=${target}`;

  navigator.clipboard.writeText(url).then(() => {
    alert("Link rute berhasil disalin ke clipboard!");
  });
}

// Auto-Run Rute dari Parameter URL
function checkUrlParamsAndAutoRoute() {
  const urlParams = new URLSearchParams(window.location.search);
  const startParam = urlParams.get('start');
  const targetParam = urlParams.get('target');

  if (startParam && targetParam && routeDatabase.nodes[startParam] && routeDatabase.nodes[targetParam]) {
    document.getElementById('startNode').value = startParam;
    document.getElementById('targetNode').value = targetParam;
    if (typeof findRoute === 'function') findRoute();
  }
}