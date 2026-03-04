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

    // Hardcoded email check (needs auth fetch)
    const { data: authData } = await supabase.auth.admin.getUserById(userId)
    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(authData?.user?.email || '')
    if (isEmailAdmin) return true

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

    if (profile?.role === 'admin') return true

    const { data: authData } = await supabase.auth.admin.getUserById(userId)
    return ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(authData?.user?.email || '')
}

/**
 * Gets the allowed units for a specific user and directorate.
 * Returns null if the user has access to all units (admin, or no unit restriction),
 * or an array of allowed unit names. Returns empty array if no access at all.
 */
export async function getUserAllowedUnits(userId: string, directorateId: string): Promise<string[] | null> {
    const supabase = createAdminClient()

    // 1. Admin check (can access all)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    if (profile?.role === 'admin') return null

    const { data: authData } = await supabase.auth.admin.getUserById(userId)
    if (['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(authData?.user?.email || '')) return null

    // 2. Directorate link check
    const { data: link } = await supabase
        .from('profile_directorates')
        .select('allowed_units')
        .eq('profile_id', userId)
        .eq('directorate_id', directorateId)
        .single()

    if (!link) return [] // No access to this directorate

    // If allowed_units is null, we interpret as "all units for this directorate"
    if (link.allowed_units === null) {
        return null // All units allowed
    }

    // An empty array strictly means "no units allowed".
    return Array.isArray(link.allowed_units) ? link.allowed_units : []
}
