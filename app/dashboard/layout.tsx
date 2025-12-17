import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { getCachedProfile, getCachedDirectorates } from "@/app/dashboard/cached-data"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const profile = await getCachedProfile(user.id)
    const directorates = await getCachedDirectorates()

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50/50 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-50 selection:bg-primary/10 selection:text-primary flex-col md:flex-row">
            <MobileNav role={profile?.role as 'admin' | 'user'} directorates={directorates || []} />
            <Sidebar role={profile?.role as 'admin' | 'user'} directorates={directorates || []} />
            <main className="flex-1 overflow-y-auto relative">
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-50"></div>
                <div className="h-full p-4 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
