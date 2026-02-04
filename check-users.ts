
import { createAdminClient } from './utils/supabase/admin'

async function checkUsers() {
    try {
        const admin = createAdminClient()
        const { data, error } = await admin.auth.admin.listUsers()

        if (error) {
            console.error("Auth Admin Error:", error.message)
        } else {
            console.log("Total Users in project:", data.users.length)
            console.log("Email list:", data.users.map(u => u.email))
        }
    } catch (e: any) {
        console.error("Crash:", e.message)
    }
}

checkUsers()
