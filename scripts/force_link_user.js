
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Iniciando correção de vínculo...");
    const email = 'klismanrds90@gmail.com';
    const dirId = 'd9f66b00-4782-4fc3-a064-04029529054b'; // Formação Profissional

    // 1. Buscar usuário
    const { data: { users }, error: errUser } = await supabase.auth.admin.listUsers();

    if (errUser) {
        console.error("Erro ao listar usuários:", errUser);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`Usuário ${email} não encontrado no Auth do Supabase.`);
        return;
    }

    console.log(`Usuário encontrado: ${user.id}`);

    // 2. Inserir vínculo na tabela profile_directorates
    // Usando upsert para garantir que crie se não existir
    const { error: upsertError } = await supabase
        .from('profile_directorates')
        .upsert({
            user_id: user.id,
            directorate_id: dirId
        }, { onConflict: 'user_id, directorate_id' }); // Supondo constraint composta, se falhar tentamos insert simples

    if (upsertError) {
        console.log("Upsert falhou (talvez sem constraint definida?), tentando INSERT simples...", upsertError.message);

        // Check se já existe
        const { data: existing } = await supabase.from('profile_directorates')
            .select('*')
            .eq('user_id', user.id)
            .eq('directorate_id', dirId);

        if (existing && existing.length > 0) {
            console.log("Vínculo já existe.");
        } else {
            const { error: insertError } = await supabase
                .from('profile_directorates')
                .insert({ user_id: user.id, directorate_id: dirId });

            if (insertError) console.error("Erro no INSERT:", insertError);
            else console.log("Vínculo criado via INSERT!");
        }
    } else {
        console.log("Vínculo garantido com sucesso (Upsert)!");
    }
}

run();
