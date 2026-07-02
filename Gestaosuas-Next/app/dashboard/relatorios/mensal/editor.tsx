'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft, Loader2, FileText, Layout } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RichTextEditor } from "@/components/editor/RichTextEditor"
import { saveMonthlyNarrative, getMonthlyNarrative } from "../../actions-narrative"

export function MonthlyReportEditor({ 
  directorateId, 
  setor, 
  directorateName 
}: { 
  directorateId: string; 
  setor: string; 
  directorateName: string;
}) {
  const router = useRouter()
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1))
  const [year, setYear] = useState<string>(String(new Date().getFullYear()))
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false)

  // Load existing data when month/year changes
  useEffect(() => {
    async function loadData() {
      setFetching(true)
      setIsAlreadySubmitted(false)
      setContent('')
      const existing = await getMonthlyNarrative(directorateId, setor, parseInt(month), parseInt(year))
      if (existing && existing.content) {
        // Report exists — lock the editor
        setIsAlreadySubmitted(true)
        // If it's a string (HTML), use it. If it's the old blocks array, try to convert or reset.
        if (typeof existing.content === 'string') {
          setContent(existing.content)
        } else if (Array.isArray(existing.content)) {
          // Fallback: merge old blocks into HTML
          const mergedHtml = existing.content.map((b: any) => `<h2>${b.title}</h2><p>${b.content}</p>`).join('')
          setContent(mergedHtml)
        } else if (existing.content.html) {
          setContent(existing.content.html)
        }
      } else {
        setIsAlreadySubmitted(false)
        setContent('')
      }
      setFetching(false)
    }
    loadData()
  }, [month, year, directorateId, setor])

  const handleSave = async () => {
    setLoading(true)
    const result = await saveMonthlyNarrative({
      directorate_id: directorateId,
      month: parseInt(month),
      year: parseInt(year),
      setor,
      content: { html: content } // Saving as JSON object with html key
    })

    if (result.success) {
      alert("Relatório salvo com sucesso!")
      router.push(`/dashboard/diretoria/${directorateId}`)
    } else {
      alert(result.error || "Erro ao salvar relatório.")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 dark:text-blue-50 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Editor de Relatórios Premium
          </h1>
          <p className="text-zinc-500 font-medium">{directorateName} • Setor: <span className="uppercase text-blue-600 font-bold">{setor.replace(/_/g, ' ')}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          {!isAlreadySubmitted && (
            <Button onClick={handleSave} disabled={loading || fetching} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Salvando...' : 'Salvar Documento'}
            </Button>
          )}
        </div>
      </div>

      {/* Selectors */}
      <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-blue-900/40 dark:text-blue-100/40 tracking-widest pl-1">Competência de Mês</label>
            <select 
              className="w-full h-12 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold transition-all focus:ring-2 focus:ring-blue-500/20"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-blue-900/40 dark:text-blue-100/40 tracking-widest pl-1">Ano</label>
            <select 
              className="w-full h-12 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold transition-all focus:ring-2 focus:ring-blue-500/20"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Editor Content */}
      <div className="space-y-4">
        {fetching ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-bold tracking-tight">Verificando dados de competência...</p>
          </div>
        ) : isAlreadySubmitted ? (
             <Card className="border-dashed border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-2">
                      <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-green-700 dark:text-green-500">Relatório Já Preenchido</h3>
                      <p className="text-green-600 dark:text-green-400 max-w-sm mt-1 mx-auto text-sm">
                          Já existe um relatório mensal salvo para esta competência. Não é permitido criar duplicatas ou editar documentos já consolidados por este painel.
                      </p>
                  </div>
                  <Button variant="outline" className="mt-4 border-green-200 dark:border-green-800 text-green-700 hover:bg-green-100" asChild>
                      <Link href={`/dashboard/relatorios/lista?setor=${setor}&directorate_id=${directorateId}`}>
                          Ver Histórico de Relatórios
                      </Link>
                  </Button>
                </CardContent>
            </Card>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
              placeholder={`Escreva aqui o relatório técnico de ${new Date(0, parseInt(month)-1).toLocaleString('pt-BR', {month: 'long'})}...`}
            />
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
          <Layout className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Dica: Formatação Híbrida Ativa</p>
          <p className="text-xs text-zinc-500 font-medium">Use a barra superior para ferramentas do Word ou selecione qualquer texto para o menu rápido estilo Notion.</p>
        </div>
      </div>
    </div>
  )
}
