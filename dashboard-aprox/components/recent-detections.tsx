"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { obtenerDeteccionesRecientes } from "../services/api"; // 💡 Importar el servicio

// Interfaz para los datos que vienen de la API
interface MovimientoApi {
  id: number;
  descripcion: string;
  fecha_hora: string; // La fecha y hora de MySQL
}

// Interfaz para los datos formateados para la UI
interface DetectionUI {
  id: number;
  timestamp: string; // Formato legible de hora
  description: string;
  timeAgo: string; // Ejemplo: "Hace 5 minutos"
}

// ⚠️ Ya no necesitamos la prop isActive
// interface RecentDetectionsProps { isActive: boolean }

const POLLING_INTERVAL = 8000; // Actualizar cada 8 segundos

// Helper para convertir la fecha_hora de la API a un formato legible
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

  // 💡 Lógica de Polling para obtener los datos reales
  const fetchRecentDetections = async () => {
    try {
      // Pedimos los últimos 10 movimientos
      const { data } = await obtenerDeteccionesRecientes(10);

      // 💡 Transformar los datos de la API al formato de la UI
      const formattedDetections: DetectionUI[] = data.map(
        (mov: MovimientoApi) => ({
          id: mov.id,
          description: mov.descripcion,
          timestamp: new Date(mov.fecha_hora).toLocaleTimeString("es-ES"),
          timeAgo: formatTimeAgo(mov.fecha_hora),
        })
      );

      setDetections(formattedDetections);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener detecciones recientes:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Carga inicial
    fetchRecentDetections();

    // 2. Polling
    const intervalId = setInterval(fetchRecentDetections, POLLING_INTERVAL);

    // 3. Limpieza
    return () => clearInterval(intervalId);
  }, []);

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
              {/* 💡 Usamos la descripción de la API */}
              <div className="font-medium">{detection.description}</div>
              <div className="text-sm text-muted-foreground">
                {detection.timestamp} ({detection.timeAgo})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              {/* ⚠️ Nota: Tu API no guarda la duración, mostramos la ID como marcador */}
              <div className="text-sm font-medium">#{detection.id}</div>
              <div className="text-xs text-muted-foreground">ID del Evento</div>
            </div>
            {/* Como la API solo registra el inicio del movimiento, el estado siempre será "Completado" */}
            <Badge variant={"secondary"}>Completado</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
