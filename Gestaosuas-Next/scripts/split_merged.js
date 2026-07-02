
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function split() {
    const { data: sub, error } = await supabase.from('submissions').select('*').eq('id', 'be9e7d34-2f96-424e-8138-b28ce42f3913').single();
    if (error) { console.log(error); return; }

    const allKeys = Object.keys(sub.data);
    const cpKeys = allKeys.filter(k => k.startsWith('resumo_') || k.startsWith('cp_') || k.includes('concluintes') || k.includes('parceiros') || k.includes('onibus'));
    const benKeys = allKeys.filter(k => ['absorvente', 'cesta_basica', 'dmae', 'pro_pao', 'guia_foto', 'numero_nis'].some(bk => k.includes(bk)));

    console.log('CP Keys:', cpKeys);
    console.log('Benefícios Keys:', benKeys);

    const cpData = {};
    cpKeys.forEach(k => cpData[k] = sub.data[k]);

    const benData = {};
    benKeys.forEach(k => benData[k] = sub.data[k]);

    // Check if we should restore CP to SINE/CP ID
    const SINE_CP_ID = 'd9f66b00-4782-4fc3-a064-04029529054b';

    // Upsert CP data to SINE/CP ID
    const { error: cpErr } = await supabase.from('submissions').upsert({
        directorate_id: SINE_CP_ID,
        month: sub.month,
        year: sub.year,
        data: cpData,
        user_id: sub.user_id
    });
    if (cpErr) console.log('CP Restore Error:', cpErr);
    else console.log('CP Restore Success');

    // Clean Benefícios data in its ID
    const { error: benErr } = await supabase.from('submissions').update({
        data: benData
    }).eq('id', sub.id);
    if (benErr) console.log('Ben Update Error:', benErr);
    else console.log('Ben Update Success');
}
split();
