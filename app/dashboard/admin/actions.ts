'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin as isAdminCheck } from '@/lib/auth-utils'

export async function createUser(formData: FormData) {
    // Check auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Check role
    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) {
        throw new Error("Unauthorized")
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const directorateIds = formData.getAll('directorates') as string[]

    if (!directorateIds || directorateIds.length === 0) {
        redirect('/dashboard/admin?error=At least one directorate is required')
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
            full_name: name
        })

    if (profileError) {
        console.error("Profile error:", profileError)
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
        redirect('/dashboard/admin?error=' + encodeURIComponent(profileError.message))
    }

    // Assign Directorates (Many-to-Many)
    if (directorateIds.length > 0) {
        const assignments = directorateIds.map(dirId => ({
            profile_id: userData.user!.id,
            directorate_id: dirId
        }))

        const { error: assignError } = await supabaseAdmin
            .from('profile_directorates')
            .insert(assignments)

        if (assignError) {
            console.error("Assignment error:", assignError)
            // Optional: Cleanup but maybe just warn?
            // await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
            // redirect('/dashboard/admin?error=User created but failed to assign directorates')
        }
    }



    revalidatePath('/dashboard/admin', 'page')
    redirect('/dashboard/admin?success=User created')
}

export async function deleteUser(userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) throw new Error("Unauthorized")

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/admin', 'page')
}

export async function updateUserAccess(userId: string, directorateIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Acesso não autorizado: Sessão expirada.")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) throw new Error("Acesso negado: Apenas administradores podem gerenciar permissões.")

    const supabaseAdmin = createAdminClient()

    // 1. Ensure Profile exists (role is required, default to 'user' if new)
    // We fetch current role first to not overwrite it if it exists
    const { data: currentProfile } = await supabaseAdmin.from('profiles').select('role, full_name').eq('id', userId).single()

    if (!currentProfile) {
        // If profile missing, we should probably fetch metadata from auth to get the name
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(userId)
        await supabaseAdmin.from('profiles').upsert({
            id: userId,
            role: 'user',
            full_name: authUser?.user_metadata?.full_name || 'Usuário Migrado'
        })
    }

    // 2. Remove existing assignments for this user
    const { error: deleteError } = await supabaseAdmin
        .from('profile_directorates')
        .delete()
        .eq('profile_id', userId)

    if (deleteError) throw new Error("Failed to clear existing permissions")

    // 2. Add new assignments
    if (directorateIds.length > 0) {
        const assignments = directorateIds.map(dirId => ({
            profile_id: userId,
            directorate_id: dirId
        }))

        const { error: insertError } = await supabaseAdmin
            .from('profile_directorates')
            .insert(assignments)

        if (insertError) throw new Error("Failed to assign new permissions")
    }

    revalidatePath('/dashboard/admin', 'page')
}
