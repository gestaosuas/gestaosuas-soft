
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load local env
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltam variáveis de ambiente (URL ou KEY).")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateCras() {
    console.log("🚀 Iniciando migração de dados históricos do CRAS...")

    // 1. Fetch submissions that might contain CRAS data
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
    
    if (error) {
        console.error("Erro ao buscar submissões:", error)
        return
    }

    let count = 0
    const columns = [
        'mes_anterior', 'admitidas', 'desligadas', 'atual', 'atendimentos', 
        'visita_domiciliar', 'atend_particularizado', 'pro_pao', 'dmae', 
        'auxilio_documento', 'cesta_basica', 'fralda', 'absorvente', 'bpc', 
        'carteirinha_idoso', 'passe_livre_deficiente', 'cadastros_novos', 'recadastros'
    ]

    for (const sub of (submissions || [])) {
        const data = sub.data || {}
        
        // Check if this submission has units (CRAS pattern)
        if (data.units && Object.keys(data.units).length > 0) {
            // Check if one of the units belongs to CRAS (e.g. 'Morumbi', 'Canaã')
            // Using a simple check to see if it matches CRAS fields
            const firstUnitKey = Object.keys(data.units)[0]
            const firstUnit = data.units[firstUnitKey]
            
            // If it has 'atend_particularizado' or 'mes_anterior', it's likely CRAS
            const isCras = firstUnit.atend_particularizado !== undefined || firstUnit.mes_anterior !== undefined

            if (isCras) {
                console.log(`📂 Processando Mês ${sub.month}/${sub.year} (Multi-unidade CRAS)`)
                
                for (const unitName of Object.keys(data.units)) {
                    const unitDataRaw = data.units[unitName]
                    
                    const crasRow: any = {
                        user_id: sub.user_id,
                        directorate_id: sub.directorate_id,
                        unit_name: unitName,
                        month: sub.month,
                        year: sub.year,
                        created_at: sub.created_at,
                        updated_at: sub.updated_at || sub.created_at
                    }

                    columns.forEach(col => {
                        if (unitDataRaw[col] !== undefined) {
                            crasRow[col] = Number(unitDataRaw[col]) || 0
                        }
                    })

                    const { error: insError } = await supabase.from('cras_reports').upsert(crasRow, { onConflict: 'unit_name,month,year' })
                    if (insError) console.error(`Erro ao migrar ${unitName}:`, insError.message)
                    else {
                        console.log(`✅ ${unitName} migrado.`)
                        count++
                    }
                }
            }
        }
    }

    console.log(`🏁 Migração do CRAS concluída! ${count} registros de unidades migrados.`)
}

migrateCras()
