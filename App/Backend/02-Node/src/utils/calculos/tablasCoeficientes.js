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
// ============================================================================
// FUNCIONES AUXILIARES (SPEC-CALC-002)
// ============================================================================

/**
 * Calcula los límites en pesos de cada rango según el valor K vigente
 * 
 * Los rangos están definidos por el coeficiente K (valorObra / valorK):
 * - Rango A: coefK < 0.5  → límites: [0, 0.5 × valorK)
 * - Rango B: 0.5 ≤ coefK < 5  → límites: [0.5 × valorK, 5 × valorK)
 * - Rango C: 5 ≤ coefK < 25  → límites: [5 × valorK, 25 × valorK)
 * - Rango D: coefK ≥ 25  → límites: [25 × valorK, ∞)
 * 
 * @param {number} valorK - Índice CPAU actualizado (ej: 574.813.607)
 * @returns {Object} Objeto con límites inferior/superior por rango en pesos (ARS)
 * @throws {Error} Si valorK no es un número positivo mayor a 0
 * 
 * @example
 * const limites = calcularLimitesRangos(574813607);
 * // {
 * //   rangoA: { inferior: 0, superior: 287406803.5 },
 * //   rangoB: { inferior: 287406803.5, superior: 2874068035 },
 * //   rangoC: { inferior: 2874068035, superior: 14370340175 },
 * //   rangoD: { inferior: 14370340175, superior: 9007199254740991 }
 * // }
 * 
 * @see {@link ../../../../../../01-Docs/00-Specs/SPEC-CALC-002-Arrastre-Coeficientes-Progresivo.md}
 */
export function calcularLimitesRangos(valorK) {
  // Validación de parámetro
  if (!valorK || typeof valorK !== 'number' || valorK <= 0) {
    throw new Error('valorK debe ser un número positivo mayor a 0');
  }
  
  // Multiplicadores según normativa CPAU
  // Rango A: hasta 0.5k (obras pequeñas)
  // Rango B: entre 0.5k y 5k (obras medianas)
  // Rango C: entre 5k y 25k (obras grandes)
  // Rango D: más de 25k (obras muy grandes)
  const limiteA = 0.5 * valorK;   // 0.5 × K
  const limiteB = 5 * valorK;     // 5 × K
  const limiteC = 25 * valorK;    // 25 × K
  
  return {
    rangoA: {
      inferior: 0,
      superior: limiteA
    },
    rangoB: {
      inferior: limiteA,
      superior: limiteB
    },
    rangoC: {
      inferior: limiteB,
      superior: limiteC
    },
    rangoD: {
      inferior: limiteC,
      superior: Number.MAX_SAFE_INTEGER  // Infinity práctica (9.007.199.254.740.991)
    }
  };
}