import { login } from './actions'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    searchParams = Promise.resolve(searchParams)
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 overflow-hidden relative selection:bg-blue-500/30">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse duration-[10000ms]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/20 blur-[120px] animate-pulse duration-[8000ms]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_0%)] opacity-70"></div>
            </div>

            <Card className="w-full max-w-md shadow-2xl shadow-blue-900/10 border-0 ring-1 ring-white/50 dark:ring-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl overflow-hidden relative group">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400"></div>

                <CardHeader className="space-y-4 text-center pb-8 pt-10 relative z-10">
                    <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30 transform group-hover:scale-105 transition-transform duration-500">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                            Bem-vindo de volta
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-zinc-500 dark:text-zinc-400">
                            Sistema de Vigilância Socioassistencial 2026
                        </CardDescription>
                    </div>
                </CardHeader>

                <form action={login}>
                    <CardContent className="grid gap-6 relative z-10 px-8">
                        {error && (
                            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 text-sm font-semibold text-red-600 dark:text-red-400 flex gap-3 items-center animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2 group/input">
                            <Label htmlFor="email" className="text-zinc-600 dark:text-zinc-300 font-semibold ml-1 transition-colors group-focus-within/input:text-blue-600 dark:group-focus-within/input:text-blue-400">Email Corporativo</Label>
                            <div className="relative transition-all duration-300 transform group-focus-within/input:scale-[1.01]">
                                <div className="absolute left-3 top-3.5 text-zinc-400 group-focus-within/input:text-blue-500 transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="pl-11 h-12 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-zinc-600 dark:text-zinc-300 font-semibold ml-1 transition-colors group-focus-within/input:text-blue-600 dark:group-focus-within/input:text-blue-400">Senha</Label>
                                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">Esqueceu a senha?</a>
                            </div>
                            <div className="relative transition-all duration-300 transform group-focus-within/input:scale-[1.01]">
                                <div className="absolute left-3 top-3.5 text-zinc-400 group-focus-within/input:text-blue-500 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="pl-11 h-12 bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all shadow-sm font-sans"
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pb-10 pt-4 px-8 relative z-10">
                        <Button className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group/btn">
                            Acessar Sistema
                            <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="absolute bottom-6 text-center text-xs text-zinc-400 dark:text-zinc-600 font-medium tracking-wide">
                © 2026 Sistema de Vigilância Socioassistencial • Klisman rDs
            </div>
        </div>
    )
}
