"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertCircle, Clock, TrendingUp } from "lucide-react"
import { MotionChart } from "@/components/motion-chart"
import { MotionStats } from "@/components/motion-stats"
import { RecentDetections } from "@/components/recent-detections"
import { obtenerEstadisticas } from "../services/api"

const POLLING_INTERVAL = 5000 // 5 segundos

const timeAgo = (isoDate?: string) => {
  if (!isoDate) return "Nunca"

  const now = new Date()
  const lastTime = new Date(isoDate)
  const diffInSeconds = Math.floor((now.getTime() - lastTime.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`

  return lastTime.toLocaleDateString()
}

export function MotionDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔒 Evita requests duplicadas en re-render
  const lastFetchRef = useRef<number>(0)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      const now = Date.now()

      // 🚫 Evitar más de una request cada POLLING_INTERVAL
      if (now - lastFetchRef.current < POLLING_INTERVAL) return
      lastFetchRef.current = now

      try {
        const data = await obtenerEstadisticas()
        console.log("📊 Data recibida:", data)

        if (isMounted) {
          setStats(data)
          setError(null)
        }
      } catch (err: any) {
        console.error("❌ Error al hacer polling de estadísticas:", err)
        if (isMounted) setError(`Error al conectar con la API: ${err.message}`)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    // Llamada inicial
    fetchData()

    // ⏱ Intervalo controlado
    const intervalId = setInterval(fetchData, POLLING_INTERVAL)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  // ⚙️ Calcular estado actual
  const isMotionDetected =
    stats?.ultimo_movimiento &&
    (() => {
      const diffMinutes =
        (Date.now() - new Date(stats.ultimo_movimiento).getTime()) / 60000
      return diffMinutes < 5
    })()

  const lastDetectionAgo = stats?.ultimo_movimiento
    ? timeAgo(stats.ultimo_movimiento)
    : "N/A"

  // 🧱 Estados de error / carga
  if (error) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-red-600 font-bold p-6 bg-red-100 rounded-lg">
          {error}. Asegúrate de que tu API Flask y ngrok estén activos.
        </p>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background p-8 text-center text-lg">
        Cargando Dashboard...
      </div>
    )
  }

  // ✅ Render final
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 🟢 Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">
              Dashboard de Sensor PIR
            </h1>
            <p className="mt-2 text-muted-foreground">
              Monitoreo alimentado por Flask/MySQL
            </p>
          </div>
          <Badge
            variant={isMotionDetected ? "default" : "secondary"}
            className="h-8 px-4 text-sm"
          >
            <Activity className="mr-2 h-4 w-4" />
            {isMotionDetected ? "Movimiento Activo" : "Esperando Movimiento"}
          </Badge>
        </div>

        {/* 📊 Tarjetas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Estado actual */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isMotionDetected ? "ACTIVO" : "INACTIVO"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Última actualización: {new Date().toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          {/* Detecciones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detecciones Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.hoy ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {stats?.total ?? 0} | Esta Semana: {stats?.semana ?? 0}
              </p>
            </CardContent>
          </Card>

          {/* Última detección */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Detección</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lastDetectionAgo}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.ultimo_movimiento
                  ? new Date(stats.ultimo_movimiento).toLocaleTimeString()
                  : "No hay registros"}
              </p>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Sin alertas activas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 🧩 Gráfico y estadísticas */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Actividad del Sensor</CardTitle>
              <CardDescription>
                Detecciones de movimiento en las últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MotionChart />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen de actividad del sensor</CardDescription>
            </CardHeader>
            <CardContent>
              <MotionStats data={stats} />
            </CardContent>
          </Card>
        </div>

        {/* 🕵️ Detecciones recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Detecciones Recientes</CardTitle>
            <CardDescription>Historial de eventos del sensor PIR</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentDetections />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
