'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Shield, Check, X, UserCog } from "lucide-react"
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
        <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-2xl shadow-indigo-500/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl overflow-hidden mt-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                        <UserCog className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Usuários Cadastrados</CardTitle>
                        <CardDescription>Gerencie o acesso dos colaboradores.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nome</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Função</th>
                                <th className="px-6 py-4 font-medium">Permissões</th>
                                <th className="px-6 py-4 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors bg-white/40 dark:bg-transparent">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role === 'admin' ? (
                                                <span className="text-xs text-zinc-400 italic">Acesso Total</span>
                                            ) : user.directorateIds.length > 0 ? (
                                                user.directorateIds.map(did => {
                                                    const dir = directorates.find(d => d.id === did)
                                                    return (
                                                        <span key={did} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30">
                                                            {dir?.name || 'Desconhecido'}
                                                        </span>
                                                    )
                                                })
                                            ) : (
                                                <span className="text-xs text-red-500 font-medium">Sem Acesso</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleEditClick(user)}
                                                disabled={isDeleting === user.id}
                                                title="Editar Permissões"
                                            >
                                                <Edit className="h-4 w-4 text-zinc-500" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={isDeleting === user.id}
                                                title="Excluir Usuário"
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

            {/* Edit Modal / Overlay */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <CardHeader>
                            <CardTitle>Editar Permissões</CardTitle>
                            <CardDescription>
                                {editingUser.name} ({editingUser.email})
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto p-1">
                                {directorates.map(dir => (
                                    <label key={dir.id} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors bg-card">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedDirs.includes(dir.id)}
                                                onChange={() => toggleDir(dir.id)}
                                                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{dir.name}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isSaving}>Cancel</Button>
                                <Button onClick={handleSavePermissions} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Card>
    )
}
