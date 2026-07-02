
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.production' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function checkTables() {
    const { data, error } = await supabase.from('cras_reports').select('id').limit(1)
    if (error) console.log("❌ Erro ao acessar cras_reports:", error.message)
    else console.log("✅ Tabela cras_reports encontrada e acessível!")
}
checkTables()
