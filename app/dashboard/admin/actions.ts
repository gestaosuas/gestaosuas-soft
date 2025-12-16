'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createUser(formData: FormData) {
    // Check auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
        throw new Error("Unauthorized")
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const directorateId = formData.get('directorate') as string

    if (!directorateId || directorateId === 'none') {
        return { error: 'Directorate is required' }
    }

    const supabaseAdmin = createAdminClient()

    // Create Auth User
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
    })

    if (authError) {
        console.error("Auth error:", authError)
        // Return error to UI (need client component or useFormState for proper error handling, but simplified here)
        // We will throw for now or just log.
        redirect('/dashboard/admin?error=' + encodeURIComponent(authError.message))
    }

    if (!userData.user) {
        redirect('/dashboard/admin?error=Failed to create user')
    }

    // Create Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: userData.user.id,
            role: 'user',
            directorate_id: directorateId || null,
            full_name: name
        })

    if (profileError) {
        console.error("Profile error:", profileError)
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
        redirect('/dashboard/admin?error=' + encodeURIComponent(profileError.message))
    }

    revalidatePath('/dashboard/admin')
    redirect('/dashboard/admin?success=User created')
}
