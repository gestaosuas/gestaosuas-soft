
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function scanCP() {
    const { data, error } = await supabase.from('submissions').select('*');
    data.forEach(sub => {
        if (sub.data.resumo_vagas !== undefined || sub.data.cp_morumbi_concluintes !== undefined) {
            console.log('FOUND CP DATA:', sub.id, sub.month, sub.year, sub.directorate_id);
        }
    });
}
scanCP();
