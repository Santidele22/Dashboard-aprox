"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

interface Detection {
  id: number
  timestamp: string
  duration: string
  status: "active" | "completed"
}

interface RecentDetectionsProps {
  isActive: boolean
}

export function RecentDetections({ isActive }: RecentDetectionsProps) {
  const [detections, setDetections] = useState<Detection[]>([
    {
      id: 1,
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString("es-ES"),
      duration: "3.2s",
      status: "completed",
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString("es-ES"),
      duration: "2.8s",
      status: "completed",
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 480000).toLocaleTimeString("es-ES"),
      duration: "4.1s",
      status: "completed",
    },
  ])

  useEffect(() => {
    if (isActive) {
      const newDetection: Detection = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString("es-ES"),
        duration: "...",
        status: "active",
      }
      setDetections((prev) => [newDetection, ...prev.slice(0, 9)])
    } else {
      setDetections((prev) =>
        prev.map((d) =>
          d.status === "active"
            ? { ...d, duration: `${(Math.random() * 3 + 1).toFixed(1)}s`, status: "completed" as const }
            : d,
        ),
      )
    }
  }, [isActive])

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
              <div className="font-medium">Movimiento detectado</div>
              <div className="text-sm text-muted-foreground">{detection.timestamp}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{detection.duration}</div>
              <div className="text-xs text-muted-foreground">Duración</div>
            </div>
            <Badge variant={detection.status === "active" ? "default" : "secondary"}>
              {detection.status === "active" ? "En curso" : "Completado"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
