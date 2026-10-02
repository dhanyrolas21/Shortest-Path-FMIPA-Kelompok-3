# 🗺️ Navigasi Rute Terpendek FMIPA UNIMED (Dijkstra Pathfinding)

Aplikasi web navigasi interaktif berbasis peta geospatial untuk menentukan dan memetakan rute jalan kaki terpendek (*shortest path*) antar gedung di lingkungan Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA) Universitas Negeri Medan (UNIMED).

Aplikasi ini dirancang menggunakan **Algoritma Dijkstra** untuk menghitung jarak efektif antarnode dan memandu pengguna melewati jalur pedestrian, koridor, dan persimpangan nyata tanpa memotong/menembus bangunan gedung.

---

## 📌 Fitur Utama

- **Navigasi Presisi Pedestrian:** Jalur rute dipaksa mengikuti persimpangan (*junction waypoints*) dan koridor pedestrian (seperti koridor utama Gedung Prof. Dr. Syawal Gultom, M.Pd.).
- **Perhitungan Rute Terpendek:** Mengimplementasikan **Algoritma Dijkstra** untuk mencari jarak paling optimal berdasarkan koordinat latitude & longitude geografis nyata.
- **Peta Interaktif:** Menggunakan pustaka Leaflet.js dengan tampilan peta satelit presisi tinggi.
- **Dropdown Asal & Tujuan:** Pengguna dapat dengan mudah memilih titik keberangkatan dan tujuan dari 13 gedung utama FMIPA.
- **Visualisasi Graf Real-Time:** Menampilkan jalur rute berbentuk garis polyline merah beserta penanda posisi awal dan akhir.

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