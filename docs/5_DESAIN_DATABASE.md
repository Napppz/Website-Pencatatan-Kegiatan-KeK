# SPESIFIKASI TABEL BASIS DATA (SUB-BAB 3.2.4.c)
## Sistem Informasi Log & Notula Rapat (Log_Book_Rapat KEK RI)
**Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus Republik Indonesia**

Dokumen ini memuat perancangan resmi **Desain Database (Physical Relational Data Model)** dengan format visual *Card Diagram* modern sesuai acuan penulisan Skripsi / Tugas Akhir, memodelkan tabel-tabel basis data **Neon PostgreSQL**.

> [!NOTE]
> **Penempatan pada Laporan PKL (Pedoman PKL UBSI Tahun 2026 Halaman 30 – 31 No. 3):**  
> Desain skema basis data fisik ini ditempatkan pada **BAB III PEMBAHASAN &rarr; 3.2. Pembuatan Program &rarr; 3.2.4. Database\* &rarr; c. Spesifikasi Tabel Basis Data**.

---


## 1. File Diagram & Tautan Pratinjau

* **File Asli Draw.io (Multi-Tab):** [`docs/DESAIN_DATABASE_Log_Book_Rapat.drawio`](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/DESAIN_DATABASE_Log_Book_Rapat.drawio)
* **Tautan Unduh Langsung:** [http://localhost:3000/DESAIN_DATABASE_Log_Book_Rapat.drawio](http://localhost:3000/DESAIN_DATABASE_Log_Book_Rapat.drawio)
* **Tautan Pratinjau Interaktif di Browser:** [http://localhost:3000/database-design-preview.html](http://localhost:3000/database-design-preview.html)

> [!TIP]
> **Fitur Pratinjau Interaktif di Web:**
> Melalui browser di `http://localhost:3000/database-design-preview.html`, Anda dapat beralih secara langsung antara:
> 1. **Skema Utama Log_Book_Rapat KEK RI (8 Tabel Inti)** — Ditata dalam grid dan relasi persis seperti contoh acuan.
> 2. **Skema Lengkap Log_Book_Rapat KEK RI (14 Tabel 3NF)** — Menampilkan seluruh 14 tabel PostgreSQL.
> 3. **Replika Persis Contoh Gambar (8 Tabel Permohonan Informasi)** — Replika 100% dari gambar yang Anda lampirkan (`m_units`, `r_user_unit`, `r_permohonan_informasi`, dll).

---

## 2. Standardisasi Visual Desain Database (Sesuai Contoh Acuan)

| Elemen Desain | Gaya / Palet Warna | Makna & Aturan Desain |
|:---|:---|:---|
| **Header Kartu Tabel** | Biru Navy `#205493`, Teks Putih Tebal | Menampilkan nama fisik tabel relasional dalam huruf kecil (*snake_case*). |
| **Baris Kunci (PK & FK)** | Latar Biru Muda Halus `#E6F0FA` | Membedakan kolom kunci utama (*Primary Key* 🔑) dan kunci tamu (*Foreign Key* 🔗) dari kolom atribut biasa. |
| **Kolom Atribut Biasa** | Latar Putih Bersih `#FFFFFF` | Menampilkan atribut data standar dengan batas garis halus (*border-bottom*). |
| **Tipe Data (Kanan)** | Abu-abu Slate `#64748B`, Font Monospace | Menampilkan tipe data fisik PostgreSQL (`varchar`, `integer`, `timestamp`, `enum`, `boolean`, `text`). |
| **Garis Relasi Ortogonal** | Biru Cerulean `#3182CE` (tebal 1.6–1.8px) | Menghubungkan kolom PK di tabel induk ke kolom FK di tabel anak dengan belokan siku halus. |
| **Titik Kardinalitas** | Lingkaran kecil putih bergaris biru `○` | Menandai sisi **0..1 (Induk / Satu)** dan sisi **\* (Anak / Banyak)** dengan tanda panah terbuka. |

---

## 3. Struktur 8 Tabel Inti Log_Book_Rapat KEK RI (Layout Contoh Acuan)

## 3. Sinkronisasi Skema Langsung dari Neon PostgreSQL

> [!IMPORTANT]
> **Verifikasi Langsung dari Basis Data Neon Lakebase Postgres:**  
> Seluruh tabel, nama atribut, tipe data, *Primary Key* (PK), dan *Foreign Key* (FK) telah diverifikasi dan disinkronkan secara langsung menggunakan **Neon MCP Server** pada basis data produksi:
> - **Project ID:** `divine-cherry-57535219`
> - **Project Name:** `Log Rapat KEK`
> - **Region:** `aws-ap-southeast-1` (Singapore)
> - **PostgreSQL Version:** PostgreSQL 18
> - **Total Entitas Fisik:** 14 Tabel (3NF)

### 3.1. Pemetaan 8 Tabel Inti Log_Book_Rapat KEK RI (Tata Letak Contoh Acuan)

```
                  +-------------------+            +-------------------+
                  |       biro        | 1         N|     tim_biro      |
                  +-------------------+───────────>+-------------------+
                  | id_biro        PK |            | id_tim         PK |
                  | kode_biro    text |            | id_biro        FK |
                  | nama_biro    text |            | kode_tim     text |
                  | nama_singkat text |            | nama_tim     text |
                  | status_aktif bool |            | status_aktif bool |
                  +-------------------+            +-------------------+
                     │ 1                                     │ 1
                     │                                       │
                     ▼ N                                     ▼ N
+--------------------+--------------+   +--------------------+--------------+   +--------------------+--------------+
|               rapat               |   |            tindak_lanjut          |   |              pengguna              |
+-----------------------------------+   +-----------------------------------+   +-----------------------------------+
| id_rapat                       PK | 1 | id_tindak_lanjut               PK |   | id_pengguna                    PK |
| nomor_rapat                  text |──>| id_rapat                       FK |   | nama_lengkap                 text |
| judul_rapat                  text | N | id_biro                        FK |   | email                        text |
| id_biro                        FK |   | id_tim                         FK |   | peran                    UserRole |
| id_tim                         FK |   | id_pengguna                    FK |   | id_biro                        FK |
| id_pengguna                    FK |   | judul_tindakan               text |   | id_tim                         FK |
| id_notulis                     FK |   | status_tindak_lanjut ActionItem.. |   | status_aktif                 bool |
| tanggal_rapat           timestamp |   | skala_prioritas    ActionItem..   |   +-----------------------------------+
| waktu_mulai                  text |   | tenggat_waktu           timestamp |              │ 1
| waktu_selesai                text |   | dibuat_pada             timestamp |              │
| lokasi_rapat                 text |   +-----------------------------------+              │
| status_rapat        MeetingStatus |                                                      │
| pic_rapat                    text |                                                      ▼ N
| status_progres               text |                                           +-----------------------------------+
+-----------------------------------+                                           |             notifikasi            |
   │ 1              │ 1                 +-----------------------------------+   +-----------------------------------+
   │                │                   |           peserta_rapat           |   | id_notifikasi                  PK |
   │                │                   +-----------------------------------+   | id_pengguna                    FK |
   │                │                 1 | id_peserta                     PK |<──| judul                         text |
   │                └──────────────────>| id_rapat                       FK | N | pesan                         text |
   │                                  N | id_pengguna                    FK |   | tipe                          text |
   │                                    | status_kehadiran AttendanceStatus |   | tautan                        text |
   │                                    | dibuat_pada             timestamp |   | sudah_dibaca                 bool |
   ▼ 1                                  +-----------------------------------+   | dibuat_pada             timestamp |
+-----------------------------------+                                           +-----------------------------------+
|           notulen_rapat           |
+-----------------------------------+
| id_notulen                     PK |
| id_rapat                       FK |
| agenda_pembahasan            text |
| hasil_pembahasan             text |
| poin_keputusan               text |
| kesimpulan                   text |
| dibuat_pada             timestamp |
+-----------------------------------+
```

---

## 4. Spesifikasi Basis Data (Data Dictionary — 8 Tabel Inti)

Spesifikasi basis data (*data dictionary*) menjelaskan rincian teknis dari setiap tabel yang digunakan dalam sistem aplikasi **Log Book Notula Rapat KEK RI**. Seluruh kolom kunci utama (*Primary Key* / PK) dan kunci tamu (*Foreign Key* / FK) telah disesuaikan keterangannya secara eksplisit agar mudah dipahami oleh dosen pembimbing, mentor instansi, dan penguji:

### Tabel III.1. Spesifikasi Tabel Pengguna (`pengguna`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_pengguna` | Varchar (UUID) | **Primary Key** |
| 2 | `nama_lengkap` | Varchar | Nama lengkap pegawai |
| 3 | `email` | Varchar | Email dinas resmi (Unique) |
| 4 | `kata_sandi` | Varchar | Password terenkripsi (Bcrypt hash) |
| 5 | `peran` | Enum | `SUPER_ADMIN`, `ADMIN`, `PIMPINAN`, `STAFF` |
| 6 | `id_biro` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel biro) |
| 7 | `id_tim` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel tim_biro, opsional) |
| 8 | `status_aktif` | Boolean | Status aktif akun (Default: `true`) |
| 9 | `dibuat_pada` | Timestamp | Waktu akun didaftarkan |
| 10 | `diperbarui_pada` | Timestamp | Waktu terakhir pembaruan profil |

### Tabel III.2. Spesifikasi Tabel Biro (`biro`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_biro` | Varchar (UUID) | **Primary Key** |
| 2 | `kode_biro` | Varchar | Kode singkatan unik biro (Unique) |
| 3 | `nama_biro` | Varchar | Nama lengkap biro pemrakarsa |
| 4 | `nama_singkat` | Varchar | Nomenklatur singkatan biro |
| 5 | `deskripsi` | Text | Uraian fungsi pokok biro |
| 6 | `status_aktif` | Boolean | Status aktif operasional biro |
| 7 | `dibuat_pada` | Timestamp | Waktu data biro dibuat |
| 8 | `diperbarui_pada` | Timestamp | Waktu terakhir data diperbarui |

### Tabel III.3. Spesifikasi Tabel Tim Kerja Biro (`tim_biro`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_tim` | Varchar (UUID) | **Primary Key** |
| 2 | `id_biro` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel biro) |
| 3 | `kode_tim` | Varchar | Kode pengenal tim kerja |
| 4 | `nama_tim` | Varchar | Nama kelompok kerja / tim |
| 5 | `deskripsi_tim` | Text | Uraian bidang penugasan tim |
| 6 | `status_aktif` | Boolean | Status keaktifan tim kerja |
| 7 | `dibuat_pada` | Timestamp | Waktu tim dibentuk |
| 8 | `diperbarui_pada` | Timestamp | Waktu pembaruan data tim |

### Tabel III.4. Spesifikasi Tabel Rapat Dinas (`rapat`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_rapat` | Varchar (UUID) | **Primary Key** |
| 2 | `nomor_rapat` | Varchar | Nomor registrasi agenda rapat (Unique) |
| 3 | `judul_rapat` | Varchar | Pokok judul pembahasan rapat |
| 4 | `id_biro` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel biro - Biro Pemrakarsa) |
| 5 | `id_tim` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel tim_biro, opsional) |
| 6 | `tanggal_rapat` | Timestamp | Tanggal pelaksanaan rapat dinas |
| 7 | `waktu_mulai` | Varchar | Jam mulai sidang (Format HH:mm) |
| 8 | `waktu_selesai` | Varchar | Jam penutupan sidang (Format HH:mm) |
| 9 | `lokasi_rapat` | Varchar | Ruang rapat luring atau tautan daring |
| 10 | `id_pengguna` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel pengguna - Pimpinan Rapat) |
| 11 | `id_notulis` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel pengguna - Petugas Notulis) |
| 12 | `status_rapat` | Enum | `DRAFT`, `REVIEW`, `APPROVED`, `FINAL` |
| 13 | `jenis_rapat` | Varchar | Klasifikasi agenda rapat dinas |
| 14 | `pic_rapat` | Varchar | Nama penanggung jawab teknis rapat |
| 15 | `status_progres` | Varchar | Status tahapan progres rapat |
| 16 | `dibuat_pada` | Timestamp | Waktu agenda rapat dibuat |
| 17 | `diperbarui_pada` | Timestamp | Waktu pembaruan data rapat |

### Tabel III.5. Spesifikasi Tabel Peserta Rapat (`peserta_rapat`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_peserta` | Varchar (UUID) | **Primary Key** |
| 2 | `id_rapat` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel rapat) |
| 3 | `id_pengguna` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel pengguna - Peserta Rapat) |
| 4 | `status_kehadiran` | Enum | Presensi: `INVITED`, `PRESENT`, `ABSENT`, `EXCUSED` |
| 5 | `dibuat_pada` | Timestamp | Waktu undangan peserta ditambahkan |

### Tabel III.6. Spesifikasi Tabel Notulen Rapat (`notulen_rapat`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_notulen` | Varchar (UUID) | **Primary Key** |
| 2 | `id_rapat` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel rapat, relasi 1:1) |
| 3 | `agenda_pembahasan` | Text | Daftar butir agenda pembahasan rapat |
| 4 | `hasil_pembahasan` | Text | Ringkasan dinamika dan jalannya sidang |
| 5 | `poin_keputusan` | Text | Butir-butir keputusan yang disepakati |
| 6 | `kesimpulan` | Text | Kesimpulan dan rekomendasi akhir rapat |
| 7 | `dibuat_pada` | Timestamp | Waktu draf notula dibuat |
| 8 | `diperbarui_pada` | Timestamp | Waktu pengesahan / revisi notula |

### Tabel III.7. Spesifikasi Tabel Tindak Lanjut Komitmen (`tindak_lanjut`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_tindak_lanjut` | Varchar (UUID) | **Primary Key** |
| 2 | `id_rapat` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel rapat) |
| 3 | `judul_tindakan` | Varchar | Judul arahan / instruksi kerja |
| 4 | `deskripsi_tindakan` | Text | Uraian rincian teknis penugasan |
| 5 | `id_biro` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel biro - Biro Penanggung Jawab) |
| 6 | `id_tim` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel tim_biro, opsional) |
| 7 | `id_pengguna` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel pengguna - Staf PIC) |
| 8 | `tenggat_waktu` | Timestamp | Batas akhir penyelesaian (Due Date) |
| 9 | `status_tindak_lanjut` | Enum | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE` |
| 10 | `skala_prioritas` | Enum | Tingkat prioritas: `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| 11 | `diselesaikan_pada` | Timestamp | Waktu penuntasan tugas (Opsional) |
| 12 | `dibuat_pada` | Timestamp | Waktu instruksi diterbitkan |
| 13 | `diperbarui_pada` | Timestamp | Waktu pembaruan status tindak lanjut |

### Tabel III.8. Spesifikasi Tabel Berkas Lampiran Rapat (`lampiran_rapat`)
| No | Nama Field | Tipe Data | Keterangan |
|:--:|:---|:---|:---|
| 1 | `id_lampiran` | Varchar (UUID) | **Primary Key** |
| 2 | `id_rapat` | Varchar (UUID) | **Foreign Key** (Relasi ke tabel rapat) |
| 3 | `nama_berkas` | Varchar | Nama dokumen (misal: `Paparan_KEK.pdf`) |
| 4 | `url_berkas` | Text | Alamat penyimpanan berkas digital (Storage URL) |
| 5 | `ukuran_berkas` | Integer | Ukuran berkas dalam satuan bytes |
| 6 | `tipe_berkas` | Varchar | Ekstensi format berkas (PDF/DOCX) |
| 7 | `nama_pengunggah` | Varchar | Identitas aparatur yang mengunggah berkas |
| 8 | `kategori` | Varchar | Klasifikasi berkas (`UNDANGAN` / `MATERI`) |
| 9 | `dibuat_pada` | Timestamp | Waktu berkas diunggah ke sistem |

---

## 5. Daftar 14 Tabel Fisik Terverifikasi (Neon PostgreSQL)

| No | Nama Tabel | Total Kolom | Kunci Utama (PK) | Kunci Asing (FK) Terkait | Fungsi Sistem |
| :---: | :--- | :---: | :--- | :--- | :--- |
| 1 | `biro` | 8 | `id_biro` | - | Data induk unit kerja setingkat Biro |
| 2 | `tim_biro` | 8 | `id_tim` | `id_biro` &rarr; `biro` | Kelompok kerja / tim teknis di bawah biro |
| 3 | `penomoran_rapat_biro` | 5 | `id_penomoran` | `id_biro` &rarr; `biro` | *Auto-sequence* counter nomor agenda per biro |
| 4 | `rapat_biro` | 2 | `id_rapat`, `id_biro` | `id_rapat` &rarr; `rapat`, `id_biro` &rarr; `biro` | Tabel perantara (*junction*) keterlibatan lintas biro |
| 5 | `pengguna` | 10 | `id_pengguna` | `id_biro` &rarr; `biro`, `id_tim` &rarr; `tim_biro` | Akun pengguna, hak akses, dan autentikasi |
| 6 | `rapat` | 31 | `id_rapat` | `id_biro`, `id_tim`, `id_pengguna`, `id_notulis`, `id_rapat_sebelumnya` | Entitas transaksi utama data log rapat |
| 7 | `notulen_rapat` | 8 | `id_notulen` | `id_rapat` &rarr; `rapat` | Isi notula resmi, agenda, arahan, dan kesimpulan |
| 8 | `komentar_notulen` | 11 | `id_komentar` | `id_rapat`, `id_pengguna`, `id_induk` | Kolaborasi review draft notula secara berjenjang |
| 9 | `riwayat_notulen` | 9 | `id_riwayat` | `id_rapat`, `id_pengguna` | Rekam jejak audit perbaikan dan revisi notula |
| 10 | `peserta_rapat` | 5 | `id_peserta` | `id_rapat`, `id_pengguna` | Daftar presensi dan status kehadiran rapat |
| 11 | `lampiran_rapat` | 9 | `id_lampiran` | `id_rapat` &rarr; `rapat` | Metadata dokumen pendukung & berkas paparan |
| 12 | `notifikasi` | 8 | `id_notifikasi` | `id_pengguna` &rarr; `pengguna` | Pemberitahuan real-time agenda dan tindak lanjut |
| 13 | `tindak_lanjut` | 13 | `id_tindak_lanjut` | `id_rapat`, `id_biro`, `id_tim`, `id_pengguna` | Matriks action items dan tanggung jawab penugasan |
| 14 | `riwayat_tindak_lanjut` | 8 | `id_riwayat` | `id_tindak_lanjut`, `id_pengguna` | Log persentase progres dan histori tindak lanjut |

---

## 6. Cara Menggunakan File di Draw.io

1. Akses [https://app.diagrams.net](https://app.diagrams.net) di peramban web Anda.
2. Pilih menu **Open Existing Diagram** &rarr; buka berkas [`docs/DESAIN_DATABASE_Log_Book_Rapat.drawio`](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/DESAIN_DATABASE_Log_Book_Rapat.drawio).
3. Anda dapat beralih antar-tab di bagian bawah layar:
   - **Tab 1:** Contoh Acuan Foto (8 Tabel Layanan Permohonan Informasi).
   - **Tab 2:** Log_Book_Rapat KEK RI (8 Tabel Inti Tata Letak Foto Sesuai Acuan).
   - **Tab 3:** Log_Book_Rapat KEK RI (14 Entitas Lengkap Sesuai Neon PostgreSQL).
4. Untuk menyematkan ke dokumen Word laporan skripsi:
   * Pilih menu **File &rarr; Export as &rarr; PNG**.
   * Centang **Transparent Background** (opsional) dan tentukan **Zoom: 300% (300 DPI)** agar hasil cetakan diagram tidak pecah atau buram.

---

*Dokumen ini merupakan bagian dari rangkaian dokumentasi resmi rekayasa perangkat lunak Log_Book_Rapat KEK RI ([Tahap 1: ERD](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/1_ERD_DIAGRAM.md) &bull; [Tahap 2: LRS](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/2_LRS_DIAGRAM.md) &bull; [Tahap 3: Use Case](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/3_USE_CASE_DIAGRAM.md) &bull; [Tahap 4: Activity Diagram](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/4_ACTIVITY_DIAGRAM.md) &bull; [Tahap 5: Desain Database](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/5_DESAIN_DATABASE.md)).*
