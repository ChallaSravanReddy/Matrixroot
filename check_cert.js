const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCert() {
    const certId = "2832c982-f226-4d78-9e1a-4f550d950238";
    console.log("Checking Certificate ID:", certId);

    const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("id", certId)
        .single();

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Certificate Data:", data);
    }
}

checkCert();
