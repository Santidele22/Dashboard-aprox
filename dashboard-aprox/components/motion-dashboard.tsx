"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertCircle, Clock, TrendingUp } from "lucide-react"
import { MotionChart } from "@/components/motion-chart"
import { MotionStats } from "@/components/motion-stats"
import { RecentDetections } from "@/components/recent-detections"

// 💡 Importar el servicio de API
import { obtenerEstadisticas } from '../services/api'; // Asegúrate de ajustar la ruta

const POLLING_INTERVAL = 5000; // 5 segundos para actualizar las estadísticas

// Helper para calcular el tiempo transcurrido desde la última detección
const timeAgo = (isoDate) => {
    if (!isoDate) return "Nunca";
    
    const now = new Date();
    const lastTime = new Date(isoDate);
    const diffInSeconds = Math.floor((now.getTime() - lastTime.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    
    return lastTime.toLocaleDateString();
};

export function MotionDashboard() {
  // Estado que contendrá todos los datos de la API /api/estadisticas
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    semana: 0,
    ultimo_movimiento: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await obtenerEstadisticas();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error al hacer polling de estadísticas:", err);
        setError("Error al conectar con la API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const isMotionDetected = stats.ultimo_movimiento ? timeAgo(stats.ultimo_movimiento).includes('s') || timeAgo(stats.ultimo_movimiento).includes('m') && Math.floor((new Date().getTime() - new Date(stats.ultimo_movimiento).getTime()) / 60000) < 5 : false;
  const lastDetectionAgo = timeAgo(stats.ultimo_movimiento);
  
  if (error) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <p className="text-red-600 font-bold p-6 bg-red-100 rounded-lg">
          {error} Asegúrate de que tu API de Flask y ngrok estén activos.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-background p-8 text-center text-lg">Cargando Dashboard...</div>
  }


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Dashboard de Sensor PIR</h1>
            <p className="mt-2 text-muted-foreground">Monitoreo alimentado por Flask/MySQL</p>
          </div>
          <Badge variant={isMotionDetected ? "default" : "secondary"} className="h-8 px-4 text-sm">
            <Activity className="mr-2 h-4 w-4" />
            {isMotionDetected ? "Movimiento Activo" : "Esperando Movimiento"}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isMotionDetected ? "ACTIVO" : "INACTIVO"}</div>
              <p className="text-xs text-muted-foreground mt-1">Última actualización: {new Date().toLocaleTimeString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detecciones Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hoy}</div> 
              <p className="text-xs text-muted-foreground mt-1">Total: {stats.total} | Esta Semana: {stats.semana}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Detección</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ultimo_movimiento ? lastDetectionAgo : "N/A"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.ultimo_movimiento ? new Date(stats.ultimo_movimiento).toLocaleTimeString() : "No hay registros"}
              </p>
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
              {/* 💡 MotionChart ya se encarga de su propio polling */}
              <MotionChart />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen de actividad del sensor</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 💡 Pasa los datos de estadísticas completos */}
              <MotionStats stats={stats} />
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
            {/* 💡 RecentDetections necesitará hacer su propia llamada a /api/movimientos */}
            <RecentDetections /> 
          </CardContent>
        </Card>
      </div>
    </div>
  )
}