
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

const SINE_ID = 'd9f66b00-4782-4fc3-a064-04029529054b';
const BENEFICIOS_ID = 'efaf606a-53ae-4bbc-996c-79f4354ce0f9';

async function repairSubmissions() {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('directorate_id', SINE_ID);

    if (error) {
        console.error('Error fetching submissions:', error);
        return;
    }

    console.log(`Checking ${submissions.length} submissions in SINE...`);

    for (const sub of submissions) {
        // Check if data contains Beneficios keys
        const keys = Object.keys(sub.data);
        // Key example in Beneficios: 'absorvente', 'cesta_basica', 'auxilio_natalidade'
        const isBeneficiosData = keys.includes('absorvente') || keys.includes('cesta_basica') || keys.includes('auxilio_natalidade');

        if (isBeneficiosData) {
            console.log(`Found Benefícios data in SINE submission (ID: ${sub.id}, Month: ${sub.month}, Year: ${sub.year}). Moving...`);

            const { error: moveError } = await supabase
                .from('submissions')
                .update({ directorate_id: BENEFICIOS_ID })
                .eq('id', sub.id);

            if (moveError) {
                console.error(`Error moving submission ${sub.id}:`, moveError);
            } else {
                console.log(`Successfully moved submission ${sub.id} to Benefícios.`);
            }
        }
    }
}

repairSubmissions();
