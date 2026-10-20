const fs = require('fs');

async function updateDbSpecs() {
  const tokenData = JSON.parse(fs.readFileSync('C:/Users/nappz/.config/google-drive-mcp/tokens.json', 'utf8'));
  const accessToken = tokenData.accounts[tokenData.defaultAccount].accessToken;
  const docId = '1dBGQ4RXnUhx2E4afkoQgKItVCMv2sQcfNHLGKdy4o7s';

  console.log('Fetching document...');
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const doc = await res.json();
  const c = doc.body.content;

  // We want to update specific cells in tables:
  // For each table, target cell is column 3 (index 3: Keterangan)
  // Mapping by field name (column 1: Nama Field)
  const targetUpdates = {
    'pengguna': {
      'id_pengguna': 'Primary Key (Kode pengenal unik akun pengguna / aparatur)',
      'id_biro': 'Foreign Key → biro.id_biro (Unit kerja Biro tempat pegawai bertugas)',
      'id_tim': 'Foreign Key → tim_biro.id_tim (Kelompok tim kerja tempat pegawai bertugas, opsional)'
    },
    'biro': {
      'id_biro': 'Primary Key (Kode pengenal unik unit kerja Eselon II / Biro)'
    },
    'tim_biro': {
      'id_tim': 'Primary Key (Kode pengenal unik kelompok tim kerja biro)',
      'id_biro': 'Foreign Key → biro.id_biro (Biro induk yang membawahi kelompok tim kerja)'
    },
    'rapat': {
      'id_rapat': 'Primary Key (Kode pengenal unik transaksi agenda rapat dinas)',
      'id_biro': 'Foreign Key → biro.id_biro (Biro penyelenggara / pemrakarsa rapat dinas)',
      'id_tim': 'Foreign Key → tim_biro.id_tim (Tim kerja teknis penyelenggara rapat, opsional)',
      'id_pengguna': 'Foreign Key → pengguna.id_pengguna (Aparatur pejabat yang memimpin rapat dinas / Pimpinan Rapat)',
      'id_notulis': 'Foreign Key → pengguna.id_pengguna (Aparatur staf yang ditugaskan mencatat notula / Petugas Notulis)'
    },
    'peserta_rapat': {
      'id_peserta': 'Primary Key (Kode pengenal unik presensi dan kehadiran peserta rapat)',
      'id_rapat': 'Foreign Key → rapat.id_rapat (Agenda rapat dinas yang dihadiri)',
      'id_pengguna': 'Foreign Key → pengguna.id_pengguna (Aparatur pegawai yang diundang hadir sebagai peserta rapat)'
    },
    'notulen_rapat': {
      'id_notulen': 'Primary Key (Kode pengenal unik naskah risalah notulensi rapat)',
      'id_rapat': 'Foreign Key → rapat.id_rapat (Agenda rapat dinas yang dinotulensikan, relasi 1:1)'
    },
    'tindak_lanjut': {
      'id_tindak_lanjut': 'Primary Key (Kode pengenal unik butir komitmen tindak lanjut)',
      'id_rapat': 'Foreign Key → rapat.id_rapat (Agenda rapat dinas sumber mandat komitmen tindak lanjut)',
      'id_biro': 'Foreign Key → biro.id_biro (Biro yang bertanggung jawab menuntaskan komitmen)',
      'id_tim': 'Foreign Key → tim_biro.id_tim (Tim kerja teknis pelaksana tindak lanjut, opsional)',
      'id_pengguna': 'Foreign Key → pengguna.id_pengguna (Staf aparatur pelaksana penugasan / Person in Charge (PIC))'
    },
    'lampiran_rapat': {
      'id_lampiran': 'Primary Key (Kode pengenal unik berkas dokumen lampiran rapat)',
      'id_rapat': 'Foreign Key → rapat.id_rapat (Agenda rapat dinas pemilik berkas dokumen lampiran)'
    }
  };

  const tableIndices = [369, 373, 377, 381, 385, 389, 393, 397];
  const tableKeys = ['pengguna', 'biro', 'tim_biro', 'rapat', 'peserta_rapat', 'notulen_rapat', 'tindak_lanjut', 'lampiran_rapat'];

  const cellsToUpdate = [];

  tableIndices.forEach((tIdx, kIdx) => {
    const tKey = tableKeys[kIdx];
    const el = c[tIdx];
    if (!el || !el.table) {
      console.error(`Element at ${tIdx} is not a table!`);
      return;
    }
    const specMap = targetUpdates[tKey];
    el.table.tableRows.forEach((row, rIdx) => {
      if (rIdx === 0) return; // Header row
      const fieldCell = row.tableCells[1];
      const ketCell = row.tableCells[3];
      const fieldName = fieldCell.content.map(p => p.paragraph?.elements?.map(e => e.textRun?.content || '').join('')).join('').trim();
      const currentKet = ketCell.content.map(p => p.paragraph?.elements?.map(e => e.textRun?.content || '').join('')).join('').trim();

      if (specMap[fieldName]) {
        const newText = specMap[fieldName];
        // Calculate cell content range (excluding cell-terminating newline)
        const firstP = ketCell.content[0];
        const lastP = ketCell.content[ketCell.content.length - 1];
        const startIndex = firstP.startIndex;
        const endIndex = lastP.endIndex - 1;

        cellsToUpdate.push({
          tKey,
          tIdx,
          rIdx,
          fieldName,
          currentKet,
          newText,
          startIndex,
          endIndex
        });
      }
    });
  });

  console.log(`Found ${cellsToUpdate.length} cells to update:`);
  cellsToUpdate.forEach(u => {
    console.log(`- [Table: ${u.tKey}, Field: ${u.fieldName}] (${u.startIndex} - ${u.endIndex})\n  OLD: "${u.currentKet}"\n  NEW: "${u.newText}"`);
  });

  // Sort descending by startIndex so earlier indices don't shift!
  cellsToUpdate.sort((a, b) => b.startIndex - a.startIndex);

  const requests = [];
  cellsToUpdate.forEach(u => {
    // 1. Delete old text if endIndex > startIndex
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
    // 2. Insert new text at startIndex
    requests.push({
      insertText: {
        location: { index: u.startIndex },
        text: u.newText
      }
    });
    // 3. Format as Times New Roman 11pt
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: u.startIndex,
          endIndex: u.startIndex + u.newText.length
        },
        textStyle: {
          weightedFontFamily: { fontFamily: 'Times New Roman' },
          fontSize: { magnitude: 11, unit: 'PT' }
        },
        fields: 'weightedFontFamily,fontSize'
      }
    });
  });

  console.log(`Generated ${requests.length} batch update requests.`);
  console.log('Sending batchUpdate to Google Docs API...');

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
    console.log('Successfully updated all table cells in Google Doc!');
  }
}

updateDbSpecs().catch(console.error);
