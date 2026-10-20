# PERANCANGAN UML USE CASE DIAGRAM (SUB-BAB 3.2.2.a)
## Sistem Informasi Log & Notula Rapat (Log_Book_Rapat KEK RI)
**Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus Republik Indonesia**

Dokumen ini memuat perancangan resmi **UML Use Case Diagram** untuk Website Log & Notula Rapat KEK, mencakup identifikasi Aktor, Batasan Sistem (*System Boundary*), Relasi Asosiasi, `«include»`, `«extend»`, serta Generalisasi Aktor.

> [!NOTE]
> **Penempatan pada Laporan PKL (Pedoman PKL UBSI Tahun 2026 Halaman 30 – 31 No. 3):**  
> Diagram ini ditempatkan pada **BAB III PEMBAHASAN &rarr; 3.2. Pembuatan Program &rarr; 3.2.2. Design Program &rarr; a. Use Case Diagram**.

---



## 1. File Draw.io Siap Pakai (Multi-Tab)

File diagram Draw.io resmi telah disediakan di repository dalam arsitektur **Multi-Tab**:
* **Lokasi File Lokal:** [`docs/USE_CASE_Log_Book_Rapat.drawio`](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/USE_CASE_Log_Book_Rapat.drawio)
* **Tautan Unduh Web:** [http://localhost:3000/USE_CASE_Log_Book_Rapat.drawio](http://localhost:3000/USE_CASE_Log_Book_Rapat.drawio)
* **Preview Interaktif:** [http://localhost:3000/uml-viewer.html](http://localhost:3000/uml-viewer.html)

### Struktur Tab pada Berkas Draw.io:
1. **Tab 1: `1. Use Case Standar (Format Contoh)`**
   - Format klasik sesuai contoh standar perancangan UML (seperti contoh referensi diagram ATM / perbankan).
   - Menampilkan batas sistem vertikal `«subsystem» Log_Book_Rapat KEK RI` dengan susunan **12 kasus penggunaan (*use case*) vertikal**.
   - Aktor operasional di sisi kiri: **Staf Pelaksana** & **Admin Biro / Tim**.
   - Aktor pengawas di sisi kanan: **Super Admin** (Pimpinan Sekjen).
   - Garis asosiasi lurus, bersih, tanpa persilangan garis (*zero line crossing*), sangat mudah dipahami oleh dosen penguji dan reviewer.
2. **Tab 2: `2. Use Case Komprehensif (27 UC & 6 Modul)`**
   - Format rinci berbasis 6 modul fungsional sistem.
   - Mencakup relasi `«include»`, `«extend»`, dan hierarki generalisasi aktor untuk dokumentasi akademik tingkat lanjut.

---

## 2. Identifikasi Aktor Sistem

Sistem membedakan pengguna ke dalam 3 tingkatan peran (*role*) hierarki berbasis prinsip **Generalisasi Aktor (*Actor Inheritance*)**:

| No | Nama Aktor | Posisi Diagram (Tab 1) | Deskripsi Peran & Tanggung Jawab | Hak Akses Utama |
|:---|:-----------|:-----------------------|:--------------------------------|:----------------|
| 1  | **Staf Pelaksana** *(Pegawai / PIC)* | Kiri Atas | Pegawai internal Sekretariat Dewan Nasional KEK yang menghadiri rapat dinas atau ditugaskan sebagai Penanggung Jawab (PIC) tindak lanjut. | • Login & autentikasi sistem.<br>• Melihat daftar & detail agenda rapat.<br>• Melakukan presensi kehadiran rapat.<br>• Mengunduh materi & risalah notula.<br>• Memperbarui progres butir tindak lanjut. |
| 2  | **Admin Biro / Tim** *(Pengelola Rapat)* | Kiri Bawah | Pengelola administrasi persuratan dan notulis pada Biro/Tim Kerja KEK (Tim Investasi, Kerja Sama, Komunikasi). Mewarisi seluruh hak akses **Staf Pelaksana**. | • Menjadwalkan agenda rapat baru.<br>• Mengelola daftar undangan & peserta rapat.<br>• Pencatatan & penyusunan notula risalah resmi.<br>• Mengelola butir tindak lanjut, penetapan PIC & deadline.<br>• Mengunggah berkas dokumen lampiran rapat. |
| 3  | **Super Admin** *(Pimpinan / Admin Sistem)* | Kanan Tengah | Administrator utama Sekretariat Jenderal Dewan Nasional KEK yang berwenang atas pengawasan menyeluruh dan tata kelola sistem. Mewarisi seluruh hak akses **Admin Biro/Tim**. | • Monitoring kinerja 3 Tim Kerja KEK (Investasi, Kerja Sama, Komunikasi).<br>• Validasi dan pengesahan notula rapat.<br>• Manajemen data pengguna & penetapan peran (*role*).<br>• Manajemen master Biro dan 3 Tim Kerja KEK.<br>• Pengawasan menyeluruh atas seluruh agenda dan log rapat. |

---

## 3. Visualisasi Mermaid Use Case Diagram

### 3.1. Format Standar (Sesuai Contoh Referensi Gambar - Tab 1)

```mermaid
flowchart LR
    %% Aktor Kiri
    subgraph AKTOR_KIRI["Aktor Operasional"]
        Staff["👤 Staf Pelaksana<br/>(Pegawai / PIC)"]
        Admin["👤 Admin Biro / Tim<br/>(Pengelola Rapat)"]
    end

    %% Batasan Sistem Vertikal
    subgraph SYSTEM["«subsystem» Log_Book_Rapat KEK RI"]
        UC01(["Login & Autentikasi Sistem"])
        UC02(["Lihat Agenda & Detail Rapat"])
        UC03(["Presensi Kehadiran Peserta"])
        UC04(["Unduh Notula & Materi Rapat"])
        UC05(["Update Progres Tindak Lanjut"])
        UC06(["Jadwalkan Agenda Rapat Baru"])
        UC07(["Kelola Undangan & Peserta"])
        UC08(["Pencatatan Notula Risalah"])
        UC09(["Kelola Butir Tindak Lanjut & PIC"])
        UC10(["Unggah Dokumen Lampiran Rapat"])
        UC11(["Monitoring Kinerja 3 Tim Kerja"])
        UC12(["Kelola Pengguna & Hak Akses"])
    end

    %% Aktor Kanan
    subgraph AKTOR_KANAN["Aktor Pengawas"]
        SuperAdmin["👤 Super Admin<br/>(Pimpinan Sekjen)"]
    end

    %% Asosiasi Staf Pelaksana (Atas)
    Staff --- UC01
    Staff --- UC02
    Staff --- UC03
    Staff --- UC04
    Staff --- UC05

    %% Asosiasi Admin Biro / Tim (Bawah)
    Admin --- UC06
    Admin --- UC07
    Admin --- UC08
    Admin --- UC09
    Admin --- UC10

    %% Asosiasi Super Admin (Kanan)
    SuperAdmin --- UC01
    SuperAdmin --- UC02
    SuperAdmin --- UC04
    SuperAdmin --- UC08
    SuperAdmin --- UC09
    SuperAdmin --- UC11
    SuperAdmin --- UC12
```

### 3.2. Format Komprehensif Berjenjang (Tab 2)

```mermaid
flowchart LR
    %% Definisi Aktor
    subgraph AKTOR["Aktor Sistem"]
        Staff["👤 Staf Pelaksana"]
        Admin["👤 Admin Biro / Tim"]
        SuperAdmin["👤 Super Admin"]
    end

    %% Generalisasi Aktor
    Admin -->|generalizes| Staff
    SuperAdmin -->|generalizes| Admin

    %% Batasan Sistem
    subgraph SYSTEM["Sistem Informasi Log & Notula Rapat (Log_Book_Rapat KEK RI)"]
        
        %% Modul 1
        subgraph MOD1["1. Modul Autentikasi & Akun"]
            UC01(["UC-01: Login & Logout Sistem"])
            UC02(["UC-02: Kelola Profil Pengguna"])
            UC03(["UC-03: Ganti Kata Sandi"])
        end

        %% Modul 2
        subgraph MOD2["2. Modul Dashboard & Monitoring"]
            UC04(["UC-04: Lihat Dashboard & Kalender"])
            UC05(["UC-05: Monitoring Kinerja 3 Tim Kerja KEK"])
            UC06(["UC-06: Filter Periode Monitoring (Hari/Minggu/Bulan)"])
            UC07(["UC-07: Lihat Detail Rapat Tim"])
        end

        %% Modul 3
        subgraph MOD3["3. Modul Manajemen Agenda Rapat"]
            UC08(["UC-08: Lihat Daftar & Detail Rapat"])
            UC09(["UC-09: Filter & Cari Agenda Rapat"])
            UC10(["UC-10: Buat / Jadwalkan Rapat Baru"])
            UC11(["UC-11: Edit Agenda Rapat"])
            UC12(["UC-12: Batalkan / Hapus Rapat"])
            UC13(["UC-13: Generate Nomor Rapat Otomatis"])
            UC14(["UC-14: Tentukan Klasifikasi Dokumen Masuk"])
            UC15(["UC-15: Kelola Peserta & Pimpinan Rapat"])
            UC16(["UC-16: Presensi Kehadiran Peserta"])
        end

        %% Modul 4
        subgraph MOD4["4. Modul Notula & Dokumen Risalah"]
            UC17(["UC-17: Catat & Susun Notula Rapat"])
            UC18(["UC-18: Unggah & Unduh Lampiran Berkas"])
            UC19(["UC-19: Cetak / Export Dokumen (Notula / Nota Dinas)"])
            UC20(["UC-20: Validasi & Finalisasi Notula"])
        end

        %% Modul 5
        subgraph MOD5["5. Modul Matriks Tindak Lanjut"]
            UC21(["UC-21: Lihat Matriks Tindak Lanjut"])
            UC22(["UC-22: Buat Butir Tindak Lanjut Baru"])
            UC23(["UC-23: Tetapkan Tim, PIC & Tenggat Waktu"])
            UC24(["UC-24: Perbarui Status Tindak Lanjut"])
        end

        %% Modul 6
        subgraph MOD6["6. Modul Administrasi Sistem"]
            UC25(["UC-25: Kelola Data Pengguna & Hak Akses"])
            UC26(["UC-26: Kelola Master Biro & Tim Kerja KEK"])
            UC27(["UC-27: Kelola Pengaturan Sistem"])
        end

    end

    %% Asosiasi Staf Pelaksana
    Staff --- UC01
    Staff --- UC02
    Staff --- UC04
    Staff --- UC08
    Staff --- UC09
    Staff --- UC18
    Staff --- UC21
    Staff --- UC24

    %% Asosiasi Admin Biro / Tim
    Admin --- UC10
    Admin --- UC11
    Admin --- UC12
    Admin --- UC17
    Admin --- UC20
    Admin --- UC22

    %% Asosiasi Super Admin
    SuperAdmin --- UC05
    SuperAdmin --- UC25
    SuperAdmin --- UC26
    SuperAdmin --- UC27

    %% Relasi Include
    UC10 -.->|«include»| UC13
    UC10 -.->|«include»| UC14
    UC10 -.->|«include»| UC15
    UC15 -.->|«include»| UC16
    UC17 -.->|«include»| UC22
    UC22 -.->|«include»| UC23

    %% Relasi Extend
    UC03 -.->|«extend»| UC02
    UC06 -.->|«extend»| UC05
    UC07 -.->|«extend»| UC05
    UC19 -.->|«extend»| UC08
```

---

## 4. Tabel Spesifikasi Rinci Use Case (Katalog Fungsionalitas)

Berikut adalah rincian lengkap 27 Use Case yang mencakup seluruh alur kerja sistem Log_Book_Rapat KEK:

### 1) Modul Autentikasi & Akun
| ID | Nama Use Case | Aktor Utama | Tipe Relasi | Deskripsi Singkat | Pre-Kondisi | Post-Kondisi |
|:---|:--------------|:------------|:------------|:------------------|:------------|:-------------|
| **UC-01** | Login & Logout Sistem | Staf, Admin, Super Admin | Dasar | Pengguna memverifikasi kredensial email dinas dan password untuk masuk ke sistem. | Akun pengguna berstatus aktif di basis data. | Sesi pengguna terbentuk dan diarahkan ke Dashboard. |
| **UC-02** | Kelola Profil Pengguna | Staf, Admin, Super Admin | Dasar | Pengguna melihat dan memperbarui informasi identitas profil pribadinya. | Pengguna telah login ke sistem. | Data profil tersimpan di database. |
| **UC-03** | Ganti Kata Sandi | Staf, Admin, Super Admin | `«extend»` ke UC-02 | Pengguna memperbarui kata sandi akun secara mandiri untuk keamanan. | Pengguna berada di halaman profil pengguna. | Kata sandi terenkripsi baru berhasil disimpan. |

### 2) Modul Dashboard & Monitoring Kinerja
| ID | Nama Use Case | Aktor Utama | Tipe Relasi | Deskripsi Singkat | Pre-Kondisi | Post-Kondisi |
|:---|:--------------|:------------|:------------|:------------------|:------------|:-------------|
| **UC-04** | Lihat Dashboard Ringkasan & Kalender | Staf, Admin, Super Admin | Dasar | Menampilkan kartu metrik eksekutif, agenda rapat mendatang, tren bulanan, dan kalender. | Pengguna telah berhasil login. | Data agregasi statistik ditampilkan di layar. |
| **UC-05** | Monitoring Kinerja 3 Tim Kerja KEK | Super Admin | Dasar | Menampilkan beban kerja dan status penyelesaian tugas 3 Tim Kerja (Investasi, Kerja Sama, Komunikasi). | Pengguna memiliki hak akses Super Admin. | Modal monitoring dan grafik beban kerja terbuka. |
| **UC-06** | Filter Periode Kinerja Tim | Super Admin | `«extend»` ke UC-05 | Menyaring indikator kinerja tim berdasarkan pilihan waktu (*Semua Waktu, Hari Ini, Minggu Ini, Bulan Ini*). | Modal monitoring kinerja tim terbuka. | Angka KPI dan daftar rapat/pekerjaan terfilter secara reaktif. |
| **UC-07** | Lihat Detail Rapat Tim Langsung | Super Admin | `«extend»` ke UC-05 | Membuka rincian notula rapat langsung dari kartu atau baris pekerjaan tim. | Modal monitoring kinerja tim terbuka. | Halaman rincian rapat (`/semua-rapat/[id]`) terbuka. |

### 3) Modul Manajemen Agenda Rapat
| ID | Nama Use Case | Aktor Utama | Tipe Relasi | Deskripsi Singkat | Pre-Kondisi | Post-Kondisi |
|:---|:--------------|:------------|:------------|:------------------|:------------|:-------------|
| **UC-08** | Lihat Daftar & Detail Rapat | Staf, Admin, Super Admin | Dasar | Menampilkan daftar seluruh agenda rapat dinas beserta rincian informasi dan statusnya. | Pengguna memiliki sesi login aktif. | Informasi rapat tersaji lengkap. |
| **UC-09** | Filter & Cari Agenda Rapat | Staf, Admin, Super Admin | Dasar | Melakukan pencarian berdasarkan nomor rapat, judul, biro, tim kerja, dan tanggal. | Pengguna berada di halaman Semua Rapat. | Daftar tabel rapat terfilter sesuai kata kunci. |
| **UC-10** | Buat / Jadwalkan Rapat Baru | Admin, Super Admin | Dasar | Mendaftarkan rapat dinas baru dengan formulir data lengkap. | Pengguna memiliki hak akses Admin / Super Admin. | Data agenda rapat baru tersimpan di tabel `rapat`. |
| **UC-11** | Edit Agenda Rapat | Admin, Super Admin | Dasar | Mengubah judul, waktu, lokasi, atau deskripsi agenda rapat yang belum berstatus final. | Rapat telah terdaftar dan belum final. | Perubahan agenda rapat tersimpan. |
| **UC-12** | Batalkan / Hapus Rapat | Admin, Super Admin | Dasar | Membatalkan rapat atau menghapus draf agenda rapat yang dibatalkan pimpinan. | Rapat terdaftar di sistem. | Rapat terhapus / status menjadi dibatalkan. |
| **UC-13** | Generate Nomor Rapat Otomatis | Sistem | `«include»` oleh UC-10 | Sistem otomatis menghitung nomor urut dan menyusun kode surat rapat dinas (misal: `INV-014`). | Form penjadwalan rapat diinisialisasi. | Nomor rapat unik tercatat pada tabel penomoran. |
| **UC-14** | Tentukan Kategori Dokumen Masuk | Admin, Super Admin | `«include»` oleh UC-10 | Menetapkan dasar undangan (Disposisi Sekjen, Undangan Internal, Naskah Masuk SRIKANDI). | Form penjadwalan rapat sedang diisi. | Klasifikasi tersimpan pada data rapat. |
| **UC-15** | Kelola Peserta & Pimpinan Rapat | Admin, Super Admin | `«include»` oleh UC-10 | Menentukan ketua sidang, notulis, biro pemrakarsa, dan daftar pegawai yang diundang. | Data rapat sedang dibuat atau diedit. | Daftar peserta tersimpan di tabel `peserta_rapat`. |
| **UC-16** | Presensi Kehadiran Peserta | Admin, Super Admin | `«include»` oleh UC-15 | Mencatat status kehadiran peserta rapat (*Hadir, Tidak Hadir, Izin, Diundang*). | Rapat telah terselenggara. | Status kehadiran peserta terbarui. |

### 4) Modul Notula & Dokumen Risalah Rapat
| ID | Nama Use Case | Aktor Utama | Tipe Relasi | Deskripsi Singkat | Pre-Kondisi | Post-Kondisi |
|:---|:--------------|:------------|:------------|:------------------|:------------|:-------------|
| **UC-17** | Catat & Susun Notula Rapat | Admin (Notulis), Super Admin | Dasar | Menginput poin-poin pembahasan rapat, arahan pimpinan, keputusan, dan kesimpulan. | Rapat telah dibuat dan berlangsung. | Notula tersimpan di tabel `notulen_rapat`. |
| **UC-18** | Unggah & Unduh Berkas Lampiran | Staf, Admin, Super Admin | Dasar | Mengunggah materi presentasi, naskah dinas, atau mengunduh berkas pendukung rapat. | Rapat terdaftar di sistem. | File tersimpan di storage dan metadata di tabel lampiran. |
| **UC-19** | Cetak / Export Dokumen Resmi | Staf, Admin, Super Admin | `«extend»` ke UC-08 | Mengenerate naskah Notula resmi atau Nota Dinas berstandar tata naskah KEK dalam format cetak/PDF. | Rapat memiliki notula yang tersusun. | Naskah cetak siap unduh atau print. |
| **UC-20** | Validasi & Finalisasi Notula | Admin, Super Admin | Dasar | Mengubah status notula menjadi Final/Disetujui setelah diverifikasi pimpinan. | Notula berstatus draf atau tinjauan. | Notula berstatus final dan terkunci dari perubahan. |

### 5) Modul Matriks Tindak Lanjut (Action Items)
| ID | Nama Use Case | Aktor Utama | Tipe Relasi | Deskripsi Singkat | Pre-Kondisi | Post-Kondisi |
|:---|:--------------|:------------|:------------|:------------------|:------------|:-------------|
| **UC-21** | Lihat Matriks Tindak Lanjut | Staf, Admin, Super Admin | Dasar | Menampilkan tabel matriks seluruh butir instruksi rapat dengan status, prioritas, dan PIC. | Pengguna telah login ke sistem. | Matriks tindak lanjut tampil terstruktur. |
| **UC-22** | Buat Butir Tindak Lanjut Baru | Admin, Super Admin | `«include»` oleh UC-17 | Menambahkan butir pekerjaan konkret yang diputuskan dalam agenda rapat dinas. | Rapat memiliki butir arahan/keputusan. | Record tersimpan di tabel `tindak_lanjut`. |
| **UC-23** | Tetapkan Tim, PIC & Tenggat Waktu | Admin, Super Admin | `«include»` oleh UC-22 | Mengalokasikan tanggung jawab kepada Tim Kerja (INV/KS/KOM), pegawai (PIC), dan tanggal batas waktu. | Butir tindak lanjut dibuat. | PIC dan due date terasosiasi ke record. |
| **UC-24** | Perbarui Status Tindak Lanjut | Staf (PIC), Admin, Super Admin | Dasar | Memperbarui perkembangan pelaksanaan pekerjaan (*Belum Dimulai, Dalam Proses, Selesai*). | PIC memiliki butir penugasan aktif. | Status dan persentase progres pekerjaan terbarui. |

### 6) Modul Administrasi Sistem
| ID | Nama Use Case | Aktor Utama | Tipe Relasi | Deskripsi Singkat | Pre-Kondisi | Post-Kondisi |
|:---|:--------------|:------------|:------------|:------------------|:------------|:-------------|
| **UC-25** | Kelola Data Pengguna & Hak Akses | Super Admin | Dasar | Menambah, menyunting data pegawai, menetapkan biro/tim, mengatur peran (*role*), dan menonaktifkan akun. | Pengguna berstatus Super Admin. | Data akun pengguna terbarui di database. |
| **UC-26** | Kelola Master Biro & Tim Kerja KEK | Super Admin | Dasar | Mengatur data master unit kerja Biro IKK serta 3 Tim Kerja KEK (Investasi, Kerja Sama, Komunikasi). | Pengguna berstatus Super Admin. | Struktur organisasi unit kerja tersinkronisasi. |
| **UC-27** | Kelola Pengaturan Sistem | Super Admin | Dasar | Mengonfigurasi parameter aplikasi, format penomoran surat, dan preferensi sistem. | Pengguna berstatus Super Admin. | Konfigurasi sistem tersimpan. |

---

## 5. Ringkasan Prinsip Relasi UML yang Diterapkan

1. **Relasi Asosiasi (*Association - Garis Lurus Tanpa Panah*):**
   Menghubungkan Aktor dengan Use Case yang dapat diinisiasi atau diakses langsung oleh aktor tersebut.
2. **Relasi Generalisasi (*Generalization - Garis Berujung Panah Segitiga Kosong*):**
   - `Admin Biro / Tim` &rarr; `Staf Pelaksana`: Segala fungsionalitas yang dapat dilakukan oleh Staf otomatis dapat dilakukan oleh Admin.
   - `Super Admin` &rarr; `Admin Biro / Tim`: Segala fungsionalitas Admin otomatis dapat dilakukan oleh Super Admin.
3. **Relasi `«include»` (*Panah Putus-putus ke Arah Use Case Sasaran*):**
   Menunjukkan bahwa Use Case induk **selalu dan wajib** mengeksekusi Use Case anak untuk menyelesaikan tugasnya (contoh: *Buat Rapat* **wajib menyertakan** *Generate Nomor Rapat Otomatis*, *Tentukan Kategori*, dan *Kelola Peserta*).
4. **Relasi `«extend»` (*Panah Putus-putus ke Arah Use Case Induk*):**
   Menunjukkan bahwa Use Case perluasan menyediakan kemampuan **tambahan/opsional** di bawah kondisi tertentu (contoh: *Cetak / Export Dokumen* memperluas *Lihat Detail Rapat*; *Filter Periode Tanggal* memperluas *Monitoring Kinerja Tim*).

---

*Dokumen ini merupakan bagian dari rangkaian dokumentasi resmi rekayasa perangkat lunak Log_Book_Rapat KEK RI ([Tahap 1: ERD](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/1_ERD_DIAGRAM.md) &bull; [Tahap 2: LRS](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/2_LRS_DIAGRAM.md) &bull; [Tahap 3: Use Case](file:///c:/Users/nappz/Documents/Project%20Website/Projek%20Log%20Rapat/docs/3_USE_CASE_DIAGRAM.md)).*
