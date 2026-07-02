
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function globalCPScan() {
    const { data, error } = await supabase.from('submissions').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Scanning ${data.length} total records...`);
    data.forEach(sub => {
        const keys = Object.keys(sub.data);
        const hasCP = keys.some(k => k.startsWith('resumo_') || k.startsWith('cp_') || k.includes('concluintes'));
        if (hasCP) {
            console.log(`MATCH FOUND! ID: ${sub.id}, Month: ${sub.month}, Year: ${sub.year}, DirID: ${sub.directorate_id}`);
            console.log(`Keys: ${keys.slice(0, 10).join(', ')}`);
        }
    });
}

globalCPScan();
