'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { updateSheetColumn, SheetConfig } from '@/lib/google-sheets'
import { redirect } from 'next/navigation'
import { FormDefinition } from '@/components/form-engine'


import { CP_FORM_DEFINITION, CP_SHEET_BLOCKS, CP_SHEET_NAME } from './cp-config'
import { BENEFICIOS_FORM_DEFINITION, BENEFICIOS_SHEET_BLOCKS, BENEFICIOS_SHEET_NAME, BENEFICIOS_SPREADSHEET_ID } from './beneficios-config'
import { updateSheetBlocks, validateSheetExists } from '@/lib/google-sheets'

export async function submitReport(formData: Record<string, any>, month: number, year: number, directorateId: string, setor?: string) {

    // Force refresh of configuration
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    // Get User Profile & Permission Check
    const { data: profile } = await supabase.from('profiles').select(`
        *,
        profile_directorates (
            directorates (*)
        )
    `).eq('id', user.id).single()

    // @ts-ignore
    const userDirectorates = profile?.profile_directorates?.map(pd => pd.directorates) || []

    // Check Admin
    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    let directorate = null

    if (isAdmin) {
        // Fetch requested directorate directly if admin
        const { data: d } = await supabase.from('directorates').select('*').eq('id', directorateId).single()
        directorate = d
    } else {
        // Verify link
        directorate = userDirectorates.find((d: any) => d.id === directorateId)
    }

    if (!directorate) {
        throw new Error("Directorate not found or unauthorized")
    }

    // Check if already submitted
    const { data: existing } = await supabase
        .from('submissions')
        .select('id, data')
        .eq('directorate_id', directorate.id)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (existing) {
        // MERGE DATA: Keep existing data and overwrite with new formData keys
        const mergedData = { ...existing.data, ...formData }

        const { error: updateError } = await supabase
            .from('submissions')
            .update({ data: mergedData, created_at: new Date().toISOString() })
            .eq('id', existing.id)

        if (updateError) throw new Error("Erro ao atualizar relatório.")
    } else {
        // Save to Supabase (New)
        const submissionData = {
            user_id: user.id,
            directorate_id: directorate.id,
            month,
            year,
            data: formData,
        }

        const { error: dbError } = await supabase.from('submissions').insert(submissionData)

        if (dbError) {
            console.error("DB Error:", dbError)
            return { error: "Erro ao salvar no banco de dados." }
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
        }

    } catch (sheetError: any) {
        console.error("Sheet Error Full:", JSON.stringify(sheetError, null, 2))

        let debugInfo = "";
        try {
            const Validation = await validateSheetExists('1Jbv5i3PBKXU4nDbqCH1RhqW5Cj1QH4uRlibM577PoDo', 'BENEFICIOS');
            debugInfo = ` (Abas disponíveis: ${Validation.available.join(', ')})`;
        } catch (e) {
            console.error("Failed to validate sheets", e)
        }

        return { error: `Erro Google Sheets: ${sheetError.message || sheetError.toString()}${debugInfo}` }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteReport(reportId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    // Explicit email whitelist for safety
    const adminEmails = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br']
    const isEmailAdmin = adminEmails.includes(user.email || '')
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    if (!isAdmin) {
        return { error: "Apenas administradores podem excluir relatórios." }
    }

    const { error } = await supabase.from('submissions').delete().eq('id', reportId)

    if (error) {
        console.error("Delete error:", error)
        return { error: "Erro ao excluir relatório." }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateSystemSetting(key: string, value: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const isAdmin = profile?.role === 'admin' || isEmailAdmin

    if (!isAdmin) {
        return { error: "Apenas administradores podem alterar configurações." }
    }

    // Upsert
    const { error } = await supabase.from('settings').upsert({ key, value })

    if (error) {
        console.error("Update setting error:", error)
        return { error: "Erro ao salvar configuração." }
    }


    revalidatePath('/dashboard', 'layout')
    return { success: true }
}
