
'use server'

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { revalidatePath, revalidateTag } from "next/cache"
import { logActivity } from "@/utils/activity-logger"

export async function saveMonthlyNarrative(formData: {
    directorate_id: string;
    month: number;
    year: number;
    setor: string;
    content: any;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Não autorizado." }
    }

    const adminSupabase = createAdminClient()

    try {
        // Find existing record to update OR insert new one
        const { data: existing } = await adminSupabase
            .from('monthly_reports')
            .select('id, user_id')
            .eq('directorate_id', formData.directorate_id)
            .eq('month', formData.month)
            .eq('year', formData.year)
            .eq('setor', formData.setor)
            .maybeSingle()

        if (existing) {
            // Update
            const { error: updateError } = await adminSupabase
                .from('monthly_reports')
                .update({
                    content: formData.content,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)

            if (updateError) throw updateError
        } else {
            // Insert
            const { error: insertError } = await adminSupabase
                .from('monthly_reports')
                .insert({
                    user_id: user.id,
                    directorate_id: formData.directorate_id,
                    month: formData.month,
                    year: formData.year,
                    setor: formData.setor,
                    content: formData.content
                })

            if (insertError) throw insertError
        }

        // Log the activity using the main log system
        try {
            const { data: directorate } = await adminSupabase.from('directorates').select('name').eq('id', formData.directorate_id).single()
            const { data: profile } = await adminSupabase.from('profiles').select('full_name').eq('id', user.id).single()
            
            await logActivity({
                user_id: user.id,
                user_name: profile?.full_name || 'Usuário',
                directorate_id: formData.directorate_id,
                directorate_name: directorate?.name || 'Diretoria',
                action_type: existing ? 'UPDATE' : 'CREATE',
                resource_type: 'MONTHLY_NARRATIVE',
                resource_name: `Relatório Mensal - ${formData.setor.toUpperCase()} - ${formData.month}/${formData.year}`,
                details: { setor: formData.setor, month: formData.month, year: formData.year }
            })
        } catch (logErr) {
            console.error("Non-critical logging error:", logErr)
        }

        revalidatePath('/dashboard', 'layout')
        
        return { success: true }
    } catch (error: any) {
        console.error("Save Monthly Narrative Error:", error)
        return { error: error.message || "Falha ao salvar o relatório narrativo." }
    }
}

export async function getMonthlyNarrative(directorateId: string, sector: string, month: number, year: number) {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('setor', sector)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

    if (error) {
        console.error("Fetch Monthly Narrative Error:", error)
        return null
    }

    return data
}

export async function listMonthlyNarratives(directorateId: string, sector: string) {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('setor', sector)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

    if (error) {
        console.error("List Monthly Narratives Error:", error)
        return []
    }

    return data
}

export async function getMonthlyNarrativeById(id: string) {
    const supabase = createAdminClient()
    
    // Fetch the report first
    const { data: report, error: reportError } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('id', id)
        .maybeSingle()

    if (reportError) {
        console.error("Get Monthly Narrative (General Error):", reportError)
        return null
    }

    if (!report) {
        console.warn(`No report found with ID: ${id}`)
        return null
    }

    // Fetch related profile if present
    if (report.user_id) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', report.user_id).single()
        if (profile) report.profiles = profile
    }

    // Fetch related directorate if present
    if (report.directorate_id) {
        const { data: directorate } = await supabase.from('directorates').select('name').eq('id', report.directorate_id).single()
        if (directorate) report.directorates = directorate
    }

    return report
}

export async function deleteMonthlyNarrative(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Não autorizado." }

    const adminSupabase = createAdminClient()
    
    // Safety check: is the user REALLY an admin?
    const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        return { error: "Apenas administradores podem excluir relatórios." }
    }

    try {
        // Log before deleting
        const report = await getMonthlyNarrativeById(id)
        if (report) {
            await logActivity({
                user_id: user.id,
                user_name: 'Administrador',
                directorate_id: report.directorate_id,
                directorate_name: 'Vigilância',
                action_type: 'DELETE',
                resource_type: 'MONTHLY_NARRATIVE',
                resource_name: `EXCLUSÃO: Relatório Mensal #${id}`,
                details: { report_id: id }
            })
        }

        const { error } = await adminSupabase
            .from('monthly_reports')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/dashboard/relatorios/lista', 'page')
        return { success: true }
    } catch (error: any) {
        console.error("Delete Monthly Narrative Error:", error)
        return { error: "Falha ao excluir o relatório." }
    }
}

export async function getDirectorateSimple(id: string) {
    const supabase = createAdminClient()
    const { data } = await supabase.from('directorates').select('*').eq('id', id).single()
    return data
}

export async function getUserRole() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const adminSupabase = createAdminClient()
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return { role: profile?.role || null, email: user.email }
}
