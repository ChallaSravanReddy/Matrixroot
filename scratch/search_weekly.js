const fs = require('fs');
const content = fs.readFileSync('app/admin/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('weekly') || line.toLowerCase().includes('grade')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
