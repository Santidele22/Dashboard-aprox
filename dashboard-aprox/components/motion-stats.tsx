"use client"

import { Progress } from "@/components/ui/progress"

interface MotionStatsProps {
  detectionCount: number
}

export function MotionStats({ detectionCount }: MotionStatsProps) {
  const maxDetections = 100
  const percentage = Math.min((detectionCount / maxDetections) * 100, 100)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Detecciones Totales</span>
          <span className="font-medium">
            {detectionCount}/{maxDetections}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-muted-foreground">Promedio por hora</span>
          <span className="text-sm font-medium">{Math.floor(detectionCount / 24)}</span>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-muted-foreground">Tiempo activo</span>
          <span className="text-sm font-medium">87%</span>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-muted-foreground">Sensibilidad</span>
          <span className="text-sm font-medium">Alta</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estado conexión</span>
          <span className="text-sm font-medium text-accent">Conectado</span>
        </div>
      </div>

      <div className="rounded-lg bg-secondary p-4">
        <div className="text-xs text-muted-foreground mb-1">Pico de actividad</div>
        <div className="text-2xl font-bold">14:30</div>
        <div className="text-xs text-muted-foreground mt-1">23 detecciones en esa hora</div>
      </div>
    </div>
  )
}
