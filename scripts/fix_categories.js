const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixData() {
    console.log("Starting cleanup...");

    // IDs to delete based on the log
    const idsToDelete = [
        '0fec477e-d084-4f63-b979-caa502ae3343', // Conselhos Tutelares
        '42ba79b9-58a0-48b1-a24d-1ef60fe60056', // Conselhos Municipais
        'c364ed4b-9db2-4e24-ab20-3767ccba7892', // Centro Prof.
        'fd1d8dc0-81ed-4a50-84ca-93a81f88411c'  // Condomínio do Idoso (the original empty one)
    ];

    for (const id of idsToDelete) {
        console.log(`Deleting units for category ID ${id}...`);
        await supabase.from('map_units').delete().eq('category_id', id);
        console.log(`Deleting category ID ${id}...`);
        await supabase.from('map_categories').delete().eq('id', id);
    }

    // ID to rename
    const idToRename = 'de460bd4-092a-4954-9c74-cdd16848b5e6'; // Condomínio (from CSV that actually has units)
    console.log(`Renaming category Condomínio to Condomínio do Idoso...`);
    await supabase.from('map_categories').update({ name: 'Condomínio do Idoso', color: 'darkblue' }).eq('id', idToRename);

    console.log("Done.");
}

fixData().catch(console.error);
