import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export const getCachedProfile = async (userId: string) => {
    return await unstable_cache(
        async () => {
            const supabase = createAdminClient()
            const { data: profile } = await supabase
                .from('profiles')
                .select('*, directorates(*)')
                .eq('id', userId)
                .single()
            return profile
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
