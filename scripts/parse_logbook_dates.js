const fs = require('fs');

const content = fs.readFileSync('C:/Users/nappz/.gemini/antigravity-ide/brain/85866fb5-3dc6-4b0f-a50f-87e712d16f6a/.system_generated/steps/4532/output.txt', 'utf8');

const parts = content.split(/MINGGU KE/i);

for (let i = 1; i < parts.length; i++) {
  const p = parts[i];
  const firstLine = p.split('\n')[0].trim();
  console.log('\n=== Section ' + i + ': MINGGU KE ' + firstLine + ' ===');
  const lines = p.split('\n');
  for (let j = 0; j < lines.length; j++) {
    const l = lines[j].trim();
    if (l.match(/^(Senin|Selasa|Rabu|Kamis|Jumat),/)) {
      const nextLine = (lines[j+1] || '').trim();
      console.log('  ' + l + ' ' + nextLine);
    }
  }
}
