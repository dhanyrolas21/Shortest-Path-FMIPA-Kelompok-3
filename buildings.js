// ============================================================
// buildings.js  -  Data gedung & ruangan (TERPISAH dari graph jalan)
// Muat SETELAH algorithm.js dan SEBELUM app.js.
//
// - nodeId  : ID node di routes.json (JANGAN diubah, dipakai routing)
// - code    : kode gedung yang ditampilkan (null = tidak ada kode)
// - name    : nama gedung yang ditampilkan
// - floors  : { nomorLantai: "baris data" }
//
// Format satu baris ruangan:   kode | nama ruangan
//   kode "-"  -> ruangan tanpa kode
//   nama kosong -> ruangan tanpa nama (field nama tidak ditampilkan)
//
// Ruangan BUKAN node graph. Rute selalu menuju nodeId gedung.
// Untuk menambah ruangan (mis. Gedung Biologi 005): isi `floors`
// pada entri nodeId 'biologi' di bawah. Tidak ada kode lain yang perlu diubah.
// ============================================================

const BUILDING_DATA = [
  {
    nodeId: 'gedung_syawal', code: '001', name: 'Gedung Syawal',
    floors: {}
  },

  {
    nodeId: 'matematika', code: '002', name: 'Gedung Matematika',
    floors: {
      1: `
002.1.06 | Kamar mandi dosen
002.1.07 | Pantry
002.1.09 | Kamar mandi dosen
002.1.08 | Ruang Panel
002.1.05 | Kamar Mandi Pria
002.1.04 | Kamar Mandi Perempuan
002.1.03 | Tangga Darurat
002.1.10 | Ruang kuliah
002.1.02 | Ruang tunggu
002.1.01 | Ruang administrasi jurusan
002.1.14 | Lift
002.1.12 | Ruang ketua pendidikan prodi matematika
002.1.11 | Ruang ketua prodi matematika`,
      2: `
002.2.05 | Kamar mandi pria
002.2.04 | Kamar mandi perempuan
002.2.08 | Kamar mandi dosen
002.2.07 | Ruang panel
002.2.03 | Tangga darurat
002.2.02 | Ruang kuliah
002.2.09 | Ruang kuliah
- | Ruang akreditasi
002.2.01 | Ruang kuliah
002.2 | Lobby
002.1.13 | Tangga darurat`,
      3: `
002.3.13 | Lift
002.3.01 | Ruang kuliah
002.3.02 | Ruang kuliah
002.3.03 | Tangga darurat
002.3.04 | Kamar mandi perempuan
002.3.05 | Kamar mandi pria
002.3.06 | Kamar mandi dosen
002.3.07 | Ruang pantry
002.3.08 | Ruang panel
002.3.10 | Ruang kuliah
002.3.11 | Ruang ujian
002.3.12 | Tangga darurat`,
      4: `
002.4 | Hall
002.4.01 | Ruang kuliah
002.4.02 | Ruang kuliah
002.4.03 | Tangga darurat
002.4.04 | Kamar mandi perempuan
002.4.05 | Kamar mandi pria
002.4.06 | Musholla
002.4.07 | Tempat wudhu
002.4.08 | Pantry
002.4.09 | Ruang panel
002.4.10 | Kamar mandi dosen
002.4.11 | Ruang penguji
002.4.12 | Ruang microteaching
002.4.13 | Ruang microteaching
002.4.14 | Ruang penguji
002.4.15 | Ruang penguji
002.4.16 | Ruang microteaching
002.4.17 | Tangga darurat
002.4.18 | Lift`,
      5: `
002.5 | Hall
002.5.01 | Ruang dosen
002.5.02 | Ruang dosen
002.5.03 | Ruang dosen
002.5.04 | Tangga darurat
002.5.05 | Kamar mandi perempuan
002.5.06 | Kamar mandi pria
002.5.07 | Gudang
002.5.08 | Pantry
002.5.09 | Ruang panel
002.5.10 | Kamar mandi dosen
002.5.11 | Ruang kuliah
002.5.12 | Tangga darurat
002.5.13 | Lift`,
      6: `
002.6 | Hall
002.6.01 | Ruang dosen
002.6.02 | Ruang dosen
002.6.03 | Tangga darurat
002.6.04 | Kamar mandi perempuan
002.6.05 | Kamar mandi pria
002.6.06 | Musholla
002.6.07 | Tempat wudhu
002.6.08 | Pantry
002.6.09 | Ruang panel
002.6.10 | Kamar mandi dosen
002.6.11 | Ruang dosen
002.6.12 | Ruang dosen
002.6.13 | Tangga darurat
002.6.14 | Lift`,
      7: `
002.7 | Hall
002.7.01 | Ruang dosen
002.7.02 | Tangga darurat
002.7.03 | Kamar mandi perempuan
002.7.04 | Kamar mandi pria
002.7.05 | Gudang
002.7.06 | Pantry
002.7.07 | Ruang panel
002.7.08 | Kamar mandi dosen
002.7.09 | Ruang kuliah
002.7.10 | Ruang baca
002.7.11 | Tangga darurat
002.7.12 | Lift`
    }
  },

  {
    nodeId: 'kimia', code: '003', name: 'Gedung Kimia',
    floors: {
      1: `
003.1 | Lobby Jurusan Kimia
003.1.01 | Ruang Administrasi Jurusan
003.1.02 | Ruang Ketua Jurusan Kimia
003.1.03 | Toilet Wanita
003.1.04 | Toilet Pria
003.1.05 | Toilet Dosen A
003.1.06 | Toilet Dosen B
003.1.07 | Ruang Panel
003.1.08 | Pantry
003.1.09 | Ruang Kontrol
003.1.10 | Ruang Kepala Lab Kimia
003.1.11 | Ruang Kaprodi Kimia
003.1.12 | Ruang Kaprodi Pendidikan Kimia
003.1.13 | Tangga Darurat
003.1.14 | Lift Mahasiswa
003.1.15 | Lift Dosen
003.1.17 | Tangga Darurat`,
      2: `
003.2 | Lobby
003.2.01 | Ruang Penguji A
003.2.02 | Ruang Microteaching A
003.2.03 | Ruang Microteaching B
003.2.04 | Ruang Penguji B
003.2.05 | Ruang Penguji C
003.2.06 | Ruang Microteaching C
003.2.07 | Ruang Kaprodi S2 Kimia
003.2.08 | Ruang Kaprodi S2 Pendidikan Kimia
003.2.09 | Toilet Wanita
003.2.10 | Toilet Pria
003.2.11 | Toilet Dosen
003.2.12 | Ruang Panel
003.2.13 | Pantry
003.2.14 | Ruang Rapat Jurusan Kimia
003.2.15 | Ruang Penguji D
003.2.15 | Ruang Microteaching D
003.2.18 | Lift Mahasiswa
003.2.19 | Lift Dosen`,
      3: `
003.3 | Lobby
003.3.01 | Ruang Kelas
003.3.02 | Ruang Kelas
003.3.03 | Toilet Wanita
003.3.04 | Toilet Pria
003.3.05 | Gudang
003.3.07 | Toilet Difabel
003.3.08 | Ruang Kelas
003.3.09 | Tangga Darurat
003.3.10 | Lift Mahasiswa
003.3.11 | Lift Dosen`,
      4: `
003.4 | Lobby
003.4.01 | Ruang Kelas
003.4.02 | Ruang Kelas
003.4.03 | Toilet Wanita
003.4.04 | Toilet Pria
003.4.05 | Musholla
003.4.07 | Ruang Kelas
003.4.08 | Tangga Darurat
003.4.09 | Lift Mahasiswa
003.4.10 | Lift Dosen`,
      5: `
003.5 | Lobby
003.5.01 | Ruang Kelas
003.5.02 | Ruang Kelas
003.5.03 | Toilet Wanita
003.5.04 | Toilet Pria
003.5.05 | Gudang
003.5.07 | Toilet Dosen
003.5.08 | Ruang Kelas
003.5.09 | Tangga Darurat
003.5.10 | Lift Mahasiswa
003.5.11 | Lift Dosen`,
      6: `
003.6 | Lobby
003.6.01 | Ruang Kelas
003.6.02 | Ruang Kelas
003.6.03 | Toilet Wanita
003.6.04 | Toilet Pria
003.6.05 | Musholla
003.6.07 | Ruang Kelas
003.6.08 | Tangga Darurat
003.6.09 | Lift Mahasiswa
003.6.10 | Lift Dosen`,
      7: `
003.7 | Lobby
003.7.01 | Ruang Kelas
003.7.02 | Ruang Kelas
003.7.03 | Toilet Wanita
003.7.04 | Toilet Pria
003.7.05 | Gudang
003.7.07 | Ruang Kelas
003.7.08 | Tangga Darurat
003.7.09 | Lift Mahasiswa
003.7.10 | Lift Dosen`,
      8: `
003.8 | Lobby
003.8.01 | Ruang Diskusi
003.8.02 | Ruang Dosen
003.8.03 | Tangga Darurat
003.8.04 | Lift Mahasiswa
003.8.05 | Lift Dosen`,
      9: `
003.9 | Lobby
003.9.01 | Ruang Diskusi
003.9.02 | Ruang Dosen
003.9.03 | Tangga Darurat
003.9.04 | Lift Mahasiswa`,
      10: `
003.10 | Lobby
003.10.01 | Ruang Komunitas Mahasiswa
003.10.02 | Ruang Pre Function
003.10.03 | Ruang Serbaguna
003.10.04 | Tangga Darurat
003.10.05 | Lift Mahasiswa
003.10.06 | Lift Dosen`,
      11: `
003.11.01 | Ruang Mesin
003.11.02 | Roof Top`
    }
  },

  {
    nodeId: 'fisika', code: '004', name: 'Gedung Fisika',
    floors: {
      1: `
004.1.01 | Administrasi Jurusan
004.1.02 | Ruang Tunggu
004.1.03 | Tangga Darurat
004.1.04 | Toilet Wanita
004.1.05 | Toilet Pria
004.1.06 | Toilet Dosen
004.1.07 | Pantry
004.1.08 | Ruang Panel
004.1.09 | Toilet Dosen
004.1.10 | Ruang Rapat Jurusan
004.1.11 | R.Ka. Prodi Pendidikan Fisika
004.1.12 | R.Ka. Prodi Fisika
004.1.13 | Tangga Darurat
004.1.14 | Lift`,
      2: `
004.2.01 | Ruang Kelas
004.2.02 | Ruang Kelas
004.2.03 | Tangga Darurat
004.2.04 | Toilet Wanita
004.2.05 | Toilet Pria
004.2.06 | Toilet Difabel
004.2.07 | Ruang Panel
004.2.08 | Toilet Dosen
004.2.09 | Ruang Kelas
004.2.10 | Tangga Darurat
004.2.11 | Lift`,
      3: `
004.3.01 | Ruang Kelas
004.3.02 | Ruang Kelas
004.3.03 | Tangga Darurat
004.3.04 | Toilet Wanita
004.3.05 | Toilet Pria
004.3.06 | Toilet Dosen
004.3.07 | Ruang Panel
004.3.08 | Janitor
004.3.09 | Toilet Dosen
004.3.10 | Ruang Kelas
004.3.11 | Tangga Darurat
004.3.12 | Lift`,
      4: `
004.4.01 | Ruang Kelas
004.4.02 | Ruang Kelas
004.4.04 | Toilet Wanita
004.4.05 | Toilet Pria
004.4.06 | Pantry
004.4.07 | Ruang Panel
004.4.08 | Toilet Dosen
004.4.09 | Ruang Penguji A
004.4.10 | Ruang Micro Teaching A
004.4.11 | Ruang Microteaching B
004.4.12 | Ruang Penguji B
004.4.13 | Ruang Penguji C
004.4.14 | Ruang Microteaching C
004.4.15 | Tangga Darurat
004.4.16 | Lift`,
      5: `
004.5.01 | Ruang Kelas
004.5.02 | Ruang Kelas
004.5.03 | Tangga Darurat
004.5.04 | Toilet Wanita
004.5.05 | Toilet Pria
004.5.06 | Ruang Control
004.5.07 | Pantry
004.5.08 | Ruang Panel
004.5.09 | Toilet Dosen
004.5.10 | Ruang Kelas
004.5.11 | Tangga Darurat
004.5.12 | Lift`,
      6: `
004.6.01 | Ruang Dosen A
004.6.02 | Ruang Dosen B
004.6.03 | Ruang Dosen C
004.6.04 | Tangga Darurat
004.6.05 | Toilet Wanita
004.6.06 | Toilet Pria
004.6.07 | Pantry
004.6.08 | Ruang Panel
004.6.09 | Toilet Dosen
004.6.10 | Ruang Dosen D
004.6.11 | Ruang Dosen E
004.6.12 | Tangga Darurat
004.6.13 | Lift`,
      7: `
004.7.01 | Ruang Dosen A
004.7.02 | Ruang Dosen B
004.7.03 | Ruang Dosen C
004.7.04 | Tangga Darurat
004.7.05 | Toilet Wanita
004.7.06 | Toilet Pria
004.7.07 | Gudang
004.7.08 | Pantry
004.7.09 | Ruang Panel
004.7.10 | Toilet Dosen
004.7.11 | Ruang Dosen D
004.7.12 | Ruang Dosen E
004.7.13 | Tangga Darurat
004.7.14 | Lift`,
      8: `
004.8.01 | Ruang Komunitas
004.8.02 | Ruang Pre Function
004.8.03 | Ruang Serbaguna
004.8.03.1 | Tangga Darurat
004.8.04 | Lift`
    }
  },

  // Gedung Biologi (005): data ruangan BELUM ada. Isi `floors` di sini nanti.
  {
    nodeId: 'biologi', code: '005', name: 'Gedung Biologi',
    floors: {}
  },

  {
    nodeId: 'bilingual', code: '006', name: 'Gedung Bilingual',
    floors: {
      1: `
006 | Gudang
006.1.01 A |
006.1.03 |
006.1.04 |
006.1.05 |
006.1.06 |
006.1.07 |
006.1.08 |
006.1.09 |
006.1.10 |`,
      2: `
006.2.01 A |
006.2.02 |
006.2.03 |
006.2.04 |
006.2.05 |
006.2.06 |
006.2.07 |
006.2.08 |
006.2.09 |
006.2.10 |`
    }
  },

  {
    nodeId: 'lab_kimia', code: '007', name: 'Laboratorium Kimia',
    floors: {
      1: `
007.1.01 | Ruang Penelitian Kimia Fisika dan Anorganik
007.1.02 | Ruang Praktikum Kimia Umum
007.1.06 | Ruang Persiapan Lt 1 dan Dapur
007.1.08 | Ruang Praktikum Kimia Umum
007.1.11 | Ruang Seminar Lab Kimia
007.1.14 | Ruang Penelitian
007.1.15 | Ruang Instrumen AAS
007.1.16 | Ruang Asisten Praktikum Kimia Umum`,
      2: `
007.2.01 | Ruang Praktikum Kimia Fisika
007.2.02 | Ruang Penelitian Kimia Komputasi
007.2.03 | Ruang Praktikum Komputer
007.2.06 | Ruang Laboran
007.2.07 | Ruang Persiapan Lt 2
007.2.10 | Ruang Praktikum Biokimia
007.2.11 | Ruang Kepala Laboratorium
007.2.12 | Ruang Praktikum Kimia Anorganik
007.2.15 | Ruang Asisten Praktikum Kimia Fisika dan Anorganik
007.2.16 | Gudang`,
      3: `
007.3.03 | Ruang Penelitian Biokimia
007.3.06 | Ruang Asisten Praktikum
007.3.07 | Ruang Instrumen UV
007.3.09 | Ruang Instrumen
007.3.10 | Ruang Admin Laboran
007.3.11 | Ruang Praktikum Kimia Organik
007.3.15 | Ruang Persiapan Mikrobiologi`
    }
  },

  {
    nodeId: 'lab_fisika', code: '008', name: 'Laboratorium Fisika',
    floors: {
      1: `
008.1.01 | Ruang Laboran
008.1.02 | Ruang Rapat
008.1.03 | Ruang SEM
008.1.04 | Toilet Wanita
008.1.05 | Janitor
008.1.06 | Ruang Panel
008.1.07 | Toilet Pria
008.1.08 | Lab Material
008.1.09 | Ruang Laboran`,
      2: `
008.2.01 | Lab Listrik
008.2.02 | Ruang Laboran
008.2.03 | Lab Media Pembelajaran
008.2.04 | Lab Komputer
008.2.05 | Lab Fisika Bumi
008.2.06 | Lab Instrumental
008.2.07 | Toilet Wanita
008.2.08 | Janitor
008.2.09 | Ruang Panel
008.2.10 | Toilet Pria
008.2.11 | Gudang
008.2.12 | Musholla
008.2.13 | Pantry`,
      3: `
008.3.01 | Lab Optik
008.3.02 | Ruang Aslab
008.3.03 | Ruang Laboran
008.3.04 | Lab Fisika Umum
008.3.05 | Gudang Bahan Habis Pakai
008.3.06 | Toilet Wanita
008.3.07 | Janitor
008.3.08 | Ruang Panel
008.3.09 | Pantry
008.3.10 | Toilet Pria
008.3.11 | Musholla
008.3.12 | Pantry`,
      4: `
008.4.01 | Ruang Panel
008.4.02 | Ground Tank
008.4.03 | Lab Observasi Bintang
008.4.04 | Gudang
008.4.05 | Toilet
008.4.06 | Janitor
008.4.07 | Gudang`
    }
  },

  {
    nodeId: 'gedung_ilkom', code: '009', name: 'Gedung Ilmu Komputer',
    floors: {
      1: `
009.1.01 | Lab Jaringan
009.1.02 | Ruang HMJ
009.1.03 | Ruang Pusat Bisnis
009.1.04 | Ruang Riset dan Pengabdian Masyarakat
009.1.05 | Ruang Prodi Ilkom
009.1.06 | Ruang Pusat Kreativitas
009.1.07 | Kamar Mandi
009.1.07.1 | Kamar Mandi Dosen
009.1.07.2 | Kamar Mandi Mahasiswa
009.1.08 | Lab Multimedia`,
      2: `
009.2.01 | Lab Komputasi dan AI
009.2.02 | Gudang
009.2.03 | Ruang Kepala Laboratorium
009.2.04 | Ruang Penelitian
009.2.05 | Ruang Administrasi
009.2.06 | Kamar Mandi
009.2.06.1 | Kamar Mandi Dosen
009.2.06.2 | Kamar Mandi Mahasiswa
009.2.07 | Lab Pemrograman dan Komputasi
009.2 | Lab Ruang Listrik dan Fisika Modern`,
      3: `
009.3.01 | Lab Jaringan Komputer dan Rekayasa Lunak
009.3.02 | Ruang Kuliah
009.3.03 | Gudang Inventaris
009.3.04 | Kamar Perpustakaan
009.3.05 | Mushola
009.3.06 | Gudang Bahan 1
009.3.07 | Gudang Bahan 2
009.3.08 | Kamar Mandi
009.3.08.1 | Kamar Mandi Perempuan
009.3.08.2 | Kamar Mandi Pria
009.3.09 | Ruang Multimedia dan Game Development
009.3 | Ruang Micro Teaching II`
    }
  },

  {
    // Prefix lama 11.x.xx disesuaikan menjadi 12.x.xx (sesuai kode gedung)
    nodeId: 'gedung_12', code: '12', name: 'Gedung 12',
    floors: {
      1: `
12.1.16 | Kantor Tata Usaha
12.1.15 | Kantor Wakil Dekan FT
12.1.14 | Kantor Jurusan Mesin
12.1.13 | Kantor Jurusan PK K
- | Kamar Mandi Pria
- | Kamar Mandi Wanita
12.1.11 | Perpustakaan FT
12.1.10 | Ruang Kuliah
12.1.09 | Ruang Kuliah
- | Kamar Mandi Dekan
- | Gudang
- | Toilet Khusus Wakil Dekan & Tenaga Kependidikan
12.1.07 | Kantor Dekan
- | Kantin
12.1.02 | Perpustakaan FMIPA
12.1.01 | Ruang Tanpa Nama`,
      2: `
12.2.01 | Ruang Kuliah
12.2.02 | Ruang Kuliah
12.2.03 | Ruang Kuliah
12.2.04 | Ruang Kuliah
12.2.05 | Ruang Kuliah Gizi
12.2.15 | Ruang Kuliah
12.2.14 | Ruang Kuliah
12.2.13 | Ruang Kuliah
12.2.12 | Ruang Kuliah
12.2.11 | Ruang Kuliah
12.2.06 | Ruang Kuliah Gizi
12.2.07 | Ruang Kuliah Gizi
12.2.08 | Ruang Kuliah
12.2.09 | Ruang Kuliah
12.2.10 | Ruang Kuliah`
    }
  },

  {
    // Semua prefix 010 / 011 / 176 diseragamkan menjadi 010.
    // Lantai & nomor ruang tidak diubah. Kode kembar dipertahankan (lihat catatan).
    nodeId: 'lab_biologi', code: '010', name: 'Laboratorium Biologi',
    floors: {
      1: `
- | Kantin
010.1.08 | Lab Bio Kimia
010.1.02 | Ruang Laboran
010.1 | Koridor
010.1.07 | Ruang Laboran
010.1.01 | Lab Mikrobiologi
010.1.03 | Ruang Furnace
010.1.06 | Pantry
010.1.04 | Kamar Mandi Pria
010.1.05 | Kamar Mandi Wanita
010.1.11 | Lab Fisiologi
010.1.10 | Ruang Laboran
010.1.06 | Jan
010.1.05 | Kamar Mandi Pria
010.1.06 | Kamar Mandi Wanita
010.1.07 | Kamar Mandi Dosen
010.1.08 | Kamar Mandi Difabel
010.1.04 | Musholla
010.1.09 | Ruang Panel
010.1.03 | Ruang Laboran
010.1.02 | Lab Genetika
010.1 | Lobby
010.1.01 | Ruang Klinik`,
      2: `
010.2 | Lobby
010.2.01 | Ruang Kepala Lab
010.2.02 | Lab Biosistematik
010.2.03 | Ruang Laboran
010.2.04 | Musholla
010.2.05 | Kamar Mandi Pria
010.2.06 | Jan
010.2.06 | Kamar Mandi Wanita
010.2.07 | Kamar Mandi Dosen
010.2.09 | Ruang Panel
010.2.10 | Ruang Laboran
010.2.11 | Lab Taksonomi Hewan Vertebrata
010.2.04 | Kamar Mandi Pria
010.2.05 | Kamar Mandi Wanita
010.2.06 | Gudang Bahan
010.2.03 | Gudang Bahan
010.2.01 | Lab Mikroteknik
010.2.02 | Ruang Laboran
010.2.07 | Ruang Laboran
010.2.08 | Lab Struktur dan Perkembangan`,
      3: `
010.3.07 | Lab Kompuer
010.3.06 | Ruang Perpustakaan Biologi
010.3.02 | Ruang Laboran
010.3.01 | Lab Penelitian GCMS
010.3.03 | Gudang Inventaris
010.3.05 | Kamar Mandi Wanita
010.3.04 | Kamar Mandi Pria
010.3.11 | Lab Biologi Sel dan Molekuler
010.3.10 | Ruang Laboran
010.3.06 | Jan
010.3.05 | Kamar Mandi Wanita
010.3.06 | Kamar Mandi Pria
010.3.07 | Kamar Mandi Dosen
010.3.09 | Ruang Panel
010.3.04 | Musholla
010.3.03 | Ruang Laboran
010.302 | Lab Kultur Jaringan
010.3.01 | Ruang Mikrofotografi
010.3 | Lobby`,
      4: `
010.4.01 | Ruang Rapat Dosen
010.4 | Lobby
010.4.02 | Ruang Laboran
010.4.03 | Lab Biologi Umum
010.04.04 | Musholla
010.04.05 | Kamar Mandi Pria
010.04.06 | Kamar Mandi Wanita
010.4.06 | Jan
010.4.09 | Ruang Panel
010.4.09 | Lab IPA Terpadu`
    }
  },

  {
    nodeId: 'tanaman_biologi', code: '85', name: 'Laboratorium Tanaman Biologi',
    floors: {}
  },

  {
    nodeId: 'kantin_kokma', code: null, name: 'Kantin FMIPA',
    floors: {}
  }
];

// ------------------------------------------------------------
// Parser: ubah BUILDING_DATA menjadi struktur siap pakai
// BUILDINGS[nodeId] = { nodeId, code, name, label, floors:[n], rooms:[room] }
// room = { index, code, name, floor, roomNumber, label }
// ------------------------------------------------------------
const BUILDINGS = {};

(function parseBuildingData() {
  BUILDING_DATA.forEach(def => {
    const rooms = [];
    Object.keys(def.floors).forEach(fl => {
      const floor = Number(fl);
      def.floors[fl].split('\n').forEach(raw => {
        const line = raw.trim();
        if (!line) return;
        const bar = line.indexOf('|');
        const codeRaw = (bar >= 0 ? line.slice(0, bar) : line).trim();
        const nameRaw = bar >= 0 ? line.slice(bar + 1).trim() : '';
        const code = codeRaw === '-' || codeRaw === '' ? null : codeRaw;
        const name = nameRaw || null;

        // Nomor ruangan = bagian setelah "gedung.lantai." (hanya jika polanya GGG.L.RR)
        let roomNumber = null;
        if (code) {
          const seg = code.split('.');
          if (seg.length >= 3 && seg[0] === def.code) roomNumber = seg.slice(2).join('.');
        }

        let label;
        if (code && name) label = code + ' — ' + name;
        else label = code || name || '(tanpa data)';

        rooms.push({ index: rooms.length, code, name, floor, roomNumber, label });
      });
    });

    const hasCode = def.code !== null && def.code !== undefined && def.code !== '';
    const label = hasCode && !def.name.includes(def.code) ? def.name + ' (' + def.code + ')' : def.name;

    BUILDINGS[def.nodeId] = {
      nodeId: def.nodeId,
      code: hasCode ? def.code : null,
      name: def.name,
      label,
      floors: [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b),
      rooms
    };
  });
})();

function getBuildingData(nodeId) {
  return BUILDINGS[nodeId] || null;
}

// Hanya mengganti nama TAMPILAN di memori. ID node & graph tidak disentuh.
function applyBuildingNames(db) {
  for (const id in BUILDINGS) {
    if (db.nodes && db.nodes[id]) db.nodes[id].name = BUILDINGS[id].label;
  }
}
