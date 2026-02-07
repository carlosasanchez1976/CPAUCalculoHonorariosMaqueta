/**
 * Tablas de coeficientes para cálculo de honorarios CPAU
 * Tipo de Cálculo: Honorarios de Especialidades - Básico
 */

/**
 * Coeficientes para Proyecto de Obra y Dirección de Obra
 * Porcentajes: Proyecto = 60%, Dirección = 40%
 */
export const COEFICIENTES_PROYECTO_DIRECCION = {
  rangoA: { obra: 0.14, k: 0 },
  rangoB: { obra: 0.08, k: 0.03 },
  rangoC: { obra: 0.06, k: 0.13 },
  rangoD: { obra: 0.04, k: 0.63 }
};

/**
 * Coeficientes para Instalaciones (Sanitaria, Eléctrica, Contra Incendio)
 * Porcentaje: 100%
 */
export const COEFICIENTES_INSTALACIONES = {
  rangoA: { obra: 0.0023, k: 0 },
  rangoB: { obra: 0.0012, k: 0 },
  rangoC: { obra: 0.0008, k: 0 },
  rangoD: { obra: 0.0004, k: 0 }
};

/**
 * Coeficientes para Proyecto de Estructuras
 * Porcentaje: 100%
 */
export const COEFICIENTES_ESTRUCTURAS = {
  rangoA: { obra: 0.0030, k: 0 },
  rangoB: { obra: 0.0026, k: 0 },
  rangoC: { obra: 0.0021, k: 0 },
  rangoD: { obra: 0.0016, k: 0 }
};

/**
 * Porcentajes de tarea
 */
export const PORCENTAJES_TAREA = {
  proyectoObra: 0.6,
  direccionObra: 0.4,
  instalaciones: 1.0,
  estructuras: 1.0
};

/**
 * Nombres de rangos de costo
 */
export const NOMBRES_RANGO = {
  rangoA: 'A',
  rangoB: 'B',
  rangoC: 'C',
  rangoD: 'D'
};

/**
 * Valor K por defecto (CPAU)
 */
export const VALOR_K_DEFAULT = 522181756.33;
