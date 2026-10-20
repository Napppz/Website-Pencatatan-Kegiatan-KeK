const fs = require('fs');

const step_path = 'C:/Users/nappz/.gemini/antigravity-ide/brain/85866fb5-3dc6-4b0f-a50f-87e712d16f6a/.system_generated/steps/4566/output.txt';
const data = JSON.parse(fs.readFileSync(step_path, 'utf8'));

const tab = data.tabs ? data.tabs[0].documentTab : data;
const content = tab.body.content;

content.forEach((el, idx) => {
  if (el.paragraph) {
    const txt = el.paragraph.elements.map(e => e.textRun?.content || '').join('').trim();
    if (txt.includes('MINGGU') || txt.includes('BULAN')) {
      console.log(`Element ${idx} [${el.startIndex}-${el.endIndex}]: "${txt}"`);
    }
  }
});
