// ============================================================
// algorithm.js  -  logika graf & pencarian rute (tanpa DOM/Leaflet)
// Muat SEBELUM app.js:  <script src="algorithm.js"></script>
// ============================================================

// Haversine dalam METER (konsisten satu satuan di seluruh program)
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ------------------------------------------------------------
// 1. Normalisasi: ubah adjacency list jadi graf tak berarah
//    + hitung bobot edge sekali saja (bukan tiap iterasi).
//    Hasil: adj[u] = [{ to, w }, ...]  (w dalam meter)
// ------------------------------------------------------------
function buildGraph(db) {
  const { nodes, graph } = db;
  const adj = {};
  for (const id in nodes) adj[id] = new Map();

  for (const a in graph) {
    for (const b of graph[a]) {
      if (!nodes[a] || !nodes[b]) continue;        // abaikan referensi rusak
      const w = haversineMeters(nodes[a], nodes[b]);
      adj[a].set(b, w);
      adj[b].set(a, w);                            // paksa dua arah
    }
  }
  const result = {};
  for (const id in adj) {
    result[id] = [...adj[id]].map(([to, w]) => ({ to, w }));
  }
  return result;
}

// ------------------------------------------------------------
// 2. Validasi data (jalankan sekali saat load, hasil ke console)
// ------------------------------------------------------------
function validateDatabase(db) {
  const { nodes, graph } = db;
  const issues = [];

  for (const id in nodes) {
    if (!(id in graph)) issues.push(`Node "${id}" tidak punya entri di graph`);
  }
  for (const a in graph) {
    if (!nodes[a]) issues.push(`graph["${a}"] tidak ada di nodes`);
    for (const b of graph[a]) {
      if (!nodes[b]) issues.push(`"${a}" -> "${b}": tujuan tidak ada di nodes`);
      else if (!(graph[b] || []).includes(a))
        issues.push(`Edge satu arah: "${a}" -> "${b}" (tidak ada balikan)`);
    }
  }

  // Konektivitas: semua node harus terjangkau dari node pertama
  const ids = Object.keys(nodes);
  if (ids.length) {
    const adj = buildGraph(db);
    const seen = new Set([ids[0]]);
    const stack = [ids[0]];
    while (stack.length) {
      const u = stack.pop();
      for (const { to } of adj[u]) if (!seen.has(to)) { seen.add(to); stack.push(to); }
    }
    const lost = ids.filter(id => !seen.has(id));
    if (lost.length) issues.push(`Node terisolasi / graf terpecah: ${lost.join(', ')}`);
  }

  if (issues.length) console.warn(`[Validasi routes.json] ${issues.length} masalah:\n- ` + issues.join('\n- '));
  else console.log('[Validasi routes.json] OK: graf konsisten dan terhubung');
  return issues;
}

// ------------------------------------------------------------
// 3. Min-heap (priority queue) untuk Dijkstra / A*
// ------------------------------------------------------------
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item, pri) {
    const a = this.a;
    a.push({ item, pri });
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].pri <= a[i].pri) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l].pri < a[m].pri) m = l;
        if (r < a.length && a[r].pri < a[m].pri) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

// ------------------------------------------------------------
// 4. Pencarian rute: Dijkstra (heuristic = 0) dan A* (heuristic = Haversine)
//    Mengembalikan jalur, jarak (meter), urutan node yang dikunjungi,
//    jumlah node diproses, dan waktu eksekusi -> bahan perbandingan di laporan.
// ------------------------------------------------------------
function shortestPath(adj, nodes, start, target, useAStar = false) {
  const t0 = performance.now();
  const dist = {};
  const prev = {};
  for (const id in adj) { dist[id] = Infinity; prev[id] = null; }
  dist[start] = 0;

  const h = id => useAStar ? haversineMeters(nodes[id], nodes[target]) : 0;
  const heap = new MinHeap();
  heap.push(start, h(start));

  const closed = new Set();
  const visitedOrder = [];

  while (heap.size) {
    const { item: u } = heap.pop();
    if (closed.has(u)) continue;          // entri usang (lazy deletion)
    closed.add(u);
    visitedOrder.push(u);
    if (u === target) break;

    for (const { to, w } of adj[u]) {
      if (closed.has(to)) continue;
      const alt = dist[u] + w;
      if (alt < dist[to]) {
        dist[to] = alt;
        prev[to] = u;
        heap.push(to, alt + h(to));
      }
    }
  }

  const path = [];
  if (dist[target] !== Infinity) {
    for (let c = target; c !== null; c = prev[c]) path.unshift(c);
  }

  return {
    path,
    distanceMeters: dist[target],
    visitedOrder,
    nodesProcessed: visitedOrder.length,
    timeMs: performance.now() - t0,
    algorithm: useAStar ? 'A*' : 'Dijkstra'
  };
}

// Konversi jarak ke waktu tempuh (kecepatan jalan kaki default 1.3 m/s ≈ 4.7 km/jam)
function walkingTimeSeconds(meters, speedMs = 1.3) {
  return meters / speedMs;
}