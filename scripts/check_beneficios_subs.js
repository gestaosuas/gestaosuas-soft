
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubmissions() {
    const { data, error } = await supabase.from('submissions').select('*').eq('directorate_id', 'efaf606a-53ae-4bbc-996c-79f4354ce0f9');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Benefícios Submissions:', data.length);
    data.forEach(sub => {
        console.log(`Month: ${sub.month}, Year: ${sub.year}, Created: ${sub.created_at}`);
    });
}

checkSubmissions();
