
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    try {
        console.log("--- DIRECTORATES ---")
        const { data: dirs, error: err1 } = await supabase.from('directorates').select('id, name')
        if (err1) console.error("Error fetching directorates:", err1)
        else console.log(dirs)

        console.log("\n--- PROFILES ---")
        const { data: profiles, error: err2 } = await supabase.from('profiles').select('id, role, full_name')
        if (err2) console.error("Error fetching profiles:", err2)
        else console.log(profiles)

        console.log("\n--- PROFILE_DIRECTORATES ---")
        const { data: links, error: err3 } = await supabase.from('profile_directorates').select('*')
        if (err3) console.error("Error fetching links:", err3)
        else console.log(links)
    } catch (e) {
        console.error("Execution error:", e)
    }
}

check()
