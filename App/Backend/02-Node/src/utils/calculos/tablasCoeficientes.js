/**
 * Tablas de coeficientes para cálculo de honorarios CPAU
 * Tipo de Cálculo: Honorarios de Especialidades - Básico
 * 
 * ⚠️ CONFIDENCIAL: Este archivo contiene datos propietarios del CPAU
 * Solo debe ejecutarse en servidor, NUNCA en navegador del cliente
 * 
 * @version 2.0.0 - SPEC-CALC-001: Coeficientes diferenciados por tipo de instalación
 * @see {@link ../../../../../../01-Docs/00-Specs/SPEC-CALC-001-Coeficientes-Instalaciones-Diferenciados.md}
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

// ============================================================================
// COEFICIENTES DIFERENCIADOS POR INSTALACIÓN (CPAU 2026 - SPEC-CALC-001)
// ============================================================================

/**
 * Coeficientes para Instalación Sanitaria/Gas e Instalación Eléctrica
 * NOTA: Ambas tareas comparten los mismos coeficientes según CPAU 2026
 * Porcentaje: 100%
 * 
 * @constant
 * @type {Object}
 */
export const COEFICIENTES_SANITARIA_ELECTRICA = {
  rangoA: { obra: 0.0040, k: 0 },  // Hasta 0.5k
  rangoB: { obra: 0.0014, k: 0 },  // 0.5k a 5k
  rangoC: { obra: 0.0012, k: 0 },  // 5k a 25k
  rangoD: { obra: 0.0005, k: 0 }   // Más de 25k
};

/**
 * Coeficientes para Instalación Contra Incendio
 * Porcentaje: 100%
 * 
 * @constant
 * @type {Object}
 */
export const COEFICIENTES_INCENDIO = {
  rangoA: { obra: 0.0010, k: 0 },  // Hasta 0.5k
  rangoB: { obra: 0.0007, k: 0 },  // 0.5k a 5k
  rangoC: { obra: 0.0006, k: 0 },  // 5k a 25k
  rangoD: { obra: 0.00025, k: 0 }  // Más de 25k
};

/**
 * Coeficientes para Instalación Termomecánica
 * Porcentaje: 100%
 * 
 * @constant
 * @type {Object}
 */
export const COEFICIENTES_TERMOMECANICA = {
  rangoA: { obra: 0.0010, k: 0 },  // Hasta 0.5k
  rangoB: { obra: 0.0007, k: 0 },  // 0.5k a 5k
  rangoC: { obra: 0.0006, k: 0 },  // 5k a 25k
  rangoD: { obra: 0.00025, k: 0 }  // Más de 25k
};

/**
 * Coeficientes para Proyecto de Estructuras
 * Porcentaje: 100%
 */
export const COEFICIENTES_ESTRUCTURAS = {
  rangoA: { obra: 0.0060, k: 0 },
  rangoB: { obra: 0.0028, k: 0 },
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
 * ⚠️ CONFIDENCIAL: Este valor debe actualizarse según legislación vigente
 */
export const VALOR_K_DEFAULT = 574813607.00;
