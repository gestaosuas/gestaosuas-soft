'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { updateSheetColumn, SheetConfig } from '@/lib/google-sheets'
import { redirect } from 'next/navigation'
import { FormDefinition } from '@/components/form-engine'
import { checkUserPermission, isAdmin as isAdminCheck } from '@/lib/auth-utils'


import { CP_FORM_DEFINITION, CP_SHEET_BLOCKS, CP_SHEET_NAME } from './cp-config'
import { BENEFICIOS_FORM_DEFINITION, BENEFICIOS_SHEET_BLOCKS, BENEFICIOS_SHEET_NAME, BENEFICIOS_SPREADSHEET_ID } from './beneficios-config'
import { CRAS_FORM_DEFINITION, CRAS_SHEET_BLOCKS, CRAS_SPREADSHEET_ID } from './cras-config'
import { CREAS_IDOSO_FORM_DEFINITION, CREAS_IDOSO_SHEET_CONFIG, CREAS_DEFICIENTE_FORM_DEFINITION, CREAS_DEFICIENTE_SHEET_CONFIG } from './creas-config'
import { CEAI_FORM_DEFINITION, CEAI_SHEET_BLOCKS, CEAI_SPREADSHEET_ID } from './ceai-config'
import { POP_RUA_FORM_DEFINITION, POP_RUA_SHEET_BLOCKS, POP_RUA_SPREADSHEET_ID } from './pop-rua-config'
import { updateSheetBlocks, validateSheetExists } from '@/lib/google-sheets'

export async function submitReport(formData: Record<string, any>, month: number, year: number, directorateId: string, setor?: string) {

    // Force refresh of configuration
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    // Check Admin & Permission
    const isAdmin = await isAdminCheck(user.id)
    const adminSupabase = createAdminClient()

    if (!isAdmin) {
        const hasAccess = await checkUserPermission(user.id, directorateId)
        if (!hasAccess) {
            throw new Error("Directorate not found or unauthorized")
        }
    }

    // Fetch directorate to get config (needed for sheets)
    const { data: directorate } = await adminSupabase.from('directorates').select('*').eq('id', directorateId).single()

    if (!directorate) {
        throw new Error("Directorate not found or unauthorized")
    }

    // Check if already submitted
    // Use Admin Client for Write Operations (Bypassing DB RLS)

    // Pre-processing and Calculations based on Sector
    if (setor === 'cras') {
        const mes_anterior = Number(formData.mes_anterior) || 0
        const admitidas = Number(formData.admitidas) || 0
        formData.atual = mes_anterior + admitidas
    }

    if (setor === 'creas') {
        // CREAS Calculation (Redundant check as client does it, but good for safety)
        // Only calculate if the corresponding fields are present to avoid clearing other subcategory data
        if (formData.fa_mes_anterior !== undefined || formData.fa_admitidas !== undefined) {
            const fa_anterior = Number(formData.fa_mes_anterior) || 0
            const fa_admitidas = Number(formData.fa_admitidas) || 0
            formData.fa_atual = fa_anterior + fa_admitidas
        }

        if (formData.ia_mes_anterior !== undefined || formData.ia_admitidas !== undefined) {
            const ia_anterior = Number(formData.ia_mes_anterior) || 0
            const ia_admitidas = Number(formData.ia_admitidas) || 0
            formData.ia_atual = ia_anterior + ia_admitidas
        }

        if (formData.pcd_mes_anterior !== undefined || formData.pcd_admitidas !== undefined) {
            const pcd_anterior = Number(formData.pcd_mes_anterior) || 0
            const pcd_admitidas = Number(formData.pcd_admitidas) || 0
            formData.pcd_atual = pcd_anterior + pcd_admitidas
        }
    }

    // Check if submitted exist
    const { data: existing } = await adminSupabase
        .from('submissions')
        .select('id, data')
        .eq('directorate_id', directorate.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

    if (existing) {
        let mergedData;
        if (setor === 'cras' || setor === 'ceai') {
            // Multi-unit handling
            const unitName = formData._unit || 'Principal'
            const currentUnits = existing.data.units || {}
            mergedData = {
                ...existing.data,
                _is_multi_unit: true,
                units: {
                    ...currentUnits,
                    [unitName]: formData
                }
            }
        } else {
            mergedData = { ...existing.data, ...formData }
        }

        const { error: updateError } = await adminSupabase
            .from('submissions')
            .update({ data: mergedData, created_at: new Date().toISOString() })
            .eq('id', existing.id)

        if (updateError) {
            console.error("Update Error:", updateError)
            throw new Error("Erro ao atualizar relatório.")
        }
    } else {
        // New Submission
        const finalData = (setor === 'cras' || setor === 'ceai') ? {
            _is_multi_unit: true,
            units: {
                [formData._unit || 'Principal']: formData
            }
        } : formData

        const submissionData = {
            user_id: user.id,
            directorate_id: directorate.id,
            month,
            year,
            data: finalData,
        }

        const { error: dbError } = await adminSupabase.from('submissions').insert(submissionData)

        if (dbError) {
            console.error("DB Error:", dbError)
            return { error: "Erro ao salvar no banco de dados: " + dbError.message }
        }
    }

    // Save to Google Sheets
    try {
        if (setor === 'centros') {
            const formDef = CP_FORM_DEFINITION
            const blocks = CP_SHEET_BLOCKS
            const blocksData = formDef.sections.map((section, index) => {
                const blockConfig = blocks[index]
                if (!blockConfig) return null
                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })
                return { startRow: blockConfig.startRow, values: values }
            }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]

            if (directorate.sheet_config) {
                await updateSheetBlocks(
                    { ...directorate.sheet_config as SheetConfig, sheetName: CP_SHEET_NAME },
                    month,
                    blocksData
                )
            }
        } else if (setor === 'beneficios') {
            const formDef = BENEFICIOS_FORM_DEFINITION
            const blocks = BENEFICIOS_SHEET_BLOCKS
            const blocksData = formDef.sections.map((section, index) => {
                const blockConfig = blocks[index]
                if (!blockConfig) return null
                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })
                return { startRow: blockConfig.startRow, values: values }
            }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]

            if (directorate.sheet_config) {
                await updateSheetBlocks(
                    { ...directorate.sheet_config as SheetConfig, sheetName: 'BENEFICIOS', spreadsheetId: BENEFICIOS_SPREADSHEET_ID },
                    month,
                    blocksData
                )
            }
        } else if (setor === 'cras') {
            const formDef = CRAS_FORM_DEFINITION
            const blocks = CRAS_SHEET_BLOCKS
            const blocksData = formDef.sections.map((section, index) => {
                const blockConfig = blocks[index]
                if (!blockConfig) return null
                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })
                return { startRow: blockConfig.startRow, values: values }
            }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]

            await updateSheetBlocks(
                { spreadsheetId: CRAS_SPREADSHEET_ID, sheetName: formData._unit || 'CRAS' },
                month,
                blocksData
            )
        } else if (setor === 'creas') {
            const subcategory = formData._subcategory || 'idoso'
            if (subcategory === 'idoso') {
                const formDef = CREAS_IDOSO_FORM_DEFINITION
                const cfg = CREAS_IDOSO_SHEET_CONFIG
                const blocksData = formDef.sections.map((section, index) => {
                    const blockConfig = cfg.blocks[index]
                    if (!blockConfig) return null
                    const values = section.fields.map(field => {
                        const val = formData[field.id]
                        return val !== undefined && val !== '' ? Number(val) : 0
                    })
                    return { startRow: blockConfig.startRow, values: values }
                }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]
                await updateSheetBlocks({ spreadsheetId: cfg.spreadsheetId, sheetName: cfg.sheetName }, month, blocksData)
            } else {
                const formDef = CREAS_DEFICIENTE_FORM_DEFINITION
                const cfg = CREAS_DEFICIENTE_SHEET_CONFIG
                const blocksData = formDef.sections.map((section, index) => {
                    const blockConfig = cfg.blocks[index]
                    if (!blockConfig) return null
                    const values = section.fields.map(field => {
                        const val = formData[field.id]
                        return val !== undefined && val !== '' ? Number(val) : 0
                    })
                    return { startRow: blockConfig.startRow, values: values }
                }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]
                await updateSheetBlocks({ spreadsheetId: cfg.spreadsheetId, sheetName: cfg.sheetName }, month, blocksData)
            }
        } else if (setor === 'ceai') {
            const formDef = CEAI_FORM_DEFINITION
            const blocksData = formDef.sections.map((section, index) => {
                const blockConfig = CEAI_SHEET_BLOCKS[index]
                if (!blockConfig) return null
                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })
                return { startRow: blockConfig.startRow, values: values }
            }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]

            await updateSheetBlocks(
                { spreadsheetId: CEAI_SPREADSHEET_ID, sheetName: formData._unit, baseColumn: 'C' },
                month,
                blocksData
            )
        } else if (setor === 'pop_rua') {
            const formDef = POP_RUA_FORM_DEFINITION

            // Group blocks by sheet name because updateSheetBlocks takes one sheet name
            // We have blocks in different sheets
            const blocksBySheet = new Map<string, { startRow: number, values: (string | number)[] }[]>()

            formDef.sections.forEach((section, index) => {
                const blockConfig = POP_RUA_SHEET_BLOCKS[index]
                if (!blockConfig) return

                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })

                if (!blocksBySheet.has(blockConfig.sheetName)) {
                    blocksBySheet.set(blockConfig.sheetName, [])
                }
                blocksBySheet.get(blockConfig.sheetName)!.push({
                    startRow: blockConfig.startRow,
                    values: values
                })
            })

            // Execute updates for each sheet
            for (const [sheetName, blocks] of blocksBySheet.entries()) {
                await updateSheetBlocks(
                    { spreadsheetId: POP_RUA_SPREADSHEET_ID, sheetName: sheetName },
                    month,
                    blocks
                )
            }
        } else if (directorate.sheet_config && directorate.form_definition && !formData._report_content) {
            // DEFAULT LOGIC (SINE/ETC)
            const formDef = directorate.form_definition as FormDefinition
            const allFields = formDef.sections.flatMap(s => s.fields)
            const orderedValues = allFields.map(field => {
                const val = formData[field.id]
                return val !== undefined && val !== '' ? Number(val) : 0
            })
            let sheetConfig = directorate.sheet_config as SheetConfig
            if (sheetConfig.sheetName?.toUpperCase().includes('BENEFICIOS')) {
                sheetConfig = { ...sheetConfig, sheetName: 'BENEFICIOS' }
            }
            await updateSheetColumn(sheetConfig, month, orderedValues)
        }
    } catch (sheetError: any) {
        console.error("Sheet Error:", sheetError)
        return { error: `Erro Google Sheets: ${sheetError.message || sheetError.toString()}` }
    }

    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

export async function submitDailyReport(date: string, directorateId: string, formData: Record<string, any>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Permission Check
    const hasAccess = await checkUserPermission(user.id, directorateId)
    if (!hasAccess) throw new Error("Unauthorized access to this directorate")

    const adminSupabase = createAdminClient()

    // Check existing
    const { data: existing } = await adminSupabase
        .from('daily_reports')
        .select('id, data')
        .eq('date', date)
        .eq('directorate_id', directorateId)
        .single()

    if (existing) {
        const mergedData = { ...existing.data, ...formData }
        const { error } = await adminSupabase
            .from('daily_reports')
            .update({ data: mergedData, updated_at: new Date().toISOString() })
            .eq('id', existing.id)

        if (error) throw new Error("Erro ao atualizar relatório diário: " + error.message)
    } else {
        const { error } = await adminSupabase
            .from('daily_reports')
            .insert({
                date,
                directorate_id: directorateId,
                data: formData,
                user_id: user.id // Assuming we might want to track who did it
            })

        if (error) throw new Error("Erro ao salvar relatório diário: " + error.message)
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function deleteReport(reportId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check admin
    const isAdmin = await isAdminCheck(user.id)

    // Check Admin or Owner
    // We need to fetch the submission first (securely via Admin Client) to check ownership
    const adminSupabase = createAdminClient()
    const { data: submission } = await adminSupabase
        .from('submissions')
        .select('user_id')
        .eq('id', reportId)
        .single()

    let canDelete = false

    if (isAdmin) {
        canDelete = true
    } else if (submission && submission.user_id === user.id) {
        canDelete = true // Owner
    }

    if (!canDelete) {
        return { error: "Apenas administradores ou o autor do relatório podem excluí-lo." }
    }

    const { error } = await adminSupabase.from('submissions').delete().eq('id', reportId)

    if (error) {
        console.error("Delete error:", error)
        return { error: "Erro ao excluir relatório." }
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function updateSystemSetting(key: string, value: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check admin
    const isAdmin = await isAdminCheck(user.id)

    if (!isAdmin) {
        return { error: "Apenas administradores podem alterar configurações." }
    }

    // Upsert
    const { error } = await supabase.from('settings').upsert({ key, value })

    if (error) {
        console.error("Update setting error:", error)
        return { error: "Erro ao salvar configuração." }
    }


    revalidatePath('/', 'layout')
    return { success: true }
}

export async function submitOSC(data: {
    name: string,
    activity_type: string,
    cep: string,
    address: string,
    number: string,
    neighborhood: string,
    phone: string,
    subsidized_count?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // OSCs are shared for now, but we check if user is at least admin or has a directorate link
    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) {
        // Verify user is linked to ANY directorate (authorized technician)
        const { data: links } = await supabase.from('profile_directorates').select('profile_id').eq('profile_id', user.id).limit(1)
        if (!links || links.length === 0) throw new Error("Unauthorized to register OSCs")
    }
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase.from('oscs').insert({
        ...data,
        user_id: user.id
    })

    if (error) {
        console.error("OSC Insert Error:", error)
        return { error: "Erro ao cadastrar OSC: " + error.message }
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function getOSCs() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
        .from('oscs')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("OSC Fetch Error:", error)
        return []
    }

    return data || []
}

export async function updateOSC(id: string, data: {
    name: string,
    activity_type: string,
    cep: string,
    address: string,
    number: string,
    neighborhood: string,
    phone: string,
    subsidized_count?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) {
        return { error: "Apenas administradores podem atualizar OSCs." }
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('oscs')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error("OSC Update Error:", error)
        return { error: "Erro ao atualizar OSC: " + error.message }
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function deleteOSC(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) {
        return { error: "Apenas administradores podem excluir OSCs." }
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('oscs')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("OSC Delete Error:", error)
        return { error: "Erro ao excluir OSC: " + error.message }
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function saveVisit(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { directorate_id } = data
    if (!directorate_id) throw new Error("Directorate ID is required")

    const hasAccess = await checkUserPermission(user.id, directorate_id)
    if (!hasAccess) throw new Error("Unauthorized to save visits for this directorate")

    const adminSupabase = createAdminClient()
    const { id, ...visitData } = data

    if (id) {
        // Update existing draft
        const { error } = await adminSupabase
            .from('visits')
            .update({
                ...visitData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('status', 'draft')

        if (error) throw new Error("Erro ao salvar rascunho: " + error.message)
    } else {
        // Create new visit
        const { data: newVisit, error } = await adminSupabase
            .from('visits')
            .insert({
                ...visitData,
                user_id: user.id,
                status: 'draft'
            })
            .select()
            .single()

        if (error) throw new Error("Erro ao criar visita: " + error.message)
        return { success: true, id: newVisit.id }
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function finalizeVisit(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    // Fetch visit to check ownership
    const { data: visit } = await adminSupabase
        .from('visits')
        .select('user_id, status')
        .eq('id', id)
        .single()

    if (!visit) throw new Error("Visita não encontrada")

    const isAdmin = await isAdminCheck(user.id)
    const isOwner = visit.user_id === user.id

    if (!isAdmin && !isOwner) {
        throw new Error("Você não tem permissão para finalizar esta visita.")
    }

    const { error } = await adminSupabase
        .from('visits')
        .update({ status: 'finalized', updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error("Erro ao finalizar visita: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function getVisits(directorateId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    // Check if user is admin
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    let query = adminSupabase
        .from('visits')
        .select(`
            *,
            oscs (name)
        `)
        .eq('directorate_id', directorateId)

    // If not admin, only show their own visits
    if (!isAdmin) {
        query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.order('visit_date', { ascending: false })

    if (error) {
        console.error("Fetch Visitas Error:", error)
        return []
    }

    return data || []
}

export async function getVisitById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
        .from('visits')
        .select(`
            *,
            oscs (*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error("Fetch Visita Detail Error:", error)
        return null
    }

    return data
}

export async function deleteVisit(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isAdmin = await isAdminCheck(user.id)
    const adminSupabase = createAdminClient()

    let query = adminSupabase
        .from('visits')
        .delete()
        .eq('id', id)

    // Only allow deletion if admin OR (owner AND draft)
    if (!isAdmin) {
        query = query.eq('user_id', user.id).eq('status', 'draft')
    }

    const { error } = await query

    if (error) throw new Error("Erro ao excluir visita: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function getPreviousMonthData(directorateId: string, currentMonth: number, currentYear: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Determine previous month
    let prevMonth = currentMonth - 1
    let prevYear = currentYear

    if (prevMonth === 0) {
        prevMonth = 12
        prevYear = currentYear - 1
    }

    const adminSupabase = createAdminClient()

    // Fetch submission
    const { data: submission } = await adminSupabase
        .from('submissions')
        .select('data')
        .eq('directorate_id', directorateId)
        .eq('month', prevMonth)
        .eq('year', prevYear)
        .maybeSingle()

    return submission?.data || null
}

export async function saveWorkPlan(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()
    const { id, ...planData } = data

    if (id) {
        // Update
        const { error } = await adminSupabase
            .from('work_plans')
            .update({
                ...planData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw new Error("Erro ao atualizar plano: " + error.message)
    } else {
        // Create
        const { error } = await adminSupabase
            .from('work_plans')
            .insert({
                ...planData,
                user_id: user.id
            })

        if (error) throw new Error("Erro ao criar plano: " + error.message)
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function getWorkPlans(oscId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
        .from('work_plans')
        .select('*')
        .eq('osc_id', oscId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Fetch Work Plans Error:", error)
        return []
    }

    return data || []
}

export async function deleteWorkPlan(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
        .from('work_plans')
        .delete()
        .eq('id', id)

    if (error) throw new Error("Erro ao excluir plano: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function getWorkPlansCount(directorateId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    // Fetch all work plans for the directorate
    const { data, error } = await adminSupabase
        .from('work_plans')
        .select('osc_id')
        .eq('directorate_id', directorateId)

    if (error) {
        console.error("Fetch Work Plan Counts Error:", error)
        return {}
    }

    // Group count by osc_id
    const counts: Record<string, number> = {}
    data?.forEach((plan: any) => {
        counts[plan.osc_id] = (counts[plan.osc_id] || 0) + 1
    })

    return counts
}

export async function saveOpinionReport(visitId: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    // Fetch visit to check permissions
    const { data: visit } = await adminSupabase
        .from('visits')
        .select('user_id, directorate_id')
        .eq('id', visitId)
        .single()

    if (!visit) throw new Error("Visita não encontrada")

    const isAdmin = await isAdminCheck(user.id)
    const hasAccess = await checkUserPermission(user.id, visit.directorate_id)

    if (!isAdmin && !hasAccess) {
        throw new Error("Você não tem permissão para salvar o parecer desta visita.")
    }

    const { error } = await adminSupabase
        .from('visits')
        .update({
            parecer_tecnico: data,
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw new Error("Erro ao salvar parecer: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function saveOSCPartnershipDetails(oscId: string, data: { objeto: string, objetivos: string, metas: string, atividades: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) throw new Error("Apenas administradores podem cadastrar descrições do plano de trabalho.")

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('oscs')
        .update(data)
        .eq('id', oscId)

    if (error) throw new Error("Erro ao salvar descrições: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}
