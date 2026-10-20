# Ringkasan Memori & Konteks Proyek Laporan PKL UBSI 2026

Dokumen ini mencatat seluruh konteks, struktur, aturan pedoman, dan progres pengerjaan Laporan PKL serta sistem aplikasi agar tersimpan secara permanen di repositori.

---

## 1. Identitas Penulis & Instansi Magang
- **Nama Mahasiswa:** Rizki Agustianto
- **NIM:** 15230292
- **Program Studi:** Informatika Kampus Margonda (Program Sarjana / S1)
- **Fakultas:** Teknik dan Informatika, Universitas Bina Sarana Informatika (UBSI)
- **Tahun Akademik:** 2026
- **Dosen Pembimbing PKL:** Budi Sudrajat, M.Kom
- **Instansi PKL:** Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus (Setjen DN KEK RI)
- **Mentor Magang:** Diaji Junianto
- **Pimpinan Unit:** Noviar Iskandar (Kepala Tata Kelola Biro 3 KEK)
- **Judul Laporan PKL:**
  > *"Perancangan dan Pembuatan Aplikasi Log Book Notula Rapat pada Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus"*

---

## 2. Tautan & Dokumen Utama
- **Google Doc Laporan PKL:**
  - **Doc ID:** `1dBGQ4RXnUhx2E4afkoQgKItVCMv2sQcfNHLGKdy4o7s`
  - **Judul Dokumen:** *Perancangan dan Pembuatan Aplikasi Log Book Notula Rapat pada Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus*
- **File Desain Diagram & Dokumentasi Lokal:**
  - `docs/ERD_Log_Book_Rapat.drawio` (ERD Chen & LRS Relasional)
  - `docs/5_DESAIN_DATABASE.md` (Kamus Data & Spesifikasi Tabel)
  - `docs/4_ACTIVITY_DIAGRAM.md` (Activity Diagram Alur Sistem)
  - `docs/5_SEQUENCE_DIAGRAM.md` (Sequence Diagram)
  - `docs/LAPORAN_PKL_Log_Book_Rapat_OUTLINE_3.md` (Draft Naskah Laporan Bab I s/d Bab IV)

---

## 3. Arsitektur Basis Data (PostgreSQL & Prisma ORM)
Tabel-tabel relasional pada Neon Serverless PostgreSQL telah disinkronkan secara konsisten di diagram ERD, LRS, dan naskah Bab III:
1. `pengguna` (id, nama, email, password_hash, peran, id_biro, id_tim_biro)
2. `biro` (id, nama_biro, kode_biro, keterangan)
3. `tim_biro` (id, nama_tim, id_biro)
4. `rapat` (id, judul_rapat, nomor_surat_undangan, tanggal_rapat, waktu_mulai, waktu_selesai, lokasi, tautan_virtual, status_rapat, id_pembuat)
5. `peserta_rapat` (id, id_rapat, id_pengguna, nama_eksternal, instansi, status_kehadiran, waktu_presensi, tanda_tangan_url)
6. `notulen_rapat` (id, id_rapat, isi_notula, kesimpulan, status_notula, pengesah_id, waktu_pengesahan)
7. `tindak_lanjut` (id, id_notulen, deskripsi_tindak_lanjut, pic_id, tenggat_waktu, status_progres, skala_prioritas)
8. `lampiran_rapat` (id, id_rapat, nama_berkas, url_berkas, tipe_mime, ukuran_bytes)
9. `penomoran_rapat_biro` (id, id_biro, tahun, nomor_terakhir)

---

## 4. Daftar Simbol Tersinkronisasi (18 Simbol)
Sesuai Pedoman PKL UBSI 2026 (Lampiran 19 Hal. 78 & Lampiran 20 Hal. 80):
- **Judul:** Font 14 pt, **Tebal (*Bold*)**, Kapital, Rata Tengah (*Center*).
- **Pengelompokan Diagram:**
  - **A. Simbol *Use Case Diagram*** (Nomor 1 s/d 6): *Actor*, *Use Case*, *Association*, *System Boundary*, *Include* (`<<include>>`), *Extend* (`<<extend>>`).
  - **B. Simbol *Activity Diagram*** (Nomor 7 s/d 13): *Initial State*, *Activity / Action*, *Decision Node*, *Swimlane*, *Fork / Join*, *Control Flow*, *Final State*.
  - **C. Simbol *Entity Relationship Diagram* (ERD)** (Nomor 14 s/d 18): Entitas (*Entity*), Atribut (*Attribute*), Atribut *Primary Key* (*PK*), Relasi (*Relationship*), Garis Kardinalitas (*Cardinality Line*).
- **Tipografi:** Seluruh istilah asing dicetak miring (***bold italic***).
- **Kesesuaian Data:** Contoh entitas basis data disinkronkan ke bahasa Indonesia (`pengguna`, `biro`, `tim_biro`, `rapat`, `notulen_rapat`, `tindak_lanjut`).

---

## 5. Daftar Gambar Tersinkronisasi (Gambar III.1 s/d III.14)
Sesuai Pedoman PKL UBSI 2026 (Lampiran 21 Hal. 82), format penomoran menggunakan Romawi Bab, font 12 pt tebal, posisi tengah (*center*) di bawah gambar:
1. `Gambar III.1. Logo Resmi Branding Kawasan Ekonomi Khusus (INDONESIA SEZ)`
2. `Gambar III.2. Struktur Organisasi Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus`
3. `Gambar III.3. Peta Lokasi Kantor Sekretariat Jenderal Dewan Nasional KEK (Google Maps)`
4. `Gambar III.4. Use Case Diagram Aplikasi Log Book Rapat KEK`
5. `Gambar III.5. Activity Diagram Alur Penjadwalan Rapat Dinas`
6. `Gambar III.6. Activity Diagram Alur Penyusunan dan Pengesahan Notulensi`
7. `Gambar III.7. Activity Diagram Alur Monitoring dan Pembaruan Tindak Lanjut`
8. `Gambar III.8. Entity Relationship Diagram (ERD) Log Book Rapat`
9. `Gambar III.9. Logical Record Structure (LRS) Log Book Rapat`
10. `Gambar III.10. Tampilan Antarmuka Halaman Login Pengguna`
11. `Gambar III.11. Tampilan Antarmuka Halaman Dashboard Eksekutif`
12. `Gambar III.12. Tampilan Antarmuka Formulir Penjadwalan Rapat Baru`
13. `Gambar III.13. Tampilan Antarmuka Editor Risalah Notula Rapat`
14. `Gambar III.14. Tampilan Antarmuka Matriks Monitoring Tindak Lanjut (Action Items)`

---

## 6. Daftar Tabel Tersinkronisasi (Tabel III.1 s/d III.11)
Sesuai Pedoman PKL UBSI 2026 (Lampiran 22 Hal. 83), format penomoran menggunakan Romawi Bab, font 12 pt tebal, posisi tengah (*center*) di atas tabel:
1. `Tabel III.1. Spesifikasi Tabel Pengguna (pengguna)`
2. `Tabel III.2. Spesifikasi Tabel Biro (biro)`
3. `Tabel III.3. Spesifikasi Tabel Tim Kerja Biro (tim_biro)`
4. `Tabel III.4. Spesifikasi Tabel Rapat Dinas (rapat)`
5. `Tabel III.5. Spesifikasi Tabel Peserta Rapat (peserta_rapat)`
6. `Tabel III.6. Spesifikasi Tabel Notulen Rapat (notulen_rapat)`
7. `Tabel III.7. Spesifikasi Tabel Tindak Lanjut Komitmen (tindak_lanjut)`
8. `Tabel III.8. Spesifikasi Tabel Berkas Lampiran Rapat (lampiran_rapat)`
9. `Tabel III.9. Hasil Pengujian Black Box Sistem Log Book Rapat`
10. `Tabel III.10. Spesifikasi Perangkat Keras (Hardware)`
11. `Tabel III.11. Spesifikasi Perangkat Lunak (Software)`

---

## 7. Standar Tipografi & Format Pedoman PKL UBSI 2026
- **Judul Bab:** Font Times New Roman 14 pt, **Tebal (*Bold*)**, Huruf Kapital Semua, Rata Tengah (*Center*).
- **Sub-Bab & Sub-Sub-Bab:** Font Times New Roman 12 pt, **Tebal (*Bold*)**, Huruf Kapital Setiap Awal Kata (*Title Case*), Rata Kiri (*Align Left*).
- **Keterangan Gambar:** Font Times New Roman 12 pt, **Tebal (*Bold*)**, Rata Tengah (*Center*), diletakkan di **bawah gambar**.
- **Keterangan Tabel:** Font Times New Roman 12 pt, **Tebal (*Bold*)**, Rata Tengah (*Center*), diletakkan di **atas tabel**.
- **Spasi Teks:**
  - Isi paragraf: 1.5 spasi.
  - Daftar gambar, daftar tabel, dan daftar lampiran: 1 spasi.
- **Istilah Asing:** Wajib dicetak miring (*italic*).
- **Aturan Sitasi (In-Text Citation):**
  - Untuk **3 pengarang atau lebih**, pengutipan di dalam teks narasi menggunakan format `Nama Pertama et al. (Tahun)` (misal: *Baehaqi et al., 2023*, *Kesuma et al., 2024*, *Rifandi et al., 2022*).
  - Untuk **2 pengarang**, kedua nama wajib tetap ditulis lengkap (misal: *Prasetyo dan Susetyo, 2022*, *Aji & Pratmanto, 2021*, *Widodo & Wati, 2022*).
  - Pada **DAFTAR PUSTAKA**, seluruh nama pengarang tetap ditulis lengkap tanpa *et al.* (sesuai Pedoman PKL Hal. 15 No. 5).


---

## 8. Referensi Jurnal SINTA Terakreditasi (5 Tahun Terakhir) di Mendeley
1. **Aji, S., & Pratmanto, D. (2021).**
   - *Judul:* Sistem Informasi Inventory Barang Menggunakan Metode Waterfall
   - *Jurnal:* Indonesian Journal on Software Engineering (IJSE), Vol. 7, No. 1, hlm. 93–99
   - *Akreditasi:* SINTA 4 (Dosen UBSI)
   - *DOI:* `10.31294/ijse.v7i1.10629`
   - *Mendeley ID:* `3d5bf79c-fb19-39e8-83b6-d18e4eb6d74b`
   - *Implementasi:* Dikutip pada Sub-Bab 2.2.6 (Unified Modeling Language & Use Case Diagram) dan dicantumkan pada DAFTAR PUSTAKA.

2. **Widodo, A. E., & Wati, F. F. (2022).**
   - *Judul:* Sistem Informasi Pendaftaran Internet Berbasis Web
   - *Jurnal:* Evolusi: Jurnal Sains dan Manajemen, Vol. 10, No. 1, hlm. 74–82
   - *Akreditasi:* SINTA 4 (Dosen UBSI)
   - *DOI:* `10.31294/evolusi.v10i1.12351`
   - *Mendeley ID:* `7cbcc2fb-709a-31f6-bc8b-a0a44c904992`
   - *Implementasi:* Dikutip pada Sub-Bab 2.2.6 (Unified Modeling Language & Activity Diagram) dan dicantumkan pada DAFTAR PUSTAKA.

---

## 9. Struktur DAFTAR ISI Tersinkronisasi (Pedoman PKL UBSI 2026)
Tersinkronisasi 100% pada Google Doc (`1dBGQ4RXnUhx2E4afkoQgKItVCMv2sQcfNHLGKdy4o7s`):
- Halaman Awal (Romawi Kecil):
  - Lembar Judul Laporan PKL (i)
  - Lembar Persetujuan Laporan PKL (ii)
  - Kata Pengantar (iii)
  - Daftar Isi (iv)
  - Daftar Simbol (v)
  - Daftar Gambar (vi)
  - Daftar Tabel (vii)
  - Daftar Lampiran (viii)
- Bagian Pokok & Penutup (Angka Arab):
  - BAB I PENDAHULUAN (1) s/d 1.4.2 (6)
  - BAB II LANDASAN TEORI (7) s/d 2.2.6 (14)
  - BAB III PEMBAHASAN (15) s/d 3.4.2 (29)
  - BAB IV PENUTUP (30) s/d 4.2 (31)
  - DAFTAR PUSTAKA (32)
  - DAFTAR RIWAYAT HIDUP (33)
  - LAMPIRAN-LAMPIRAN (34)

