const APi_URL = "https://nonobservingly-towerless-sarai.ngrok-free.dev/api/";

export async function registrarMovimiento(descripcion: string) {
  const url = `${APi_URL}/movimiento`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descripcion }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message}`);
  }

  return response.json();
}

export async function obtenerMovimientos(page = 1, limit = 10) {
  const url = `${APi_URL}/movimientos?page=${page}&limit=${limit}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Fallo al cargar los movimientos.");
  }

  return response.json();
}
export async function obtenerEstadisticas() {
  const url = `${APi_URL}/estadisticas`;
  const response = await fetch(url, { next: { revalidate: 0 } });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.message}`);
  }
  return response.json(); 
}
export async function obtenerDeteccionesRecientes(limit = 5) {
  const url = `${APi_URL}/movimientos?limit=${limit}`;
  const response = await fetch(url, { next: { revalidate: 0 } });

  if (!response.ok) {
    throw new Error('Fallo al cargar las detecciones recientes.');
  }
  return response.json();
}