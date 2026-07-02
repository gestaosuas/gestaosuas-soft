import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log("Creating CEAI Directorate...")

    // Check if exists
    const { data: existing } = await supabase
        .from('directorates')
        .select('id, name')
        .eq('name', 'CEAI')
        .single()

    if (existing) {
        console.log("CEAI Directorate already exists:", existing)
        return
    }

    const { data, error } = await supabase
        .from('directorates')
        .insert({
            name: 'CEAI'
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating CEAI:", error)
    } else {
        console.log("Created CEAI Directorate:", data)
    }
}

main()
