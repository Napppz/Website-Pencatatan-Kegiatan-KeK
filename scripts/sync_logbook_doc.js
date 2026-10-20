const fs = require('fs');

async function main() {
  const tokenData = JSON.parse(fs.readFileSync('C:/Users/nappz/.config/google-drive-mcp/tokens.json', 'utf8'));
  const accessToken = tokenData.accounts[tokenData.defaultAccount].accessToken;
  const docId = '1hHZ7iRT0eZCBlff_KHBPtp69n0C5TTlWxDx06RX8kM0';

  console.log('Fetching live document...');
  let res = await fetch('https://docs.googleapis.com/v1/documents/' + docId, {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!res.ok) throw new Error('Failed to fetch doc: ' + res.statusText);
  let doc = await res.json();
  console.log('Fetched document revision:', doc.revisionId);

  const content = doc.body.content;
  const tables = [];
  content.forEach((el, idx) => {
    if (el.table) {
      tables.push({
        elementIndex: idx,
        table: el.table
      });
    }
  });

  console.log('Total tables in doc:', tables.length);

  function findHeading(c, tableIdx) {
    for (let i = tableIdx - 1; i >= Math.max(0, tableIdx - 5); i--) {
      const p = c[i]?.paragraph;
      if (p) {
        const text = p.elements?.map(e => e.textRun?.content || '').join('').trim();
        if (text.startsWith('MINGGU KE')) {
          return { index: i, text, p };
        }
      }
    }
    return null;
  }

  // Define target data for tables 4 through 14 (indices 3 through 13)
  // Formatted with leading newlines matching the exact structure above 15 October:
  // Col 1: \n\nHari,\nTanggal Bulan 2026
  // Col 2: \n\n8:00 – 16:30
  // Col 3: \nKegiatan (concise, natural single sentence matching earlier rows)
  const updates = {
    // Table 4 (Week 4 Month 1): update row 4 & 5
    3: {
      rows: {
        4: {
          col1: '\n\nSenin,\n19 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nPengarahan dan koordinasi perancangan sistem Log Book Rapat KEK bersama mentor'
        },
        5: {
          col1: '\n\nSelasa,\n20 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nObservasi dan identifikasi kebutuhan sistem notula rapat dinas'
        }
      }
    },
    // Table 5 (Week 1 Month 2 - Oktober)
    4: {
      heading: 'MINGGU KE 1 (Satu)\tBULAN KE 2 (Oktober)',
      rows: {
        1: {
          col1: '\n\nRabu,\n21 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nAnalisis kebutuhan fungsional aplikasi Log Book Notula Rapat KEK'
        },
        2: {
          col1: '\n\nKamis,\n22 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMenyusun spesifikasi kebutuhan sistem dan hak akses pengguna'
        },
        3: {
          col1: '\n\nJumat,\n23 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n26 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMerancang Use Case Diagram sistem Log Book Rapat'
        },
        5: {
          col1: '\n\nSelasa,\n27 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMerancang Activity Diagram alur persidangan dan notulensi rapat'
        }
      }
    },
    // Table 6 (Week 2 Month 2 - Oktober)
    5: {
      heading: 'MINGGU KE 2 (Dua)\tBULAN KE 2 (Oktober)',
      rows: {
        1: {
          col1: '\n\nRabu,\n28 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMerancang Entity Relationship Diagram (ERD) basis data sistem'
        },
        2: {
          col1: '\n\nKamis,\n29 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMelakukan normalisasi basis data dan perancangan relasi tabel LRS'
        },
        3: {
          col1: '\n\nJumat,\n30 Oktober 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n2 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nSetup basis data PostgreSQL dan konfigurasi Prisma ORM'
        },
        5: {
          col1: '\n\nSelasa,\n3 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat skema tabel basis data dan migrasi database'
        }
      }
    },
    // Table 7 (Week 3 Month 2 - November)
    6: {
      heading: 'MINGGU KE 3 (Tiga)\tBULAN KE 2 (November)',
      rows: {
        1: {
          col1: '\n\nRabu,\n4 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat antarmuka dan modul autentikasi login pengguna'
        },
        2: {
          col1: '\n\nKamis,\n5 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMenerapkan pembatasan hak akses halaman berbasis peran pengguna'
        },
        3: {
          col1: '\n\nJumat,\n6 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n9 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat modul manajemen data unit kerja dan tim biro'
        },
        5: {
          col1: '\n\nSelasa,\n10 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat modul manajemen data pengguna sistem'
        }
      }
    },
    // Table 8 (Week 4 Month 2 - November)
    7: {
      heading: 'MINGGU KE 4 (Empat)\tBULAN KE 2 (November)',
      rows: {
        1: {
          col1: '\n\nRabu,\n11 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat formulir penjadwalan rapat dinas baru'
        },
        2: {
          col1: '\n\nKamis,\n12 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat fitur generate nomor registrasi rapat dinas otomatis'
        },
        3: {
          col1: '\n\nJumat,\n13 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n16 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat tampilan kalender rapat dan daftar riwayat rapat dinas'
        },
        5: {
          col1: '\n\nSelasa,\n17 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nPengujian fungsi penjadwalan rapat dan penyimpanan data rapat'
        }
      }
    },
    // Table 9 (Week 1 Month 3 - November)
    8: {
      heading: 'MINGGU KE 1 (Satu)\tBULAN KE 3 (November)',
      rows: {
        1: {
          col1: '\n\nRabu,\n18 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat modul pengelolaan daftar peserta rapat dinas'
        },
        2: {
          col1: '\n\nKamis,\n19 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat sistem presensi kehadiran rapat secara digital'
        },
        3: {
          col1: '\n\nJumat,\n20 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n23 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nPenerapan validasi presensi dan penguncian kehadiran peserta'
        },
        5: {
          col1: '\n\nSelasa,\n24 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat rekapitulasi kehadiran dan persentase kehadiran rapat'
        }
      }
    },
    // Table 10 (Week 2 Month 3 - November)
    9: {
      heading: 'MINGGU KE 2 (Dua)\tBULAN KE 3 (November)',
      rows: {
        1: {
          col1: '\n\nRabu,\n25 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat antarmuka editor pencatatan notula rapat'
        },
        2: {
          col1: '\n\nKamis,\n26 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMengembangkan fungsi penyimpanan draf naskah notulensi rapat'
        },
        3: {
          col1: '\n\nJumat,\n27 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n30 November 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat alur telaah dan verifikasi pengesahan notula oleh pimpinan'
        },
        5: {
          col1: '\n\nSelasa,\n1 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat fitur catatan telaah dan persetujuan notula rapat dinas'
        }
      }
    },
    // Table 11 (Week 3 Month 3 - Desember)
    10: {
      heading: 'MINGGU KE 3 (Tiga)\tBULAN KE 3 (Desember)',
      rows: {
        1: {
          col1: '\n\nRabu,\n2 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat matriks monitoring tindak lanjut arahan rapat dinas'
        },
        2: {
          col1: '\n\nKamis,\n3 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat formulir penetapan PIC penugasan dan tenggat waktu tugas'
        },
        3: {
          col1: '\n\nJumat,\n4 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n7 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat fitur pembaruan status progres tindak lanjut oleh PIC'
        },
        5: {
          col1: '\n\nSelasa,\n8 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat notifikasi dan indikator pemantauan status tindak lanjut'
        }
      }
    },
    // Table 12 (Week 4 Month 3 - Desember)
    11: {
      heading: 'MINGGU KE 4 (Empat)\tBULAN KE 3 (Desember)',
      rows: {
        1: {
          col1: '\n\nRabu,\n9 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMembuat fitur ekspor dokumen PDF resmi notula rapat dinas'
        },
        2: {
          col1: '\n\nKamis,\n10 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nPenyematan QR Code verifikasi legalitas dokumen risalah rapat'
        },
        3: {
          col1: '\n\nJumat,\n11 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n14 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nMelakukan pengujian sistem bersama mentor menggunakan Black Box Testing'
        },
        5: {
          col1: '\n\nSelasa,\n15 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nPerbaikan dan penyempurnaan antarmuka serta kueri sistem'
        }
      }
    },
    // Table 13 (Week 1 Month 4 - Desember)
    12: {
      heading: 'MINGGU KE 1 (Satu)\tBULAN KE 4 (Desember)',
      rows: {
        1: {
          col1: '\n\nRabu,\n16 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nDeployment sistem Log Book Rapat KEK ke server cloud'
        },
        2: {
          col1: '\n\nKamis,\n17 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nDemonstrasi sistem dan pengujian oleh pengguna bersama mentor'
        },
        3: {
          col1: '\n\nJumat,\n18 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nWFH'
        },
        4: {
          col1: '\n\nSenin,\n21 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nBimbingan dan penyusunan draf akhir Laporan PKL bersama mentor'
        },
        5: {
          col1: '\n\nSelasa,\n22 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nSerah terima sistem aplikasi Log Book Rapat KEK dan dokumentasi teknis'
        }
      }
    },
    // Table 14 (Week 2 Month 4 - Final Day)
    13: {
      heading: 'MINGGU KE 2 (Dua)\tBULAN KE 4 (Desember)',
      rows: {
        1: {
          col1: '\n\nRabu,\n23 Desember 2026',
          col2: '\n\n8:00 – 16:30',
          col3: '\nEvaluasi akhir kegiatan PKL, penyerahan plakat kenang-kenangan, dan penutupan'
        }
      }
    }
  };

  // Build batchUpdate requests for Phase 1 (Content replacement)
  const ops = [];

  for (const tblIdxStr of Object.keys(updates)) {
    const tblIdx = parseInt(tblIdxStr, 10);
    const tableObj = tables[tblIdx];
    const updateData = updates[tblIdx];

    // Check heading
    if (updateData.heading) {
      const h = findHeading(content, tableObj.elementIndex);
      if (h) {
        const start = h.p.elements[0].startIndex;
        const end = h.p.elements[h.p.elements.length - 1].endIndex - 1;
        ops.push({
          startIndex: start,
          endIndex: end,
          text: updateData.heading,
          desc: 'Heading Table ' + (tblIdx + 1)
        });
      }
    }

    // Process rows
    if (updateData.rows) {
      for (const rowIdxStr of Object.keys(updateData.rows)) {
        const rowIdx = parseInt(rowIdxStr, 10);
        const rowData = updateData.rows[rowIdx];
        const tblRow = tableObj.table.tableRows[rowIdx];

        // Col 1 (Hari/Tanggal)
        if (rowData.col1) {
          const cell = tblRow.tableCells[1];
          const start = cell.content[0].startIndex;
          const end = cell.content[cell.content.length - 1].endIndex - 1;
          ops.push({
            startIndex: start,
            endIndex: end,
            text: rowData.col1,
            desc: `T${tblIdx + 1} R${rowIdx} C1`
          });
        }

        // Col 2 (Waktu)
        if (rowData.col2) {
          const cell = tblRow.tableCells[2];
          const start = cell.content[0].startIndex;
          const end = cell.content[cell.content.length - 1].endIndex - 1;
          ops.push({
            startIndex: start,
            endIndex: end,
            text: rowData.col2,
            desc: `T${tblIdx + 1} R${rowIdx} C2`
          });
        }

        // Col 3 (Jenis Kegiatan)
        if (rowData.col3) {
          const cell = tblRow.tableCells[3];
          const start = cell.content[0].startIndex;
          const end = cell.content[cell.content.length - 1].endIndex - 1;
          ops.push({
            startIndex: start,
            endIndex: end,
            text: rowData.col3,
            desc: `T${tblIdx + 1} R${rowIdx} C3`
          });
        }
      }
    }
  }

  console.log('Total operations generated:', ops.length);

  // Sort operations in DESCENDING order by startIndex
  ops.sort((a, b) => b.startIndex - a.startIndex);

  // Build Google Docs API requests
  const requests = [];
  ops.forEach(op => {
    if (op.endIndex > op.startIndex) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: op.startIndex,
            endIndex: op.endIndex
          }
        }
      });
    }
    if (op.text && op.text.length > 0) {
      requests.push({
        insertText: {
          location: { index: op.startIndex },
          text: op.text
        }
      });
    }
  });

  console.log('Total Phase 1 batchUpdate requests:', requests.length);

  console.log('Sending Phase 1 batchUpdate to Google Docs API...');
  let updateRes = await fetch('https://docs.googleapis.com/v1/documents/' + docId + ':batchUpdate', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error('Phase 1 batchUpdate failed: ' + updateRes.status + ' ' + errText);
  }

  let result = await updateRes.json();
  console.log('Phase 1 SUCCESS! Content replaced. Replies count:', result.replies?.length);

  // Phase 2: Formatting / Styling Normalization to MATCH ABOVE 15 OCTOBER EXACTLY
  console.log('Fetching document again for Phase 2 styling normalization...');
  res = await fetch('https://docs.googleapis.com/v1/documents/' + docId, {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  doc = await res.json();
  const refreshedTables = doc.body.content.filter(el => el.table).map(el => el.table);

  const styleRequests = [];

  // Normalize Table 4 (rows 4 and 5) and Table 5 through Table 14
  for (let ti = 3; ti < refreshedTables.length; ti++) {
    const tbl = refreshedTables[ti];
    tbl.tableRows.forEach((r, ri) => {
      if (ri === 0) return; // keep table headers untouched

      // If Table 4, only normalize rows 4 and 5
      if (ti === 3 && ri < 4) return;

      r.tableCells.forEach((c, ci) => {
        const start = c.content[0].startIndex;
        const end = c.content[c.content.length - 1].endIndex;

        // Paragraph Style matching above 15 October:
        // Col 0, 1, 2: alignment CENTER, lineSpacing 100
        // Col 3 (Kegiatan): alignment CENTER, lineSpacing 150 (1.5 spasi)
        // Col 4 (Tanda tangan): alignment START, lineSpacing 100
        const alignment = (ci === 4) ? 'START' : 'CENTER';
        const lineSpacing = (ci === 3) ? 150 : 100;

        styleRequests.push({
          updateParagraphStyle: {
            range: { startIndex: start, endIndex: end },
            paragraphStyle: {
              alignment: alignment,
              lineSpacing: lineSpacing,
              spaceAbove: { magnitude: 0, unit: 'PT' },
              spaceBelow: { magnitude: 0, unit: 'PT' },
              indentStart: { magnitude: 0, unit: 'PT' },
              indentFirstLine: { magnitude: 0, unit: 'PT' }
            },
            fields: 'alignment,lineSpacing,spaceAbove,spaceBelow,indentStart,indentFirstLine'
          }
        });
      });
    });
  }

  console.log('Total Phase 2 styling requests:', styleRequests.length);

  if (styleRequests.length > 0) {
    console.log('Sending Phase 2 styling batchUpdate to Google Docs API...');
    updateRes = await fetch('https://docs.googleapis.com/v1/documents/' + docId + ':batchUpdate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: styleRequests })
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error('Phase 2 batchUpdate failed: ' + updateRes.status + ' ' + errText);
    }
    result = await updateRes.json();
    console.log('Phase 2 SUCCESS! Styling normalized.');
  }

  console.log('ALL SYNCHRONIZATION AND TIDYING UP COMPLETE!');
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
