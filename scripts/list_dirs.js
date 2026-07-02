
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use .env.local
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function listDirectorates() {
    const { data, error } = await supabase.from('directorates').select('id, name');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Directorates:');
    data.forEach(d => console.log(`${d.id}: ${d.name}`));
}

listDirectorates();
