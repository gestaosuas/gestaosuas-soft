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
        if (setor === 'cras') {
            // For CRAS, we store units in a nested 'units' object to avoid unique constraint issues
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
        const finalData = setor === 'cras' ? {
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
            // CP LOGIC
            const formDef = CP_FORM_DEFINITION
            const blocks = CP_SHEET_BLOCKS

            // We need to map the flat form data to the blocked structure
            // The form definition sections map 1:1 to the blocks in order

            const blocksData = formDef.sections.map((section, index) => {
                const blockConfig = blocks[index]
                if (!blockConfig) return null

                // Get values for this section's fields
                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })

                return {
                    startRow: blockConfig.startRow,
                    values: values
                }
            }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]

            if (directorate.sheet_config) {
                // Use the CP Sheet Name, keep the ID from directorate config
                const cpConfig = {
                    ...directorate.sheet_config as SheetConfig,
                    sheetName: CP_SHEET_NAME
                }

                await updateSheetBlocks(
                    cpConfig,
                    month,
                    blocksData
                )
            }

        } else if (setor === 'beneficios') {
            // BENEFICIOS LOGIC
            const formDef = BENEFICIOS_FORM_DEFINITION
            const blocks = BENEFICIOS_SHEET_BLOCKS

            const blocksData = formDef.sections.map((section, index) => {
                const blockConfig = blocks[index]
                if (!blockConfig) return null

                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })

                return {
                    startRow: blockConfig.startRow,
                    values: values
                }
            }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]

            if (directorate.sheet_config) {
                const beneficiosConfig = {
                    ...directorate.sheet_config as SheetConfig,
                    sheetName: 'BENEFICIOS',
                    spreadsheetId: BENEFICIOS_SPREADSHEET_ID
                }

                await updateSheetBlocks(
                    beneficiosConfig,
                    month,
                    blocksData
                )
            }

            // Skip Google Sheets if this is a narrative report (has _report_content)
            // or check which keys are numeric before sending.
        } else if (directorate.sheet_config && directorate.form_definition && !formData._report_content) {
            // SINE / DEFAULT LOGIC
            const formDef = directorate.form_definition as FormDefinition

            // Map the form data to an ordered array based on the fields definition
            const allFields = formDef.sections.flatMap(s => s.fields)

            const orderedValues = allFields.map(field => {
                const val = formData[field.id]
                return val !== undefined && val !== '' ? Number(val) : 0
            })

            // Fix for wrong sheet name in DB
            let sheetConfig = directorate.sheet_config as SheetConfig

            // Aggressive fix: If it looks like Beneficicios, force the correct name
            if (sheetConfig.sheetName && sheetConfig.sheetName.toUpperCase().includes('BENEFICIOS')) {
                sheetConfig = { ...sheetConfig, sheetName: 'BENEFICIOS' }
            }

            await updateSheetColumn(
                sheetConfig,
                month,
                orderedValues
            )
        } else if (setor === 'cras') {
            // CRAS LOGIC
            const formDef = CRAS_FORM_DEFINITION
            const blocks = CRAS_SHEET_BLOCKS

            // Calculation already done at the top of function for DB
            // We just need to prepare blocks Data for Sheets

            const blocksData = formDef.sections.map((section, index) => {
                const blockConfig = blocks[index]
                if (!blockConfig) return null

                const values = section.fields.map(field => {
                    const val = formData[field.id]
                    return val !== undefined && val !== '' ? Number(val) : 0
                })

                return {
                    startRow: blockConfig.startRow,
                    values: values
                }
            }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]

            if (directorate.sheet_config || CRAS_SPREADSHEET_ID) {
                const crasConfig = {
                    ...(directorate.sheet_config || {}) as SheetConfig,
                    sheetName: formData._unit || 'CRAS', // Use the unit name as tab name
                    spreadsheetId: CRAS_SPREADSHEET_ID
                }

                await updateSheetBlocks(
                    crasConfig,
                    month,
                    blocksData
                )
            }
        }

    } catch (sheetError: any) {
        console.error("Sheet Error Full:", JSON.stringify(sheetError, null, 2))

        let debugInfo = "";
        let specificHint = "";

        if (sheetError.message?.includes("not supported for this document")) {
            specificHint = " [Dica: Este erro geralmente ocorre quando o arquivo é um Excel (.xlsx) no Drive. Converta-o para o formato nativo do Google Sheets (Arquivo > Salvar como Planilha Google)]";
        }

        try {
            // Attempt to diagnose based on the setor/config
            let diagId = '';
            let diagSheet = '';

            if (setor === 'beneficios') {
                diagId = BENEFICIOS_SPREADSHEET_ID;
                diagSheet = 'BENEFICIOS';
            } else if (setor === 'cras') {
                diagId = CRAS_SPREADSHEET_ID;
                diagSheet = formData._unit || 'CRAS';
            } else if (directorate.sheet_config) {
                const cfg = directorate.sheet_config as SheetConfig;
                diagId = cfg.spreadsheetId;
                diagSheet = cfg.sheetName;
            }

            if (diagId) {
                const Validation = await validateSheetExists(diagId, diagSheet);
                if (!Validation.exists && Validation.available.length > 0) {
                    debugInfo = ` (Abas disponíveis: ${Validation.available.join(', ')})`;
                }
            }
        } catch (e) {
            console.error("Failed to validate sheets", e)
        }

        return { error: `Erro Google Sheets: ${sheetError.message || sheetError.toString()}${specificHint}${debugInfo}` }
    }

    revalidatePath('/dashboard', 'layout')
    // revalidateTag('submissions')
    // revalidateTag(`submissions-${directorateId}`)
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

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    const adminSupabase = createAdminClient()
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
