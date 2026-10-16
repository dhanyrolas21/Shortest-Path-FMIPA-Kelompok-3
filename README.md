# 🗺️ Navigasi Rute Terpendek FMIPA UNIMED (Dijkstra Pathfinding)

Aplikasi web navigasi interaktif berbasis peta geospatial untuk menentukan dan memetakan rute jalan kaki terpendek (*shortest path*) antar gedung serta ruangan di lingkungan Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA) Universitas Negeri Medan (UNIMED).

Aplikasi ini mengimplementasikan **Algoritma Dijkstra** berbasis **Min-Heap (Priority Queue)** untuk menghitung jarak paling optimal berdasarkan koordinat latitude & longitude geografis nyata, memandu pengguna melewati jalur pedestrian, koridor, dan persimpangan tanpa memotong bangunan gedung.

---

## 📌 Fitur Utama

- **Navigasi Presisi Pedestrian:** Jalur rute dipaksa mengikuti persimpangan (*junction waypoints*) dan koridor pedestrian nyata.
- **Navigasi Detail Ruangan (Gedung ➔ Lantai ➔ Ruangan):** Mendukung pemilihan tujuan spesifik hingga ke nomor lantai dan ruangan di dalam gedung.
- **Perhitungan Rute Terpendek (Dijkstra):** Menggunakan algoritma Dijkstra teroptimasi dengan bobot Euclidean/Haversine murni dalam satuan meter.
- **Peta Interaktif & Switcher Layer:** Pilihan tampilan peta Satelit Google dan OpenStreetMap Street View menggunakan pustaka Leaflet.js.
- **Populasi Dropdown Dinamis:** Pilihan gedung asal dan tujuan diisi secara otomatis dari `routes.json` dengan menyaring hanya node bertipe `building`.
- **Fitur GPS Geolocation (🎯 Lokasi Saya):** Mendeteksi koordinat GPS pengguna secara *real-time* dan memilih gedung FMIPA terdekat sebagai titik keberangkatan.
- **Fitur Bagikan Link Rute (🔗 Shareable Link):** Menyalin tautan rute dinamis (URL Parameter `?start=X&target=Y&room=Z`) sehingga rute navigasi dapat dibuka dan dimuat secara otomatis oleh pengguna lain.
- **Visualisasi Garis Rute Berpendar (Glow Polyline):** Visualisasi rute dengan efek garis berpendar (*glowing line*) serta penanda posisi *START* (hijau) dan *FINISH* (merah).
- **Marker & Popup Interaktif:** Klik marker gedung mana saja di peta untuk memilihnya langsung sebagai titik asal atau tujuan.
- **Petunjuk Arah Jalan Kaki:** Panel instruksi navigasi *step-by-step* dari titik awal hingga lokasi tujuan beserta estimasi waktu tempuh (kecepatan rata-rata 1.3 m/s).
- **Mode Debug Graf (?debug=1):** Fitur inspeksi geometri graf untuk memeriksa *edge* berpotongan, *near-misses*, atau jarak persimpangan yang terlalu panjang secara visual.

---

## 🏗️ Arsitektur Kode Modular & Fungsi Berkas

Proyek ini menerapkan prinsip *Separation of Concerns* secara ketat agar logika algoritma, database graf, peta Leaflet, serta antarmuka UI terisolasi dengan rapi:

```text
├── index.html       # Antarmuka dasar HTML & kontainer peta
├── style.css        # Tata letak & gaya visual modern (Dark Slate Theme)
├── routes.json      # Database node (gedung & simpang) + adjacency list
├── buildings.js     # Data spasial & inventaris ruangan internal gedung
├── algorithm.js     # Logika graf murni, Haversine, Min-Heap, & Dijkstra
├── app.js           # Pengendali utama Leaflet & eksekusi pencarian rute
├── ui.js            # Interaktivitas UI (GPS, Share Link, Popup, Dropdown, & Steps)
└── debug.js         # Mode verifikasi graf geospatial (opsional via ?debug=1)


💾 Struktur Data Graf (routes.json)
Data lokasi dan koneksi dikelola dalam berkas routes.json yang terdiri dari dua komponen utama:

nodes: Berisi nama tempat beserta koordinat GPS (lat, lng) untuk:

13 Gedung Utama: Gedung Matematika, Biologi, Kimia, Fisika, Bilingual, Gedung 12, Gedung Syawal, Kantin FMIPA, Lab Kimia, Lab Biologi, Lab Fisika, Gedung Ilmu Komputer, dan Tanaman Biologi.

Waypoint Persimpangan (simpang_): Titik belokan di jalan kaki/koridor pedestrian (simpang_1, simpang_syawal, dll.).

graph: Adjacency List (Daftar Ketetanggaan) yang mendefinisikan hubungan koneksi langsung dua arah (undirected graph) antar-titik gedung dan persimpangan.


🚀 Pemasangan & Penggunaan Lokal
Clone Repositori:

Bash
git clone [https://github.com/dhanyrolas21/Shortest-Path-FMIPA-Kelompok-3.git](https://github.com/dhanyrolas21/Shortest-Path-FMIPA-Kelompok-3.git)
cd Shortest-Path-FMIPA-Kelompok-3

Tugas Project Matematika Diskrit.

Tim Pengembang
Kelompok 3 - Ilmu Komputer UNIMED
1. Dhany Rolas
2. Gandi Armana Tarigan
3. Keegan Gibran Jehian
4. Samuel Jacksen Brahmana
5. Revaldo Ginting
6. Yesy Pelita