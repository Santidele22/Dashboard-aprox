"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertCircle, Clock, TrendingUp } from "lucide-react"
import { MotionChart } from "@/components/motion-chart"
import { MotionStats } from "@/components/motion-stats"
import { RecentDetections } from "@/components/recent-detections"

export function MotionDashboard() {
  const [isMotionDetected, setIsMotionDetected] = useState(false)
  const [detectionCount, setDetectionCount] = useState(0)

  // Simular datos del sensor PIR de Wokwi
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular detección aleatoria de movimiento
      const detected = Math.random() > 0.7
      setIsMotionDetected(detected)
      if (detected) {
        setDetectionCount((prev) => prev + 1)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Dashboard de Sensor PIR</h1>
            <p className="mt-2 text-muted-foreground">Monitoreo en tiempo real desde Wokwi</p>
          </div>
          <Badge variant={isMotionDetected ? "default" : "secondary"} className="h-8 px-4 text-sm">
            <Activity className="mr-2 h-4 w-4" />
            {isMotionDetected ? "Movimiento Detectado" : "Sin Movimiento"}
          </Badge>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isMotionDetected ? "ACTIVO" : "INACTIVO"}</div>
              <p className="text-xs text-muted-foreground mt-1">Sensor PIR en línea</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detecciones Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detectionCount}</div>
              <p className="text-xs text-muted-foreground mt-1">+12% vs ayer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Detección</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isMotionDetected ? "Ahora" : "2m"}</div>
              <p className="text-xs text-muted-foreground mt-1">Hace {isMotionDetected ? "0" : "2"} minutos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Sin alertas activas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Actividad del Sensor</CardTitle>
              <CardDescription>Detecciones de movimiento en las últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <MotionChart isActive={isMotionDetected} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen de actividad del sensor</CardDescription>
            </CardHeader>
            <CardContent>
              <MotionStats detectionCount={detectionCount} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Detections */}
        <Card>
          <CardHeader>
            <CardTitle>Detecciones Recientes</CardTitle>
            <CardDescription>Historial de eventos del sensor PIR</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentDetections isActive={isMotionDetected} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
