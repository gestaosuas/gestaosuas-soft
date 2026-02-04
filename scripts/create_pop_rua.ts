
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createPopRuaDirectorate() {
    const name = "População de Rua e Migrantes"

    // Check if it already exists
    const { data: existing } = await supabase
        .from('directorates')
        .select('*')
        .eq('name', name)
        .single()

    if (existing) {
        console.log(`Directorate '${name}' already exists with ID: ${existing.id}`)
        return
    }

    const { data, error } = await supabase
        .from('directorates')
        .insert([{
            name: name,
            description: "Diretoria responsável pelo monitoramento de População de Rua e Migrantes" // Optional description
        }])
        .select()

    if (error) {
        console.error("Error creating directorate:", JSON.stringify(error, null, 2))
    } else {
        console.log(`Successfully created directorate '${name}' with ID: ${data[0].id}`)
    }
}

createPopRuaDirectorate()
