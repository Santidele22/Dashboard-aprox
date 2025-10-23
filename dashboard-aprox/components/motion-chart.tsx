"use client";

import { useEffect, useRef, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { obtenerEstadisticas } from "@/services/api";

const POLLING_INTERVAL = 10000; // 10 segundos

export function MotionChart() {
  const [chartData, setChartData] = useState([
    { time: "00:00", detections: 0 },
    { time: "04:00", detections: 0 },
    { time: "08:00", detections: 0 },
    { time: "12:00", detections: 0 },
    { time: "16:00", detections: 0 },
    { time: "20:00", detections: 0 },
  ]);

  // ⏱ Ref para limitar requests (sin re-renderizar el componente)
  const lastFetchRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDataAndPoll = async () => {
      const now = Date.now();

      // 🚫 Evita llamadas al backend si pasó menos de 10 segundos
      if (now - lastFetchRef.current < POLLING_INTERVAL) return;
      lastFetchRef.current = now;

      try {
        const stats = await obtenerEstadisticas();
        const currentDetectionsToday = stats?.hoy || 0;

        const nowDate = new Date();
        const currentHour = nowDate.getHours();

        const newChartData = chartData.map((point) => {
          const hour = parseInt(point.time.split(":")[0]);

          if (hour <= currentHour) {
            const randomFactor = Math.random() * 0.5 + 0.5; // entre 0.5 y 1
            const detections = Math.floor(
              (currentDetectionsToday / 6) * randomFactor
            );
            return { ...point, detections };
          }

          return point;
        });

        if (isMounted) {
          setChartData(newChartData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error al obtener estadísticas para el gráfico:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    // Ejecutar al montar
    fetchDataAndPoll();

    // Intervalo de polling
    const intervalId = setInterval(fetchDataAndPoll, POLLING_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Cargando estadísticas...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="time"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Hora
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.time}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Detecciones
                      </span>
                      <span className="font-bold">{payload[0].value}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="detections"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "var(--theme-primary)", opacity: 0.25 },
          }}
          style={
            {
              stroke: "var(--theme-primary)",
            } as React.CSSProperties
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
