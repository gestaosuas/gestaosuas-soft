'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Shield, Check, X, UserCog } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteUser, updateUserAccess } from './actions'
// If no toast, we can use simple alert or just relying on revalidate

type UserData = {
    id: string
    email: string
    name: string
    role: string
    directorateIds: string[] // IDs of assigned directorates
}

type Directorate = {
    id: string
    name: string
}

export function UserList({ users, directorates }: { users: UserData[], directorates: Directorate[] }) {
    const [editingUser, setEditingUser] = useState<UserData | null>(null)
    const [selectedDirs, setSelectedDirs] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleDelete = async (userId: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) return

        setIsDeleting(userId)
        try {
            await deleteUser(userId)
            // Toast success
        } catch (e) {
            alert("Erro ao excluir usuário")
        } finally {
            setIsDeleting(null)
        }
    }

    const handleEditClick = (user: UserData) => {
        setEditingUser(user)
        setSelectedDirs(user.directorateIds || [])
    }

    const handleSavePermissions = async () => {
        if (!editingUser) return
        setIsSaving(true)
        try {
            await updateUserAccess(editingUser.id, selectedDirs)
            setEditingUser(null)
        } catch (e) {
            alert("Erro ao atualizar permissões")
        } finally {
            setIsSaving(false)
        }
    }

    const toggleDir = (dirId: string) => {
        if (selectedDirs.includes(dirId)) {
            setSelectedDirs(selectedDirs.filter(id => id !== dirId))
        } else {
            setSelectedDirs([...selectedDirs, dirId])
        }
    }

    return (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none rounded-2xl overflow-hidden mt-12">
            <CardHeader className="pt-10 px-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Membros da Equipe</CardTitle>
                    <CardDescription className="text-sm font-medium text-zinc-500">Listagem de acessos vinculados ao sistema.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] font-bold bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/60">
                            <tr>
                                <th className="px-8 py-5">Identificação</th>
                                <th className="px-8 py-5">E-mail Corporativo</th>
                                <th className="px-8 py-5">Atribuição</th>
                                <th className="px-8 py-5">Escopo de Acesso</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{user.name}</div>
                                    </td>
                                    <td className="px-8 py-6 text-zinc-500 dark:text-zinc-400 font-medium">
                                        {user.email}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                user.role === 'admin' ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-300 dark:bg-zinc-700"
                                            )}></div>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                user.role === 'admin' ? "text-blue-900 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                                            )}>
                                                {user.role === 'admin' ? 'Administrador' : 'Agente'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {user.role === 'admin' ? (
                                                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider italic">Acesso Irrestrito</span>
                                            ) : user.directorateIds.length > 0 ? (
                                                user.directorateIds.map(did => {
                                                    const dir = directorates.find(d => d.id === did)
                                                    return (
                                                        <span key={did} className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 uppercase tracking-tight">
                                                            {dir?.name || 'Área Excluída'}
                                                        </span>
                                                    )
                                                })
                                            ) : (
                                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20">
                                                    <X className="w-3 h-3 text-red-500" />
                                                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">Sem Permissão</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-400 hover:text-blue-900 dark:hover:text-blue-100 transition-all rounded-lg"
                                                onClick={() => handleEditClick(user)}
                                                disabled={isDeleting === user.id}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-lg"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={isDeleting === user.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            {/* Modal de Edição Refinado */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/20 dark:bg-black/20 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none rounded-2xl overflow-hidden">
                        <CardHeader className="pt-10 px-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Permissões de Acesso</CardTitle>
                                <CardDescription className="text-sm font-medium text-zinc-500">
                                    Monitoramento atribuído para <span className="text-blue-900 dark:text-blue-100 font-bold">{editingUser.name}</span>
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {directorates.map(dir => (
                                    <label key={dir.id} className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group",
                                        selectedDirs.includes(dir.id)
                                            ? "bg-blue-900 dark:bg-blue-600 border-blue-900 dark:border-blue-600 shadow-lg shadow-blue-900/10"
                                            : "bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-100 dark:border-zinc-800/60 hover:border-blue-300 dark:hover:border-blue-700"
                                    )}>
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedDirs.includes(dir.id)}
                                                onChange={() => toggleDir(dir.id)}
                                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 opacity-0 absolute"
                                            />
                                            <div className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                selectedDirs.includes(dir.id)
                                                    ? "bg-white dark:bg-zinc-900 border-transparent"
                                                    : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                            )}>
                                                {selectedDirs.includes(dir.id) && <Check className="w-3 h-3 text-zinc-900 dark:text-zinc-50" />}
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[13px] font-bold uppercase tracking-tight transition-colors",
                                            selectedDirs.includes(dir.id)
                                                ? "text-white dark:text-zinc-900"
                                                : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                                        )}>
                                            {dir.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                                <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={isSaving} className="font-bold text-[11px] uppercase tracking-widest text-zinc-500 hover:text-blue-900">Descartar</Button>
                                <Button onClick={handleSavePermissions} disabled={isSaving} className="bg-blue-900 dark:bg-blue-600 text-white font-bold px-8 rounded-lg text-[11px] uppercase tracking-widest h-11 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/10">
                                    {isSaving ? "Processando..." : "Confirmar Alterações"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Card>
    )
}
