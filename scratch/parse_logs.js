const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\srava\\.gemini\\antigravity\\brain\\89843b19-8c5b-4c09-8858-69f46f761ded\\.system_generated\\logs\\overview.txt';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line) => {
    if (line.includes('.sql') || line.includes('psql') || line.includes('supabase') || line.includes('run_command')) {
      console.log(line);
    }
  });
} else {
  console.log("Log file not found at " + logPath);
}
