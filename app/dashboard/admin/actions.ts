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
            directorate_id: dirId,
            allowed_units: null // Default: all units when first created
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
    const adminId = user.id

    // 1. Remove permissions/linked directorates
    await supabaseAdmin.from('profile_directorates').delete().eq('profile_id', userId)

    // 2. Reassign ownership of Visits (Instrumentais)
    await supabaseAdmin.from('visits').update({ user_id: adminId }).eq('user_id', userId)

    // 3. Reassign ownership of key entities to the Admin to prevent data loss
    await supabaseAdmin.from('oscs').update({ user_id: adminId }).eq('user_id', userId)
    await supabaseAdmin.from('submissions').update({ user_id: adminId }).eq('user_id', userId)
    await supabaseAdmin.from('daily_reports').update({ user_id: adminId }).eq('user_id', userId)

    // 4. Remove profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // 5. Delete Auth User
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/admin', 'page')
}

export async function updateUserAccess(userId: string, directorates: { id: string, allowed_units: string[] | null }[]) {
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
    if (directorates.length > 0) {
        const assignments = directorates.map(dir => ({
            profile_id: userId,
            directorate_id: dir.id,
            allowed_units: dir.allowed_units
        }))

        const { error: insertError } = await supabaseAdmin
            .from('profile_directorates')
            .insert(assignments)

        if (insertError) throw new Error("Failed to assign new permissions")
    }

    revalidatePath('/dashboard/admin', 'page')
}

export async function updateUserAccount(userId: string, data: { 
    password?: string, 
    role?: string,
    primaryDirectorateId?: string | null,
    directorates?: { id: string, allowed_units: string[] | null }[] 
}) {
    console.log(`[updateUserAccount] Iniciando atualização para o usuário: ${userId}`);
    
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error("[updateUserAccount] Usuário não autenticado");
            throw new Error("Acesso não autorizado: Sessão expirada.");
        }

        const isAdmin = await isAdminCheck(user.id)
        if (!isAdmin) {
            console.error(`[updateUserAccount] Usuário ${user.id} tentou ação de admin sem permissão`);
            throw new Error("Acesso negado: Apenas administradores podem gerenciar usuários.");
        }

        const supabaseAdmin = createAdminClient()

        // 1. Update Password if provided
        if (data.password && data.password.trim().length >= 6) {
            console.log(`[updateUserAccount] Atualizando senha para o usuário: ${userId}`);
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: data.password.trim()
            })
            if (authError) {
                console.error("[updateUserAccount] Erro Auth Supabase:", authError);
                throw new Error("Erro ao atualizar senha: " + authError.message);
            }
        } else if (data.password && data.password.trim().length > 0) {
            throw new Error("A senha deve ter pelo menos 6 caracteres.");
        }

        // 2. Update Role and Primary Directorate in Profiles
        if (data.role || data.primaryDirectorateId !== undefined) {
            const updateData: any = {}
            if (data.role) updateData.role = data.role
            if (data.primaryDirectorateId !== undefined) updateData.directorate_id = data.primaryDirectorateId
            console.log(`[updateUserAccount] Enviando updateData para profiles:`, JSON.stringify(updateData, null, 2));
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update(updateData)
                .eq('id', userId)

            if (profileError) {
                console.error("[updateUserAccount] Erro ao atualizar perfil:", profileError);
                throw new Error(`Falha ao atualizar papel ou diretoria primária: ${profileError.message} (${profileError.code})`);
            }
        }

        // 3. Update Access (Many-to-Many permissions) if provided
        if (data.directorates) {
            console.log(`[updateUserAccount] Atualizando permissões para o usuário: ${userId}`);
            // Remove existing assignments
            const { error: deleteError } = await supabaseAdmin
                .from('profile_directorates')
                .delete()
                .eq('profile_id', userId)

            if (deleteError) {
                console.error("[updateUserAccount] Erro ao deletar permissões:", deleteError);
                throw new Error("Falha ao limpar permissões existentes.");
            }

            // Add new assignments
            if (data.directorates.length > 0) {
                const assignments = data.directorates.map(dir => ({
                    profile_id: userId,
                    directorate_id: dir.id,
                    allowed_units: dir.allowed_units
                }))

                const { error: insertError } = await supabaseAdmin
                    .from('profile_directorates')
                    .insert(assignments)

                if (insertError) {
                    console.error("[updateUserAccount] Erro ao inserir permissões:", insertError);
                    throw new Error("Falha ao atribuir novas permissões.");
                }
            }
        }

        revalidatePath('/dashboard/admin', 'page')
        console.log(`[updateUserAccount] Atualização concluída com sucesso para o usuário: ${userId}`);
        return { success: true };
    } catch (error: any) {
        console.error("[updateUserAccount] Falha crítica:", error.message || error);
        throw new Error(error.message || "Erro inesperado no servidor");
    }
}
