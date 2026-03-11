'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { updateSheetColumn, SheetConfig } from '@/lib/google-sheets'
import { redirect } from 'next/navigation'
import { FormDefinition } from '@/components/form-engine'
import { checkUserPermission, isAdmin as isAdminCheck, getUserAllowedUnits } from '@/lib/auth-utils'
import { getCachedProfile } from '@/app/dashboard/cached-data'


import { CP_FORM_DEFINITION, CP_SHEET_BLOCKS, CP_SHEET_NAME } from './cp-config'
import { BENEFICIOS_FORM_DEFINITION, BENEFICIOS_SHEET_BLOCKS, BENEFICIOS_SHEET_NAME, BENEFICIOS_SPREADSHEET_ID } from './beneficios-config'
import { CRAS_FORM_DEFINITION, CRAS_SHEET_BLOCKS, CRAS_SPREADSHEET_ID } from './cras-config'
import { CREAS_IDOSO_FORM_DEFINITION, CREAS_IDOSO_SHEET_CONFIG, CREAS_DEFICIENTE_FORM_DEFINITION, CREAS_DEFICIENTE_SHEET_CONFIG } from './creas-config'
import { CEAI_FORM_DEFINITION, CEAI_SHEET_BLOCKS, CEAI_SPREADSHEET_ID } from './ceai-config'
import { POP_RUA_FORM_DEFINITION, POP_RUA_SHEET_BLOCKS, POP_RUA_SPREADSHEET_ID } from './pop-rua-config'
import { NAICA_FORM_DEFINITION, NAICA_SHEET_BLOCKS, NAICA_SPREADSHEET_ID } from './naica-config'
import { PROTETIVO_FORM_DEFINITION, PROTETIVO_SHEET_BLOCKS, PROTETIVO_SPREADSHEET_ID, SOCIOEDUCATIVO_FORM_DEFINITION, SOCIOEDUCATIVO_SHEET_BLOCKS, SOCIOEDUCATIVO_SPREADSHEET_ID } from './protecao-especial-config'
import { SINE_FORM_DEFINITION, SINE_SHEET_NAME } from './sine-config'
import { CASA_DA_MULHER_FORM_DEFINITION, DIVERSIDADE_FORM_DEFINITION } from './casa-da-mulher-config'
import { updateSheetBlocks, validateSheetExists } from '@/lib/google-sheets'
import { uploadFileToDrive, getOrCreateFolder } from '@/lib/google-drive'
import { submissionBaseSchema, visitSchema, oscSchema, dailyReportSchema } from '@/lib/validation'
import { logActivity } from '@/utils/activity-logger'

export async function submitReport(input: Record<string, any> | FormData, month: number, year: number, directorateId: string, setor?: string) {
    let formData: Record<string, any> = {}

    if (input instanceof FormData) {
        for (const [key, value] of input.entries()) {
            formData[key] = value
        }
    } else {
        formData = { ...input }
    }

    // Ensure the sector is saved within the data for progress tracking
    if (setor && !formData._setor) {
        formData._setor = setor
    }
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

            const isFile = (val: any) => val && typeof val === 'object' && (val.constructor?.name === 'File' || (typeof val.arrayBuffer === 'function' && !!val.name));

            // Handle PDF Upload to Google Drive if present
            if (isFile(formData.anexo_rma)) {
                const rmaFile = formData.anexo_rma as File
                console.log(`DEBUG: CRAS RMA Upload detected. File: ${rmaFile.name}, Size: ${rmaFile.size} bytes`);
                const buffer = Buffer.from(await rmaFile.arrayBuffer());

                try {
                    if (buffer.length === 0) {
                        console.warn("DEBUG: Buffer is empty!");
                    }

                    // Root folder from user: Plataforma Vigilância
                    const rootFolderId = "1V-ReKw3wvgg8chtZIIhY_mPYuJMyHQJ9"

                    console.log(`DEBUG: Resolving folder structure for unit: ${formData._unit}`);
                    // 1. Get or Create "Cras" folder
                    const crasFolderId = await getOrCreateFolder("Cras", rootFolderId)

                    // 2. Get or Create unit folder
                    const unitName = formData._unit || 'Geral'
                    const unitFolderId = await getOrCreateFolder(unitName, crasFolderId)

                    console.log(`DEBUG: Target Unit Folder ID: ${unitFolderId}`);

                    // 3. Document Name: RMA + Mês referência (Portuguese)
                    const monthNamesPt = [
                        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                    ]
                    const monthName = monthNamesPt[month - 1]
                    const fileName = `RMA ${monthName} ${year}.pdf`

                    const uploadResult = await uploadFileToDrive(buffer, fileName, rmaFile.type || 'application/pdf', unitFolderId)

                    console.log(`DEBUG: Upload successful. Link: ${uploadResult.webViewLink}`);
                    formData.anexo_rma_link = uploadResult.webViewLink
                    formData.anexo_rma_id = uploadResult.id as string
                } catch (driveError: any) {
                    console.error("DEBUG: Failed to upload RMA to Drive. Falling back to Supabase:", driveError.message || driveError)

                    // FALLBACK: Se o Google Drive der erro (ex: erro de cota 403 de Service Account), salvamos no Supabase
                    try {
                        const filePath = `rmas/${year}/${month}/${formData._unit?.replace(/\s+/g, '_')}_${Date.now()}.pdf`

                        const { data: uploadData, error: supabaseError } = await adminSupabase.storage
                            .from('system-assets')
                            .upload(filePath, buffer, {
                                contentType: 'application/pdf',
                                upsert: true
                            })

                        if (supabaseError) throw supabaseError

                        // Get public URL
                        const { data: { publicUrl } } = adminSupabase.storage
                            .from('system-assets')
                            .getPublicUrl(filePath)

                        console.log(`DEBUG: Fallback to Supabase successful. Link: ${publicUrl}`)
                        formData.anexo_rma_link = publicUrl
                        formData.anexo_rma_id = filePath // save path as ID for reference
                    } catch (fallbackError) {
                        console.error("DEBUG: Both Google Drive and Supabase fallback failed.", fallbackError)
                    }
                } finally {
                    // Always remove the File object (or empty object proxy) before saving to DB
                    delete formData.anexo_rma
                }
            }

            // Cleanup old fields that might be coming from fetchedInitialData
            // and ensure we don't save the File object itself to indicators JSONB
            const crasAllowedFields = CRAS_FORM_DEFINITION.sections.flatMap(s =>
                s.fields.filter(f => f.type !== 'file').map(f => f.id)
            );
            crasAllowedFields.push('mes_anterior', 'admitidas', 'atual', 'anexo_rma_link', 'anexo_rma_id', '_unit', '_subcategory');

            const cleanData: Record<string, any> = {};
            crasAllowedFields.forEach(field => {
                if (formData[field] !== undefined) {
                    cleanData[field] = formData[field];
                }
            });
            formData = cleanData;
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

        // Verificação de Limites de Envio (Apenas para não-Admins)
        const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
        const cachedProfile = await getCachedProfile(user.id)
        const isAdminUserLocal = cachedProfile?.role === 'admin' || isEmailAdmin
        const isOfficialAdmin = isAdmin || isAdminUserLocal

        if (!isOfficialAdmin) {
            // 1. Restrição de Período (Apenas Mês Atual ou Anterior)
            const now = new Date()
            const currentMonth = now.getMonth() + 1
            const currentYear = now.getFullYear()

            // Lógica simplificada de "janela": mes atual ou (mes atual - 1)
            // Tratando virada de ano
            const isCurrentPeriod = (month === currentMonth && year === currentYear)
            const isPreviousPeriod = (year === (currentMonth === 1 ? currentYear - 1 : currentYear) &&
                month === (currentMonth === 1 ? 12 : currentMonth - 1))

            if (!isCurrentPeriod && !isPreviousPeriod) {
                return { error: `Período bloqueado. Você só pode enviar dados do mês atual (${currentMonth}/${currentYear}) ou do mês anterior.` }
            }
        }

        // SINE, CP e outras divisões compartilham a mesma diretoria_id 
        // e por isso devem ser MERGEADOS no mesmo registro (mesma linha)
        // para não violar a restrição de unicidade da diretoria/mês/ano.
        const { data: existing } = await adminSupabase
            .from('submissions')
            .select('id, data, user_id')
            .eq('directorate_id', directorate.id)
            .eq('month', month)
            .eq('year', year)
            .maybeSingle()

        if (existing) {
            // Se já existe e não é admin, vamos verificar se podemos editar (sobrescrever)
            if (!isOfficialAdmin) {
                // Para Relatório Mensal (Narrativo), o bloqueio é total após o primeiro envio
                const isNarrative = existing.data?._report_content !== undefined || !!setor && !!existing.data?.[`_report_content_${setor}`]
                if (isNarrative) {
                    return { error: "Este relatório narrativo já foi enviado e não pode mais ser editado. Entre em contato com um administrador se precisar de correções." }
                }

                // Para Indicadores (Multi-unidade), verificamos se ESTA unidade específica já foi enviada
                if (setor === 'cras' || setor === 'ceai' || setor === 'naica') {
                    const unitName = formData._unit || 'Principal'
                    if (existing.data?.units && existing.data?.units[unitName]) {
                        return { error: `Os dados da unidade ${unitName} para ${month}/${year} já foram enviados anteriormente e estão bloqueados para edição.` }
                    }
                } else if (setor === 'sine' || setor === 'centros' || setor === 'casa_da_mulher' || setor === 'diversidade') {
                    const alreadyHasThisSector = (existing.data?.[`_has_${setor}`]) || (existing.data?._setor === setor)
                    if (alreadyHasThisSector) {
                        return { error: `O relatório do ${setor.toUpperCase().replace(/_/g, ' ')} para ${month}/${year} já foi enviado e está bloqueado.` }
                    }
                } else {
                    return { error: `Já existe um registro para ${month}/${year}. Edições não são permitidas após o envio.` }
                }
            }

            let mergedData;
            const isNarrative = formData._report_content !== undefined
            const isMultiUnit = (setor === 'cras' || setor === 'ceai' || setor === 'naica')
            const isShared = (setor === 'sine' || setor === 'centros' || setor === 'casa_da_mulher' || setor === 'diversidade')

            mergedData = { ...existing.data }

            if (isMultiUnit) {
                const unitName = formData._unit || 'Principal'
                const currentUnits = mergedData.units || {}
                mergedData._is_multi_unit = true
                mergedData.units = {
                    ...currentUnits,
                    [unitName]: {
                        ...currentUnits[unitName],
                        ...formData
                    }
                }
                mergedData._setor = mergedData._setor || setor
                mergedData[`_has_${setor}`] = true
            } else if (isShared) {
                mergedData = {
                    ...mergedData,
                    ...formData,
                    _setor: `merged_${setor.split('_')[0]}`,
                    [`_has_${setor}`]: true
                }
            } else {
                mergedData = { ...mergedData, ...formData, _setor: setor }
            }

            if (isNarrative) {
                (mergedData as any)[`_report_content_${setor}`] = formData._report_content
                if (isMultiUnit) {
                    const unitName = formData._unit || 'Principal'
                    delete (mergedData as any).units[unitName]._report_content
                }
                delete (mergedData as any)._report_content
            }

            const { error: updateError } = await adminSupabase
                .from('submissions')
                .update({ data: mergedData as any, created_at: new Date().toISOString() })
                .eq('id', existing.id)

            if (updateError) {
                console.error("Update Error:", updateError)
                throw new Error("Erro ao atualizar relatório.")
            }
        } else {
            // New Submission
            let finalData: any;
            const isNarrative = formData._report_content !== undefined
            const isMultiUnit = (setor === 'cras' || setor === 'ceai' || setor === 'naica')
            const isShared = (setor === 'sine' || setor === 'centros' || setor === 'casa_da_mulher' || setor === 'diversidade')

            if (isMultiUnit) {
                const unitName = formData._unit || 'Principal'
                finalData = {
                    _is_multi_unit: true,
                    units: {
                        [unitName]: formData
                    },
                    _setor: setor,
                    [`_has_${setor}`]: true
                }
            } else if (isShared) {
                finalData = { ...formData, _setor: setor, [`_has_${setor}`]: true }
            } else {
                finalData = { ...formData, _setor: setor }
            }

            if (isNarrative) {
                finalData[`_report_content_${setor}`] = formData._report_content
                if (isMultiUnit) {
                    const unitName = formData._unit || 'Principal'
                    delete finalData.units[unitName]._report_content
                }
                delete finalData._report_content
            }

            const submissionData = {
                user_id: user.id,
                directorate_id: directorateId,
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

        // 4. Log Activity AND Revalidate (Do this before sheet sync to ensure log appears even if sync fails)
        try {
            // Use adminSupabase to fetch profile to ensure we get the name even if RLS is strict
            const { data: profile } = await adminSupabase.from('profiles').select('full_name').eq('id', user.id).single()
            const unitName = formData._unit || formData._subcategory || ''

            // Format sector name for better readability in the log
            const sectorTag = setor === 'sine' ? 'SINE' : (setor === 'centros' ? 'CP' : '')
            const resourceNameStr = (sectorTag ? `${sectorTag} - ` : '') + `Mês ${month}/${year}` + (unitName ? ` (${unitName})` : '')

            // Log activity
            await logActivity({
                user_id: user.id,
                user_name: profile?.full_name || 'Usuário',
                directorate_id: directorateId,
                directorate_name: directorate.name,
                action_type: existing ? 'UPDATE' : 'CREATE', // Keep original logic for UPDATE/CREATE
                resource_type: 'REPORT',
                resource_name: `Relatório de ${month}/${year}`,
                details: {
                    setor,
                    unit: unitName, // Use unitName from context
                    month,
                    year,
                    drive_file_id: formData.anexo_rma_id || null, // Use actual ID
                    drive_file_link: formData.anexo_rma_link || null // Add link
                }
            })
            revalidatePath('/dashboard', 'layout')
            // @ts-ignore
            revalidateTag('submissions')
            // @ts-ignore
            revalidateTag(`submissions-${directorateId}`)
        } catch (logErr) {
            console.error("Non-critical Log Error:", logErr)
        }

        // 5. Save to Google Sheets (Last step, non-blocking for the log)
        try {
            await syncSubmissionToSheets(formData, month, year, directorate, setor)
        } catch (sheetError: any) {
            console.error("Sheet Error:", sheetError)
            return {
                success: true,
                warning: `O relatório foi salvo e registrado, mas houve um erro ao sincronizar com a planilha Google.`
            }
        }

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
    // Skip sheets sync for narrative reports
    if (formData._report_type === 'monthly_narrative' || formData._report_content !== undefined) {
        return
    }

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
                if (field.type === 'file') return 0
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

    // Special Case: If we are in a merged SINE/CP scenario, ensure BOTH are updated if the data contains them
    // This is useful for updateSubmissionCell
    if (setor === 'centros' && formData._has_sine) {
        await syncSubmissionToSheets(formData, month, year, directorate, 'sine')
    } else if (setor === 'sine' && formData._has_centros) {
        await syncSubmissionToSheets(formData, month, year, directorate, 'centros')
    }
}

export async function updateSubmissionCell(id: string, fieldId: string, value: any, unitName?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const isEmailAdmin = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'].includes(user.email || '')
    const cachedProfile = await getCachedProfile(user.id)
    const isAdminUserLocal = cachedProfile?.role === 'admin' || isEmailAdmin
    const isOfficialAdmin = isAdmin || isAdminUserLocal

    if (!isOfficialAdmin) throw new Error("Apenas administradores podem editar dados históricos.")

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
        else if (dirName.includes('beneficios')) setor = 'beneficios'
        else if (dirName.includes('ceai')) setor = 'ceai'
        else if (dirName.includes('populacao') && dirName.includes('rua')) setor = 'pop_rua'
        else if (dirName.includes('naica')) setor = 'naica'
        else if (dirName.includes('protecao') || dirName.includes('especial')) {
            if (unitDataToSync._subcategory === 'socioeducativo') setor = 'creas_socioeducativo'
            else if (unitDataToSync._subcategory === 'protetivo') setor = 'creas_protetivo'
            else setor = 'creas'
        }

        // SINE and CP check - since they share directorate, we check the field itself
        if (dirName.includes('sine') || dirName.includes('profissional') || dirName.includes('centro') || dirName.includes('qualificacao')) {
            const allSineFields = SINE_FORM_DEFINITION.sections.flatMap((s: any) => s.fields.map((f: any) => f.id))
            const allCPFields = CP_FORM_DEFINITION.sections.flatMap((s: any) => s.fields.map((f: any) => f.id))

            if (allSineFields.includes(fieldId)) setor = 'sine'
            else if (allCPFields.includes(fieldId)) setor = 'centros'
            else {
                if (unitDataToSync._has_sine) setor = 'sine'
                else if (unitDataToSync._has_centros) setor = 'centros'
                else setor = 'centros'
            }
        } else if (dirName.includes('mulher') || dirName.includes('casa da mulher')) {
            const allCMFields = CASA_DA_MULHER_FORM_DEFINITION.sections.flatMap((s: any) => s.fields.map((f: any) => f.id))
            const allDivFields = DIVERSIDADE_FORM_DEFINITION.sections.flatMap((s: any) => s.fields.map((f: any) => f.id))

            if (allCMFields.includes(fieldId)) setor = 'casa_da_mulher'
            else if (allDivFields.includes(fieldId)) setor = 'diversidade'
            else {
                if (unitDataToSync._has_casa_da_mulher) setor = 'casa_da_mulher'
                else if (unitDataToSync._has_diversidade) setor = 'diversidade'
                else setor = 'casa_da_mulher'
            }
        }

        await syncSubmissionToSheets(unitDataToSync, submission.month, submission.year, directorate, setor)
    } catch (sheetError) {
        console.error("Sheet Sync Error in updateSubmissionCell:", sheetError)
    }

    // Log Activity for Edit
    try {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        const { data: directorate } = await adminSupabase.from('directorates').select('name').eq('id', submission.directorate_id).single()

        await logActivity({
            user_id: user.id,
            user_name: profile?.full_name || 'Usuário',
            directorate_id: submission.directorate_id,
            directorate_name: directorate?.name || 'Diretoria',
            action_type: 'UPDATE',
            resource_type: 'REPORT',
            resource_name: `Mês ${submission.month}/${submission.year} (Célula editada pelo Admin)`
        })
    } catch (e) {
        console.error("Log error in updateSubmissionCell:", e)
    }

    revalidatePath('/dashboard/dados', 'page')
    revalidatePath('/dashboard', 'layout')
    return { success: true }
}


export async function submitDailyReport(date: string, directorateId: string, formData: Record<string, any>) {
    try {
        // Validate inputs
        dailyReportSchema.parse({ date, directorateId, data: formData })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        // Permission Check
        const hasAccess = await checkUserPermission(user.id, directorateId)
        if (!hasAccess) throw new Error("Unauthorized access to this directorate")

        const adminSupabase = createAdminClient()

        // Check existing - using maybeSingle to avoid throw on empty results
        const { data: existing, error: fetchError } = await adminSupabase
            .from('daily_reports')
            .select('id, data')
            .eq('date', date)
            .eq('directorate_id', directorateId)
            .maybeSingle()

        if (fetchError) throw new Error("Erro ao consultar relatórios: " + fetchError.message)

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
                    data: formData
                })

            if (error) throw new Error("Erro ao salvar relatório diário: " + error.message)
        }

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        const { data: dir } = await adminSupabase.from('directorates').select('name').eq('id', directorateId).single()

        await logActivity({
            user_id: user.id,
            user_name: profile?.full_name || 'Usuário',
            directorate_id: directorateId,
            directorate_name: dir?.name || 'Diretoria',
            action_type: existing ? 'UPDATE' : 'CREATE',
            resource_type: 'REPORT',
            resource_name: `Relatório Diário - ${date.split('-').reverse().join('/')}`
        })

        revalidatePath('/dashboard', 'page')
        revalidatePath('/dashboard', 'layout')
        return { success: true }
    } catch (error: any) {
        console.error("submitDailyReport Error:", error)
        if (error.name === 'ZodError') {
            return { error: "Dados inválidos: Verifique os campos preenchidos." }
        }
        return { error: error.message || "Erro inesperado ao salvar relatório diário." }
    }
}

export async function deleteReport(reportId: string) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        // Check admin
        const isAdminUser = await isAdminCheck(user.id)

        // Check Admin or Owner
        // We need to fetch the submission first (securely via Admin Client) to check ownership
        const adminSupabase = createAdminClient()
        const { data: submission, error: fetchErr } = await adminSupabase
            .from('submissions')
            .select('user_id')
            .eq('id', reportId)
            .single()

        if (fetchErr || !submission) {
            console.error("Fetch submission error for delete:", fetchErr)
            return { error: "Relatório não encontrado (pode já ter sido excluído)." }
        }

        let canDelete = false

        if (isOfficialAdmin) {
            canDelete = true
        } else if (submission.user_id === user.id) {
            canDelete = true // Owner
        }

        if (!canDelete) {
            return { error: "Apenas administradores ou o autor do relatório podem excluí-lo." }
        }

        const { error } = await adminSupabase.from('submissions').delete().eq('id', reportId)

        if (error) {
            console.error("Delete error from DB:", error)
            return { error: "Erro ao excluir relatório no banco de dados." }
        }

        // Log Activity
        try {
            const { data: profile } = await adminSupabase.from('profiles').select('full_name').eq('id', user.id).single()
            await logActivity({
                user_id: user.id,
                user_name: profile?.full_name || 'Usuário',
                action_type: 'DELETE',
                resource_type: 'REPORT',
                resource_name: `Controle #${reportId.split('-')[0]}`
            })
        } catch (e) {
            console.error("Log error in deleteReport (non-critical):", e)
        }

        revalidatePath('/dashboard', 'page')
        revalidatePath('/dashboard', 'layout')
        revalidatePath('/dashboard/relatorios/lista', 'page')

        return { success: true }
    } catch (err: any) {
        console.error("Critical error in deleteReport action:", err)
        return { error: err.message || "Erro inesperado ao processar exclusão." }
    }
}

export async function deleteMonthData(directorateId: string, month: number, year: number, unitName?: string, setor?: string) {
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
        if (Object.keys(updatedUnits).length === 0) {
            await adminSupabase.from('submissions').delete().eq('id', existing.id)
        } else {
            await adminSupabase.from('submissions')
                .update({ data: { ...existing.data, units: updatedUnits } })
                .eq('id', existing.id)
        }
    } else if (setor && (setor === 'sine' || setor === 'centros' || setor === 'casa_da_mulher' || setor === 'diversidade')) {
        // Shared Directorate context
        const newData = { ...existing.data }

        // Remove sector markers
        delete newData[`_has_${setor}`]
        if (newData._setor === setor) delete newData._setor

        // Remove sector fields
        let formDef: FormDefinition | null = null
        if (setor === 'sine') formDef = SINE_FORM_DEFINITION
        else if (setor === 'centros') formDef = CP_FORM_DEFINITION
        else if (setor === 'casa_da_mulher') formDef = CASA_DA_MULHER_FORM_DEFINITION
        else if (setor === 'diversidade') formDef = DIVERSIDADE_FORM_DEFINITION

        if (formDef) {
            formDef.sections.flatMap((s: any) => s.fields).forEach((f: any) => {
                delete newData[f.id]
            })
        }

        // Check if anything else remains
        const hasOther = newData._has_sine || newData._has_centros || newData._has_casa_da_mulher || newData._has_diversidade ||
            (newData._setor && newData._setor !== setor && newData._setor !== 'merged_sine' && newData._setor !== 'merged_centros' && newData._setor !== 'merged_casa' && newData._setor !== 'merged_sine_cp')

        if (!hasOther) {
            await adminSupabase.from('submissions').delete().eq('id', existing.id)
        } else {
            await adminSupabase.from('submissions').update({ data: newData }).eq('id', existing.id)
        }
    } else {
        // Flat cleanup or no unit/sector specified: Delete the whole record for the month
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
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('settings').upsert({ key, value })

    if (error) {
        console.error("Update setting error:", error)
        return { error: "Erro ao salvar configuração." }
    }


    revalidatePath('/', 'layout')
    // @ts-ignore
    revalidateTag('settings')
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

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        const { data: dir } = await adminSupabase.from('directorates').select('name').eq('id', directorate_id).single()

        await logActivity({
            user_id: user.id,
            user_name: profile?.full_name || 'Usuário',
            directorate_id: directorate_id,
            directorate_name: dir?.name || 'Diretoria',
            action_type: 'DRAFT',
            resource_type: 'VISIT',
            resource_name: `Visita ${visitData.visit_date.split('-').reverse().join('/')}`
        })

        return { success: true, id: newVisit.id }
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const { data: dir } = await adminSupabase.from('directorates').select('name').eq('id', directorate_id).single()

    await logActivity({
        user_id: user.id,
        user_name: profile?.full_name || 'Usuário',
        directorate_id: directorate_id,
        directorate_name: dir?.name || 'Diretoria',
        action_type: 'DRAFT',
        resource_type: 'VISIT',
        resource_name: `Atualização de Visita ${visitData.visit_date.split('-').reverse().join('/')}`
    })

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

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    const { data: visitData } = await adminSupabase.from('visits').select('directorate_id, visit_date').eq('id', id).single()

    if (visitData) {
        const { data: dir } = await adminSupabase.from('directorates').select('name').eq('id', visitData.directorate_id).single()

        await logActivity({
            user_id: user.id,
            user_name: profile?.full_name || 'Usuário',
            directorate_id: visitData.directorate_id,
            directorate_name: dir?.name || 'Diretoria',
            action_type: 'CREATE', // Once finalized, it counts as officially created
            resource_type: 'VISIT',
            resource_name: `Visita ${visitData.visit_date.split('-').reverse().join('/')}`
        })
    }

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function revertVisitToDraft(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin) {
        throw new Error("Apenas administradores podem reverter o status de uma visita.")
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
        .from('visits')
        .update({ 
            status: 'draft', 
            updated_at: new Date().toISOString() 
        })
        .eq('id', id)

    if (error) throw new Error("Erro ao reverter status: " + error.message)

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

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        await logActivity({
            user_id: user.id,
            user_name: profile?.full_name || 'Usuário',
            action_type: 'UPDATE',
            resource_type: 'WORK_PLAN',
            resource_name: planData.title || 'Plano de Trabalho'
        })
    } else {
        // Create
        const { error } = await adminSupabase
            .from('work_plans')
            .insert({
                ...planData,
                user_id: user.id
            })

        if (error) throw new Error("Erro ao criar plano: " + error.message)

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        await logActivity({
            user_id: user.id,
            user_name: profile?.full_name || 'Usuário',
            action_type: 'CREATE',
            resource_type: 'WORK_PLAN',
            resource_name: planData.title || 'Plano de Trabalho'
        })
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

export async function saveParecerConclusivo(visitId: string, data: any, status: 'draft' | 'finalized' = 'draft') {
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
        throw new Error("Você não tem permissão para salvar o parecer conclusivo desta visita.")
    }

    const { error } = await adminSupabase
        .from('visits')
        .update({
            parecer_conclusivo: {
                ...data,
                status: status
            },
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw new Error("Erro ao salvar parecer conclusivo: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function finalizeParecerConclusivo(visitId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    // Fetch current report to check its current status
    const { data: visit } = await adminSupabase
        .from('visits')
        .select('parecer_conclusivo, user_id, directorate_id')
        .eq('id', visitId)
        .single()

    if (!visit) throw new Error("Visita não encontrada")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin && visit.user_id !== user.id) {
        throw new Error("Apenas o autor ou administradores podem finalizar este parecer conclusivo.")
    }

    const updatedData = {
        ...(visit.parecer_conclusivo || {}),
        status: 'finalized'
    }

    const { error } = await adminSupabase
        .from('visits')
        .update({
            parecer_conclusivo: updatedData,
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw new Error("Erro ao finalizar parecer conclusivo: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function saveRelatorioFinal(visitId: string, data: any, status: 'draft' | 'finalized' = 'draft') {
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
        throw new Error("Você não tem permissão para salvar o relatório final desta visita.")
    }

    const { error } = await adminSupabase
        .from('visits')
        .update({
            relatorio_final: {
                ...data,
                status: status
            },
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw new Error("Erro ao salvar relatório final: " + error.message)

    revalidatePath('/dashboard', 'page')
    return { success: true }
}

export async function finalizeRelatorioFinal(visitId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const adminSupabase = createAdminClient()

    // Fetch current report to check its current status
    const { data: visit } = await adminSupabase
        .from('visits')
        .select('relatorio_final, user_id, directorate_id')
        .eq('id', visitId)
        .single()

    if (!visit) throw new Error("Visita não encontrada")

    const isAdmin = await isAdminCheck(user.id)
    if (!isAdmin && visit.user_id !== user.id) {
        throw new Error("Apenas o autor ou administradores podem finalizar este relatório final.")
    }

    const updatedData = {
        ...(visit.relatorio_final || {}),
        status: 'finalized'
    }

    const { error } = await adminSupabase
        .from('visits')
        .update({
            relatorio_final: updatedData,
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw new Error("Erro ao finalizar relatório final: " + error.message)

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

export async function getDailyReports(date: string) {
    try {
        const adminSupabase = createAdminClient()

        const { data: directorates, error: dirError } = await adminSupabase
            .from('directorates')
            .select('id, name')
            .order('name')

        if (dirError) throw dirError

        const { data: reports, error: repError } = await adminSupabase
            .from('daily_reports')
            .select('*, directorate:directorates(name)')
            .eq('date', date)

        if (repError) throw repError

        return {
            success: true,
            data: reports || [],
            directorates: directorates || []
        }
    } catch (error: any) {
        console.error("getDailyReports Error:", error)
        return { error: "Erro ao buscar relatórios diários." }
    }
}

export async function checkSubmissionExists(directorateId: string, month: number, year: number, unit?: string, setor?: string) {
    const adminSupabase = createAdminClient()
    const { data: existing } = await adminSupabase
        .from('submissions')
        .select('id, data')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

    if (!existing) return false

    const isNarrativeCheck = !unit
    const hasSectorFlag = !!(existing.data?.[`_has_${setor}`] || existing.data?._setor === setor)
    const hasNarrativeFlag = !!(setor && existing.data?.[`_report_content_${setor}`])

    // For narrative report editor (no unit specified)
    if (isNarrativeCheck && hasNarrativeFlag) return true

    // Sector-specific logic
    if (setor === 'cras' || setor === 'ceai' || setor === 'naica') {
        if (isNarrativeCheck) return hasNarrativeFlag
        const unitName = unit || 'Principal'
        return !!(existing.data?.units && existing.data?.units[unitName])
    }

    if (setor === 'sine' || setor === 'centros' || setor === 'casa_da_mulher' || setor === 'diversidade') {
        return hasSectorFlag
    }

    // Para outros, a existência do registro já significa que foi enviado (ou se tem o flag do setor)
    return hasSectorFlag || true
}

export async function getMonthlyProgressData(month: number, year: number) {
    const adminSupabase = createAdminClient()

    const { data: submissions, error } = await adminSupabase
        .from('submissions')
        .select('directorate_id, data')
        .eq('month', month)
        .eq('year', year)

    if (error) {
        console.error("Error fetching progress data:", error)
        return []
    }

    return submissions
}
