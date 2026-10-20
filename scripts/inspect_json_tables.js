const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/nappz/.gemini/antigravity-ide/brain/85866fb5-3dc6-4b0f-a50f-87e712d16f6a/.system_generated/steps/4566/output.txt', 'utf8'));

console.log('Title:', data.title);
console.log('RevisionId:', data.revisionId);

const tab = data.tabs ? data.tabs[0].documentTab : data;
const content = tab.body.content;

let tableIndex = 0;
for (let i = 0; i < content.length; i++) {
  const el = content[i];
  if (el.table) {
    tableIndex++;
    const tbl = el.table;
    console.log(`\n=================== TABLE ${tableIndex} (startIndex: ${el.startIndex}, endIndex: ${el.endIndex}) ===================`);
    console.log(`Rows: ${tbl.rows}, Columns: ${tbl.columns}`);
    // inspect preceding paragraph to see Week/Month title
    if (i > 0 && content[i-1].paragraph) {
      const p = content[i-1].paragraph;
      const title = p.elements.map(e => e.textRun?.content || '').join('').trim();
      console.log(`Preceding Heading: "${title}"`);
    }
    for (let r = 0; r < tbl.tableRows.length; r++) {
      const row = tbl.tableRows[r];
      const cells = row.tableCells.map(c => {
        let txt = '';
        for (const ce of c.content) {
          if (ce.paragraph) {
            txt += ce.paragraph.elements.map(e => e.textRun?.content || '').join('');
          }
        }
        return txt.replace(/\n/g, ' ').trim();
      });
      console.log(`  Row ${r}: [${cells.join(' | ')}]`);
    }
  }
}
