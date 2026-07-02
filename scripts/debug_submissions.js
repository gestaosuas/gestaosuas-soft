
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubmissions() {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching submissions:', error);
        return;
    }

    console.log('Last 5 submissions:');
    data.forEach(sub => {
        console.log(`ID: ${sub.id}, Month: ${sub.month}, Year: ${sub.year}, Directorate: ${sub.directorate_id}, Setor: ${sub.setor}, Created: ${sub.created_at}`);
    });
}

checkSubmissions();
