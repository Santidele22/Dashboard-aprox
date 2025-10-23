"use client";

import { Progress } from "@/components/ui/progress";

interface MotionStatsData {
  total: number;
  hoy: number;
  semana: number;
  ultimo_movimiento: string | null;
}

interface MotionStatsProps {
  data: MotionStatsData;
}

export function MotionStats({ data }: MotionStatsProps) {
  console.log(data)
  const totalDetections = data.total;


  const maxDetections = 100; 
  const percentage = Math.min((totalDetections / maxDetections) * 100, 100);

  // Cálculos sencillos
  const avgPerHour = Math.floor(totalDetections / 24); // Estimación burda

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Detecciones Totales</span>
          <span className="font-medium">
            {totalDetections}
            {maxDetections > 0 ? `/${maxDetections}` : ""}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-muted-foreground">
            Promedio por hora (Est.)
          </span>
          <span className="text-sm font-medium">{avgPerHour}</span>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-muted-foreground">Detecciones Hoy</span>
          <span className="text-sm font-medium">{data.hoy}</span>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-muted-foreground">
            Detecciones Semana
          </span>
          <span className="text-sm font-medium">{data.semana}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estado conexión</span>
          <span className="text-sm font-medium text-green-500">
            API Conectada
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-secondary p-4">
        <div className="text-xs text-muted-foreground mb-1">
          Última Detección
        </div>
        <div className="text-2xl font-bold">
          {data.ultimo_movimiento
            ? new Date(data.ultimo_movimiento).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {data.ultimo_movimiento
            ? new Date(data.ultimo_movimiento).toLocaleDateString()
            : "Sin registros"}
        </div>
      </div>
    </div>
  );
}
