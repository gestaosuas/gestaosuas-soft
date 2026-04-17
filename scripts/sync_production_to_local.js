
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

// Carregar configurações de produção e local
const prodEnv = dotenv.parse(fs.readFileSync('.env.production'));
const localEnv = dotenv.parse(fs.readFileSync('.env.local'));

const prodSupabase = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY);
const localSupabase = createClient(localEnv.NEXT_PUBLIC_SUPABASE_URL, localEnv.SUPABASE_SERVICE_ROLE_KEY);

const tablesToSync = [
    'directorates',
    'profiles',
    'profile_directorates',
    'oscs',
    'visits',
    'submissions',
    'settings',
    'work_plans',
    'form_delegations',
    'cras_reports',
    'beneficios_reports',
    'naica_reports',
    'creas_pop_rua_reports',
    'creas_protetivo_reports',
    'creas_socioeducativo_reports',
    'casa_da_mulher_reports',
    'diversidade_reports',
    'nucleo_diversidade_reports',
    'sine_reports',
    'qualificacao_reports'
];

async function sync() {
    console.log('🚀 Iniciando sincronismo Produção -> Local...');

    for (const table of tablesToSync) {
        console.log(`\n--- Sincronizando tabela: ${table} ---`);

        // 1. Puxar da Produção
        const { data: prodData, error: prodError } = await prodSupabase.from(table).select('*');
        if (prodError) {
            console.error(`❌ Erro ao puxar dados da produção (${table}):`, prodError.message);
            continue;
        }
        console.log(`✅ ${prodData.length} registros encontrados na produção.`);

        if (prodData.length === 0) continue;

        // 2. Limpar local (opcional, mas recomendado para evitar conflitos de ID)
        const { error: deleteError } = await localSupabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo que não for um ID impossível
        if (deleteError) {
            console.warn(`⚠️ Aviso ao limpar local (${table}):`, deleteError.message);
        }

        // 3. Inserir no Local (em lotes de 100 para não estourar)
        const batchSize = 100;
        for (let i = 0; i < prodData.length; i += batchSize) {
            const batch = prodData.slice(i, i + batchSize);
            const { error: insertError } = await localSupabase.from(table).insert(batch);
            if (insertError) {
                console.error(`❌ Erro ao inserir no local (${table}):`, insertError.message);
                break;
            }
            console.log(`📦 Lote ${i / batchSize + 1} inserido...`);
        }
        console.log(`✨ Tabela ${table} sincronizada com sucesso!`);
    }

    console.log('\n✅ Sincronismo concluído! Seu localhost está atualizado.');
}

sync().catch(err => {
    console.error('💥 Erro fatal no sincronismo:', err);
});
