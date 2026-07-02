
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase.from('submissions').select('*');
    if (error) console.log(error);
    data.forEach(d => {
        console.log(d.id, d.directorate_id, Object.keys(d.data).length, Object.keys(d.data).slice(0, 5));
    });
}
check();
