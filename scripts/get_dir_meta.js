
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function getDir() {
    const { data, error } = await supabase.from('directorates').select('*').eq('id', 'd9f66b00-4782-4fc3-a064-04029529054b').single();
    console.log(JSON.stringify(data, null, 2));
}
getDir();
