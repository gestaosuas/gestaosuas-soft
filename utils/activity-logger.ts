import { createAdminClient } from './supabase/admin'

type ActivityPayload = {
    user_id: string
    user_name: string
    directorate_id?: string
    directorate_name?: string
    action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'DRAFT'
    resource_type: string // e.g. 'REPORT', 'WORK_PLAN', 'VISIT', 'OSC'
    resource_name?: string // e.g. 'Relatório de Março', 'OSC ABC', etc
    details?: any
}

export async function logActivity(payload: ActivityPayload) {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('activity_logs')
            .insert([
                {
                    user_id: payload.user_id,
                    user_name: payload.user_name,
                    directorate_id: payload.directorate_id || null,
                    directorate_name: payload.directorate_name || null,
                    action_type: payload.action_type,
                    resource_type: payload.resource_type,
                    resource_name: payload.resource_name || null,
                    details: payload.details || {}
                }
            ])

        if (error) {
            console.error('[Activity Logger] Error saving log:', error)
        }
    } catch (e) {
        console.error('[Activity Logger] Exception:', e)
    }
}
