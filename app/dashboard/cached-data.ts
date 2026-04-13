
import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export const getCachedProfile = async (userId: string) => {
    return await unstable_cache(
        async () => {
            try {
                const supabase = createAdminClient()

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select(`
                        *,
                        profile_directorates (
                            directorates (*)
                        )
                    `)
                    .eq('id', userId)
                    .single()

                if (error || !profile) return null

                // Flatten the structure safely
                const flatDirectorates = (profile.profile_directorates || [])
                    // @ts-ignore
                    .map(pd => pd.directorates)
                    .filter(Boolean)

                return {
                    ...profile,
                    directorates: flatDirectorates
                }
            } catch (error) {
                console.error("Error in getCachedProfile:", error)
                return null
            }
        },
        [`user-profile-${userId}`],
        {
            tags: [`user-profile-${userId}`, 'profiles'],
            revalidate: 5 // Cache for 5 seconds
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
            const { data, error } = await supabase
                .from('directorates')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error(`[getCachedDirectorate] Error fetching ID ${id}:`, error)
            }
            if (!data) {
                console.warn(`[getCachedDirectorate] No data found for ID ${id}`)
            }

            return data || null
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
            revalidate: 1
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

            // If profile role isn't admin, check auth.users metadata or hardcoded list
            // Since we can't easily join auth.users, for hardcoded admins we can just rely on their ID 
            // if we know it, or fetch their email using admin auth API.
            let isEmailAdmin = false
            if (profile?.role !== 'admin') {
                const { data: authData } = await supabase.auth.admin.getUserById(userId)
                isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(authData?.user?.email || '')
            }

            let hasAccess = false
            if (profile?.role === 'admin' || isEmailAdmin) {
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

            // 3. Fetch Specialized Reports
            const { data: sineReports } = await supabase.from('sine_reports').select('*').eq('directorate_id', directorateId);
            const { data: qualifReports } = await supabase.from('qualificacao_reports').select('*').eq('directorate_id', directorateId);
            const { data: crasReports } = await supabase.from('cras_reports').select('*').eq('directorate_id', directorateId);
            const { data: beneficiosReports } = await supabase.from('beneficios_reports').select('*').eq('directorate_id', directorateId);

            // 4. Extract all unique user IDs from all sources to fetch profiles
            const allUserIds = new Set([
                ...(submissions || []).map(s => s.user_id),
                ...(sineReports || []).map(s => s.user_id),
                ...(qualifReports || []).map(s => s.user_id),
                ...(crasReports || []).map(s => s.user_id),
                ...(beneficiosReports || []).map(s => s.user_id)
            ]);
            const uniqueUserIds = Array.from(allUserIds).filter(Boolean);

            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', uniqueUserIds)

            const profileMap = (profiles || []).reduce((acc: any, p) => {
                acc[p.id] = p.full_name
                return acc
            }, {})

            const finalSubmissions = (submissions || []).map(s => ({
                ...s,
                profiles: { full_name: profileMap[s.user_id] || 'Usuário Desconhecido' }
            }))

            // Integrar SINE
            if (sineReports) {
                sineReports.forEach(sine => {
                    const existingIdx = finalSubmissions.findIndex(fs => fs.month === sine.month && fs.year === sine.year);
                    const cleanData = { ...sine };
                    delete (cleanData as any).id;
                    delete (cleanData as any).user_id;

                    if (existingIdx > -1) {
                        finalSubmissions[existingIdx].data = { ...finalSubmissions[existingIdx].data, ...cleanData, _has_sine: true };
                    } else {
                        finalSubmissions.push({
                            id: sine.id,
                            month: sine.month,
                            year: sine.year,
                            directorate_id: directorateId,
                            user_id: sine.user_id,
                            created_at: sine.created_at,
                            data: { ...cleanData, _has_sine: true, _setor: 'sine' },
                            profiles: { full_name: profileMap[sine.user_id] || 'Usuário' }
                        } as any);
                    }
                });
            }

            // Integrar Qualificação
            if (qualifReports) {
                qualifReports.forEach(q => {
                    const existingIdx = finalSubmissions.findIndex(fs => fs.month === q.month && fs.year === q.year);
                    const cleanData = { ...q };
                    delete (cleanData as any).id;
                    delete (cleanData as any).user_id;

                    if (existingIdx > -1) {
                        finalSubmissions[existingIdx].data = { ...finalSubmissions[existingIdx].data, ...cleanData, _has_centros: true };
                    } else {
                        finalSubmissions.push({
                            id: q.id,
                            month: q.month,
                            year: q.year,
                            directorate_id: directorateId,
                            user_id: q.user_id,
                            created_at: q.created_at,
                            data: { ...cleanData, _has_centros: true, _setor: 'centros' },
                            profiles: { full_name: profileMap[q.user_id] || 'Usuário' }
                        } as any);
                    }
                });
            }

            // Integrar CRAS
            if (crasReports) {
                crasReports.forEach(cras => {
                    const existingIdx = finalSubmissions.findIndex(fs => fs.month === cras.month && fs.year === cras.year);
                    const cleanData = { ...cras };
                    delete (cleanData as any).id;
                    delete (cleanData as any).user_id;

                    if (existingIdx > -1) {
                        // CRAS é multi-unidade, então inserimos na estrutura de units
                        const sub = finalSubmissions[existingIdx];
                        if (!sub.data.units) sub.data.units = {};
                        sub.data.units[cras.unit_name] = { ...sub.data.units[cras.unit_name], ...cleanData };
                        sub.data._is_multi_unit = true;
                        sub.data._has_cras = true;
                    } else {
                        finalSubmissions.push({
                            id: cras.id,
                            month: cras.month,
                            year: cras.year,
                            directorate_id: directorateId,
                            user_id: cras.user_id,
                            created_at: cras.created_at,
                            data: { 
                                units: { [cras.unit_name]: cleanData },
                                _is_multi_unit: true,
                                _has_cras: true,
                                _setor: 'cras'
                            },
                            profiles: { full_name: profileMap[cras.user_id] || 'Usuário' }
                        } as any);
                    }
                });
            }

            // Integrar Benefícios
            if (beneficiosReports) {
                beneficiosReports.forEach(benef => {
                    const existingIdx = finalSubmissions.findIndex(fs => fs.month === benef.month && fs.year === benef.year);
                    const cleanData = { ...benef };
                    delete (cleanData as any).id;
                    delete (cleanData as any).user_id;

                    if (existingIdx > -1) {
                        finalSubmissions[existingIdx].data = { ...finalSubmissions[existingIdx].data, ...cleanData, _has_beneficios: true };
                    } else {
                        finalSubmissions.push({
                            id: benef.id,
                            month: benef.month,
                            year: benef.year,
                            directorate_id: directorateId,
                            user_id: benef.user_id,
                            created_at: benef.created_at,
                            data: { ...cleanData, _has_beneficios: true, _setor: 'beneficios' },
                            profiles: { full_name: profileMap[benef.user_id] || 'Usuário' }
                        } as any);
                    }
                });
            }

            return finalSubmissions;
        },
        [`submissions-safe-${directorateId}-${userId}`], // Cache per user+directorate
        {
            tags: ['submissions', `submissions-${directorateId}`, `submissions-user-${userId}`],
            revalidate: 60
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

            // 2. Security Check (Admin OR Owner)
            const { data: authData } = await supabase.auth.admin.getUserById(userId)
            const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(authData?.user?.email || '')

            if (profile?.role === 'admin' || isEmailAdmin) return submission
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
