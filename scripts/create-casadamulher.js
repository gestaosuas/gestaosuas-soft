const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Initializing Supabase client...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Error: Missing credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = {
        name: "Casa da Mulher",
        sheet_config: { sheetName: "CASA_DA_MULHER", startRow: 2, spreadsheetId: "1Jbv5i3PBKXU4nDbqCH1RhqW5Cj1QH4uRlibM577PoDo" },
        form_definition: { sections: [] }
    };

    console.log('Inserting "Casa da Mulher" directorate...');

    // Check if it already exists to avoid duplicates
    const { data: existing } = await supabase.from('directorates').select('id').eq('name', payload.name).single();
    if (existing) {
        console.log('Directorate already exists!', existing);
        return;
    }

    const { data, error } = await supabase.from('directorates').insert(payload).select().single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success!', data.id);
    }
}

main();
