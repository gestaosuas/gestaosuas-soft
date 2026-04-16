            {(isSINE || isCP) ? (
                <div className="space-y-6">
                    {/* SINE */}
                    {isSINE && canSeeSINE && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">SINE • Operações</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {[
                                    { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=sine&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Ver Dados", href: `/dashboard/dados?setor=sine&directorate_id=${directorate.id}`, icon: Database },
                                    { label: "Dashboard", href: `/dashboard/graficos?setor=sine&directorate_id=${directorate.id}`, icon: BarChart3 },
                                    { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=sine&directorate_id=${directorate.id}`, icon: FileText },
                                    { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=sine&directorate_id=${directorate.id}`, icon: FolderOpen },
                                ].map((item, idx) => {
                                    const theme = getCardTheme(item.label);
                                    return (
                                        <Link key={idx} href={item.href} className="group">
                                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                    <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                </div>
                                                {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                    <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                        <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* CP */}
                    {isCP && canSeeCP && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                <h2 className="text-[12px] font-bold text-blue-900/60 dark:text-blue-400/60 uppercase tracking-[0.2em]">Qualificação Profissional</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {[
                                    { label: "Atualizar Dados", href: `/dashboard/relatorios/novo?setor=centros&directorate_id=${directorate.id}`, icon: FilePlus },
                                    { label: "Ver Dados", href: `/dashboard/dados?setor=centros&directorate_id=${directorate.id}`, icon: Database },
                                    { label: "Dashboard", href: `/dashboard/graficos?setor=centros&directorate_id=${directorate.id}`, icon: BarChart3 },
                                    { label: "Relatório Mensal", href: `/dashboard/relatorios/mensal?setor=centros&directorate_id=${directorate.id}`, icon: FileText },
                                    { label: "Ver Relatórios", href: `/dashboard/relatorios/lista?setor=centros&directorate_id=${directorate.id}`, icon: FolderOpen },
                                ].map((item, idx) => {
                                    const theme = getCardTheme(item.label);
                                    return (
                                        <Link key={idx} href={item.href} className="group">
                                            <Card className={`h-full min-h-[90px] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-none ${theme.border} transition-all duration-300 rounded-xl group-hover:shadow-lg flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden`}>
                                                <div className={`p-2 ${theme.iconBg} rounded-lg ${theme.iconActive} transition-all duration-300 mb-1.5 shadow-sm relative z-10`}>
                                                    <item.icon className={`w-4 h-4 ${theme.iconText} group-hover:text-white transition-colors`} />
                                                </div>
                                                {item.label === "Atualizar Dados" && latestMonthSINE_CP && (
                                                    <div className="mb-2 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-full w-fit relative z-10">
                                                        <CheckCircle2 className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                                        <span className="text-[8px] font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Vigência: {latestMonthSINE_CP}</span>
                                                    </div>
                                                )}
                                                <CardTitle className="text-[11px] font-bold text-blue-900 dark:text-blue-100 transition-colors leading-tight px-1 relative z-10">{item.label}</CardTitle>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}
                </div>
            ) : isBeneficios ? (
                <BeneficiosPageClient 
                    directorate={directorate}
                    submissions={submissions}
                    currentYear={currentYear}
                />
            ) : isCRAS ? (
                <CrasPageClient 
                    directorate={directorate}
                    submissions={submissions}
                    currentYear={currentYear}
                    allowedUnits={allowedUnits}
                />
            ) : isCREAS ? (
