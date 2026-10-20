const fs = require('fs');

async function dryRun() {
  const tokenData = JSON.parse(fs.readFileSync('C:/Users/nappz/.config/google-drive-mcp/tokens.json', 'utf8'));
  const accessToken = tokenData.accounts[tokenData.defaultAccount].accessToken;
  const docId = '1hHZ7iRT0eZCBlff_KHBPtp69n0C5TTlWxDx06RX8kM0';
  
  const res = await fetch('https://docs.googleapis.com/v1/documents/' + docId, {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (!res.ok) throw new Error('Failed to fetch doc: ' + res.statusText);
  const doc = await res.json();
  
  const content = doc.body.content;
  console.log('Doc title:', doc.title);
  console.log('Total content elements:', content.length);
  
  // Find all tables
  const tables = [];
  content.forEach((el, idx) => {
    if (el.table) {
      tables.push({ elementIndex: idx, startIndex: el.startIndex, endIndex: el.endIndex, table: el.table });
    }
  });
  console.log('Found tables count:', tables.length);
}

dryRun().catch(console.error);
