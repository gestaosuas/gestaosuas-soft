
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Verificando diretorias e submissões...");

    // 1. Buscar Diretoria de Formação
    const { data: dirs, error: errDir } = await supabase
        .from('directorates')
        .select('id, name')
        .ilike('name', '%Forma%'); // Busca por "Formação"

    if (errDir) {
        console.error("Erro ao buscar diretoria:", errDir);
        return;
    }

    console.log('Diretorias encontradas:', dirs);

    if (!dirs || dirs.length === 0) {
        console.log("Nenhuma diretoria encontrada com 'Forma'.");
        return;
    }

    const dirId = dirs[0].id;
    console.log(`Usando ID da diretoria: ${dirId}`);

    // 2. Buscar Submissões
    const { data: subs, error: errSub } = await supabase
        .from('submissions')
        .select('id, month, year, data')
        .eq('directorate_id', dirId);

    if (errSub) {
        console.error("Erro ao buscar submissões:", errSub);
        return;
    }

    console.log(`Total de relatório/submissões encontradas no banco: ${subs.length}`);

    subs.forEach(s => {
        const hasContent = s.data && s.data._report_content && s.data._report_content.length > 0;
        console.log(`- Mês ${s.month}/${s.year}: ID=${s.id} | Tem _report_content? ${hasContent ? 'SIM' : 'NÃO'}`);
    });
}

check();
