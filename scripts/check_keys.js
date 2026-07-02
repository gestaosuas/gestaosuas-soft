
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkKeys() {
    const { data, error } = await supabase.from('submissions').select('*').eq('id', '0be94c19-b682-414e-98c8-81cc0db00022').single();
    if (error) { console.log(error); return; }
    console.log('Keys:', Object.keys(data.data).join(', '));
}
checkKeys();
