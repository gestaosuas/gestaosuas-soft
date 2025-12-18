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
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>Personalize a aparência do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label>Nome do Sistema</Label>
                    <Input
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="Ex: Sistema Vigilância"
                    />
                </div>

                <div className="space-y-3">
                    <Label>URL da Logo</Label>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-4">
                            <Input
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://exemplo.com/logo.png"
                            />

                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="logo">Ou faça upload da imagem</Label>
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

                <div className="pt-4 border-t">
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Alterações
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
