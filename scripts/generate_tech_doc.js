const fs = require('fs');

async function main() {
  const tokenData = JSON.parse(fs.readFileSync('C:/Users/nappz/.config/google-drive-mcp/tokens.json', 'utf8'));
  const account = tokenData.accounts[tokenData.defaultAccount];
  const docId = '1BiRl5kqt1odLjdrFOS7pA6NkNOKt-sK_H0bX9AQ1qdg';

  console.log('1. Mempersiapkan naskah Dokumen Teknis Website Log Book Notula Rapat KEK...');

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dokumen Teknis Website Log Book Notula Rapat KEK</title>
  <style>
    body {
      font-family: Arial, Calibri, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
    }
    h1 {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 24pt;
      color: #0f3741;
      text-transform: uppercase;
    }
    h2 {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 6pt;
      color: #1b4955;
      border-bottom: 1.5px solid #31889C;
      padding-bottom: 3pt;
    }
    h3 {
      font-size: 11.5pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 4pt;
      color: #215865;
    }
    h4 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 8pt;
      margin-bottom: 3pt;
      color: #333333;
    }
    p {
      margin-top: 0;
      margin-bottom: 6pt;
      text-align: justify;
    }
    ul, ol {
      margin-top: 2pt;
      margin-bottom: 8pt;
      padding-left: 20pt;
    }
    li {
      margin-bottom: 3pt;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 14pt;
      font-size: 9.5pt;
    }
    table, th, td {
      border: 1px solid #cbd5e1;
    }
    th {
      background-color: #f1f8f9;
      color: #134e5e;
      font-weight: bold;
      text-align: left;
      padding: 6pt 8pt;
    }
    td {
      padding: 5pt 8pt;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #fafbfc;
    }
    .table-title {
      font-weight: bold;
      margin-top: 10pt;
      margin-bottom: 3pt;
      color: #134e5e;
      font-size: 10pt;
    }
    .center {
      text-align: center;
    }
  </style>
</head>
<body>

  <h1>DOKUMEN TEKNIS PENGEMBANGAN WEBSITE SISTEM INFORMASI LOG BOOK NOTULA RAPAT DEWAN NASIONAL KAWASAN EKONOMI KHUSUS</h1>

  <h2>1. Pendahuluan</h2>

  <h3>1.1. Latar Belakang</h3>
  <p>Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus (Setjen DN KEK RI) memegang peranan krusial dalam mengoordinasikan perumusan kebijakan, pengawasan operasional, serta fasilitasi investasi di seluruh kawasan ekonomi khusus di Indonesia. Pelaksanaan tugas kedinasan tersebut melibatkan koordinasi intensif antar 5 (lima) Biro utama, yaitu: Biro Perencanaan dan Pembentukan KEK (BPPK), Biro Pengendalian KEK (PKKEK), Biro Investasi, Kerja Sama, dan Komunikasi (IKK), Biro Hukum, Sumber Daya Manusia, dan Organisasi (HSDMO), serta Biro Umum dan Keuangan (UK), bersama kelompok tim kerja fungsional terkait (seperti Tim Investasi, Tim Kerja Sama, dan Tim Komunikasi).</p>
  
  <p>Dalam tata kelola pemerintahan kedinasan, rapat merupakan instrumen formal utama untuk pengambilan keputusan strategis dan penentuan arah kebijakan. Setiap rapat dinas menghasilkan dokumen penting berupa agenda, daftar presensi kehadiran, risalah notulensi, dan komitmen butir tindak lanjut (<em>action items</em>). Sebelum diterapkannya sistem digital terpadu, pengelolaan rapat menghadapi sejumlah kendala operasional:</p>
  <ol>
    <li>Pencatatan agenda dan buku log book rapat dinas masih dilakukan secara terpisah di masing-masing unit kerja atau menggunakan lembar spreadsheet lokal yang rentan inkonsistensi penomoran.</li>
    <li>Penyusunan risalah notulensi membutuhkan waktu lama dan seringkali terpisah dari berkas dokumen pendukung resmi (seperti surat undangan dinas dan materi paparan narasumber).</li>
    <li>Pemantauan komitmen tindak lanjut (<em>action items</em>) pasca-rapat dinas sulit dimonitor secara transparan dan akuntabel, sehingga berisiko terjadinya keterlambatan atas keputusan yang telah disepakati bersama.</li>
    <li>Distribusi notulensi dan penugasan tindak lanjut kepada Person in Charge (PIC) belum terotomasi dengan pembagian hak akses berjenjang.</li>
  </ol>
  
  <p>Untuk menyelesaikan permasalahan tersebut, dikembangkanlah Sistem Informasi Log Book Notula Rapat berbasis website terintegrasi. Sistem ini mendigitalkan seluruh siklus hidup rapat (<em>meeting lifecycle</em>), menyediakan penomoran rapat otomatis terstandar, memfasilitasi pencatatan notulensi interaktif, menyediakan matriks pemantauan tindak lanjut secara realtime, serta mendukung prinsip tata kelola pemerintahan yang efektif, efisien, transparan, dan akuntabel.</p>

  <h3>1.2. Tujuan Dokumen</h3>
  <p>Dokumen teknis ini disusun dengan tujuan sebagai berikut:</p>
  <ol>
    <li>Menjadi acuan teknis utama dalam pengembangan, pengujian, implementasi, dan pemeliharaan Website Log Book Notula Rapat Dewan Nasional KEK.</li>
    <li>Memberikan gambaran komprehensif mengenai arsitektur sistem, alur proses bisnis persidangan dinas, serta spesifikasi teknologi yang diterapkan.</li>
    <li>Mendokumentasikan struktur basis data relasional, kamus data tabel, integritas foreign key, dan tata kelola hak akses berbasis peran (RBAC).</li>
    <li>Memudahkan tim teknis dan pengembang dalam melakukan pemeliharaan rutin maupun pengembangan fitur lanjutan di masa mendatang.</li>
    <li>Menjadi dokumen referensi resmi bagi mentor instansi, pimpinan unit kerja, serta akademisi dalam pertanggungjawaban karya teknologi kedinasan.</li>
  </ol>

  <h3>1.3. Ruang Lingkup Sistem</h3>
  <p>Ruang lingkup fungsional dan teknis dari Website Log Book Notula Rapat Dewan Nasional KEK mencakup:</p>
  <ol>
    <li><strong>Manajemen Penjadwalan Rapat Dinas:</strong> Pencatatan metadata rapat (judul, biro/tim penyelenggara, waktu mulai/selesai, lokasi fisik/virtual, pimpinan rapat, dan notulis).</li>
    <li><strong>Penomoran Rapat Otomatis:</strong> Pembangkitan kode nomor surat/rapat dinas unik secara berurutan per biro dan tahun berjalan (Format: <code>NOMOR/KODE_BIRO/BULAN/TAHUN</code>).</li>
    <li><strong>Presensi dan Kehadiran Peserta:</strong> Pencatatan daftar undangan peserta internal pejabat/staf KEK serta tamu eksternal lintas kementerian/lembaga/swasta, dilengkapi status presensi dan tanda tangan kehadiran.</li>
    <li><strong>Pencatatan Notulensi Digital Interaktif:</strong> Editor risalah rapat terstruktur meliputi agenda pembahasan, dinamika diskusi sidang, butir keputusan resmi, dan kesimpulan rapat.</li>
    <li><strong>Alur Pengesahan Notulensi Berjenjang:</strong> Mekanisme review notulis dan pengesahan resmi oleh Pimpinan Rapat (Status: <code>DRAFT</code> &rarr; <code>REVIEW</code> &rarr; <code>APPROVED</code> &rarr; <code>FINAL</code>).</li>
    <li><strong>Matriks Pemantauan Tindak Lanjut (Action Items):</strong> Distribusi butir komitmen rapat kepada PIC penanggung jawab dan tim pelaksana dengan atribut tenggat waktu (<em>due date</em>) serta skala prioritas.</li>
    <li><strong>Pelacakan Progres Komitmen Rapat:</strong> Pembaruan status tindak lanjut (<strong>Belum Dimulai</strong>, <strong>Dalam Proses</strong>, <strong>Selesai</strong>, <strong>Terlambat</strong>) dan status progres keseluruhan rapat (<code>Start</code>, <code>On Progress</code>, <code>Done</code>).</li>
    <li><strong>Manajemen Pengarsipan Dokumen Rapat:</strong> Pengunggahan dan penyimpanan terpusat untuk surat undangan dinas, kategori dokumen, serta materi paparan rapat.</li>
    <li><strong>Manajemen Pengguna Berbasis Peran & Tim (Team-Scoped RBAC):</strong> Otorisasi 4 peran (Super Admin, Administrator Tim, Pimpinan, Staf) dengan pemisahan wewenang pengelolaan anggota per tim kerja.</li>
    <li><strong>Dashboard Eksekutif & Ekspor Laporan Resmi:</strong> Visualisasi statistik rapat, persentase penyelesaian komitmen, serta fitur cetak/ekspor risalah notulen ke format PDF standar dinas.</li>
  </ol>

  <h3>1.4. Definisi Istilah</h3>
  <p>Istilah-istilah teknis dan kedinasan yang digunakan dalam dokumen ini antara lain:</p>
  <ol>
    <li><strong>Sistem Log Book Notula Rapat:</strong> Sistem Informasi Pengelolaan Log Book dan Risalah Notula Rapat pada Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus.</li>
    <li><strong>Notula / Risalah Rapat:</strong> Catatan resmi autentik mengenai jalannya rapat dinas, pokok-pokok pembahasan, kesepakatan, dan keputusan yang mengikat.</li>
    <li><strong>Tindak Lanjut (<em>Action Item</em>):</strong> Butir penugasan operasional konkret hasil kesepakatan rapat yang wajib diselesaikan oleh unit kerja atau PIC dalam batas waktu tertentu.</li>
    <li><strong>PIC (<em>Person in Charge</em>):</strong> Aparatur pejabat atau staf yang ditunjuk sebagai penanggung jawab utama atas penyelesaian butir komitmen tindak lanjut.</li>
    <li><strong>Nomor Rapat Dinas:</strong> Kode unik penomoran rapat dinas yang digenerate otomatis oleh sistem secara sistematis per biro dan tahun.</li>
    <li><strong>Biro:</strong> Unit kerja eselon II di lingkungan Sekretariat Jenderal Dewan Nasional KEK (BPPK, PKKEK, IKK, HSDMO, UK).</li>
    <li><strong>Tim Kerja:</strong> Unit kelompok kerja fungsional di bawah biro (misalnya: Tim Investasi, Tim Kerja Sama, dan Tim Komunikasi pada Biro IKK).</li>
    <li><strong>RBAC (<em>Role-Based Access Control</em>):</strong> Mekanisme pembatasan hak akses fitur dan mutasi data berdasarkan peran pengguna kedinasan.</li>
    <li><strong>Frontend:</strong> Antarmuka web modern yang berinteraksi langsung dengan pengguna (dibangun dengan Next.js & React).</li>
    <li><strong>Server Actions & Backend:</strong> Lapisan server pada Next.js yang memproses logika bisnis, validasi keamanan Zod, dan interaksi basis data PostgreSQL.</li>
  </ol>

  <h2>2. Gambaran Umum Sistem</h2>

  <h3>2.1. Deskripsi Sistem</h3>
  <p>Website Log Book Notula Rapat merupakan sistem manajemen siklus hidup rapat kedinasan (<em>meeting lifecycle management</em>) yang mengintegrasikan seluruh tahapan persidangan kedinasan dalam satu platform terpadu:</p>
  <ul>
    <li><strong>Tahap Pra-Rapat:</strong> Inisiasi penjadwalan rapat dinas, alokasi nomor surat otomatis, penentuan pimpinan dan notulis, pendaftaran peserta undangan internal/eksternal, serta pengunggahan surat undangan resmi.</li>
    <li><strong>Tahap Pelaksanaan Rapat:</strong> Verifikasi presensi kehadiran peserta secara realtime serta pencatatan draf risalah notulensi secara langsung melalui antarmuka web.</li>
    <li><strong>Tahap Pasca-Rapat:</strong> Penyempurnaan naskah risalah rapat, pengajuan review dan pengesahan oleh pimpinan, pencatatan butir komitmen tindak lanjut, distribusi tugas kepada PIC terkait, pemantauan status penyelesaian tugas, serta pelaporan statistik eksekutif.</li>
  </ul>
  <p>Sistem dirancang terpadu antara sisi antarmuka pengguna responsif dan lapisan server actions yang aman, menjamin keakuratan dokumentasi persidangan dinas serta keterbukaan informasi bagi seluruh pimpinan dan staf.</p>

  <h3>2.2. Aktor / Pengguna</h3>
  <p>Sistem Log Book Notula Rapat melibatkan 4 (empat) jenis peran pengguna kedinasan:</p>
  <ol>
    <li><strong>Super Admin (Super Administrator):</strong>
      <ul>
        <li>Memiliki hak akses penuh (<em>global scope</em>) ke seluruh data rapat, notulensi, dan tindak lanjut di seluruh biro.</li>
        <li>Mengelola master data pengguna sistem, master data biro, dan kelompok tim kerja.</li>
        <li>Menetapkan peran (role) pengguna dan mengelola pengaturan sistem global.</li>
        <li>Memantau audit trail dan rekapitulasi data lintas biro.</li>
      </ul>
    </li>
    <li><strong>Admin Tim Kerja (Administrator Tim / Biro):</strong>
      <ul>
        <li>Mengelola agenda penjadwalan rapat dinas pada biro dan tim kerjanya.</li>
        <li>Mengakses menu manajemen anggota tim untuk menambah personel staf baru atau mengelola akun tim kerjanya (<em>team-scoped</em>).</li>
        <li>Memantau jalannya penyusunan notulensi dan progres butir tindak lanjut pada tim kerjanya.</li>
        <li>Mengunggah dokumen pendukung dan surat undangan rapat.</li>
      </ul>
    </li>
    <li><strong>Pimpinan (Pimpinan Biro / Pimpinan Sidang):</strong>
      <ul>
        <li>Meninjau (<em>review</em>) seluruh agenda rapat dinas dan draf notulensi yang diajukan.</li>
        <li>Memberikan persetujuan dan pengesahan resmi atas risalah notulensi rapat dinas.</li>
        <li>Mengakses dashboard analitik eksekutif untuk memantau matriks komitmen tindak lanjut dan performa penyelesaian tugas lintas biro.</li>
      </ul>
    </li>
    <li><strong>Staf (Notulis & Staf Pelaksana):</strong>
      <ul>
        <li>Bertindak sebagai notulis: mencatat draf risalah notulensi, dinamika diskusi, butir keputusan, dan kesimpulan rapat.</li>
        <li>Mencatat dan mengonfirmasi presensi kehadiran peserta rapat (internal dan eksternal).</li>
        <li>Mengakses butir tindak lanjut yang ditugaskan kepadanya (sebagai PIC) dan memperbarui catatan progres serta status penyelesaian tugas.</li>
      </ul>
    </li>
  </ol>

  <h3>2.3. Alur Proses Utama</h3>

  <h4>a. Alur Penjadwalan Rapat Dinas</h4>
  <ol>
    <li>Pengguna (Admin atau Staf) membuka formulir pembuatan rapat baru pada menu <strong>Buat Rapat</strong>.</li>
    <li>Mengisi formulir metadata: Judul Rapat, Biro Penyelenggara, Tim Kerja, Tanggal Rapat, Waktu Mulai & Selesai, Lokasi Rapat (ruang rapat fisik atau tautan virtual/Zoom), Pimpinan Rapat, Notulis, dan PIC Rapat.</li>
    <li>Sistem secara otomatis memeriksa urutan rapat biro terkait pada tahun berjalan dan menerbitkan Kode Nomor Rapat resmi (misal: <code>001/IKK/X/2026</code>).</li>
    <li>Pengguna mengunggah berkas surat undangan dinas dan materi paparan (opsional).</li>
    <li>Sistem memvalidasi tanggal (tidak boleh tanggal masa lampau) dan menyimpan data dengan status awal <code>DRAFT</code>. Rapat kini tercatat di kalender dan log book dinas.</li>
  </ol>

  <h4>b. Alur Presensi Kehadiran Peserta</h4>
  <ol>
    <li>Notulis atau admin mendaftarkan peserta rapat ke dalam daftar kehadiran (memilih pejabat/pegawai KEK dari basis data pengguna atau menginput tamu eksternal kementerian/swasta).</li>
    <li>Peserta mengonfirmasi kehadiran melalui modul presensi.</li>
    <li>Status kehadiran dicatat: <code>PRESENT</code> (Hadir), <code>ABSENT</code> (Tidak Hadir), atau <code>EXCUSED</code> (Izin/Disposisi).</li>
    <li>Waktu presensi dan URL tanda tangan digital (jika ada) terekam otomatis sebagai bukti otentik persidangan.</li>
  </ol>

  <h4>c. Alur Pencatatan dan Pengesahan Notulensi</h4>
  <ol>
    <li>Notulis membuka detail rapat dan mengakses editor risalah notulensi.</li>
    <li>Notulis mencatat rincian rapat ke dalam 4 (empat) bagian terstruktur:
      <ul>
        <li>Agenda Rapat</li>
        <li>Hasil Pembahasan & Dinamika Diskusi Sidang</li>
        <li>Poin Keputusan Resmi</li>
        <li>Kesimpulan & Rekomendasi Rapat</li>
      </ul>
    </li>
    <li>Notulis menyimpan draf notulen dan mengajukan permohonan review kepada Pimpinan Rapat (Status berubah menjadi <code>REVIEW</code>).</li>
    <li>Pimpinan meninjau draf risalah rapat melalui antarmuka sistem.</li>
    <li>Apabila naskah telah disetujui, Pimpinan mengesahkan notulensi sehingga status berubah menjadi <code>APPROVED</code> dan siap difinalisasi ke status <code>FINAL</code>.</li>
    <li>Notulensi berstatus <code>FINAL</code> terkunci (<em>read-only</em>) untuk mencegah perubahan ilegal, serta siap diekspor menjadi dokumen PDF resmi.</li>
  </ol>

  <h4>d. Alur Monitoring dan Distribusi Tindak Lanjut (Action Items)</h4>
  <ol>
    <li>Berdasarkan butir keputusan rapat, notulis atau admin menambahkan butir-butir tindak lanjut pada matriks Action Items.</li>
    <li>Setiap butir dilengkapi: Uraian Komitmen, Biro & Tim Pelaksana, Akun Aparatur/Nama PIC, Batas Waktu Penyelesaian (<em>Due Date</em>), dan Skala Prioritas (<em>Low, Medium, High, Urgent</em>).</li>
    <li>Status awal butir tindak lanjut tercatat sebagai <strong>Belum Dimulai</strong>.</li>
    <li>PIC yang bersangkutan menerima notifikasi penugasan dan memperbarui progres pengerjaan menjadi <strong>Dalam Proses</strong> disertai catatan realisasi.</li>
    <li>Jika tugas telah tuntas, status diubah menjadi <strong>Selesai</strong>.</li>
    <li>Apabila batas waktu terlampaui dan tugas belum selesai, sistem secara otomatis melabeli status sebagai <strong>Terlambat</strong> sebagai bahan evaluasi pimpinan.</li>
  </ol>

  <h3>2.4. Fitur Utama Sistem</h3>
  <ol>
    <li><strong>Form Penjadwalan Rapat Terintegrasi:</strong> Input metadata rapat dinas lengkap dengan generator nomor urut rapat otomatis.</li>
    <li><strong>Editor Notulensi Digital Interaktif:</strong> Pencatatan risalah rapat dinas terstruktur (agenda, pembahasan, keputusan, kesimpulan).</li>
    <li><strong>Matriks Pemantauan Tindak Lanjut (Action Items):</strong> Pelacakan komitmen kerja pasca-rapat secara realtime berbasis PIC dan deadline.</li>
    <li><strong>Modul Presensi Kehadiran Peserta:</strong> Pencatatan status hadir/izin peserta internal KEK dan tamu eksternal.</li>
    <li><strong>Pengarsipan Berkas Digital Rapat:</strong> Pengunggahan surat undangan, kategori dokumen pendukung, dan materi paparan rapat.</li>
    <li><strong>Dashboard Analitik Eksekutif:</strong> Visualisasi grafik tren rapat, distribusi per biro, dan rasio penyelesaian tindak lanjut.</li>
    <li><strong>Manajemen Pengguna Berbasis Tim (Team-Scoped RBAC):</strong> Pengelolaan akun staf dinas yang terisolasi aman per kelompok tim kerja.</li>
    <li><strong>Ekspor Dokumen Resmi:</strong> Pembangkitan dokumen cetak risalah notulen ke format PDF standar kedinasan dan log book rekapitulasi.</li>
    <li><strong>Sistem Notifikasi In-App:</strong> Pemberitahuan lonceng notifikasi otomatis untuk penugasan rapat dan peringatan tenggat waktu tugas.</li>
    <li><strong>Riwayat Perubahan & Audit Trail:</strong> Pencatatan riwayat revisi naskah notulensi untuk menjamin akuntabilitas data persidangan.</li>
  </ol>

  <h3>2.5. Batasan Sistem</h3>
  <ol>
    <li>Sistem diakses melalui jaringan internet/intranet menggunakan web browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).</li>
    <li>Validasi tanggal pelaksanaan rapat terikat aturan integritas bisnis (tidak dapat memilih tanggal sebelum hari ini / tidak bisa mundur).</li>
    <li>Hak akses data dan operasi mutasi dibatasi secara ketat oleh peran RBAC (Super Admin, Admin, Pimpinan, Staf).</li>
    <li>Administrator Tim hanya berwenang menambah dan mengelola anggota staf dalam lingkup tim kerjanya sendiri, serta dilarang memanipulasi akun Super Admin.</li>
    <li>Kapasitas berkas dokumen lampiran yang diunggah dibatasi maksimal 10 MB per berkas dengan format PDF, DOCX, atau PPTX.</li>
  </ol>

  <h2>3. Arsitektur Sistem</h2>

  <h3>3.1. Gambaran Arsitektur Sistem</h3>
  <p>Website Log Book Notula Rapat dibangun menggunakan arsitektur modern berbasis framework <strong>Next.js 14+ (App Router)</strong> dengan bahasa pemrograman <strong>TypeScript</strong>. Sistem mengadopsi pola <em>Modern Fullstack Component-Based Architecture</em> yang menyatukan rendering antarmuka pengguna dan eksekusi server actions dalam satu arsitektur terpadu.</p>
  
  <p>Seluruh interaksi client-server diamankan menggunakan enkripsi <strong>HTTPS/TLS</strong>. Permintaan mutasi data dari browser pengguna diproses langsung oleh Next.js Server Actions yang menjalankan validasi skema data Zod dan otorisasi sesi NextAuth.js. Lapisan akses basis data dikelola secara deklaratif dan type-safe oleh <strong>Prisma ORM</strong>, yang berkomunikasi langsung dengan basis data relasional <strong>PostgreSQL (Neon Serverless Database)</strong>.</p>

  <h3>3.2. Pola Arsitektur Sistem</h3>
  <p>Sistem menerapkan pemisahan lapisan tanggung jawab (<em>Separation of Concerns</em>) yang terbagi menjadi 5 (lima) lapisan utama:</p>
  <ol>
    <li><strong>Presentation Layer (View / UI Components):</strong>
      <p>Dibangun menggunakan React Server Components (RSC) untuk efisiensi rendering di sisi server, serta Client Components untuk interaksi form dinamis, modal dialog, dan filter. Penataan gaya visual menggunakan utilitas <strong>Tailwind CSS</strong> dan ikon vektor dari <strong>Lucide React</strong>.</p>
    </li>
    <li><strong>Application & Controller Layer (Server Actions):</strong>
      <p>Next.js Server Actions bertindak sebagai controller yang menerima input pengguna, memeriksa izin otorisasi peran (RBAC), memvalidasi struktur data dengan skema Zod, dan memicu revalidasi cache halaman (<code>revalidatePath</code>).</p>
    </li>
    <li><strong>Business Logic & Service Layer (<code>lib/</code>):</strong>
      <p>Mengelola aturan bisnis khusus seperti generator penomoran rapat otomatis (<code>id-generator.ts</code>), kalkulator status keterlambatan tindak lanjut (<code>status-calculator.ts</code>), dan aturan otorisasi keamanan (<code>authorization.ts</code>).</p>
    </li>
    <li><strong>Data Access Layer (Prisma ORM):</strong>
      <p>Prisma Client bertindak sebagai Object-Relational Mapper yang menyediakan query basis data bertipe ketat (<em>type-safe</em>), menjamin integritas relasi foreign key, dan menangani transaksi data atomik (<code>prisma.$transaction</code>).</p>
    </li>
    <li><strong>Database Layer (PostgreSQL):</strong>
      <p>Basis data relasional ACID-compliant pada infrastruktur Neon Serverless yang menyimpan seluruh entitas master dan transaksi rapat secara persisten.</p>
    </li>
  </ol>

  <h3>3.3. Alur Kerja Sistem (Request-Response Lifecycle)</h3>
  <ol>
    <li>Pengguna berinteraksi dengan antarmuka web melalui browser (misalnya menginput jadwal rapat, mengisi risalah notulensi, atau memperbarui status tindak lanjut).</li>
    <li>Browser mengirimkan permintaan ke server melalui Next.js Server Action menggunakan koneksi aman HTTPS.</li>
    <li>Server Action memverifikasi sesi login aktif pengguna (<code>requireAuth()</code>) dan memvalidasi hak akses peran pengguna (<code>requireRole()</code>).</li>
    <li>Data masukan divalidasi terhadap skema Zod. Jika data tidak valid, proses dihentikan dan sistem mengembalikan pesan kesalahan yang informatif.</li>
    <li>Server Action mengeksekusi logika bisnis dan memanggil Prisma Client untuk memanipulasi data di basis data PostgreSQL.</li>
    <li>Setelah transaksi basis data selesai, Next.js melakukan revalidasi cache rute halaman terkait.</li>
    <li>Respon sukses dikembalikan ke client dan tampilan antarmuka web diperbarui secara instan (<em>realtime UI update</em>).</li>
  </ol>

  <h3>3.4. Technology Stack</h3>
  <p>Tabel berikut menyajikan rincian teknologi yang digunakan dalam pengembangan Website Log Book Notula Rapat Dewan Nasional KEK:</p>

  <p class="table-title">Tabel 3.1. Daftar Teknologi Pengembangan Website Log Book Notula Rapat Dewan Nasional KEK</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 32%;">Komponen Sistem</th>
        <th style="width: 35%;">Teknologi yang Digunakan</th>
        <th style="width: 25%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td>Framework Aplikasi Utama</td>
        <td>Next.js 14+ (App Router)</td>
        <td>Fullstack framework React dengan SSR & Server Actions</td>
      </tr>
      <tr>
        <td class="center">2</td>
        <td>Bahasa Pemrograman</td>
        <td>TypeScript / JavaScript (ES2022)</td>
        <td>Pemrograman bertipe statis (<em>type-safe</em>)</td>
      </tr>
      <tr>
        <td class="center">3</td>
        <td>Basis Data (Database)</td>
        <td>PostgreSQL (Neon Serverless)</td>
        <td>Basis data relasional ACID-compliant berkinerja tinggi</td>
      </tr>
      <tr>
        <td class="center">4</td>
        <td>Object-Relational Mapping (ORM)</td>
        <td>Prisma ORM v5</td>
        <td>Pemodelan skema deklaratif & query type-safe</td>
      </tr>
      <tr>
        <td class="center">5</td>
        <td>Frontend & UI Library</td>
        <td>React 18 & Tailwind CSS</td>
        <td>Komponen antarmuka modular dan styling utilitas modern</td>
      </tr>
      <tr>
        <td class="center">6</td>
        <td>Pustaka Ikon (Iconography)</td>
        <td>Lucide React</td>
        <td>Pustaka ikon vektor modern yang bersih dan konsisten</td>
      </tr>
      <tr>
        <td class="center">7</td>
        <td>Autentikasi & Manajemen Sesi</td>
        <td>NextAuth.js (Auth.js v5)</td>
        <td>Manajemen sesi berbasis token JWT dan cookie aman</td>
      </tr>
      <tr>
        <td class="center">8</td>
        <td>Enkripsi Kata Sandi</td>
        <td>BcryptJS</td>
        <td>Algoritma hashing kata sandi dengan salt acak</td>
      </tr>
      <tr>
        <td class="center">9</td>
        <td>Skema Validasi Data</td>
        <td>Zod Schema Validation</td>
        <td>Validasi ketat skema masukan data di sisi server</td>
      </tr>
      <tr>
        <td class="center">10</td>
        <td>Pembangkit Laporan PDF</td>
        <td>jsPDF & html2canvas</td>
        <td>Pustaka ekspor dokumen risalah rapat dinas ke PDF</td>
      </tr>
      <tr>
        <td class="center">11</td>
        <td>Runtime & Web Server</td>
        <td>Node.js (v18+) / Vercel Serverless</td>
        <td>Lingkungan runtime serverless berkinerja tinggi</td>
      </tr>
      <tr>
        <td class="center">12</td>
        <td>Version Control System</td>
        <td>Git & GitHub</td>
        <td>Manajemen repositori kode sumber dan pelacakan versi</td>
      </tr>
    </tbody>
  </table>

  <h3>3.5. Keamanan Sistem</h3>
  <ol>
    <li><strong>Server-Side RBAC Enforcement:</strong> Seluruh otorisasi fungsi mutasi data divalidasi langsung di lingkungan server (Server Actions), sehingga tidak dapat dimanipulasi atau dibypass melalui manipulasi client-side DOM.</li>
    <li><strong>Proteksi Otomatis CSRF:</strong> Next.js Server Actions secara inheren mengamankan transaksi formulir dari serangan pemalsuan permintaan lintas situs (Cross-Site Request Forgery).</li>
    <li><strong>Type-Safety & Sanitasi Masukan:</strong> Kombinasi TypeScript dan validasi skema Zod menjamin setiap parameter masukan diverifikasi tipe data dan batas panjangnya sebelum dieksekusi.</li>
    <li><strong>Pencegahan SQL Injection:</strong> Prisma ORM menggunakan mekanisme parameterized queries dalam setiap operasi basis data, mengeliminasi kerentanan injeksi SQL.</li>
    <li><strong>Enkripsi Kredensial Pengguna:</strong> Seluruh kata sandi akun kedinasan disimpan dalam bentuk hash terenkripsi menggunakan algoritma Bcrypt dengan salt acak (bukan plaintext).</li>
    <li><strong>Komunikasi Terenkripsi HTTPS/TLS:</strong> Pertukaran data antara browser pengguna dan server terlindungi oleh enkripsi sertifikat SSL/TLS.</li>
  </ol>

  <h3>3.6. Kelebihan Pendekatan Arsitektur</h3>
  <p>Penerapan arsitektur Next.js fullstack dengan Prisma dan PostgreSQL memberikan keunggulan teknis nyata:</p>
  <ul>
    <li><strong>End-to-End Type Safety:</strong> Konsistensi tipe data terjaga mulai dari skema basis data, lapisan logika server actions, hingga komponen antarmuka pengguna.</li>
    <li><strong>Efisiensi dan Kecepatan Akses:</strong> Pemanfaatan Server Components dan caching rute menghasilkan pemuatan halaman yang sangat cepat serta mengurangi beban komputasi di sisi perangkat pengguna.</li>
    <li><strong>Kemudahan Pemeliharaan:</strong> Struktur modular memudahkan penambahan modul baru di masa depan secara independen tanpa memengaruhi stabilitas fitur yang sudah berjalan.</li>
  </ul>

  <h2>4. Desain Database</h2>

  <h3>4.1. Konsep Relasional Basis Data</h3>
  <p>Desain basis data Sistem Log Book Notula Rapat dirancang untuk mendukung siklus bisnis rapat dinas secara terstruktur dan ternormalisasi. Struktur organisasi Sekretariat Jenderal Dewan Nasional KEK dipetakan melalui entitas <code>biro</code> dan entitas turunan <code>tim_biro</code>. Entitas <code>pengguna</code> menampung data aparatur dan hak akses peran (<code>SUPER_ADMIN</code>, <code>ADMIN</code>, <code>PIMPINAN</code>, <code>STAFF</code>) yang terikat pada biro dan tim kerja tertentu.</p>
  
  <p>Setiap transaksi rapat disimpan dalam entitas utama <code>rapat</code>. Penomoran rapat dikelola melalui entitas <code>penomoran_rapat_biro</code> untuk memastikan nomor rapat berurutan tanpa duplikasi. Entitas <code>rapat</code> memiliki relasi satu-ke-banyak (1:N) dengan entitas <code>peserta_rapat</code> untuk mencatat presensi kehadiran dan tanda tangan digital peserta.</p>
  
  <p>Hasil persidangan dicatat dalam entitas <code>notulen_rapat</code> yang berelasi satu-ke-satu (1:1) dengan entitas <code>rapat</code>, memuat agenda, hasil pembahasan, dan butir keputusan resmi. Dari notulensi tersebut, butir-butir komitmen kerja diturunkan ke dalam entitas <code>tindak_lanjut</code> (Action Items) yang berelasi langsung dengan akun aparatur penanggung jawab (PIC), biro, dan tim pelaksana dengan tenggat waktu penyelesaian (<em>due date</em>). Entitas <code>lampiran_rapat</code> mengarsipkan dokumen surat undangan dan materi paparan, sedangkan entitas <code>notifikasi</code> mengelola pengiriman pesan in-app bagi pengguna.</p>

  <h3>4.2. Spesifikasi Tabel Basis Data</h3>
  <p>Berikut adalah 10 (sepuluh) tabel spesifikasi basis data yang menyusun sistem Log Book Notula Rapat:</p>

  <p class="table-title">Tabel 4.1. Spesifikasi Tabel Pengguna (pengguna)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_pengguna</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik akun pengguna)</td></tr>
      <tr><td class="center">2</td><td>nama_lengkap</td><td>Varchar(255) / String</td><td>Nama lengkap aparatur beserta gelar kedinasan</td></tr>
      <tr><td class="center">3</td><td>email</td><td>Varchar(255) / String</td><td>Alamat surel dinas resmi (Unique)</td></tr>
      <tr><td class="center">4</td><td>kata_sandi</td><td>Varchar(255) / String</td><td>Hash kata sandi terenkripsi (Bcrypt)</td></tr>
      <tr><td class="center">5</td><td>peran</td><td>Enum</td><td>SUPER_ADMIN, ADMIN, PIMPINAN, STAFF</td></tr>
      <tr><td class="center">6</td><td>id_biro</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel biro)</td></tr>
      <tr><td class="center">7</td><td>id_tim</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel tim_biro, opsional)</td></tr>
      <tr><td class="center">8</td><td>status_aktif</td><td>Boolean</td><td>Status keaktifan akun pengguna (default: true)</td></tr>
      <tr><td class="center">9</td><td>dibuat_pada</td><td>Timestamp</td><td>Waktu pendaftaran akun pengguna</td></tr>
      <tr><td class="center">10</td><td>diperbarui_pada</td><td>Timestamp</td><td>Waktu pembaruan profil pengguna terakhir</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.2. Spesifikasi Tabel Biro (biro)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_biro</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik unit Biro)</td></tr>
      <tr><td class="center">2</td><td>kode_biro</td><td>Varchar(50) / String</td><td>Kode resmi unit biro (Unique: BPPK, PKKEK, IKK, HSDMO, UK)</td></tr>
      <tr><td class="center">3</td><td>nama_biro</td><td>Varchar(255) / String</td><td>Nama lengkap unit kerja Eselon II Biro</td></tr>
      <tr><td class="center">4</td><td>nama_singkat</td><td>Varchar(100) / String</td><td>Nama sebutan singkat unit biro</td></tr>
      <tr><td class="center">5</td><td>deskripsi</td><td>Text</td><td>Tupoksi dan deskripsi kewenangan biro</td></tr>
      <tr><td class="center">6</td><td>status_aktif</td><td>Boolean</td><td>Status keaktifan biro dalam sistem (default: true)</td></tr>
      <tr><td class="center">7</td><td>dibuat_pada</td><td>Timestamp</td><td>Waktu pencatatan data biro</td></tr>
      <tr><td class="center">8</td><td>diperbarui_pada</td><td>Timestamp</td><td>Waktu pembaruan data biro</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.3. Spesifikasi Tabel Tim Kerja Biro (tim_biro)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_tim</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik kelompok tim kerja)</td></tr>
      <tr><td class="center">2</td><td>id_biro</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel biro)</td></tr>
      <tr><td class="center">3</td><td>kode_tim</td><td>Varchar(50) / String</td><td>Kode identifikasi tim kerja (misal: INV, KS, KOM)</td></tr>
      <tr><td class="center">4</td><td>nama_tim</td><td>Varchar(255) / String</td><td>Nama kelompok tim kerja teknis</td></tr>
      <tr><td class="center">5</td><td>deskripsi_tim</td><td>Text</td><td>Deskripsi fungsi kelompok tim kerja</td></tr>
      <tr><td class="center">6</td><td>status_aktif</td><td>Boolean</td><td>Status keaktifan tim kerja (default: true)</td></tr>
      <tr><td class="center">7</td><td>dibuat_pada</td><td>Timestamp</td><td>Waktu pencatatan kelompok tim kerja</td></tr>
      <tr><td class="center">8</td><td>diperbarui_pada</td><td>Timestamp</td><td>Waktu pembaruan kelompok tim kerja</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.4. Spesifikasi Tabel Rapat Dinas (rapat)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_rapat</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik agenda rapat dinas)</td></tr>
      <tr><td class="center">2</td><td>nomor_rapat</td><td>Varchar(100) / String</td><td>Nomor surat rapat dinas resmi (Unique)</td></tr>
      <tr><td class="center">3</td><td>judul_rapat</td><td>Varchar(255) / String</td><td>Tema atau pokok agenda rapat kedinasan</td></tr>
      <tr><td class="center">4</td><td>id_biro</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel biro)</td></tr>
      <tr><td class="center">5</td><td>id_tim</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel tim_biro, opsional)</td></tr>
      <tr><td class="center">6</td><td>tanggal_rapat</td><td>Timestamp / Date</td><td>Hari dan tanggal penyelenggaraan rapat</td></tr>
      <tr><td class="center">7</td><td>waktu_mulai</td><td>Varchar(10) / String</td><td>Waktu mulai rapat (format HH:mm WIB)</td></tr>
      <tr><td class="center">8</td><td>waktu_selesai</td><td>Varchar(10) / String</td><td>Waktu selesai rapat (format HH:mm WIB)</td></tr>
      <tr><td class="center">9</td><td>lokasi_rapat</td><td>Varchar(255) / String</td><td>Ruang rapat fisik atau tautan pertemuan virtual</td></tr>
      <tr><td class="center">10</td><td>id_pengguna</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel pengguna: Pimpinan Rapat)</td></tr>
      <tr><td class="center">11</td><td>id_notulis</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel pengguna: Petugas Notulis)</td></tr>
      <tr><td class="center">12</td><td>status_rapat</td><td>Enum</td><td>DRAFT, REVIEW, APPROVED, FINAL</td></tr>
      <tr><td class="center">13</td><td>status_progres</td><td>Varchar(50) / String</td><td>Status tahapan rapat: Start, On Progress, Done</td></tr>
      <tr><td class="center">14</td><td>jenis_rapat</td><td>Varchar(100) / String</td><td>Kategori rapat (Pleno, Koordinasi, Teknis)</td></tr>
      <tr><td class="center">15</td><td>pic_rapat</td><td>Varchar(255) / String</td><td>Nama PIC pelaksana kegiatan rapat</td></tr>
      <tr><td class="center">16</td><td>dokumen_undangan_url</td><td>Text</td><td>URL penyimpanan berkas surat undangan dinas</td></tr>
      <tr><td class="center">17</td><td>nama_dokumen_undangan</td><td>Varchar(255) / String</td><td>Nama asli berkas surat undangan dinas</td></tr>
      <tr><td class="center">18</td><td>materi_dokumen_url</td><td>Text</td><td>URL berkas paparan / materi rapat dinas</td></tr>
      <tr><td class="center">19</td><td>dibuat_pada</td><td>Timestamp</td><td>Waktu inisiasi agenda rapat dibuat</td></tr>
      <tr><td class="center">20</td><td>diperbarui_pada</td><td>Timestamp</td><td>Waktu pembaruan agenda rapat terakhir</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.5. Spesifikasi Tabel Peserta Rapat (peserta_rapat)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_peserta</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik presensi peserta)</td></tr>
      <tr><td class="center">2</td><td>id_rapat</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel rapat)</td></tr>
      <tr><td class="center">3</td><td>id_pengguna</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel pengguna, jika staf internal)</td></tr>
      <tr><td class="center">4</td><td>nama_peserta</td><td>Varchar(255) / String</td><td>Nama lengkap peserta rapat dinas</td></tr>
      <tr><td class="center">5</td><td>instansi_peserta</td><td>Varchar(255) / String</td><td>Instansi asal peserta (Kementerian/Lembaga/Swasta)</td></tr>
      <tr><td class="center">6</td><td>jabatan_peserta</td><td>Varchar(255) / String</td><td>Jabatan dinas peserta yang diundang</td></tr>
      <tr><td class="center">7</td><td>status_kehadiran</td><td>Enum</td><td>INVITED, PRESENT, ABSENT, EXCUSED</td></tr>
      <tr><td class="center">8</td><td>waktu_presensi</td><td>Timestamp</td><td>Waktu konfirmasi kehadiran presensi rapat</td></tr>
      <tr><td class="center">9</td><td>url_tanda_tangan</td><td>Text</td><td>URL gambar tanda tangan digital presensi</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.6. Spesifikasi Tabel Notulen Rapat (notulen_rapat)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_notulen</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik naskah risalah notulen)</td></tr>
      <tr><td class="center">2</td><td>id_rapat</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel rapat, relasi 1:1)</td></tr>
      <tr><td class="center">3</td><td>agenda</td><td>Text</td><td>Rincian susunan pokok agenda rapat dinas</td></tr>
      <tr><td class="center">4</td><td>pembahasan</td><td>Text</td><td>Uraian dinamika diskusi, masukan, dan jalannya sidang</td></tr>
      <tr><td class="center">5</td><td>kesimpulan</td><td>Text</td><td>Butir-butir keputusan resmi dan kesimpulan rapat</td></tr>
      <tr><td class="center">6</td><td>dibuat_pada</td><td>Timestamp</td><td>Waktu penulisan draf notulensi dibuat</td></tr>
      <tr><td class="center">7</td><td>diperbarui_pada</td><td>Timestamp</td><td>Waktu pembaruan naskah notulensi terakhir</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.7. Spesifikasi Tabel Tindak Lanjut Komitmen (tindak_lanjut)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_tindak_lanjut</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik butir tindak lanjut)</td></tr>
      <tr><td class="center">2</td><td>id_rapat</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel rapat)</td></tr>
      <tr><td class="center">3</td><td>id_notulen</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel notulen_rapat, opsional)</td></tr>
      <tr><td class="center">4</td><td>butir_tindak_lanjut</td><td>Text</td><td>Deskripsi komitmen penugasan konkret pasca-rapat</td></tr>
      <tr><td class="center">5</td><td>pic_nama</td><td>Varchar(255) / String</td><td>Nama penanggung jawab operasional penugasan</td></tr>
      <tr><td class="center">6</td><td>id_pic_pengguna</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel pengguna: Akun PIC)</td></tr>
      <tr><td class="center">7</td><td>id_pic_tim</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel tim_biro: Tim Pelaksana)</td></tr>
      <tr><td class="center">8</td><td>tenggat_waktu</td><td>Timestamp / Date</td><td>Batas waktu penyelesaian tugas (due date)</td></tr>
      <tr><td class="center">9</td><td>status</td><td>Enum / Varchar</td><td>Belum Dimulai, Dalam Proses, Selesai, Terlambat</td></tr>
      <tr><td class="center">10</td><td>prioritas</td><td>Enum</td><td>LOW, MEDIUM, HIGH, URGENT</td></tr>
      <tr><td class="center">11</td><td>catatan_progres</td><td>Text</td><td>Catatan perkembangan realisasi pelaksanaan komitmen</td></tr>
      <tr><td class="center">12</td><td>dibuat_pada</td><td>Timestamp</td><td>Waktu butir tindak lanjut diterbitkan</td></tr>
      <tr><td class="center">13</td><td>diperbarui_pada</td><td>Timestamp</td><td>Waktu pembaruan status tindak lanjut</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.8. Spesifikasi Tabel Berkas Lampiran Rapat (lampiran_rapat)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id_lampiran</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik berkas lampiran)</td></tr>
      <tr><td class="center">2</td><td>id_rapat</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel rapat)</td></tr>
      <tr><td class="center">3</td><td>nama_berkas</td><td>Varchar(255) / String</td><td>Nama asli berkas dokumen yang diunggah</td></tr>
      <tr><td class="center">4</td><td>url_berkas</td><td>Text</td><td>Lokasi URL berkas pada cloud storage / server</td></tr>
      <tr><td class="center">5</td><td>tipe_berkas</td><td>Varchar(100) / String</td><td>Tipe MIME dokumen (application/pdf, docx, pptx)</td></tr>
      <tr><td class="center">6</td><td>ukuran_berkas</td><td>Integer</td><td>Besaran ukuran file dalam satuan bytes</td></tr>
      <tr><td class="center">7</td><td>diunggah_pada</td><td>Timestamp</td><td>Waktu dokumen lampiran diunggah ke sistem</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.9. Spesifikasi Tabel Penomoran Rapat Biro (penomoran_rapat_biro)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik pencatatan nomor)</td></tr>
      <tr><td class="center">2</td><td>id_biro</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel biro)</td></tr>
      <tr><td class="center">3</td><td>tahun</td><td>Integer</td><td>Tahun kalender penomoran rapat (misal: 2026)</td></tr>
      <tr><td class="center">4</td><td>nomor_terakhir</td><td>Integer</td><td>Nomor urut rapat terakhir yang diterbitkan pada tahun berjalan</td></tr>
    </tbody>
  </table>

  <p class="table-title">Tabel 4.10. Spesifikasi Tabel Notifikasi Sistem (notifikasi)</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 27%;">Nama Field</th>
        <th style="width: 25%;">Tipe Data</th>
        <th style="width: 40%;">Keterangan</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="center">1</td><td>id</td><td>Varchar(36) / String</td><td>Primary Key (Kode pengenal unik notifikasi)</td></tr>
      <tr><td class="center">2</td><td>id_pengguna</td><td>Varchar(36) / String</td><td>Foreign Key (Relasi ke tabel pengguna: Penerima pesan)</td></tr>
      <tr><td class="center">3</td><td>judul</td><td>Varchar(255) / String</td><td>Judul singkat pengingat / notifikasi kedinasan</td></tr>
      <tr><td class="center">4</td><td>pesan</td><td>Text</td><td>Isi detail notifikasi (jadwal baru / deadline tugas)</td></tr>
      <tr><td class="center">5</td><td>tautan</td><td>Varchar(255) / String</td><td>URL rute aplikasi terkait notifikasi</td></tr>
      <tr><td class="center">6</td><td>sudah_dibaca</td><td>Boolean</td><td>Status konfirmasi pembacaan pesan (default: false)</td></tr>
      <tr><td class="center">7</td><td>dibuat_pada</td><td>Timestamp</td><td>Waktu notifikasi diterbitkan oleh sistem</td></tr>
    </tbody>
  </table>

  <h2>5. Struktur Folder Sistem</h2>
  <p>Proyek aplikasi Website Log Book Notula Rapat diorganisasikan dengan struktur direktori modular berbasis standar Next.js App Router:</p>

  <p class="table-title">Tabel 5.1. Struktur Direktori Proyek Website Log Book Notula Rapat</p>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;" class="center">No</th>
        <th style="width: 32%;">Folder / File</th>
        <th style="width: 60%;">Keterangan & Fungsi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="center">1</td>
        <td><code>app/</code></td>
        <td>Direktori utama App Router yang berisi tata letak (layout), halaman aplikasi (page), dan rute server.</td>
      </tr>
      <tr>
        <td class="center">2</td>
        <td><code>app/actions/</code></td>
        <td>Kumpulan berkas Next.js Server Actions untuk mutasi data (meeting-actions, minute-actions, action-item-actions, user-actions).</td>
      </tr>
      <tr>
        <td class="center">3</td>
        <td><code>app/semua-rapat/</code> & <code>app/buat-rapat/</code></td>
        <td>Halaman antarmuka daftar tabel seluruh rapat dinas dan formulir penjadwalan rapat dinas baru.</td>
      </tr>
      <tr>
        <td class="center">4</td>
        <td><code>app/rapat/[id]/</code></td>
        <td>Halaman detail rapat dinas terintegrasi modul notulensi, daftar presensi peserta, dan berkas lampiran.</td>
      </tr>
      <tr>
        <td class="center">5</td>
        <td><code>app/tindak-lanjut/</code></td>
        <td>Halaman matriks monitoring komitmen tindak lanjut (Action Items) dilengkapi filter biro, status, dan prioritas.</td>
      </tr>
      <tr>
        <td class="center">6</td>
        <td><code>app/laporan/</code></td>
        <td>Halaman pelaporan statistik dan ekspor dokumen risalah rapat serta rekapitulasi data persidangan.</td>
      </tr>
      <tr>
        <td class="center">7</td>
        <td><code>app/pengguna/</code></td>
        <td>Halaman administrasi pengguna dan penugasan peran kedinasan dengan pemisahan wewenang per tim kerja (team-scoped).</td>
      </tr>
      <tr>
        <td class="center">8</td>
        <td><code>components/</code></td>
        <td>Komponen antarmuka modular (meetings, minutes, action-items, users, layout/sidebar, dan providers).</td>
      </tr>
      <tr>
        <td class="center">9</td>
        <td><code>lib/</code></td>
        <td>Pustaka pembantu logika bisnis: koneksi Prisma Client (<code>prisma.ts</code>), otorisasi RBAC (<code>authorization.ts</code>), generator nomor rapat (<code>id-generator.ts</code>), dan validasi Zod.</td>
      </tr>
      <tr>
        <td class="center">10</td>
        <td><code>prisma/</code></td>
        <td>Skema basis data relasional (<code>schema.prisma</code>) dan berkas seeder master data resmi (<code>seed.ts</code>).</td>
      </tr>
      <tr>
        <td class="center">11</td>
        <td><code>public/</code></td>
        <td>Aset statis aplikasi web seperti logo branding Kawasan Ekonomi Khusus, favicon, serta pratinjau diagram.</td>
      </tr>
      <tr>
        <td class="center">12</td>
        <td><code>scripts/</code></td>
        <td>Kumpulan skrip otomatisasi pengujian sistem (test suites), migrasi data, dan sinkronisasi laporan PKL.</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Penutup</h2>
  <p>Dokumen Teknis Pengembangan Website Sistem Informasi Log Book Notula Rapat ini disusun sebagai pedoman baku dalam pelaksanaan pembangunan, implementasi operasional, serta pemeliharaan sistem informasi pada Sekretariat Jenderal Dewan Nasional Kawasan Ekonomi Khusus. Seluruh dokumentasi arsitektur, siklus proses bisnis persidangan kedinasan, desain basis data relasional, dan struktur direktori yang disajikan diharapkan menjadi rujukan komprehensif bagi pengembang dan pemangku kepentingan.</p>
  
  <p>Dengan berjalannya sistem Website Log Book Notula Rapat, tata kelola rapat dinas dan pengawasan komitmen tindak lanjut dapat terlaksana secara efektif, cepat, terukur, dan akuntabel guna mendukung akselerasi pembangunan Kawasan Ekonomi Khusus di seluruh Indonesia. Pemutakhiran terhadap dokumen teknis ini dapat dilakukan secara berkala sejalan dengan evolusi kebutuhan organisasi dan kemajuan teknologi informasi.</p>

</body>
</html>`;

  console.log('2. Mengunggah dan mengonversi naskah HTML ke Google Doc...');
  console.log('   Doc ID:', docId);

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files/' + docId + '?uploadType=media', {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + account.accessToken,
      'Content-Type': 'text/html'
    },
    body: htmlContent
  });

  if (!uploadRes.ok) {
    throw new Error('Upload failed: ' + uploadRes.status + ' ' + (await uploadRes.text()));
  }

  const uploadData = await uploadRes.json();
  console.log('3. Berhasil memperbarui dokumen Google Drive!');
  console.log('   File ID:', uploadData.id);
  console.log('   File Name:', uploadData.name);

  // Verifikasi dokumen via Google Docs API
  const docRes = await fetch('https://docs.googleapis.com/v1/documents/' + docId, {
    headers: { 'Authorization': 'Bearer ' + account.accessToken }
  });
  const doc = await docRes.json();
  console.log('4. Verifikasi isi Google Doc berhasil:');
  console.log('   Judul:', doc.title);
  console.log('   Jumlah elemen konten:', doc.body.content.length);
  console.log('   Revision ID:', doc.revisionId);
  console.log('\n=== SUKSES BESAR! DOKUMEN TEKNIS LOG BOOK RAPAT TELAH TERBIT DI GOOGLE DOCS ===');
}

main().catch(console.error);
