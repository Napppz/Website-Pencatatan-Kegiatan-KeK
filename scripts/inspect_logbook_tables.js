const fs = require('fs');

const step_path = 'C:/Users/nappz/.gemini/antigravity-ide/brain/85866fb5-3dc6-4b0f-a50f-87e712d16f6a/.system_generated/steps/4532/output.txt';
const text = fs.readFileSync(step_path, 'utf8');

// Let's write an inspector script to check each table's position, headers, and rows
console.log('Document length:', text.length);
