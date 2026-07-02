
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLinks() {
    const { data, error } = await supabase.from('profile_directorates').select('*').eq('directorate_id', 'd9f66b00-4782-4fc3-a064-04029529054b');
    console.log('Users linked to SINE/CP:', data.length);
    data.forEach(d => console.log(d.profile_id));
}
checkLinks();
