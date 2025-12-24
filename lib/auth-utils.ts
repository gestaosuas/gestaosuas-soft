import { createAdminClient } from '@/utils/supabase/admin'

/**
 * Checks if a user has access to a specific directorate.
 * Returns true if the user is an admin or is linked to the directorate.
 */
export async function checkUserPermission(userId: string, directorateId: string): Promise<boolean> {
    const supabase = createAdminClient()

    // 1. Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    if (profile?.role === 'admin') return true

    // 2. Check direct link in profile_directorates
    const { data: link } = await supabase
        .from('profile_directorates')
        .select('profile_id')
        .eq('profile_id', userId)
        .eq('directorate_id', directorateId)
        .single()

    return !!link
}

/**
 * Checks if a user has admin role.
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const supabase = createAdminClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    return profile?.role === 'admin'
}
