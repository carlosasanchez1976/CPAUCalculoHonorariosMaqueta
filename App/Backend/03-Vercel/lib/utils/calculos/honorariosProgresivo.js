/**
 * Algoritmo de cálculo de honorarios CPAU - Sistema Progresivo
 * SPEC-CALC-002: Arrastre de coeficientes entre rangos
 * 
 * ⚠️ CONFIDENCIAL: Este archivo contiene lógica propietaria del CPAU
 * Solo debe ejecutarse en servidor, NUNCA en navegador del cliente
 * 
 * @module honorariosProgresivo
 * @version 1.0.0
 * @since 2026-04-20
 * @author Backend Team - CH2026
 */

import {
  COEFICIENTES_PROYECTO_DIRECCION,
  COEFICIENTES_SANITARIA_ELECTRICA,
  COEFICIENTES_INCENDIO,
  COEFICIENTES_TERMOMECANICA,
  COEFICIENTES_ESTRUCTURAS,
  PORCENTAJES_TAREA,
  NOMBRES_RANGO,
  VALOR_K_DEFAULT,
  calcularLimitesRangos
} from './tablasCoeficientes.js';

// ============================================================================
// CONFIGURACIÓN DE TAREAS
// ============================================================================

/**
 * Configuración de todas las tareas profesionales soportadas
 * Centraliza la definición de tareas para evitar código duplicado
 * @private
 * @constant
 */
const CONFIGURACION_TAREAS = [
  {
    clave: 'obraProyecto',
    nombre: 'Proyecto de obra de arquitectura',
    coeficientes: COEFICIENTES_PROYECTO_DIRECCION,
    porcentaje: PORCENTAJES_TAREA.proyectoObra
  },
  {
    clave: 'obraDireccion',
    nombre: 'Dirección de obra de arquitectura',
    coeficientes: COEFICIENTES_PROYECTO_DIRECCION,
    porcentaje: PORCENTAJES_TAREA.direccionObra
  },
  {
    clave: 'instalacionSanitaria',
    nombre: 'Instalación Sanitaria',
    coeficientes: COEFICIENTES_SANITARIA_ELECTRICA,
    porcentaje: PORCENTAJES_TAREA.instalaciones
  },
  {
    clave: 'instalacionElectrica',
    nombre: 'Instalación Eléctrica',
    coeficientes: COEFICIENTES_SANITARIA_ELECTRICA,
    porcentaje: PORCENTAJES_TAREA.instalaciones
  },
  {
    clave: 'instalacionContraIncendio',
    nombre: 'Instalación Contra Incendio',
    coeficientes: COEFICIENTES_INCENDIO,
    porcentaje: PORCENTAJES_TAREA.instalaciones
  },
  {
    clave: 'instalacionTermomecanica',
    nombre: 'Instalación Termomecánica',
    coeficientes: COEFICIENTES_TERMOMECANICA,
    porcentaje: PORCENTAJES_TAREA.instalaciones
  },
  {
    clave: 'proyectoEstructuras',
    nombre: 'Proyecto de Estructuras',
    coeficientes: COEFICIENTES_ESTRUCTURAS,
    porcentaje: PORCENTAJES_TAREA.estructuras
  }
];

// ============================================================================
// FUNCIONES AUXILIARES PRIVADAS
// ============================================================================

/**
 * Determina el rango de costo de obra según la relación valorObra/valorK
 * 
 * @private
 * @param {number} coeficienteK - Relación valorObra / valorK
 * @returns {string} 'rangoA' | 'rangoB' | 'rangoC' | 'rangoD'
 */
function determinarRango(coeficienteK) {
  if (coeficienteK < 0.5) return 'rangoA';
  if (coeficienteK < 5) return 'rangoB';
  if (coeficienteK < 25) return 'rangoC';
  return 'rangoD';
}

/**
 * Formatea el porcentaje para descripción
 * 
 * @private
 * @param {number} coeficiente - Coeficiente decimal (ej: 0.14)
 * @returns {string} Porcentaje formateado (ej: "14%")
 */
function formatearPorcentaje(coeficiente) {
  const porcentaje = coeficiente * 100;
  
  // Si es entero, mostrar sin decimales
  if (Number.isInteger(porcentaje)) {
    return `${porcentaje}%`;
  }
  
  // Si tiene decimales, mostrar hasta 2 decimales (eliminando ceros innecesarios)
  return `${porcentaje.toFixed(2).replace(/\.?0+$/, '')}%`;
}

/**
 * Procesa una tarea profesional de forma progresiva por rangos
 * 
 * Itera por cada rango afectado y calcula el importe correspondiente
 * según el monto que cae dentro de cada rango. Aplica early-return
 * cuando la obra no alcanza rangos superiores.
 * 
 * @private
 * @param {Array<Object>} items - Array de ítems acumulados (mutable)
 * @param {string} nombreTarea - Nombre de la tarea profesional
 * @param {Object} coeficientes - Coeficientes por rango { rangoA, rangoB, rangoC, rangoD }
 * @param {Object} limites - Límites de rangos en pesos
 * @param {number} valorObra - Valor total de la obra en ARS
 * @param {number} valorK - Valor índice K
 * @param {number} porcentajeTarea - Porcentaje de la tarea (0.6, 0.4, 1.0)
 * @param {string} rangoFinal - Rango final donde cae la obra ('rangoA', 'rangoB', 'rangoC', 'rangoD')
 */
function procesarTareaProgresiva(
  items,
  nombreTarea,
  coeficientes,
  limites,
  valorObra,
  valorK,
  porcentajeTarea,
  rangoFinal
) {
  const rangos = ['rangoA', 'rangoB', 'rangoC', 'rangoD'];
  
  for (const rango of rangos) {
    const limInferior = limites[rango].inferior;
    const limSuperior = limites[rango].superior;
    
    // Determinar límite superior efectivo
    // Si la obra supera el límite superior del rango, usar el límite
    // Si la obra está dentro del rango, usar el valorObra
    const limSupEfectivo = valorObra > limSuperior ? limSuperior : valorObra;
    
    // Solo procesar si la obra alcanza este rango
    if (limSupEfectivo <= limInferior) {
      // Early return: si no llegamos ni al inicio de este rango,
      // tampoco llegaremos a rangos superiores
      break;
    }
    
    const montoAfectado = limSupEfectivo - limInferior;
    const coef = coeficientes[rango];
    const nombreRango = NOMBRES_RANGO[rango];
    
    // Agregar ítem de coeficiente obra (si existe)
    if (coef.obra > 0) {
      const importeObra = Math.round(coef.obra * montoAfectado * porcentajeTarea);
      
      items.push({
        tareaProfesional: nombreTarea,
        descripcion: `Rango ${nombreRango} (coef ${formatearPorcentaje(coef.obra)})`,
        importe: importeObra
      });
    }
    
    // Agregar ítem de coeficiente K (solo en rango final)
    if (coef.k > 0 && rango === rangoFinal) {
      const importeK = Math.round(coef.k * valorK * porcentajeTarea);
      
      items.push({
        tareaProfesional: nombreTarea,
        descripcion: `Rango ${nombreRango} (coef K ${formatearPorcentaje(coef.k)})`,
        importe: importeK
      });
    }
    
    // Si no llegamos al límite superior, no seguir a rangos superiores
    if (valorObra <= limSuperior) {
      break;
    }
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL EXPORTADA
// ============================================================================

/**
 * Calcula honorarios con sistema progresivo escalonado
 * 
 * A diferencia del sistema plano (honorariosBasico.js), este algoritmo
 * calcula los honorarios aplicando los coeficientes de forma progresiva:
 * cada tramo del valor de obra paga el coeficiente de su rango correspondiente.
 * 
 * Similar al sistema impositivo por escalas.
 * 
 * Algoritmo:
 * 1. Calcula límites de rangos en pesos según valorK
 * 2. Determina el rango final donde cae la obra (A/B/C/D)
 * 3. Itera por cada rango afectado (desde A hasta rangoFinal)
 * 4. Para cada rango, calcula el monto afectado y aplica coeficientes
 * 5. Genera ítems por rango (coef obra + coef K solo en rangoFinal)
 * 
 * @public
 * @param {Object} formData - Datos del formulario completo
 * @param {number} formData.valorObra - Valor total de la obra en ARS
 * @param {Object} formData.tareas - Objeto con tareas seleccionadas
 * @param {boolean} [formData.tareas.obraProyecto] - ¿Realiza Proyecto de Obra? (60%)
 * @param {boolean} [formData.tareas.obraDireccion] - ¿Realiza Dirección de Obra? (40%)
 * @param {boolean} [formData.tareas.instalacionSanitaria] - ¿Realiza Instalación Sanitaria? (100%)
 * @param {boolean} [formData.tareas.instalacionElectrica] - ¿Realiza Instalación Eléctrica? (100%)
 * @param {boolean} [formData.tareas.instalacionContraIncendio] - ¿Realiza Instalación Contra Incendio? (100%)
 * @param {boolean} [formData.tareas.instalacionTermomecanica] - ¿Realiza Instalación Termomecánica? (100%)
 * @param {boolean} [formData.tareas.proyectoEstructuras] - ¿Realiza Proyecto de Estructuras? (100%)
 * @param {number} [valorK=VALOR_K_DEFAULT] - Valor K desde parámetros (índice CPAU actualizado)
 * @returns {Array<Object>} Array de ítems de honorarios (múltiples por tarea si atraviesa rangos)
 * @returns {string} return[].tareaProfesional - Nombre de la tarea profesional
 * @returns {string} return[].descripcion - Descripción del ítem (Rango X, coeficiente Y%)
 * @returns {number} return[].importe - Importe en ARS (redondeado)
 * 
 * @example
 * // Caso simple: obra en Rango B
 * const formData = {
 *   valorObra: 1692000000,
 *   tareas: {
 *     obraProyecto: true
 *   }
 * };
 * const resultado = calcularHonorariosProgresivo(formData, 574813607);
 * // [
 * //   { tareaProfesional: "Proyecto...", descripcion: "Rango A (coef 14%)", importe: 24142171 },
 * //   { tareaProfesional: "Proyecto...", descripcion: "Rango B (coef 8%)", importe: 67420473 },
 * //   { tareaProfesional: "Proyecto...", descripcion: "Rango B (coef K 3%)", importe: 10346645 }
 * // ]
 * 
 * @example
 * // Validación: retorna [] si valorObra es inválido
 * calcularHonorariosProgresivo({ valorObra: 0, tareas: {} }, 574813607); // []
 * calcularHonorariosProgresivo({ valorObra: -100, tareas: {} }, 574813607); // []
 * calcularHonorariosProgresivo({ valorObra: 1000000, tareas: {} }, 574813607); // [] (sin tareas)
 */
export function calcularHonorariosProgresivo(formData, valorK = VALOR_K_DEFAULT) {
  // 1. VALIDACIONES
  const valorObra = formData?.valorObra || 0;
  
  if (valorObra <= 0 || !valorK || valorK <= 0) {
    return [];
  }
  
  const tareas = formData?.tareas || {};
  
  // Si no hay tareas seleccionadas, retornar vacío
  if (!Object.values(tareas).some(t => t === true)) {
    return [];
  }
  
  // 2. CALCULAR LÍMITES DE RANGOS EN PESOS
  const limites = calcularLimitesRangos(valorK);
  
  // 3. DETERMINAR RANGO FINAL (para saber dónde aplicar coef K)
  const coeficienteK = valorObra / valorK;
  const rangoFinal = determinarRango(coeficienteK);
  
  // 4. INICIALIZAR ARRAY DE ITEMS
  const items = [];
  
  // 5. PROCESAR CADA TAREA PROFESIONAL SELECCIONADA
  // Itera sobre la configuración de tareas para evitar código duplicado
  for (const tarea of CONFIGURACION_TAREAS) {
    if (tareas[tarea.clave]) {
      procesarTareaProgresiva(
        items,
        tarea.nombre,
        tarea.coeficientes,
        limites,
        valorObra,
        valorK,
        tarea.porcentaje,
        rangoFinal
      );
    }
  }
  
  // 6. RETORNAR ARRAY DE ÍTEMS
  return items;
}
