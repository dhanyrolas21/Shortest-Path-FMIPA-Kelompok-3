// ============================================================
// ui.js - Peningkatan UI/UX (GPS, Animasi, Popup, Share Link)
// + Pemilihan tujuan: Gedung -> Lantai -> Ruangan
// Tanpa mengubah algorithm.js. Ruangan BUKAN node graph:
// rute selalu menuju node gedung (nilai #targetNode = ID node routes.json).
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

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

// 2. Dropdown Gedung (titik berangkat & gedung tujuan) - hanya type === "building"
function populateBuildingDropdowns() {
  const startSelect = document.getElementById('startNode');
  const targetSelect = document.getElementById('targetNode');
  if (!startSelect || !targetSelect) return;

  startSelect.innerHTML = '';
  targetSelect.innerHTML = '';
  startSelect.add(new Option('— Pilih titik berangkat —', ''));
  targetSelect.add(new Option('— Pilih gedung tujuan —', ''));

  const buildings = Object.keys(routeDatabase.nodes)
    .filter(id => routeDatabase.nodes[id].type === 'building')
    .map(id => ({ id, ...routeDatabase.nodes[id] }))
    .sort((a, b) => a.name.localeCompare(b.name, 'id', { numeric: true }));

  buildings.forEach((b) => {
    startSelect.add(new Option(b.name, b.id));
    targetSelect.add(new Option(b.name, b.id));
  });
}

// ------------------------------------------------------------
// Tujuan: Gedung -> Lantai -> Ruangan
// ------------------------------------------------------------
function showEl(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden', !show);
}

function showFormMsg(text) {
  const el = document.getElementById('formMsg');
  if (el) el.textContent = text || '';
}

function currentTargetBuilding() {
  const id = document.getElementById('targetNode').value;
  return id && typeof getBuildingData === 'function' ? getBuildingData(id) : null;
}

function getSelectedRoom() {
  const b = currentTargetBuilding();
  const val = document.getElementById('targetRoom').value;
  if (!b || val === '') return null;
  return b.rooms[Number(val)] || null;
}

// Dipanggil saat gedung tujuan berubah
function onTargetBuildingChange() {
  const floorSel = document.getElementById('targetFloor');
  const roomSel = document.getElementById('targetRoom');
  floorSel.innerHTML = '';
  roomSel.innerHTML = '';
  roomSel.disabled = true;
  showFormMsg('');

  const nodeId = document.getElementById('targetNode').value;
  if (!nodeId) {
    showEl('destDetail', false);
    showEl('noRoomMsg', false);
    updateDestInfo();
    return;
  }

  const b = currentTargetBuilding();
  if (!b || b.rooms.length === 0) {
    // Gedung belum punya data ruangan: jangan buat pilihan palsu
    showEl('destDetail', false);
    showEl('noRoomMsg', true);
  } else {
    showEl('noRoomMsg', false);
    showEl('destDetail', true);
    floorSel.add(new Option('— Pilih lantai —', ''));
    b.floors.forEach(f => floorSel.add(new Option('Lantai ' + f, String(f))));
    roomSel.add(new Option('— Pilih lantai dulu —', ''));
  }
  updateDestInfo();
}

// Dipanggil saat lantai berubah: tampilkan hanya ruangan di lantai itu
function onFloorChange() {
  const b = currentTargetBuilding();
  const roomSel = document.getElementById('targetRoom');
  const floorVal = document.getElementById('targetFloor').value;
  roomSel.innerHTML = '';
  showFormMsg('');

  if (!b || floorVal === '') {
    roomSel.add(new Option('— Pilih lantai dulu —', ''));
    roomSel.disabled = true;
    updateDestInfo();
    return;
  }

  const rooms = b.rooms
    .filter(r => r.floor === Number(floorVal))
    .slice()
    .sort((x, y) => x.label.localeCompare(y.label, 'id', { numeric: true }));

  // Beri penanda bila ada label yang persis sama pada lantai yang sama
  const seen = {};
  const total = {};
  rooms.forEach(r => { total[r.label] = (total[r.label] || 0) + 1; });

  roomSel.add(new Option('— Pilih ruangan —', ''));
  rooms.forEach(r => {
    let text = r.label;
    if (total[r.label] > 1) {
      seen[r.label] = (seen[r.label] || 0) + 1;
      text += ' (data ' + seen[r.label] + ')';
    }
    roomSel.add(new Option(text, String(r.index)));
  });
  roomSel.disabled = false;
  updateDestInfo();
}

function onRoomChange() {
  showFormMsg('');
  updateDestInfo();
}

function roomSummaryText(room) {
  const parts = ['Lantai ' + room.floor];
  if (room.name) parts.push(room.name);
  if (room.roomNumber) parts.push('Nomor ' + room.roomNumber);
  return parts.join(' · ');
}

// Kartu informasi tujuan: hanya menampilkan field yang tersedia
function updateDestInfo() {
  const box = document.getElementById('destInfo');
  if (!box) return;

  const b = currentTargetBuilding();
  if (!b) {
    box.innerHTML = '';
    showEl('destInfo', false);
    return;
  }

  const room = getSelectedRoom();
  let rows = '';
  if (room) {
    const row = (k, v) => `<li><span>${k}</span><b>${esc(v)}</b></li>`;
    rows += row('Lantai', room.floor);
    if (room.name) rows += row('Nama Ruangan', room.name);
    if (room.roomNumber) rows += row('Nomor Ruangan', room.roomNumber);
    if (room.code) rows += row('Kode Ruangan', room.code);
  }

  box.innerHTML =
    `<div class="dest-info-title">🏢 ${esc(b.label)}</div>` +
    (rows ? `<ul class="dest-info-list">${rows}</ul>` : '');
  showEl('destInfo', true);
}

// Validasi sebelum rute dicari. Pesan tampil di bawah form (tanpa popup).
function validateInputs() {
  const start = document.getElementById('startNode').value;
  const target = document.getElementById('targetNode').value;

  if (!start) { showFormMsg('Pilih titik berangkat terlebih dahulu.'); return false; }
  if (!target) { showFormMsg('Pilih gedung tujuan terlebih dahulu.'); return false; }

  const b = currentTargetBuilding();
  if (!window.__skipRoomCheck && b && b.rooms.length > 0) {
    if (document.getElementById('targetFloor').value === '') {
      showFormMsg('Pilih lantai tujuan terlebih dahulu.');
      return false;
    }
    if (!getSelectedRoom()) {
      showFormMsg('Pilih ruangan tujuan terlebih dahulu.');
      return false;
    }
  }
  showFormMsg('');
  return true;
}

function setTargetBuilding(nodeId) {
  document.getElementById('targetNode').value = nodeId || '';
  onTargetBuildingChange();
}

function tryAutoRoute() {
  if (validateInputs() && typeof findRoute === 'function') findRoute();
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
          html: `<div class="pin-badge">🏢 <span>${esc(node.name)}</span></div>`,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        })
      });

      const popupContent = `
        <div class="popup-card-modern">
          <h4>${esc(node.name)}</h4>
          <p>Fakultas Matematika dan Ilmu Pengetahuan Alam</p>
          <div class="popup-actions">
            <button class="btn-pop-start" onclick="setAsLocation('${id}', 'start')">📍 Set Titik Berangkat</button>
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
    showFormMsg('');
  } else {
    setTargetBuilding(id);
  }
  map.closePopup();
  tryAutoRoute();
}

function swapLocations() {
  const startSelect = document.getElementById('startNode');
  const targetSelect = document.getElementById('targetNode');
  const oldStart = startSelect.value;
  const oldTarget = targetSelect.value;

  startSelect.value = oldTarget;
  setTargetBuilding(oldStart);   // pilihan lantai/ruangan direset

  tryAutoRoute();
}

function setupUIEvents() {
  const swapBtn = document.getElementById('btnSwap');
  if (swapBtn) swapBtn.addEventListener('click', swapLocations);

  const startSel = document.getElementById('startNode');
  if (startSel) startSel.addEventListener('change', () => showFormMsg(''));

  const targetSel = document.getElementById('targetNode');
  if (targetSel) targetSel.addEventListener('change', onTargetBuildingChange);

  const floorSel = document.getElementById('targetFloor');
  if (floorSel) floorSel.addEventListener('change', onFloorChange);

  const roomSel = document.getElementById('targetRoom');
  if (roomSel) roomSel.addEventListener('change', onRoomChange);
}

// 4. Overwrite findRoute untuk validasi tujuan + Visual Rute Berpendar & Step-by-Step
const originalFindRoute = window.findRoute;
window.findRoute = function() {
  if (!validateInputs()) return;

  if (typeof originalFindRoute === 'function') {
    const ok = originalFindRoute();
    if (ok === false) return;   // rute gagal/ditolak: jangan render ulang rute lama

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

      // Detail ruangan tujuan di judul rute
      const room = getSelectedRoom();
      if (room) {
        const title = document.getElementById('routeName');
        if (title) title.innerHTML += `<br><small class="route-room">${esc(roomSummaryText(room))}</small>`;
      }
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
  const room = getSelectedRoom();

  let html = `
    <div class="step-item start">
      <span class="step-icon">🟢</span>
      <div class="step-text">Mulai dari <b>${esc(startName)}</b></div>
    </div>
    <div class="step-item walk">
      <span class="step-icon">🚶</span>
      <div class="step-text">Ikuti rute pedestrian sejauh <b>${esc(document.getElementById('totalDistance').textContent)}</b></div>
    </div>
    <div class="step-item finish">
      <span class="step-icon">🏁</span>
      <div class="step-text">Tiba di <b>${esc(targetName)}</b></div>
    </div>
  `;

  if (room) {
    html += `
    <div class="step-item room">
      <span class="step-icon">🚪</span>
      <div class="step-text">Menuju <b>${esc(roomSummaryText(room))}</b></div>
    </div>
  `;
  }

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
        showFormMsg('');
        alert(`Titik berangkat diatur ke gedung terdekat: ${routeDatabase.nodes[nearestBuildingId].name} (${Math.round(minDistance)} m dari lokasi Anda)`);
        tryAutoRoute();
      }
    },
    (error) => {
      alert("Gagal mendapatkan lokasi GPS: " + error.message);
    }
  );
}

// 6. Fitur Bagikan Link Rute (opsional &room=<nomor urut data ruangan>)
function copyShareableLink() {
  const start = document.getElementById('startNode').value;
  const target = document.getElementById('targetNode').value;
  const room = getSelectedRoom();
  let url = `${window.location.origin}${window.location.pathname}?start=${encodeURIComponent(start)}&target=${encodeURIComponent(target)}`;
  if (room) url += `&room=${room.index}`;

  navigator.clipboard.writeText(url).then(() => {
    alert("Link rute berhasil disalin ke clipboard!");
  });
}

// Auto-Run Rute dari Parameter URL (link lama tanpa &room tetap berfungsi)
function checkUrlParamsAndAutoRoute() {
  const urlParams = new URLSearchParams(window.location.search);
  const startParam = urlParams.get('start');
  const targetParam = urlParams.get('target');
  const roomParam = urlParams.get('room');

  if (startParam && targetParam && routeDatabase.nodes[startParam] && routeDatabase.nodes[targetParam]) {
    document.getElementById('startNode').value = startParam;
    setTargetBuilding(targetParam);

    let hasRoom = false;
    const b = currentTargetBuilding();
    if (b && roomParam !== null && /^\d+$/.test(roomParam) && b.rooms[Number(roomParam)]) {
      const r = b.rooms[Number(roomParam)];
      document.getElementById('targetFloor').value = String(r.floor);
      onFloorChange();
      document.getElementById('targetRoom').value = String(r.index);
      onRoomChange();
      hasRoom = true;
    }

    // Link lama (tanpa room) tetap langsung merutekan ke gedung
    window.__skipRoomCheck = !hasRoom;
    try {
      if (typeof findRoute === 'function') findRoute();
    } finally {
      window.__skipRoomCheck = false;
    }
  }
}
