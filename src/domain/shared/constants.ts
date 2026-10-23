// Shared Kernel - Constants
// Fixed values used across the calculation domain

export const PESO_BOLSA_CEMENTERO = 42.5; // kg por bolsa (estándar en Bolivia)

export const DEFAULT_DESEMPAQUE = 5; // % desperdicio por defecto
export const DEFAULT_CUARTAS_SOCIALES = 55; // %
export const DEFAULT_GASTOS_GENERALES = 15; // %
export const DEFAULT_UTILIDAD = 10; // %
export const DEFAULT_IMPUESTO_IT = 3.09; // %

export const FACTORES_DESPERDICIO = {
  // Desperdicio por tipo de material (ej. para bloques, acero, etc.)
  bloque: 5, // 5% por defecto
  concreto: 5, // 5% por defecto
  acero: 5, // 5% por defecto
  mortero: 5, // 5% por defecto
};