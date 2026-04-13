
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load production env
dotenv.config({ path: '.env.production' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltam variáveis de ambiente para a migração.")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateData() {
    console.log("🚀 Iniciando migração de dados históricos para SINE e Qualificação...")

    // 1. Fetch all candidate submissions
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
    
    if (error) {
        console.error("Erro ao buscar submissões:", error)
        return
    }

    let sineCount = 0
    let cpCount = 0

    for (const sub of (submissions || [])) {
        const data = sub.data || {}
        const isSine = data._setor === 'sine' || data._has_sine === true
        const isCP = data._setor === 'centros' || data._has_centros === true

        if (isSine) {
            console.log(`📊 Migrando SINE: Mês ${sub.month}/${sub.year}`)
            const sineData: any = {
                user_id: sub.user_id,
                directorate_id: sub.directorate_id,
                month: sub.month,
                year: sub.year,
                created_at: sub.created_at,
                updated_at: sub.updated_at || sub.created_at,
            }

            // Fill columns dynamically based on keys in JSON
            const columns = [
                'atend_trabalhador', 'atend_online_trabalhador', 'atend_empregador', 'atend_online_empregador',
                'seguro_desemprego', 'vagas_captadas', 'ligacoes_recebidas', 'ligacoes_realizadas',
                'curriculos', 'entrevistados', 'proc_administrativos', 'processo_seletivo',
                'inseridos_mercado', 'carteira_digital', 'orientacao_profissional', 'convocacao_trabalhadores',
                'vagas_alto_valor', 'atendimentos'
            ]

            columns.forEach(col => {
                if (data[col] !== undefined) {
                    sineData[col] = Number(data[col]) || 0
                }
            })

            const { error: insError } = await supabase.from('sine_reports').upsert(sineData, { onConflict: 'month,year' })
            if (insError) console.error("Erro SINE migration:", insError)
            else sineCount++
        }

        if (isCP) {
            console.log(`🛠️ Migrando Qualificação: Mês ${sub.month}/${sub.year}`)
            const qualifData: any = {
                user_id: sub.user_id,
                directorate_id: sub.directorate_id,
                month: sub.month,
                year: sub.year,
                created_at: sub.created_at,
                updated_at: sub.updated_at || sub.created_at,
            }

            const cpColumns = [
                'resumo_vagas', 'resumo_cursos', 'resumo_turmas', 'resumo_concluintes', 
                'resumo_mulheres', 'resumo_homens', 'resumo_mercado_fem', 'resumo_mercado_masc', 
                'resumo_vagas_ocupadas', 'resumo_taxa_ocupacao',
                'cp_morumbi_concluintes', 'cp_lagoinha_concluintes', 'cp_campo_alegre_concluintes', 
                'cp_luizote_1_concluintes', 'cp_luizote_2_concluintes', 'cp_tocantins_concluintes', 
                'cp_planalto_concluintes', 'onibus_concluintes_unit', 'maravilha_concluintes', 'uditech_concluintes',
                'bairros_visitados', 'concluintes_onibus', 'cursos_onibus',
                'cp_morumbi_atendimentos', 'cp_lagoinha_atendimentos', 'cp_campo_alegre_atendimentos', 
                'cp_luizote_1_atendimentos', 'cp_luizote_2_atendimentos', 'cp_tocantis_atendimentos', 
                'cp_planalto_atendimentos', 'maravilha_atendimentos', 'unitech_atendimentos', 'onibus_atendimentos',
                'cursos_andamento'
            ]

            cpColumns.forEach(col => {
                if (data[col] !== undefined) {
                    qualifData[col] = Number(data[col]) || 0
                }
            })

            const { error: insError } = await supabase.from('qualificacao_reports').upsert(qualifData, { onConflict: 'month,year' })
            if (insError) console.error("Erro CP migration:", insError)
            else cpCount++
        }
    }

    console.log(`✅ Migração concluída! SINE: ${sineCount} registros, CP: ${cpCount} registros.`)
}

migrateData()
