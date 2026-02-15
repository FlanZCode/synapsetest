"use client";

import type { ComponentProps } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

type DataChartProps = {
    data: { time: number; down: number; up: number }[];
} & ComponentProps<"div">;

const chartConfig = {
    down: {
        label: "Download",
        color: "hsl(var(--primary))",
    },
    up: {
        label: "Upload",
        color: "hsl(var(--accent))",
    },
} satisfies ChartConfig;

export function DataChart({ data }: DataChartProps) {
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <AreaChart
                accessibilityLayer
                data={data}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="hsl(var(--muted-foreground) / 0.5)" />
                <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}s`}
                    stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value} Mbps`}
                    stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                    cursor={{
                        stroke: "hsl(var(--accent))",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                    }}
                    content={<ChartTooltipContent
                        indicator="line"
                        labelFormatter={(label, payload) => `${payload?.[0]?.payload?.time}s`}
                        formatter={(value, name) => (
                            <div className="flex flex-col">
                <span className="font-bold" style={{color: chartConfig[name as keyof typeof chartConfig].color}}>
                  {chartConfig[name as keyof typeof chartConfig].label}
                </span>
                                <span>{Number(value).toFixed(2)} Mbps</span>
                            </div>
                        )}
                        itemStyle={{
                            color: 'hsl(var(--foreground))',
                        }}
                        labelStyle={{
                            color: 'hsl(var(--foreground))',
                        }}
                    />}

                />
                <defs>
                    <linearGradient id="fillDown" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={chartConfig.down.color}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={chartConfig.down.color}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient id="fillUp" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={chartConfig.up.color}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={chartConfig.up.color}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <Area
                    dataKey="down"
                    type="natural"
                    fill="url(#fillDown)"
                    stroke={chartConfig.down.color}
                    strokeWidth={2}
                    stackId="a"
                />
                <Area
                    dataKey="up"
                    type="natural"
                    fill="url(#fillUp)"
                    stroke={chartConfig.up.color}
                    strokeWidth={2}
                    stackId="b"
                />
            </AreaChart>
        </ChartContainer>
    );
}
