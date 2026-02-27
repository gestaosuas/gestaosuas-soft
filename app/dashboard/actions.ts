'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { updateSheetColumn, SheetConfig } from '@/lib/google-sheets'
import { redirect } from 'next/navigation'
import { FormDefinition } from '@/components/form-engine'
import { checkUserPermission, isAdmin as isAdminCheck, getUserAllowedUnits } from '@/lib/auth-utils'


import { CP_FORM_DEFINITION, CP_SHEET_BLOCKS, CP_SHEET_NAME } from './cp-config'
import { BENEFICIOS_FORM_DEFINITION, BENEFICIOS_SHEET_BLOCKS, BENEFICIOS_SHEET_NAME, BENEFICIOS_SPREADSHEET_ID } from './beneficios-config'
import { CRAS_FORM_DEFINITION, CRAS_SHEET_BLOCKS, CRAS_SPREADSHEET_ID } from './cras-config'
import { CREAS_IDOSO_FORM_DEFINITION, CREAS_IDOSO_SHEET_CONFIG, CREAS_DEFICIENTE_FORM_DEFINITION, CREAS_DEFICIENTE_SHEET_CONFIG } from './creas-config'
import { CEAI_FORM_DEFINITION, CEAI_SHEET_BLOCKS, CEAI_SPREADSHEET_ID } from './ceai-config'
import { POP_RUA_FORM_DEFINITION, POP_RUA_SHEET_BLOCKS, POP_RUA_SPREADSHEET_ID } from './pop-rua-config'
import { NAICA_FORM_DEFINITION, NAICA_SHEET_BLOCKS, NAICA_SPREADSHEET_ID } from './naica-config'
import { PROTETIVO_FORM_DEFINITION, PROTETIVO_SHEET_BLOCKS, PROTETIVO_SPREADSHEET_ID, SOCIOEDUCATIVO_FORM_DEFINITION, SOCIOEDUCATIVO_SHEET_BLOCKS, SOCIOEDUCATIVO_SPREADSHEET_ID } from './protecao-especial-config'
import { SINE_FORM_DEFINITION, SINE_SHEET_NAME } from './sine-config'
import { updateSheetBlocks, validateSheetExists } from '@/lib/google-sheets'
import { submissionBaseSchema, visitSchema, oscSchema, dailyReportSchema } from '@/lib/validation'

export async function submitReport(formData: Record<string, any>, month: number, year: number, directorateId: string, setor?: string) {
    // Validate inputs
    submissionBaseSchema.parse({ month, year, directorateId, setor })

    try {
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

        // Check unit permission if a unit is submitted
        const submittedUnit = formData._unit;
        if (submittedUnit) {
            const allowedUnits = await getUserAllowedUnits(user.id, directorateId);
            // If allowedUnits is not null (which means unrestricted), and it doesn't include the unit
            if (allowedUnits && !allowedUnits.includes(submittedUnit)) {
                throw new Error(`Sem permissão para preencher relatórios da unidade: ${submittedUnit}`);
            }
        }

        // Security check: Verify that the 'setor' matches the directorate
        if (setor) {
            const normName = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            const dirName = normName(directorate.name)
            let isAuthorized = false

            if (setor === 'cras' && dirName.includes('cras')) isAuthorized = true
            else if (setor === 'centros' && (dirName.includes('formacao') || dirName.includes('profissional') || dirName.includes('centro'))) isAuthorized = true
            else if (setor === 'sine' && (dirName.includes('sine') || dirName.includes('formacao'))) isAuthorized = true
            else if (setor === 'beneficios' && dirName.includes('beneficios')) isAuthorized = true
            else if (setor === 'ceai' && dirName.includes('ceai')) isAuthorized = true
            else if (setor === 'creas' && dirName.includes('creas')) isAuthorized = true
            else if (setor === 'pop_rua' && dirName.includes('populacao') && dirName.includes('rua')) isAuthorized = true
            else if (setor === 'naica' && dirName.includes('naica')) isAuthorized = true
            else if (setor === 'creas_protetivo' && (dirName.includes('protecao') || dirName.includes('especial'))) isAuthorized = true
            else if (setor === 'creas_socioeducativo' && (dirName.includes('protecao') || dirName.includes('especial'))) isAuthorized = true

            if (!isAdmin && !isAuthorized) {
                throw new Error(`O setor '${setor}' não corresponde à diretoria '${directorate.name}'.`)
            }
        }

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
            if (setor === 'cras' || setor === 'ceai' || setor === 'naica') {
                // Multi-unit handling
                const unitName = formData._unit || 'Principal'
                console.log(`Updating ${setor.toUpperCase()} unit ${unitName} for ${month}/${year}`)

                const currentUnits = existing.data.units || {}
                mergedData = {
                    ...existing.data,
                    _is_multi_unit: true,
                    units: {
                        ...currentUnits,
                        [unitName]: {
                            ...currentUnits[unitName],
                            ...formData
                        }
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
            const finalData = (setor === 'cras' || setor === 'ceai' || setor === 'naica') ? {
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
            await syncSubmissionToSheets(formData, month, year, directorate, setor)
        } catch (sheetError: any) {
            console.error("Sheet Error:", sheetError)
            return { error: `Não foi possível sincronizar com a planilha. O dado foi salvo no banco, mas a planilha pode estar desatualizada.` }
        }

        revalidatePath('/dashboard', 'layout')
        return { success: true }
    } catch (error: any) {
        console.error("Submit Report Error:", error)
        if (error.name === 'ZodError') {
            return { error: "Dados inválidos: Verifique os campos preenchidos." }
        }
        return { error: error.message || "Erro inesperado ao salvar relatório." }
    }
}

async function syncSubmissionToSheets(formData: Record<string, any>, month: number, year: number, directorate: any, setor?: string) {
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
        if (formData._subcategory !== 'condominio') {
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
        }
    } else if (setor === 'pop_rua') {
        const formDef = POP_RUA_FORM_DEFINITION
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
        for (const [sheetName, blocks] of blocksBySheet.entries()) {
            await updateSheetBlocks(
                { spreadsheetId: POP_RUA_SPREADSHEET_ID, sheetName: sheetName },
                month,
                blocks
            )
        }
    } else if (setor === 'naica') {
        const formDef = NAICA_FORM_DEFINITION
        const blocksData = formDef.sections.map((section, index) => {
            const blockConfig = NAICA_SHEET_BLOCKS[index]
            if (!blockConfig) return null
            const values = section.fields.map(field => {
                const val = formData[field.id]
                return val !== undefined && val !== '' ? Number(val) : 0
            })
            return { startRow: blockConfig.startRow, values: values }
        }).filter(b => b !== null) as { startRow: number, values: (string | number)[] }[]
        const unitName = formData._unit || 'Principal'
        await updateSheetBlocks(
            { spreadsheetId: NAICA_SPREADSHEET_ID, sheetName: unitName, baseColumn: 'C' },
            month,
            blocksData
        )
    } else if (setor === 'creas_socioeducativo') {
        const formDef = SOCIOEDUCATIVO_FORM_DEFINITION
        const blocksBySheet = new Map<string, { startRow: number, values: (string | number)[] }[]>()
        formDef.sections.forEach((section, index) => {
            const blockConfig = SOCIOEDUCATIVO_SHEET_BLOCKS[index]
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
        for (const [sheetName, blocks] of blocksBySheet.entries()) {
            await updateSheetBlocks(
                { spreadsheetId: SOCIOEDUCATIVO_SPREADSHEET_ID, sheetName: sheetName, baseColumn: 'C' },
                month,
                blocks
            )
        }
    } else if (setor === 'creas_protetivo') {
        const formDef = PROTETIVO_FORM_DEFINITION
        const blocksBySheet = new Map<string, { startRow: number, values: (string | number)[] }[]>()
        formDef.sections.forEach((section, index) => {
            const blockConfig = PROTETIVO_SHEET_BLOCKS[index]
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
        for (const [sheetName, blocks] of blocksBySheet.entries()) {
            await updateSheetBlocks(
                { spreadsheetId: PROTETIVO_SPREADSHEET_ID, sheetName: sheetName, baseColumn: 'B' },
                month,
                blocks
            )
        }
    } else if (setor === 'sine') {
        const formDef = SINE_FORM_DEFINITION
        const allFields = formDef.sections.flatMap(s => s.fields)
        const orderedValues = allFields.map(field => {
            const val = formData[field.id]
            return val !== undefined && val !== '' ? Number(val) : 0
        })
        if (directorate.sheet_config) {
            await updateSheetColumn(
                { ...directorate.sheet_config as SheetConfig, sheetName: SINE_SHEET_NAME },
                month,
                orderedValues
            )
        }
    } else if (directorate.sheet_config && directorate.form_definition && !formData._report_content) {
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
}

export async function updateSubmissionCell(id: string, fieldId: string, value: any, unitName?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) throw new Error("Apenas administradores podem editar dados históricos.")

    const adminSupabase = createAdminClient()
    const { data: submission } = await adminSupabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single()

    if (!submission) throw new Error("Submission not found")

    let updatedData = { ...submission.data }
    let unitDataToSync = updatedData

    if (unitName && updatedData._is_multi_unit && updatedData.units) {
        updatedData.units[unitName] = {
            ...updatedData.units[unitName],
            [fieldId]: value
        }
        unitDataToSync = updatedData.units[unitName]
    } else {
        updatedData[fieldId] = value
        unitDataToSync = updatedData
    }

    const { error: dbError } = await adminSupabase
        .from('submissions')
        .update({ data: updatedData, created_at: new Date().toISOString() })
        .eq('id', id)

    if (dbError) throw new Error("Erro ao atualizar banco de dados: " + dbError.message)

    // Sync to Sheets
    try {
        const { data: directorate } = await adminSupabase
            .from('directorates')
            .select('*')
            .eq('id', submission.directorate_id)
            .single()

        let setor = ""
        const normName = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const dirName = normName(directorate.name)

        if (dirName.includes('cras')) setor = 'cras'
        else if (dirName.includes('formacao') || dirName.includes('profissional') || dirName.includes('centro')) setor = 'centros'
        else if (dirName.includes('sine')) setor = 'sine'
        else if (dirName.includes('beneficios')) setor = 'beneficios'
        else if (dirName.includes('ceai')) setor = 'ceai'
        else if (dirName.includes('populacao') && dirName.includes('rua')) setor = 'pop_rua'
        else if (dirName.includes('naica')) setor = 'naica'
        else if (dirName.includes('protecao') || dirName.includes('especial')) {
            if (unitDataToSync._subcategory === 'socioeducativo') setor = 'creas_socioeducativo'
            else if (unitDataToSync._subcategory === 'protetivo') setor = 'creas_protetivo'
            else setor = 'creas'
        }

        await syncSubmissionToSheets(unitDataToSync, submission.month, submission.year, directorate, setor)
    } catch (sheetError) {
        console.error("Sheet Sync Error in updateSubmissionCell:", sheetError)
    }

    revalidatePath('/dashboard/dados', 'page')
    return { success: true }
}


export async function submitDailyReport(date: string, directorateId: string, formData: Record<string, any>) {
    // Validate inputs
    dailyReportSchema.parse({ date, directorateId, data: formData })

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

export async function deleteMonthData(directorateId: string, month: number, year: number, unitName?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isAdmin = await isAdminCheck(user.id)
    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    if (!isAdmin && !isEmailAdmin) {
        throw new Error("Apenas administradores podem excluir dados mensais.")
    }

    const adminSupabase = createAdminClient()

    // 1. Fetch the existing submission
    const { data: existing } = await adminSupabase
        .from('submissions')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

    if (!existing) return { success: true }

    if (unitName && existing.data?._is_multi_unit && existing.data?.units) {
        // Multi-unit cleanup: Just remove the specific unit from the JSON
        const updatedUnits = { ...existing.data.units }
        delete updatedUnits[unitName]

        // If no units left, we might as well delete the whole record? 
        // Or just leave an empty units object. Better delete it if it's the last one.
        if (Object.keys(updatedUnits).length === 0) {
            await adminSupabase.from('submissions').delete().eq('id', existing.id)
        } else {
            await adminSupabase.from('submissions')
                .update({ data: { ...existing.data, units: updatedUnits } })
                .eq('id', existing.id)
        }
    } else {
        // Flat cleanup or no unit specified: Delete the whole record for the month
        await adminSupabase.from('submissions').delete().eq('id', existing.id)
    }

    revalidatePath('/dashboard', 'layout')
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
    subsidized_count?: number,
    directorate_id: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Validate inputs
    oscSchema.parse(data)

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

export async function getOSCs(directorateId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado")

    const adminSupabase = createAdminClient()
    let query = adminSupabase
        .from('oscs')
        .select('*')

    if (directorateId) {
        query = query.eq('directorate_id', directorateId)
    } else {
        // If no ID is provided, and user is not admin, maybe they shouldn't see anything or only their linked ones?
        // For now, let's keep it as is but emphasize that directorateId is usually required for isolation.
        // Actually, let's make it so if not admin, it MUST have a directorateId.
        const isAdmin = await isAdminCheck(user.id)
        if (!isAdmin) {
            // Fetch linked directorate for the user if not provided? 
            // Better to just filter by what's passed or return empty if ambiguous.
            if (!directorateId) return []
        }
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) {
        console.error("OSC Fetch Error:", JSON.stringify(error, null, 2))
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
    subsidized_count?: number,
    directorate_id?: string
}) {
    // Validate inputs
    oscSchema.parse(data)

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
    // Validate inputs
    visitSchema.parse(data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado (Sessão expirada?)")

    const { directorate_id } = data
    if (!directorate_id) throw new Error("ID da diretoria é obrigatório")

    const hasAccess = await checkUserPermission(user.id, directorate_id)
    if (!hasAccess) throw new Error("Você não tem permissão para salvar visitas nesta diretoria")

    const adminSupabase = createAdminClient()
    const { id, ...visitData } = data

    if (id) {
        // Update existing draft
        // Security Check: Ensure owner or admin
        const { data: existingVisit } = await adminSupabase
            .from('visits')
            .select('user_id')
            .eq('id', id)
            .single()

        const isAdmin = await isAdminCheck(user.id)
        if (!isAdmin && existingVisit?.user_id !== user.id) {
            throw new Error("Você não tem permissão para alterar este rascunho.")
        }

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
    if (!user) throw new Error("Usuário não autenticado (Sessão expirada?)")

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
            oscs(name)
        `)
        .eq('directorate_id', directorateId)

    // If not admin, only show their own visits
    if (!isAdmin) {
        query = query.eq('user_id', user.id)
    }

    // If default join fails, we fallback or try with explicit relation if schemas are complex
    // Note: If you receive an error here, check if visits.user_id has a foreign key to profiles.id
    const { data, error } = await query.order('visit_date', { ascending: false })

    if (error) {
        console.error("Fetch Visitas Error Details:", JSON.stringify(error, null, 2))
        return []
    }

    const visits = data || []

    // Since direct join to profiles is missing FK in DB, fetch manually
    if (visits.length > 0) {
        const userIds = Array.from(new Set(visits.map((v: any) => v.user_id).filter(Boolean)))
        const { data: profiles } = await adminSupabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds)

        if (profiles) {
            const profileMap = new Map(profiles.map(p => [p.id, p.full_name]))
            return visits.map((v: any) => ({
                ...v,
                profiles: { full_name: profileMap.get(v.user_id) || "Desconhecido" }
            }))
        }
    }

    return visits || []
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

export async function saveOpinionReport(visitId: string, data: any, status: 'draft' | 'finalized' = 'draft') {
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
            parecer_tecnico: {
                ...data,
                status: status
            },
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw new Error("Erro ao salvar parecer: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function finalizeOpinionReport(visitId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    // Fetch current report to check its current status
    const { data: visit } = await adminSupabase
        .from('visits')
        .select('parecer_tecnico, user_id, directorate_id')
        .eq('id', visitId)
        .single()

    if (!visit) throw new Error("Visita não encontrada")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin && visit.user_id !== user.id) {
        throw new Error("Apenas o autor ou administradores podem finalizar este parecer.")
    }

    const updatedData = {
        ...(visit.parecer_tecnico || {}),
        status: 'finalized'
    }

    const { error } = await adminSupabase
        .from('visits')
        .update({
            parecer_tecnico: updatedData,
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw new Error("Erro ao finalizar parecer: " + error.message)

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
