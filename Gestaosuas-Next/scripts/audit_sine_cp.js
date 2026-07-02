
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

const SINE_CP_ID = 'd9f66b00-4782-4fc3-a064-04029529054b';

async function auditSINE_CP() {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('directorate_id', SINE_CP_ID);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Auditing ${data.length} submissions for SINE/CP directorate...`);
    data.forEach(sub => {
        const keys = Object.keys(sub.data);
        const hasSINE = keys.some(k => ['curriculos', 'ate_guia_foto', 'seguro_desemprego'].includes(k));
        const hasCP = keys.some(k => ['total_matriculados', 'orientacao_profissional', 'projeto_pao'].includes(k));

        console.log(`Month: ${sub.month}, Year: ${sub.year}`);
        console.log(`- Has SINE keys: ${hasSINE}`);
        console.log(`- Has CP keys: ${hasCP}`);
        console.log(`- Keys found: ${keys.slice(0, 10).join(', ')}...`);
        console.log('---');
    });
}

auditSINE_CP();
