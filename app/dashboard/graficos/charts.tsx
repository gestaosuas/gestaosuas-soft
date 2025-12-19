"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetricsCards({ data, monthName }: { data: any, monthName: string }) {
    // data is { label: string, value: number, color: string }[]
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.map((item: any, i: number) => (
                <Card key={i} className="border-l-4 shadow-sm" style={{ borderLeftColor: item.color }}>
                    <CardHeader className="p-4 pb-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {item.label} ({monthName})
                        </h3>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold" style={{ color: item.color }}>
                            {item.value.toLocaleString('pt-BR')}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function ServicesBarChart({ data }: { data: any[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Serviços
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            fill="#0ea5e9"
                            radius={[0, 4, 4, 0]}
                            barSize={30}
                            label={{ position: 'right', fill: '#0ea5e9', fontSize: 12, fontWeight: 'bold' }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function AttendanceLineChart({ data }: { data: any[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Atendimento ao Empregador e ao Trabalhador
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTrabalhador" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEmpregador" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                        <Area
                            type="monotone"
                            dataKey="trabalhador"
                            name="Atendimento ao Trabalhador"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTrabalhador)"
                            label={{ position: 'top', fill: '#3b82f6', fontSize: 10, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="empregador"
                            name="Atendimento ao Empregador"
                            stroke="#0f172a"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEmpregador)"
                            label={{ position: 'top', fill: '#0f172a', fontSize: 10, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function GenericLineChart({ data, title, dataKey, color }: { data: any[], title: string, dataKey: string, color: string }) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                            label={{ position: 'top', fill: color, fontSize: 10, dy: -5, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function ComparisonLineChart({ data, title, keys, colors }: { data: any[], title: string, keys: string[], colors: string[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        {keys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index]}
                                strokeWidth={3}
                                dot={{ r: 4, fill: colors[index], strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                                label={{ position: 'top', fill: colors[index], fontSize: 10, dy: -5, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}


const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[12px] font-bold"
        >
            {value}
        </text>
    );
};

export function GenderPieChart({ data }: { data: any[] }) {
    const COLORS = ['#3b82f6', '#f43f5e']; // Blue for Men, Rose for Women

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Gênero
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={renderCustomizedLabel}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name: any, props: any) => [`${value}`, name]}
                        />
                        <Legend
                            verticalAlign="middle"
                            layout="vertical"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value, entry: any) => <span className="text-zinc-600 dark:text-zinc-400 font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {data.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
            </CardContent>
        </Card>
    )
}

export function GenericPieChart({ data, title, colors }: { data: any[], title: string, colors?: string[] }) {
    // Default colors if not provided
    const DEFAULT_COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];
    const COLORS = colors || DEFAULT_COLORS;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={renderCustomizedLabel}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name: any, props: any) => [`${value}`, name]}
                        />
                        <Legend
                            verticalAlign="middle"
                            layout="vertical"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value, entry: any) => <span className="text-zinc-600 dark:text-zinc-400 font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {data.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
            </CardContent>
        </Card>
    )
}
