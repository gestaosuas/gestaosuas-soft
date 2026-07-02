
export const printWorkPlan = (plan: any, customLogoUrl?: string) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const styles = `
        <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; max-width: 900px; margin: 0 auto; background: #f4f4f5; }
            .document-container { background: white; padding: 60px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; min-height: 29.7cm; }
            h1 { font-size: 24px; margin-bottom: 20px; text-align: center; text-transform: uppercase; color: #1e3a8a; }
            h2 { font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #1e3a8a; font-weight: bold; border-left: 4px solid #1e3a8a; padding-left: 15px; }
            p { margin-bottom: 15px; line-height: 1.6; text-align: justify; color: #444; }
            table { width: 100%; border-collapse: collapse; margin: 25px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; font-weight: bold; color: #1e3a8a; }
            .header { text-align: center; margin-bottom: 50px; border-bottom: 1px solid #e5e7eb; padding-bottom: 25px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; padding: 20px; border-top: 1px solid #e5e7eb; }
            .no-print-toolbar { position: sticky; top: 0; background: #f4f4f5; padding: 10px 0; margin-bottom: 20px; display: flex; justify-content: flex-end; z-index: 100; }
            .btn-print { background: #1e3a8a; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; transition: opacity 0.2s; }
            .btn-print:hover { opacity: 0.9; }

            @media print {
                body { padding: 0; background: white; }
                .document-container { box-shadow: none; padding: 0; }
                .no-print { display: none !important; }
                .no-print-toolbar { display: none !important; }
            }
        </style>
    `

    const parseMarkdown = (text: string) => {
        if (!text) return ''
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
    }

    const blocksHtml = plan.content.map((block: any) => {
        if (block.type === 'title') {
            return `<h2>${parseMarkdown(block.content)}</h2>`
        }
        if (block.type === 'paragraph') {
            return `<p>${parseMarkdown(block.content).replace(/\n/g, '<br>')}</p>`
        }
        if (block.type === 'table') {
            const headers = (block.content.headers || []).map((h: string) => `<th>${parseMarkdown(h)}</th>`).join('')
            const rows = (block.content.rows || []).map((row: string[]) =>
                `<tr>${row.map(cell => `<td>${parseMarkdown(cell)}</td>`).join('')}</tr>`
            ).join('')
            return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`
        }
        return ''
    }).join('')

    const logoUrl = customLogoUrl || "https://ovfpxrepxlrspsjbtpnd.supabase.co/storage/v1/object/public/system/logo-pm-uberlandia.png"

    const html = `
        <html>
        <head>
            <title>${plan.title}</title>
            ${styles}
        </head>
        <body>
            <div class="no-print-toolbar">
                <button class="btn-print" onclick="window.print()">Imprimir Documento</button>
            </div>
            <div class="document-container">
                <div class="header">
                    <img src="${logoUrl}" alt="Logo" style="height: 60px; margin-bottom: 15px;">
                    <h1>${plan.title}</h1>
                    <p style="text-align: center; margin: 0; font-size: 12px; color: #64748b;">Gerado pelo Sistema de Vigilância Socioassistencial</p>
                </div>
                <div class="content">
                    ${blocksHtml}
                </div>
                <div class="footer">
                    Documento visualizado em ${new Date().toLocaleString('pt-BR')} pela Plataforma de Vigilância Socioassistencial
                </div>
            </div>
        </body>
        </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
}
