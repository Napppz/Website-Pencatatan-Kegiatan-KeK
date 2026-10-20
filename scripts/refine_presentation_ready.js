const fs = require('fs');

async function refineForPresentation() {
  const tokenData = JSON.parse(fs.readFileSync('C:/Users/nappz/.config/google-drive-mcp/tokens.json', 'utf8'));
  const accessToken = tokenData.accounts[tokenData.defaultAccount].accessToken;
  const docId = '1dBGQ4RXnUhx2E4afkoQgKItVCMv2sQcfNHLGKdy4o7s';

  console.log('Fetching document...');
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const doc = await res.json();
  const c = doc.body.content;

  // 1. Target updates for Table Keterangan cells (Format Baku UBSI)
  const targetUpdates = {
    'pengguna': {
      'id_pengguna': 'Primary Key',
      'id_biro': 'Foreign Key (Relasi ke tabel biro)',
      'id_tim': 'Foreign Key (Relasi ke tabel tim_biro, opsional)'
    },
    'biro': {
      'id_biro': 'Primary Key'
    },
    'tim_biro': {
      'id_tim': 'Primary Key',
      'id_biro': 'Foreign Key (Relasi ke tabel biro)'
    },
    'rapat': {
      'id_rapat': 'Primary Key',
      'id_biro': 'Foreign Key (Relasi ke tabel biro - Biro Pemrakarsa)',
      'id_tim': 'Foreign Key (Relasi ke tabel tim_biro, opsional)',
      'id_pengguna': 'Foreign Key (Relasi ke tabel pengguna - Pimpinan Rapat)',
      'id_notulis': 'Foreign Key (Relasi ke tabel pengguna - Petugas Notulis)'
    },
    'peserta_rapat': {
      'id_peserta': 'Primary Key',
      'id_rapat': 'Foreign Key (Relasi ke tabel rapat)',
      'id_pengguna': 'Foreign Key (Relasi ke tabel pengguna - Peserta Rapat)'
    },
    'notulen_rapat': {
      'id_notulen': 'Primary Key',
      'id_rapat': 'Foreign Key (Relasi ke tabel rapat, relasi 1:1)'
    },
    'tindak_lanjut': {
      'id_tindak_lanjut': 'Primary Key',
      'id_rapat': 'Foreign Key (Relasi ke tabel rapat)',
      'id_biro': 'Foreign Key (Relasi ke tabel biro - Biro Penanggung Jawab)',
      'id_tim': 'Foreign Key (Relasi ke tabel tim_biro, opsional)',
      'id_pengguna': 'Foreign Key (Relasi ke tabel pengguna - Staf PIC)'
    },
    'lampiran_rapat': {
      'id_lampiran': 'Primary Key',
      'id_rapat': 'Foreign Key (Relasi ke tabel rapat)'
    }
  };

  const tableIndices = [369, 373, 377, 381, 385, 389, 393, 397];
  const tableKeys = ['pengguna', 'biro', 'tim_biro', 'rapat', 'peserta_rapat', 'notulen_rapat', 'tindak_lanjut', 'lampiran_rapat'];

  const cellsToUpdate = [];

  tableIndices.forEach((tIdx, kIdx) => {
    const tKey = tableKeys[kIdx];
    const el = c[tIdx];
    if (!el || !el.table) return;
    const specMap = targetUpdates[tKey];
    el.table.tableRows.forEach((row, rIdx) => {
      if (rIdx === 0) return;
      const fieldCell = row.tableCells[1];
      const ketCell = row.tableCells[3];
      const fieldName = fieldCell.content.map(p => p.paragraph?.elements?.map(e => e.textRun?.content || '').join('')).join('').trim();
      const currentKet = ketCell.content.map(p => p.paragraph?.elements?.map(e => e.textRun?.content || '').join('')).join('').trim();

      if (specMap[fieldName]) {
        const newText = specMap[fieldName];
        const firstP = ketCell.content[0];
        const lastP = ketCell.content[ketCell.content.length - 1];
        const startIndex = firstP.startIndex;
        const endIndex = lastP.endIndex - 1;

        cellsToUpdate.push({
          type: 'cell',
          tKey,
          fieldName,
          currentKet,
          newText,
          startIndex,
          endIndex
        });
      }
    });
  });

  // 2. Target update for Paragraph [338] (Activity Diagram Tindak Lanjut Narrative)
  const p338 = c[338];
  const p338Start = p338.startIndex;
  const p338End = p338.endIndex - 1; // exclude newline
  const newActivityNarrative = 'Alur monitoring dan pembaruan tindak lanjut (action items) dimodelkan dengan empat swimlane terpadu (Kepala Biro, Koordinator Tim, PIC/Staf Pelaksana, dan Sistem) yang mencerminkan tata kelola dinas di lingkungan Setjen DN KEK:\n' +
    '1. Disposisi Naskah Masuk (Aplikasi SRIKANDI): Alur diawali dari Kepala Biro yang menerima naskah dinas/arahan rapat eksternal melalui Aplikasi SRIKANDI dan memberikan lembar disposisi penugasan kepada Koordinator Tim terkait.\n' +
    '2. Pencatatan Pekerjaan & Penunjukan PIC: Koordinator Tim menerima lembar disposisi, mencatat rincian agenda tugas ke dalam aplikasi Log Book Rapat (sistem menyimpan data ke tabel rapat dan tindak_lanjut), lalu menetapkan staf aparatur sebagai Person in Charge (PIC).\n' +
    '3. Pelaksanaan & Audit Trail Riwayat Progres: Staf PIC menerima penugasan (Menerima Task), melaksanakan pekerjaan dinas, memperbarui progres persentase kerja secara bertahap (Update Progress -> Simpan history), dan mengunggah dokumen eviden/laporan hasil (Input hasil -> Simpan history pada tabel riwayat_tindak_lanjut).\n' +
    '4. Agregasi Capaian pada Dashboard: Sistem secara otomatis mengakumulasi data riwayat tindak lanjut ke dalam Dashboard Eksekutif, sehingga Kepala Biro dapat langsung memantau laporan capaian pekerjaan (Melihat report pekerjaan) secara transparan dan akurat hingga status tuntas (Final).';

  const allUpdates = [
    ...cellsToUpdate,
    {
      type: 'paragraph',
      name: 'Activity Diagram Tindak Lanjut Narrative [338]',
      startIndex: p338Start,
      endIndex: p338End,
      newText: newActivityNarrative,
      fontSize: 12
    }
  ];

  // Sort descending by startIndex
  allUpdates.sort((a, b) => b.startIndex - a.startIndex);

  console.log(`Executing ${allUpdates.length} updates in descending order...`);

  const requests = [];
  allUpdates.forEach(u => {
    if (u.endIndex > u.startIndex) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: u.startIndex,
            endIndex: u.endIndex
          }
        }
      });
    }
    requests.push({
      insertText: {
        location: { index: u.startIndex },
        text: u.newText
      }
    });
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: u.startIndex,
          endIndex: u.startIndex + u.newText.length
        },
        textStyle: {
          weightedFontFamily: { fontFamily: 'Times New Roman' },
          fontSize: { magnitude: u.fontSize || 11, unit: 'PT' }
        },
        fields: 'weightedFontFamily,fontSize'
      }
    });
  });

  const batchRes = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  const batchData = await batchRes.json();
  if (batchData.error) {
    console.error('Batch update failed:', JSON.stringify(batchData.error, null, 2));
  } else {
    console.log('Successfully refined Google Doc for presentation readiness!');
  }
}

refineForPresentation().catch(console.error);
