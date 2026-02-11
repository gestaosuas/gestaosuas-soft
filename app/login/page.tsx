import { login } from './actions'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#366cb0] px-4 relative overflow-hidden">
            {/* Elegant Background Layering */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),rgba(54,108,176,0))]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            <main className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-1000">
                <header className="text-center mb-10 pt-8 flex flex-col items-center">
                    <div className="relative mb-8 group">
                        <div className="relative w-24 h-24 flex items-center justify-center bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo-vigilancia.png" alt="Logo" className="w-16 h-16 object-contain relative z-10" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-[14px] text-white/90 font-bold tracking-[0.1em] uppercase">
                            Sistema de Vigilância Socioassistencial • 2026
                        </p>
                    </div>
                </header>

                <Card className="border border-white/20 bg-white/5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
                    <form action={login}>
                        <CardContent className="grid gap-8 pt-12 px-10">
                            {error && (
                                <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-[13px] font-bold text-white animate-in fade-in slide-in-from-top-2 duration-500 text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label
                                    htmlFor="email"
                                    className="text-[11px] uppercase tracking-[0.2em] font-black text-white/70 ml-1"
                                >
                                    E-mail Corporativo
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    className="h-12 bg-white/10 border-white/20 rounded-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:border-white transition-all placeholder:text-white/30 shadow-none text-white text-[15px]"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <Label
                                        htmlFor="password"
                                        className="text-[11px] uppercase tracking-[0.2em] font-black text-white/70"
                                    >
                                        Senha
                                    </Label>
                                    <a
                                        href="#"
                                        className="text-[10px] font-bold text-white/60 hover:text-white transition-colors uppercase tracking-widest"
                                    >
                                        Esqueceu a senha?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-12 bg-white/10 border-white/20 rounded-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:border-white transition-all placeholder:text-white/30 shadow-none text-white text-[15px]"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-white text-[#366cb0] hover:bg-zinc-100 font-black rounded-xl transition-all mt-4 active:scale-[0.98] shadow-xl uppercase tracking-[0.2em] text-[12px]"
                            >
                                Entrar
                            </Button>
                        </CardContent>
                        <div className="pb-12 text-center px-10">
                            <span className="text-[11px] text-white/40 font-medium">
                                Acesso restrito a servidores autorizados
                            </span>
                        </div>
                    </form>
                </Card>

                <footer className="mt-16 text-center text-white/30">
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase">
                        © 2026 • SISTEMA DE VIGILÂNCIA • KLISMAN RDS
                    </p>
                </footer>
            </main>
        </div>
    )
}
