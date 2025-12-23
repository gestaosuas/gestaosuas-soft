'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateSystemSetting } from "@/app/dashboard/actions"
import { Loader2, Save } from "lucide-react"

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
    const [logoUrl, setLogoUrl] = useState(initialSettings?.logo_url || "")
    const [systemName, setSystemName] = useState(initialSettings?.system_name || "Sistema Vigilância Socioassistencial 2026")
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateSystemSetting('logo_url', logoUrl)
            await updateSystemSetting('system_name', systemName)
            alert("Configurações salvas com sucesso!")
            window.location.reload() // Reload to reflect changes in Sidebar
        } catch (e) {
            console.error(e)
            alert("Erro ao salvar.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="pt-10 px-10 pb-6 border-b border-zinc-50 dark:border-zinc-800/60">
                <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Identidade Visual</CardTitle>
                <CardDescription className="text-sm font-medium text-zinc-500">Personalize a aparência e identidade do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="pt-10 px-10 pb-12 space-y-10">
                <div className="space-y-3">
                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Nome do Sistema</Label>
                    <Input
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="Ex: Sistema Vigilância"
                        className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-600 transition-all font-medium"
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">URL da Logo</Label>
                    <div className="flex gap-6 items-end">
                        <div className="flex-1 space-y-6">
                            <Input
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://exemplo.com/logo.png"
                                className="h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-400 transition-all font-medium"
                            />

                            <div className="grid w-full max-w-sm items-center gap-2.5">
                                <Label htmlFor="logo" className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight ml-0.5">Ou faça upload da imagem</Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return

                                        setSaving(true)
                                        try {
                                            const formData = new FormData()
                                            formData.append('file', file)

                                            const response = await fetch('/api/upload', {
                                                method: 'POST',
                                                body: formData,
                                            })

                                            if (!response.ok) {
                                                const data = await response.json()
                                                throw new Error(data.error || 'Upload failed')
                                            }

                                            const data = await response.json()
                                            setLogoUrl(data.url)
                                            alert("Upload concluído!")
                                        } catch (error: any) {
                                            console.error("Erro no upload:", error)
                                            alert(`Erro ao fazer upload: ${error.message}`)
                                        } finally {
                                            setSaving(false)
                                        }
                                    }}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground mt-1">Cole o link direto ou envie um arquivo.</p>
                        </div>
                        {logoUrl && (
                            <div className="h-20 w-20 relative bg-zinc-100 rounded border flex items-center justify-center overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/60">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-11 px-10 bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 font-bold rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 dark:shadow-none uppercase tracking-widest text-[11px]"
                    >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Configurações
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
