"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
// 💡 Importa la función de tu servicio de API
import { obtenerEstadisticas } from '../services/api'; // Asegúrate de ajustar la ruta

const chartConfig = {
  detections: {
    label: "Detecciones de Hoy",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface MotionChartProps {
  // Ya no necesitamos 'isActive', el componente se auto-actualiza
  // isActive: boolean 
}

// Interfaz para el estado de los datos del gráfico
interface ChartDataItem {
    time: string;
    detections: number; // El valor 'hoy' de la API
}

// Mantenemos una longitud fija para la ventana de tiempo del gráfico (ej: 30 puntos)
const MAX_DATA_POINTS = 30;
const POLLING_INTERVAL = 10000; // 10 segundos para actualizar

export function MotionChart() {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función de Polling (se ejecuta periódicamente)
  const fetchDataAndPoll = async () => {
    try {
        // 1. Obtener datos reales de la API
        const { data: stats } = await obtenerEstadisticas();
        const currentDetectionsToday = stats.hoy || 0;
        
        // 2. Crear el nuevo punto de datos
        const newPoint: ChartDataItem = {
            time: new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
            // Usamos el total de detecciones de hoy de la API
            detections: currentDetectionsToday, 
        };

        // 3. Actualizar el estado del gráfico
        setData(prevData => {
            // Si los datos superan el límite, eliminamos el más antiguo
            const newData = prevData.length >= MAX_DATA_POINTS
                ? prevData.slice(1)
                : [...prevData];

            newData.push(newPoint);
            return newData;
        });

        setIsLoading(false);

    } catch (error) {
        console.error("Error al obtener estadísticas de la API:", error);
        // Podrías manejar el error mostrando un mensaje al usuario
        setIsLoading(false);
    }
  };

  // 💡 useEffect para inicializar y configurar el polling
  useEffect(() => {
    // Inicializar inmediatamente
    fetchDataAndPoll();
    
    // Configurar el intervalo de polling
    const interval = setInterval(fetchDataAndPoll, POLLING_INTERVAL);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []); // Se ejecuta solo al montar

  if (isLoading && data.length === 0) {
      return <div className="h-[300px] flex items-center justify-center">Cargando datos del sensor...</div>
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      {/* El resto del JSX del gráfico permanece igual */}
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