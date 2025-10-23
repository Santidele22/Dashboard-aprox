"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { obtenerDeteccionesRecientes } from "../services/api";

interface MovimientoApi {
  id: number;
  descripcion: string;
  fecha_hora: string;
}

interface DetectionUI {
  id: number;
  timestamp: string;
  description: string;
  timeAgo: string;
}

const POLLING_INTERVAL = 15000; // 15 segundos

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "hace menos de un minuto";
  if (diffInMinutes < 60) return `hace ${diffInMinutes} minutos`;
  if (diffInMinutes < 1440)
    return `hace ${Math.floor(diffInMinutes / 60)} horas`;
  return date.toLocaleDateString("es-ES");
};

export function RecentDetections() {
  const [detections, setDetections] = useState<DetectionUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentDetections = async () => {
    try {
      const data = await obtenerDeteccionesRecientes(10);

      // 👇 Ajuste clave: soportar ambos formatos (array directo o { data: [...] })
      const list = Array.isArray(data) ? data : data.data;

      const formatted = list.map((mov: MovimientoApi) => ({
        id: mov.id,
        description: mov.descripcion,
        timestamp: new Date(mov.fecha_hora).toLocaleTimeString("es-ES"),
        timeAgo: formatTimeAgo(mov.fecha_hora),
      }));

      // Evita duplicados comparando IDs
      setDetections((prev) => {
        const idsPrev = new Set(prev.map((d) => d.id));
        const unique = formatted.filter((mov) => !idsPrev.has(mov.id));
        return [...unique, ...prev].slice(0, 10);
      });
    } catch (err) {
      console.error("Error al obtener detecciones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔁 useEffect para ejecutar al montar y cada X segundos
  useEffect(() => {
    fetchRecentDetections();
    const interval = setInterval(fetchRecentDetections, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // 📊 Render
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Cargando historial...
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aún no hay movimientos registrados en la base de datos.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {detections.map((detection) => (
        <div
          key={detection.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{detection.description}</div>
              <div className="text-sm text-muted-foreground">
                {detection.timestamp} ({detection.timeAgo})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">#{detection.id}</div>
              <div className="text-xs text-muted-foreground">ID del Evento</div>
            </div>
            <Badge variant={"secondary"}>Completado</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
