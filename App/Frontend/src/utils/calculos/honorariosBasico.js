import {
  COEFICIENTES_PROYECTO_DIRECCION,
  COEFICIENTES_INSTALACIONES,
  COEFICIENTES_ESTRUCTURAS,
  PORCENTAJES_TAREA,
  NOMBRES_RANGO,
  VALOR_K_DEFAULT
} from './tablasCoeficientes';

/**
 * Determina el rango de costo de obra según la relación valorObra/valorK
 * @param {number} rangoCostoDeObra - Relación valorObra / valorK
 * @returns {string} 'rangoA' | 'rangoB' | 'rangoC' | 'rangoD'
 */
function determinarRango(rangoCostoDeObra) {
  if (rangoCostoDeObra < 0.5) return 'rangoA';
  if (rangoCostoDeObra < 5) return 'rangoB';
  if (rangoCostoDeObra < 25) return 'rangoC';
  return 'rangoD';
}

/**
 * Formatea el porcentaje para descripción
 * @param {number} coeficiente - Coeficiente decimal (ej: 0.14)
 * @returns {string} Porcentaje formateado (ej: "14%")
 */
function formatearPorcentaje(coeficiente) {
  return `${(coeficiente * 100).toFixed(2)}%`.replace('.00%', '%');
}

/**
 * Agrega ítems de honorarios para una tarea profesional
 * @param {Array} items - Array de ítems acumulados
 * @param {string} tareaProfesional - Nombre de la tarea
 * @param {Object} coeficientes - Objeto con coefRangoObra y coefRangoK
 * @param {string} nombreRango - Nombre del rango (A, B, C, D)
 * @param {number} valorObra - Valor de la obra en ARS
 * @param {number} valorK - Valor índice K
 * @param {number} porcentajeTarea - Porcentaje de la tarea (0.6, 0.4, 1.0)
 * @returns {number} Nuevo contador de ítems
 */
function agregarItemsTarea(items, tareaProfesional, coeficientes, nombreRango, valorObra, valorK, porcentajeTarea) {
  const { obra: coefRangoObra, k: coefRangoK } = coeficientes;
  
  // Agregar ítem por coeficiente de obra (si existe)
  if (coefRangoObra > 0) {
    items.push({
      item: items.length + 1,
      tareaProfesional,
      descripcion: `Rango de Costos de Obra ${nombreRango} (coef ${formatearPorcentaje(coefRangoObra)})`,
      importe: coefRangoObra * valorObra * porcentajeTarea
    });
  }
  
  // Agregar ítem por coeficiente K (si existe)
  if (coefRangoK > 0) {
    items.push({
      item: items.length + 1,
      tareaProfesional,
      descripcion: `Rango de Costos de Obra ${nombreRango} (coef K ${formatearPorcentaje(coefRangoK)})`,
      importe: coefRangoK * valorK * porcentajeTarea
    });
  }
}

/**
 * Calcula honorarios para tipo Básico según especificaciones CPAU
 * @param {Object} formData - Datos del formulario completo
 * @param {number} formData.valorObra - Valor total de la obra en ARS
 * @param {boolean} formData.obraProyecto - ¿Realiza Proyecto de Obra?
 * @param {boolean} formData.obraDireccion - ¿Realiza Dirección de Obra?
 * @param {boolean} formData.instalacionSanitaria - ¿Realiza Instalación Sanitaria?
 * @param {boolean} formData.instalacionElectrica - ¿Realiza Instalación Eléctrica?
 * @param {boolean} formData.instalacionContraIncendio - ¿Realiza Instalación Contra Incendio?
 * @param {boolean} formData.proyectoEstructuras - ¿Realiza Proyecto de Estructuras?
 * @param {number} valorK - Valor K desde parámetros (default: 522181756.33)
 * @returns {Array<Object>} Array de ítems de honorarios
 */
export function calcularHonorariosBasico(formData, valorK = VALOR_K_DEFAULT) {
  const items = [];
  
  // Validar datos de entrada
  if (!formData.valorObra || formData.valorObra <= 0) {
    console.warn('valorObra no válido:', formData.valorObra);
    return items;
  }
  
  if (!valorK || valorK <= 0) {
    console.warn('valorK no válido, usando default:', VALOR_K_DEFAULT);
    valorK = VALOR_K_DEFAULT;
  }
  
  // PASO 1: Calcular rango de costo de obra
  const rangoCostoDeObra = formData.valorObra / valorK;
  const rango = determinarRango(rangoCostoDeObra);
  const nombreRango = NOMBRES_RANGO[rango];
  
  console.log('Cálculo de Honorarios Básico:', {
    valorObra: formData.valorObra,
    valorK,
    rangoCostoDeObra: rangoCostoDeObra.toFixed(4),
    rango: nombreRango
  });
  
  // PASO 2: Generar ítems según tareas seleccionadas
  
  // 2.1 - Proyecto de Obra
  if (formData.obraProyecto) {
    agregarItemsTarea(
      items,
      'Proyecto de Obra',
      COEFICIENTES_PROYECTO_DIRECCION[rango],
      nombreRango,
      formData.valorObra,
      valorK,
      PORCENTAJES_TAREA.proyectoObra
    );
  }
  
  // 2.2 - Dirección de Obra
  if (formData.obraDireccion) {
    agregarItemsTarea(
      items,
      'Dirección de Obra',
      COEFICIENTES_PROYECTO_DIRECCION[rango],
      nombreRango,
      formData.valorObra,
      valorK,
      PORCENTAJES_TAREA.direccionObra
    );
  }
  
  // 2.3 - Instalación Sanitaria
  if (formData.instalacionSanitaria) {
    agregarItemsTarea(
      items,
      'Proyecto de Instalación Sanitaria',
      COEFICIENTES_INSTALACIONES[rango],
      nombreRango,
      formData.valorObra,
      valorK,
      PORCENTAJES_TAREA.instalaciones
    );
  }
  
  // 2.4 - Instalación Eléctrica
  if (formData.instalacionElectrica) {
    agregarItemsTarea(
      items,
      'Proyecto de Instalación Eléctrica',
      COEFICIENTES_INSTALACIONES[rango],
      nombreRango,
      formData.valorObra,
      valorK,
      PORCENTAJES_TAREA.instalaciones
    );
  }
  
  // 2.5 - Instalación Contra Incendio
  if (formData.instalacionContraIncendio) {
    agregarItemsTarea(
      items,
      'Proyecto de Instalación contra Incendios',
      COEFICIENTES_INSTALACIONES[rango],
      nombreRango,
      formData.valorObra,
      valorK,
      PORCENTAJES_TAREA.instalaciones
    );
  }
  
  // 2.6 - Proyecto de Estructuras
  if (formData.proyectoEstructuras) {
    agregarItemsTarea(
      items,
      'Proyecto de Estructuras',
      COEFICIENTES_ESTRUCTURAS[rango],
      nombreRango,
      formData.valorObra,
      valorK,
      PORCENTAJES_TAREA.estructuras
    );
  }
  
  console.log(`Total de ítems generados: ${items.length}`);
  console.log('Detalle de honorarios:', items);
  
  return items;
}

/**
 * Calcula el total de honorarios sumando todos los importes
 * @param {Array<Object>} detalleHonorarios - Array de ítems de honorarios
 * @returns {number} Total de honorarios en ARS
 */
export function calcularTotalHonorarios(detalleHonorarios) {
  if (!Array.isArray(detalleHonorarios)) return 0;
  return detalleHonorarios.reduce((sum, item) => sum + (item.importe || 0), 0);
}
