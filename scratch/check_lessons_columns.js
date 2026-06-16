const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Manually parse .env.local
const envPath = path.join(__dirname, "../.env.local");
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (parts) {
      const key = parts[1];
      let val = parts[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      env[key] = val.trim();
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE env vars", { supabaseUrl, supabaseServiceKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .limit(1);
  
  if (error) {
    console.error("Error fetching lessons:", error);
  } else {
    console.log("Lessons table columns:", Object.keys(data[0] || {}));
  }
}

run();
