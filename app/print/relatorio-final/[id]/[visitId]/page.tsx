import { createClient } from '@/utils/supabase/server'
import { getVisitById } from '@/app/dashboard/actions'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ id: string; visitId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { visitId } = await params
    try {
        const visit = await getVisitById(visitId)
        const osc = visit?.relatorio_final?.osc_name
            || (Array.isArray(visit?.oscs) ? visit?.oscs[0]?.name : visit?.oscs?.name)
            || 'Relatório'
        return { title: `Relatório Técnico – ${osc}` }
    } catch {
        return { title: 'Relatório Técnico' }
    }
}

export default async function RelatorioFinalPrintPage({ params }: Props) {
    const { visitId } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const visit = await getVisitById(visitId)
    if (!visit) return notFound()

    const report = visit.relatorio_final || {}
    const osc_name = report.osc_name || (Array.isArray(visit.oscs) ? visit.oscs[0]?.name : visit.oscs?.name) || '---'

    const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'logo_url')
        .single()
    const logoUrl = settings?.value || null

    const v = (val: string | undefined | null) => (val && val.trim()) ? val : '---'

    const printStyles = `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            background: #e5e7eb;
        }

        .print-page {
            width: 21cm;
            min-height: 29.7cm;
            margin: 1cm auto;
            padding: 2cm 2cm 2.5cm 2cm;
            background: #fff;
            box-shadow: 0 4px 30px rgba(0,0,0,0.15);
        }

        .doc-header {
            text-align: center;
            padding-bottom: 1cm;
            border-bottom: 2px solid #000;
            margin-bottom: 0.7cm;
        }

        .doc-header img {
            max-height: 65px;
            object-fit: contain;
            margin-bottom: 0.4cm;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        .doc-title {
            font-size: 15pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            line-height: 1.3;
            margin-bottom: 0.15cm;
        }

        .doc-subtitle {
            font-size: 8.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #444;
        }

        .section {
            margin-bottom: 0.65cm;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 0.25cm;
            margin-bottom: 0.35cm;
        }

        .section-bar {
            width: 4px;
            height: 16px;
            background: #000;
            flex-shrink: 0;
        }

        .section-title h2 {
            font-size: 9.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.35cm 0.5cm;
        }

        .col-2 { grid-column: span 2; }

        .field-group {
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.2cm;
        }

        .field-label {
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #666;
            margin-bottom: 0.08cm;
        }

        .field-value {
            font-size: 10pt;
            font-weight: 700;
        }

        .text-block {
            font-size: 10.5pt;
            line-height: 1.7;
            text-align: justify;
            white-space: pre-wrap;
            padding-left: 0.3cm;
            border-left: 2px solid #ddd;
        }

        .text-label {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #333;
            margin-bottom: 0.15cm;
            margin-top: 0.25cm;
        }

        .text-item {
            margin-bottom: 0.35cm;
        }

        .local-data {
            text-align: right;
            font-size: 10pt;
            font-weight: 700;
            margin-top: 0.5cm;
            margin-bottom: 0.4cm;
        }

        .signatures-block {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.7cm;
            margin-top: 0.4cm;
        }

        .signature-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .signature-image-area {
            width: 100%;
            min-height: 75px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            border-bottom: 1.5px solid #000;
            padding-bottom: 3px;
            margin-bottom: 0.15cm;
        }

        .signature-image-area img {
            max-height: 70px;
            max-width: 90%;
            object-fit: contain;
        }

        .no-sig {
            font-size: 7pt;
            color: #bbb;
            font-style: italic;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding-bottom: 5px;
        }

        .signature-name {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
            letter-spacing: 0.04em;
            margin-bottom: 0.04cm;
        }

        .signature-role {
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
            color: #555;
            letter-spacing: 0.05em;
        }

        .homologacao-section {
            margin-top: 0.8cm;
            padding-top: 0.7cm;
            border-top: 3px double #666;
        }

        .homologacao-title {
            text-align: center;
            font-size: 10.5pt;
            font-weight: 700;
            text-transform: uppercase;
            text-decoration: underline;
            text-underline-offset: 3px;
            margin-bottom: 0.4cm;
        }

        .homologacao-text {
            font-size: 10pt;
            text-align: center;
            font-style: italic;
            line-height: 1.7;
            white-space: pre-wrap;
            margin-bottom: 0.4cm;
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 2cm 2cm 2.5cm 2cm;
            }

            body {
                background: #fff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .print-page {
                width: 100%;
                min-height: auto;
                margin: 0;
                padding: 0;
                box-shadow: none;
            }

            .section { break-inside: avoid; page-break-inside: avoid; }
            .section-title { break-after: avoid; page-break-after: avoid; }
            .signatures-block { break-inside: avoid; page-break-inside: avoid; }
            .signature-item { break-inside: avoid; page-break-inside: avoid; }
            .homologacao-section { break-inside: avoid; page-break-inside: avoid; }
            .doc-header { break-inside: avoid; page-break-inside: avoid; }
            .text-item { break-inside: avoid; page-break-inside: avoid; }
            .field-group { break-inside: avoid; page-break-inside: avoid; }
            .data-grid { break-inside: avoid; page-break-inside: avoid; }
        }
    `

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: printStyles }} />

            <div className="print-page">
                {/* CABEÇALHO */}
                <div className="doc-header">
                    {logoUrl && <img src={logoUrl} alt="Logo do Sistema" />}
                    <div className="doc-title">Relatório Técnico de Monitoramento e Avaliação</div>
                    <div className="doc-subtitle">Exercício de 2026</div>
                </div>

                {/* 1. DADOS DA PARCERIA */}
                <div className="section">
                    <div className="section-title">
                        <div className="section-bar" />
                        <h2>1. Dados da Parceria</h2>
                    </div>
                    <div className="data-grid">
                        <div className="field-group col-2">
                            <div className="field-label">OSC Parceira</div>
                            <div className="field-value">{v(osc_name)}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label">CNPJ</div>
                            <div className="field-value">{v(report.cnpj)}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label">Recurso</div>
                            <div className="field-value">{v(report.emenda)}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label">Nº Termo</div>
                            <div className="field-value">{v(report.termo_fomento)}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label">Vigência</div>
                            <div className="field-value">{v(report.vigencia)}</div>
                        </div>
                        <div className="field-group col-2">
                            <div className="field-label">Valor Autorizado por Lei e Repassado</div>
                            <div className="field-value">{v(report.valor_autorizado)}</div>
                        </div>
                    </div>
                </div>

                {/* 2. OBJETO DO RELATÓRIO */}
                <div className="section">
                    <div className="section-title">
                        <div className="section-bar" />
                        <h2>2. Objeto do Relatório</h2>
                    </div>
                    <div className="text-block">{v(report.objeto_relatorio)}</div>
                </div>

                {/* 3. REFERÊNCIAS */}
                <div className="section">
                    <div className="section-title">
                        <div className="section-bar" />
                        <h2>3. Referências</h2>
                    </div>
                    <div className="text-block">{v(report.referencias)}</div>
                </div>

                {/* 4. OBJETIVOS, METAS E EXECUÇÃO FINANCEIRA */}
                <div className="section">
                    <div className="section-title">
                        <div className="section-bar" />
                        <h2>4. Descrição dos Objetivos, Metas Previstas e Execução Financeira</h2>
                    </div>

                    <div className="text-item">
                        <div className="text-label">a) Dos objetivos:</div>
                        <div className="text-block">{v(report.objetivos)}</div>
                    </div>

                    <div className="text-item">
                        <div className="text-label">b) Das metas estabelecidas:</div>
                        <div className="text-block">{v(report.metas)}</div>
                    </div>

                    {report.metas_quantitativas?.trim() && (
                        <div className="text-item" style={{ paddingLeft: '0.5cm' }}>
                            <div className="text-label">Quantitativas:</div>
                            <div className="text-block">{report.metas_quantitativas}</div>
                        </div>
                    )}

                    <div className="text-item">
                        <div className="text-label">c) Dos resultados:</div>
                        <div className="text-block">{v(report.resultados)}</div>
                    </div>

                    <div className="text-item">
                        <div className="text-label">e) Da execução financeira e análise dos documentos comprobatórios das despesas:</div>
                        <div className="text-block">{v(report.execucao_financeira)}</div>
                    </div>
                </div>

                {/* 5. CUMPRIMENTO DO OBJETO */}
                <div className="section">
                    <div className="section-title">
                        <div className="section-bar" />
                        <h2>5. Cumprimento do Objeto</h2>
                    </div>
                    <div className="text-block">{v(report.cumprimento_objeto_final)}</div>
                </div>

                {/* LOCAL E DATA */}
                <div className="local-data">{v(report.local_data)}</div>

                {/* ASSINATURAS PRINCIPAL */}
                <div className="signatures-block">
                    <div className="signature-item">
                        <div className="signature-image-area">
                            {report.signature_tecnico
                                ? <img src={report.signature_tecnico} alt="Assinatura do Técnico" />
                                : <span className="no-sig">Sem Assinatura</span>
                            }
                        </div>
                        <div className="signature-name">{report.tecnico_nome || '(Nome não informado)'}</div>
                        <div className="signature-role">Assinatura do Técnico</div>
                    </div>
                    <div className="signature-item">
                        <div className="signature-image-area">
                            {report.signature_financeiro
                                ? <img src={report.signature_financeiro} alt="Assinatura do Técnico Financeiro" />
                                : <span className="no-sig">Sem Assinatura</span>
                            }
                        </div>
                        <div className="signature-name">{report.financeiro_nome || '(Nome não informado)'}</div>
                        <div className="signature-role">Assinatura do Técnico Financeiro</div>
                    </div>
                </div>

                {/* HOMOLOGAÇÃO DA COMISSÃO */}
                <div className="homologacao-section">
                    <div className="homologacao-title">Homologação da Comissão de Monitoramento e Avaliação</div>
                    {report.texto_homologacao?.trim() && (
                        <div className="homologacao-text">{report.texto_homologacao}</div>
                    )}
                    <div className="local-data">{v(report.homologacao_local_data)}</div>

                    <div className="signatures-block">
                        <div className="signature-item">
                            <div className="signature-image-area">
                                {report.signature_comissao_tecnico
                                    ? <img src={report.signature_comissao_tecnico} alt="Assinatura Comissão Técnico" />
                                    : <span className="no-sig">Sem Assinatura</span>
                                }
                            </div>
                            <div className="signature-name">{report.comissao_tecnico_nome || '(Nome não informado)'}</div>
                            <div className="signature-role">Comissão de Monitoramento e Avaliação</div>
                            <div className="signature-role" style={{ fontStyle: 'italic' }}>Técnico</div>
                        </div>
                        <div className="signature-item">
                            <div className="signature-image-area">
                                {report.signature_comissao_financeiro
                                    ? <img src={report.signature_comissao_financeiro} alt="Assinatura Comissão Financeiro" />
                                    : <span className="no-sig">Sem Assinatura</span>
                                }
                            </div>
                            <div className="signature-name">{report.comissao_financeiro_nome || '(Nome não informado)'}</div>
                            <div className="signature-role">Comissão de Monitoramento e Avaliação</div>
                            <div className="signature-role" style={{ fontStyle: 'italic' }}>Financeiro</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-print ao carregar */}
            <script dangerouslySetInnerHTML={{ __html: `
                window.addEventListener('load', function() {
                    setTimeout(function() { window.print(); }, 800);
                });
            `}} />
        </>
    )
}
