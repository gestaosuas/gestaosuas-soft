
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export const getCachedProfile = async (userId: string) => {
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()

            // Fetch profile and joined directorates via the junction table
            // Note: We try both the old 'directorates' relation (if it exists) and new 'profile_directorates'
            // But since likely we dropped the FK or just ignore it, let's focus on the new table.
            // Query: profile -> profile_directorates -> directorates
            const { data: profile } = await supabase
                .from('profiles')
                .select(`
                    *,
                    profile_directorates (
                        directorates (*)
                    )
                `)
                .eq('id', userId)
                .single()

            if (!profile) return null

            // Flatten the structure: profile.directorates = [dir1, dir2]
            // Accessing the nested data safely
            const rawDirectorates = profile.profile_directorates || []
            // @ts-ignore
            const flatDirectorates = rawDirectorates.map(pd => pd.directorates).filter(Boolean)

            return {
                ...profile,
                directorates: flatDirectorates
            }
        },
        [`user-profile-${userId}`],
        {
            tags: [`user-profile-${userId}`, 'profiles'],
            revalidate: 3600 // Cache for 1 hour
        }
    )()
}

export const getCachedDirectorates = async () => {
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()
            const { data } = await supabase
                .from('directorates')
                .select('*')
                .order('name')
            return data
        },
        ['all-directorates-v4'],
        {
            tags: ['directorates'],
            revalidate: 1
        }
    )()
}

export const getCachedDirectorate = async (id: string) => {
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()
            const { data } = await supabase
                .from('directorates')
                .select('*')
                .eq('id', id)
                .single()
            return data
        },
        [`directorate-v4-${id}`],
        {
            tags: [`directorate-${id}`, 'directorates'],
            revalidate: 1
        }
    )()
}

export const getSystemSettings = async () => {
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()
            try {
                const { data, error } = await supabase.from('settings').select('*')
                if (error) throw error
                const defaultSettings = {
                    logo_url: '',
                    system_name: 'Sistema Vigilância Socioassistencial 2026'
                }

                // Convert array to object
                const settings = data.reduce((acc: any, curr: any) => {
                    acc[curr.key] = curr.value
                    return acc
                }, {})

                return { ...defaultSettings, ...settings }
            } catch (e) {
                console.warn("Settings table not found or empty, using defaults.", e)
                return {
                    logo_url: '',
                    system_name: 'Sistema Vigilância Socioassistencial 2026'
                }
            }
        },
        ['system-settings'],
        {
            tags: ['settings'],
            revalidate: 3600
        }
    )()
}

export const getCachedSubmissionsForUser = async (userId: string, directorateId: string) => {
    // This cache key includes userId to ensure it's specific, but we check permission internally
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()

            // 1. Verify Permission: Does user have access to this directorate?
            // (We check Admin role OR Link)
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

            let hasAccess = false
            if (profile?.role === 'admin') {
                hasAccess = true
            } else {
                // Check direct link (Correct column is profile_id)
                const { data: link } = await supabase
                    .from('profile_directorates')
                    .select('profile_id')
                    .eq('profile_id', userId)
                    .eq('directorate_id', directorateId)
                    .single()

                if (link) hasAccess = true
            }

            if (!hasAccess) return [] // Return empty if no access

            // 2. Fetch Submissions (Bypassing RLS)
            const { data: submissions } = await supabase
                .from('submissions')
                .select('*')
                .eq('directorate_id', directorateId)
                .order('year', { ascending: false })
                .order('month', { ascending: false })

            return submissions || []
        },
        [`submissions-safe-${directorateId}-${userId}`], // Cache per user+directorate
        {
            tags: ['submissions', `submissions-${directorateId}`],
            revalidate: 60 // 1 minute is fine for listings
        }
    )()
}

export const getCachedSubmission = async (id: string, userId: string) => {
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()

            // 1. Fetch the submission first to know which directorate it belongs to
            const { data: submission } = await supabase
                .from('submissions')
                .select('*, directorates(*)')
                .eq('id', id)
                .single()

            if (!submission) return null

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

            // 2. Security Check
            if (profile?.role === 'admin') return submission
            if (userId === submission.user_id) return submission // Owner access

            // Check Directorate Link
            const { data: link } = await supabase
                .from('profile_directorates')
                .select('profile_id')
                .eq('profile_id', userId)
                .eq('directorate_id', submission.directorate_id)
                .single()

            if (link) return submission

            return null // No access
        },
        [`submission-view-${id}-${userId}`],
        {
            tags: [`submission-${id}`],
            revalidate: 60
        }
    )()
}

export const getCachedIndicators = async (userId: string, directorateId: string, month: number, year: number) => {
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()

            // 1. Permission Check
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
            let hasAccess = false
            if (profile?.role === 'admin') hasAccess = true
            else {
                const { data: link } = await supabase
                    .from('profile_directorates')
                    .select('profile_id')
                    .eq('profile_id', userId)
                    .eq('directorate_id', directorateId)
                    .single()
                if (link) hasAccess = true
            }

            if (!hasAccess) return null

            // 2. Fetch Indicator Submission (Not Narrative)
            // We assume indicators don't have _report_content
            const { data: submissions } = await supabase
                .from('submissions')
                .select('*')
                .eq('directorate_id', directorateId)
                .eq('month', month)
                .eq('year', year)

            if (!submissions || submissions.length === 0) return null

            // Find the one that doesn't look like a narrative
            // Narrative has _report_content array
            const indicatorSub = submissions.find(s => !s.data?._report_content)

            return indicatorSub || null
        },
        [`indicators-${directorateId}-${month}-${year}-${userId}`],
        {
            tags: [`submissions-${directorateId}`],
            revalidate: 60
        }
    )()
}
