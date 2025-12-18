
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipeReports() {
    console.log('Iniciando exclusão de TODOS os relatórios (tabela submissions)...');

    const { error } = await supabase
        .from('submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all where ID is not a dummy value (basically all)

    if (error) {
        console.error('Erro ao excluir relatórios:', error);
    } else {
        console.log('Sucesso! Todos os relatórios foram excluídos.');
    }
}

wipeReports();
