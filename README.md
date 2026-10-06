# 🗺️ Navigasi Rute Terpendek FMIPA UNIMED (Dijkstra Pathfinding)

Aplikasi web navigasi interaktif berbasis peta geospatial untuk menentukan dan memetakan rute jalan kaki terpendek (*shortest path*) antar gedung di lingkungan Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA) Universitas Negeri Medan (UNIMED).

Aplikasi ini dirancang menggunakan **Algoritma Dijkstra** untuk menghitung jarak efektif antarnode dan memandu pengguna melewati jalur pedestrian, koridor, dan persimpangan nyata tanpa memotong/menembus bangunan gedung.

---

## 📌 Fitur Utama

- **Navigasi Presisi Pedestrian:** Jalur rute dipaksa mengikuti persimpangan (*junction waypoints*) dan koridor pedestrian nyata.
- **Perhitungan Rute Terpendek (Dijkstra):** Menggunakan algoritma Dijkstra teroptimasi dengan bobot Euclidean/Haversine murni dalam satuan meter.
- **Peta Interaktif & Switcher Layer:** Pilihan tampilan peta Satelit Google dan OpenStreetMap Street View menggunakan pustaka Leaflet.js.
- **Populasi Dropdown Dinamis:** Pilihan gedung asal dan tujuan diisi secara otomatis dari `routes.json` dengan menyaring hanya node bertipe `building`.
- **Fitur GPS Geolocation (🎯 Lokasi Saya):** Mendeteksi koordinat GPS pengguna secara *real-time* dan memilih gedung FMIPA terdekat sebagai titik keberangkatan.
- **Fitur Bagikan Link Rute (🔗 Shareable Link):** Menyalin tautan rute dinamis (URL Parameter) sehingga rute navigasi dapat dibuka dan dimuat secara otomatis oleh pengguna lain.
- **Visualisasi Garis Rute Berpendar (Glow Polyline):** Visualisasi rute dengan efek garis berpendar (*glowing line*) serta penanda posisi *START* (hijau) dan *FINISH* (merah).
- **Marker & Popup Interaktif:** Klik marker gedung mana saja di peta untuk memilihnya langsung sebagai titik asal atau tujuan.
- **Petunjuk Arah Jalan Kaki:** Panel instruksi navigasi *step-by-step* dari titik awal hingga lokasi tujuan beserta estimasi waktu tempuh (kecepatan rata-rata 1.3 m/s).
- **Mode Debug Graf (?debug=1):** Fitur inspeksi geometri graf untuk memeriksa *edge* berpotongan, *near-misses*, atau jarak persimpangan yang terlalu panjang secara visual.

---

## 🏗️ Arsitektur Kode Modular

Proyek ini menggunakan prinsip pemisahan tanggung jawab (*Separation of Concerns*) secara ketat agar logika algoritma dan UI terisolasi dengan rapi:

```text
├── index.html       # Antarmuka dasar HTML & kontainer peta
├── style.css        # Tata letak UI/UX modern (Dark Slate Theme)
├── routes.json      # Database node (gedung & simpang) + adjacency list
├── algorithm.js     # Logika graf murni, Haversine, Min-Heap, & Dijkstra
├── app.js           # Pengendali utama Leaflet & eksekusi pencarian rute
├── ui.js            # Interaktivitas UI (GPS, Share Link, Popup, & Steps)
└── debug.js         # Mode verifikasi graf geospatial (opsional via ?debug=1)

---

## 🏗️ Struktur Data Graf (`routes.json`)

Data lokasi dan koneksi dikelola dalam file `routes.json` yang terdiri dari dua komponen utama:

1. **`nodes`**: Berisi nama tempat beserta koordinat GPS (`lat`, `lng`) untuk:
   - **13 Gedung Utama:** *Gedung Matematika, Biologi, Kimia, Fisika, Billingual, Gedung 12, Gedung Syawal, Kantin FMIPA, Lab Kimia, Lab Biologi, Lab Fisika, Gedung Ilmu Komputer, dan Tanaman Biologi.*
   - **Waypoint Persimpangan (`simpang_`):** Titik belokan di jalan kaki/koridor pedestrian (termasuk titik penyesuaian khusus seperti `Simpang 45`, `Simpang 46`, `Simpang 47`, dan `Simpang 48`).

2. **`graph`**: *Adjacency List* (Daftar Ketetanggaan) yang mendefinisikan hubungan koneksi langsung dua arah antara titik gedung dan persimpangan.

---

## 🚀 Pemasangan & Penggunaan Lokal

1. **Clone Repositori (Private / Public):**
   ```bash
   git clone [https://github.com/dhanyrolas21/Shortest-Path-FMIPA-Kelompok-3.git](https://github.com/dhanyrolas21/Shortest-Path-FMIPA-Kelompok-3.git)
   cd Shortest-Path-FMIPA-Kelompok-3

 👥 Tim Pengembang
Kelompok 3 - Ilmu Komputer UNIMED