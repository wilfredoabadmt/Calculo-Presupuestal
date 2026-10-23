// Shared Kernel - Types
// Common types shared between domain, application, and infrastructure

export interface MaterialCalculado {
  codigo: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  costoTotal: number;
}

export interface ResultadoCalculo {
  materiales: MaterialCalculado[];
  costoTotalMateriales: number;
  resumen: Record<string, string>;
}