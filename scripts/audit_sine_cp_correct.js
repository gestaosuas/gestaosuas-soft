
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

const SINE_CP_ID = 'd9f66b00-4782-4fc3-a064-04029529054b';

async function auditSINE_CP_Correct() {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('directorate_id', SINE_CP_ID)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Auditing ${data.length} submissions for SINE/CP...`);
    data.forEach(sub => {
        const keys = Object.keys(sub.data);
        const hasSINE = keys.includes('curriculos');
        const hasCP = keys.some(k => k.startsWith('resumo_') || k.startsWith('cp_') || k.includes('concluintes'));

        console.log(`Created: ${sub.created_at}, Month: ${sub.month}, Year: ${sub.year}`);
        console.log(`- SINE: ${hasSINE}, CP: ${hasCP}`);
        if (hasCP) console.log(`- CP Keys sample: ${keys.filter(k => k.startsWith('resumo_') || k.startsWith('cp_')).join(', ')}`);
        console.log('---');
    });
}

auditSINE_CP_Correct();
