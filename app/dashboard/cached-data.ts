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
        ['all-directorates'],
        {
            tags: ['directorates'],
            revalidate: 86400 // 24 hours
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
        [`directorate-${id}`],
        {
            tags: [`directorate-${id}`, 'directorates'],
            revalidate: 3600
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
                // Convert array to object
                const settings = data.reduce((acc: any, curr: any) => {
                    acc[curr.key] = curr.value
                    return acc
                }, {})
                return settings
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
