const fs = require('fs');

async function inspectTables() {
  const tokenData = JSON.parse(fs.readFileSync('C:/Users/nappz/.config/google-drive-mcp/tokens.json', 'utf8'));
  const accessToken = tokenData.accounts[tokenData.defaultAccount].accessToken;
  const docId = '1dBGQ4RXnUhx2E4afkoQgKItVCMv2sQcfNHLGKdy4o7s';
  const res = await fetch('https://docs.googleapis.com/v1/documents/' + docId, {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  const doc = await res.json();
  const c = doc.body.content;

  for (let idx = 250; idx <= 445; idx++) {
    const el = c[idx];
    if (!el) continue;
    if (el.paragraph) {
      const text = el.paragraph.elements?.map(e => e.textRun?.content || '').join('').trim();
      if (text.startsWith('Tabel III.') || text.startsWith('3.2.4') || text.includes('Spesifikasi')) {
        console.log(`[${idx}] Paragraph: ${text}`);
      }
    } else if (el.table) {
      const prev1 = c[idx-1]?.paragraph?.elements?.map(e => e.textRun?.content || '').join('').trim();
      const prev2 = c[idx-2]?.paragraph?.elements?.map(e => e.textRun?.content || '').join('').trim();
      const heading = prev1 || prev2 || '';
      console.log(`=== Table at [${idx}]: "${heading}" (rows: ${el.table.tableRows.length}) ===`);
      el.table.tableRows.forEach((r, ri) => {
        const rowText = r.tableCells.map(tc => tc.content.map(p => p.paragraph?.elements?.map(e => e.textRun?.content || '').join('')).join('').trim().replace(/\n/g, ' ')).join(' | ');
        console.log(`  Row ${ri}: ${rowText}`);
      });
    }
  }
}

inspectTables().catch(console.error);
