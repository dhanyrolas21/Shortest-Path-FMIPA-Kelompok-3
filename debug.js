// ============================================================
// debug.js  -  Mode verifikasi graf di atas peta
// Aktif hanya jika alamat memakai ?debug=1  (contoh: index.html?debug=1)
// Perlu: algorithm.js (haversineMeters) dan Leaflet. Muat SETELAH algorithm.js.
// ============================================================

const DEBUG_MODE = typeof location !== 'undefined' &&
                   new URLSearchParams(location.search).has('debug');

// Ambang pemeriksaan (meter) - ubah sesuai kebutuhan
const DEBUG_LONG_EDGE_M = 45;   // edge lebih panjang dari ini ditandai "panjang"
const DEBUG_NEAR_NODE_M = 3;    // node sedekat ini dari edge lain (tapi tak terhubung) ditandai

// ------------------------------------------------------------
// ANALISIS (fungsi murni, tanpa Leaflet -> bisa diuji di Node)
// ------------------------------------------------------------
function analyzeGraph(db) {
  const ids = Object.keys(db.nodes);
  if (!ids.length) return { edges: [], long: [], crossings: [], nearMisses: [] };

  // Proyeksi datar ke meter (cukup akurat untuk area kampus)
  const lat0 = db.nodes[ids[0]].lat, lng0 = db.nodes[ids[0]].lng;
  const kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 110540;
  const P = {};
  for (const id of ids) {
    P[id] = { x: (db.nodes[id].lng - lng0) * kx, y: (db.nodes[id].lat - lat0) * ky };
  }

  // Daftar edge unik (tak berarah)
  const seen = new Set(), edges = [];
  for (const a in db.graph) {
    for (const b of db.graph[a]) {
      if (!db.nodes[a] || !db.nodes[b]) continue;
      const key = a < b ? a + '|' + b : b + '|' + a;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a, b, len: haversineMeters(db.nodes[a], db.nodes[b]) });
    }
  }

  const cross = (o, p, q) => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);

  // 1. Edge yang saling berpotongan padahal tidak berbagi simpul
  const crossings = [];
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e = edges[i], f = edges[j];
      if (e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) continue;
      const A = P[e.a], B = P[e.b], C = P[f.a], D = P[f.b];
      const d1 = cross(A, B, C), d2 = cross(A, B, D);
      const d3 = cross(C, D, A), d4 = cross(C, D, B);
      if (d1 * d2 < 0 && d3 * d4 < 0) crossings.push([e, f]);
    }
  }

  // 2. Node yang "menempel" pada edge lain tetapi tidak terhubung dengannya
  const nearMisses = [];
  for (const e of edges) {
    const A = P[e.a], B = P[e.b];
    const dx = B.x - A.x, dy = B.y - A.y, len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    for (const id of ids) {
      if (id === e.a || id === e.b) continue;
      const Q = P[id];
      const t = ((Q.x - A.x) * dx + (Q.y - A.y) * dy) / len2;
      if (t <= 0 || t >= 1) continue;
      const dist = Math.hypot(Q.x - (A.x + t * dx), Q.y - (A.y + t * dy));
      if (dist < DEBUG_NEAR_NODE_M) nearMisses.push({ node: id, edge: e, dist });
    }
  }

  const long = edges.filter(e => e.len > DEBUG_LONG_EDGE_M).sort((x, y) => y.len - x.len);
  return { edges, long, crossings, nearMisses };
}

// ------------------------------------------------------------
// TAMPILAN DI PETA
// ------------------------------------------------------------
function initDebugLayer(map, db) {
  if (!DEBUG_MODE) return;

  const report = analyzeGraph(db);
  const flaggedEdges = new Set();
  report.long.forEach(e => flaggedEdges.add(e.a + '|' + e.b));
  report.crossings.forEach(([e, f]) => { flaggedEdges.add(e.a + '|' + e.b); flaggedEdges.add(f.a + '|' + f.b); });
  const nearNodes = new Set(report.nearMisses.map(m => m.node));

  const colorFor = len => len > DEBUG_LONG_EDGE_M ? '#e74c3c' : len > 25 ? '#f39c12' : '#2ecc71';
  const ll = id => [db.nodes[id].lat, db.nodes[id].lng];
  const nodeColor = n => n.type === 'building' ? '#3498db' : '#ffffff';

  const edgeLayer = L.layerGroup();
  const nodeLayer = L.layerGroup();
  const labelLayer = L.layerGroup();
  const problemLayer = L.layerGroup();

  // Edge: hijau <=25 m, oranye 25-45 m, merah >45 m
  for (const e of report.edges) {
    L.polyline([ll(e.a), ll(e.b)], { color: colorFor(e.len), weight: 3, opacity: 0.9 })
      .bindPopup(`<b>${db.nodes[e.a].name}</b> ↔ <b>${db.nodes[e.b].name}</b><br>${e.len.toFixed(1)} m<br><code>${e.a} ↔ ${e.b}</code>`)
      .addTo(edgeLayer);
  }

  // Node: biru = gedung, putih = simpang/waypoint
  for (const id in db.nodes) {
    const n = db.nodes[id];
    const neighbors = (db.graph[id] || []).join(', ');
    L.circleMarker(ll(id), {
      radius: n.type === 'building' ? 7 : 5,
      fillColor: nodeColor(n), color: '#000', weight: 1.5, fillOpacity: 1
    }).bindPopup(
      `<b>${n.name}</b> (${n.type || '-'})<br><code>${id}</code><br>` +
      `${n.lat}, ${n.lng}<br><small>Tetangga: ${neighbors}</small>`
    ).addTo(nodeLayer);

    L.circleMarker(ll(id), { radius: 1, opacity: 0, fillOpacity: 0 })
      .bindTooltip(id, { permanent: true, direction: 'top', offset: [0, -4], className: 'dbg-label' })
      .addTo(labelLayer);
  }

  // Penanda masalah: edge berpotongan (garis putus magenta) dan node menempel (cincin kuning)
  for (const [e, f] of report.crossings) {
    for (const x of [e, f]) {
      L.polyline([ll(x.a), ll(x.b)], { color: '#ff00ff', weight: 5, dashArray: '6 6' })
        .bindPopup(`Berpotongan: ${x.a} ↔ ${x.b}`).addTo(problemLayer);
    }
  }
  for (const m of report.nearMisses) {
    L.circle(ll(m.node), { radius: 4, color: '#f1c40f', weight: 3, fillOpacity: 0 })
      .bindPopup(`<code>${m.node}</code> hanya ${m.dist.toFixed(1)} m dari edge ${m.edge.a} ↔ ${m.edge.b} tetapi tidak terhubung`)
      .addTo(problemLayer);
  }

  edgeLayer.addTo(map);
  nodeLayer.addTo(map);
  problemLayer.addTo(map);
  L.control.layers(null, {
    'Edge (jalur)': edgeLayer,
    'Node': nodeLayer,
    'Label ID': labelLayer,
    'Penanda masalah': problemLayer
  }, { collapsed: false, position: 'topright' }).addTo(map);

  // Gaya kecil khusus debug (disuntik lewat JS agar style.css tidak perlu diubah)
  const css = document.createElement('style');
  css.textContent = `
    .dbg-label{background:rgba(0,0,0,.65);color:#fff;border:0;box-shadow:none;font-size:10px;padding:1px 4px}
    .dbg-panel{background:#fff;color:#222;padding:10px 12px;border-radius:6px;max-width:300px;
      max-height:55vh;overflow:auto;font:12px/1.4 'Segoe UI',sans-serif;box-shadow:0 1px 6px rgba(0,0,0,.4)}
    .dbg-panel h4{margin:0 0 6px;font-size:13px}
    .dbg-panel button{display:block;width:100%;text-align:left;margin:2px 0;padding:3px 6px;
      border:1px solid #ccc;border-radius:4px;background:#f7f7f7;cursor:pointer;font-size:11px}
    .dbg-panel button:hover{background:#e8f0fe}
    .dbg-ok{color:#27ae60;font-weight:600}
  `;
  document.head.appendChild(css);

  // Panel ringkasan: klik item untuk terbang ke lokasi masalah
  const panel = L.control({ position: 'bottomright' });
  panel.onAdd = () => {
    const div = L.DomUtil.create('div', 'dbg-panel');
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    const items = [];
    report.crossings.forEach(([e, f]) => items.push({
      label: `✖ Berpotongan: ${e.a}↔${e.b} × ${f.a}↔${f.b}`,
      bounds: L.latLngBounds([ll(e.a), ll(e.b), ll(f.a), ll(f.b)])
    }));
    report.nearMisses.forEach(m => items.push({
      label: `◎ ${m.node} menempel ke ${m.edge.a}↔${m.edge.b} (${m.dist.toFixed(1)} m)`,
      bounds: L.latLngBounds([ll(m.node), ll(m.edge.a), ll(m.edge.b)])
    }));
    report.long.forEach(e => items.push({
      label: `↔ Panjang ${e.len.toFixed(0)} m: ${e.a}↔${e.b}`,
      bounds: L.latLngBounds([ll(e.a), ll(e.b)])
    }));

    div.innerHTML = `<h4>Debug graf</h4>
      ${report.edges.length} edge, ${Object.keys(db.nodes).length} node<br>
      Berpotongan: <b>${report.crossings.length}</b> · Node menempel: <b>${report.nearMisses.length}</b> ·
      Panjang &gt;${DEBUG_LONG_EDGE_M} m: <b>${report.long.length}</b>
      <div style="margin:4px 0;font-size:11px;color:#555">Hijau ≤25 m, oranye 25–45 m, merah &gt;45 m.
      Bandingkan setiap garis dengan jalan di citra satelit.</div>`;

    if (!items.length) {
      div.insertAdjacentHTML('beforeend', '<div class="dbg-ok">Tidak ada kejanggalan geometri.</div>');
    }
    items.forEach(it => {
      const btn = L.DomUtil.create('button', '', div);
      btn.textContent = it.label;
      btn.onclick = () => map.fitBounds(it.bounds, { padding: [80, 80], maxZoom: 20 });
    });
    return div;
  };
  panel.addTo(map);

  console.log('[Debug graf]', report);
}