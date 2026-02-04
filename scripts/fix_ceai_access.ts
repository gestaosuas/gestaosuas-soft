import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log("Checking CEAI Configuration...")

    // 1. Get CEAI ID
    const { data: ceai, error: ceaiError } = await supabase
        .from('directorates')
        .select('id, name')
        .eq('name', 'CEAI')
        .single()

    if (ceaiError || !ceai) {
        console.error("CEAI not found!", ceaiError)
        return
    }
    console.log("Found CEAI:", ceai)

    // 2. Find User
    const email = 'klismanrds@gmail.com'
    // We can't query auth.users directly easily without specific setup, 
    // but we can query public.profiles using the service key

    const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email) // Assuming email is synced to profile, or use another way if not.
        // Actually typically profile ID is user ID. Let's try to find by similarity or if email column exists.
        // Checking schema via select * first.
        .single()

    // If we can't find by email column in profiles, we assume he is the one logged in or we list all.
    // Let's list all profiles to find him.
    const { data: profiles } = await supabase.from('profiles').select('*')
    const userProfile = profiles?.find(p => p.full_name?.toLowerCase().includes('klisman') || p.email === email)

    if (!userProfile) {
        console.error("User profile not found for Klisman.")
        return
    }

    console.log("Found User:", userProfile.full_name, userProfile.id, "Role:", userProfile.role)

    // 3. Ensure Admin Role
    if (userProfile.role !== 'admin') {
        console.log("Upgrading user to admin...")
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userProfile.id)

        if (updateError) console.error("Error updating role:", updateError)
        else console.log("User upgraded to admin.")
    }

    // 4. Force Link to CEAI just in case
    const { data: existingLink } = await supabase
        .from('profile_directorates')
        .select('*')
        .eq('profile_id', userProfile.id)
        .eq('directorate_id', ceai.id)
        .single()

    if (!existingLink) {
        console.log("Linking user to CEAI...")
        const { error: linkError } = await supabase
            .from('profile_directorates')
            .insert({
                profile_id: userProfile.id,
                directorate_id: ceai.id
            })

        if (linkError) console.error("Link error:", linkError)
        else console.log("User linked to CEAI.")
    } else {
        console.log("User already linked to CEAI.")
    }
}

main()
