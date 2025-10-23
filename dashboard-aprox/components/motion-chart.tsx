"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  detections: {
    label: "Detecciones",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface MotionChartProps {
  isActive: boolean
}

export function MotionChart({ isActive }: MotionChartProps) {
  const [data, setData] = useState<Array<{ time: string; detections: number }>>([])

  useEffect(() => {
    // Inicializar con datos históricos simulados
    const initialData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      detections: Math.floor(Math.random() * 15),
    }))
    setData(initialData)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)]
        const lastValue = prevData[prevData.length - 1]?.detections || 0
        const newValue = isActive ? lastValue + 1 : lastValue

        newData.push({
          time: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          detections: newValue,
        })

        return newData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillDetections" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-detections)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-detections)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="detections"
          stroke="var(--color-detections)"
          fillOpacity={1}
          fill="url(#fillDetections)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
