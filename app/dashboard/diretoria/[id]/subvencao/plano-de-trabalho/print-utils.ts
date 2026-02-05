
export const printWorkPlan = (plan: any) => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const styles = `
        <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 24px; margin-bottom: 20px; text-align: center; text-transform: uppercase; }
            h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; color: #000; font-weight: bold; }
            p { margin-bottom: 15px; line-height: 1.5; text-align: justify; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #666; padding: 10px; }
            @media print {
                .no-print { display: none; }
            }
        </style>
    `

    const blocksHtml = plan.content.map((block: any) => {
        if (block.type === 'title') {
            return `<h2>${block.content}</h2>`
        }
        if (block.type === 'paragraph') {
            return `<p>${block.content.replace(/\n/g, '<br>')}</p>`
        }
        if (block.type === 'table') {
            const headers = block.content.headers.map((h: string) => `<th>${h}</th>`).join('')
            const rows = block.content.rows.map((row: string[]) =>
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
            ).join('')
            return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`
        }
        return ''
    }).join('')

    const logoUrl = window.location.origin + '/logo-vigilancia.png'

    const html = `
        <html>
        <head>
            <title>${plan.title}</title>
            ${styles}
        </head>
        <body>
            <div class="header">
                <img src="${logoUrl}" alt="Logo" style="height: 60px; margin-bottom: 15px;">
                <h1>${plan.title}</h1>
                <p style="text-align: center; margin: 0; font-size: 12px;">Gerado pelo Sistema de Vigilância Socioassistencial</p>
            </div>
            <div class="content">
                ${blocksHtml}
            </div>
            <div class="footer">
                Documento gerado em ${new Date().toLocaleString('pt-BR')} pela Plataforma de Vigilância Socioassistencial
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
}
