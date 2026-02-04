
import { createAdminClient } from './utils/supabase/admin'

async function test() {
    try {
        console.log("Testing Supabase connection...")
        console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        const admin = createAdminClient()
        const { data, error } = await admin.from('directorates').select('name').limit(1)

        if (error) {
            console.error("Connection Error:", error.message)
        } else {
            console.log("Connection Success! Found directorate:", data)
        }
    } catch (e) {
        console.error("Test failed catastrophically:", e)
    }
}

test()
