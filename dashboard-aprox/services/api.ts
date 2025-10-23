const APi_URL = "https://nonobservingly-towerless-sarai.ngrok-free.dev";

// Headers comunes para todas las peticiones
const commonHeaders = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "1" // ← Esto evita la página de advertencia
};

export async function registrarMovimiento(descripcion: string) {
  const url = `${APi_URL}/api/movimiento`;

  const response = await fetch(url, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({ descripcion }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message}`);
  }

  return response.json();
}

export async function obtenerMovimientos(page = 1, limit = 10) {
  const url = `${APi_URL}/api/movimientos?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    headers: { "ngrok-skip-browser-warning": "1" }
  });

  if (!response.ok) {
    throw new Error("Fallo al cargar los movimientos.");
  }

  return response.json();
}

export async function obtenerEstadisticas() {
  const url = `${APi_URL}/api/estadisticas`;
  
  try {
    console.log("🔍 Intentando conectar a:", url);
    
    const response = await fetch(url, { 
      headers: { 
        "ngrok-skip-browser-warning": "1",
        "Content-Type": "application/json"
      },
      cache: 'no-store',
      mode: 'cors' // Explícitamente habilitar CORS
    });
    
    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Datos recibidos:", result);
    
    // El backend devuelve { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Respuesta inválida del servidor');
    
  } catch (error) {
    console.error("💥 Error en obtenerEstadisticas:", error);
    
    // Distinguir entre errores de red y otros errores
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que Flask y ngrok estén corriendo.');
    }
    
    throw error;
  }
}

export async function obtenerDeteccionesRecientes(limit = 5) {
  const url = `${APi_URL}/api/movimientos?limit=${limit}`;
  const response = await fetch(url, { 
    headers: { "ngrok-skip-browser-warning": "1" },
    cache: 'no-store'
  });

  const responseText = await response.text();
  console.log("Cuerpo de la respuesta de /api/movimientos:", responseText.substring(0, 100) + '...');

  if (!response.ok) {
    throw new Error(`Fallo al cargar las detecciones recientes. Status: ${response.status}. Cuerpo: ${responseText.substring(0, 100)}`);
  }
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error("Fallo al parsear JSON de /api/movimientos:", e);
    throw new Error("Error de parsing en detecciones recientes.");
  }
}