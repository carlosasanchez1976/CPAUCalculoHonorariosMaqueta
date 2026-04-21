/**
 * Vercel Serverless Function - Calcular Honorarios
 * Endpoint: POST /api/v1/honorarios/calcular
 * 
 * SPEC-CALC-002: Sistema Progresivo de Honorarios
 * @version 2.0.0
 */

// ============================================================================
// CONSTANTES Y TABLAS DE COEFICIENTES (SPEC-CALC-001 + SPEC-CALC-002)
// ============================================================================

const COEFICIENTES_PROYECTO_DIRECCION = {
  rangoA: { obra: 0.14, k: 0 },
  rangoB: { obra: 0.08, k: 0.03 },
  rangoC: { obra: 0.06, k: 0.13 },
  rangoD: { obra: 0.04, k: 0.63 }
};

const COEFICIENTES_SANITARIA_ELECTRICA = {
  rangoA: { obra: 0.0040, k: 0 },
  rangoB: { obra: 0.0014, k: 0 },
  rangoC: { obra: 0.0012, k: 0 },
  rangoD: { obra: 0.0005, k: 0 }
};

const COEFICIENTES_INCENDIO = {
  rangoA: { obra: 0.0010, k: 0 },
  rangoB: { obra: 0.0007, k: 0 },
  rangoC: { obra: 0.0006, k: 0 },
  rangoD: { obra: 0.00025, k: 0 }
};

const COEFICIENTES_TERMOMECANICA = {
  rangoA: { obra: 0.0010, k: 0 },
  rangoB: { obra: 0.0007, k: 0 },
  rangoC: { obra: 0.0006, k: 0 },
  rangoD: { obra: 0.00025, k: 0 }
};

const COEFICIENTES_ESTRUCTURAS = {
  rangoA: { obra: 0.0060, k: 0 },
  rangoB: { obra: 0.0028, k: 0 },
  rangoC: { obra: 0.0021, k: 0 },
  rangoD: { obra: 0.0016, k: 0 }
};

const PORCENTAJES_TAREA = {
  proyectoObra: 0.6,
  direccionObra: 0.4,
  instalaciones: 1.0,
  estructuras: 1.0
};

const NOMBRES_RANGO = {
  rangoA: 'A',
  rangoB: 'B',
  rangoC: 'C',
  rangoD: 'D'
};

const VALOR_K_DEFAULT = 574813607.00; // CPAU 2026

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
// FUNCIONES DE CÁLCULO PROGRESIVO
// ============================================================================

function calcularLimitesRangos(valorK) {
  if (!valorK || typeof valorK !== 'number' || valorK <= 0) {
    throw new Error('valorK debe ser un número positivo mayor a 0');
  }
  
  const limiteA = 0.5 * valorK;
  const limiteB = 5 * valorK;
  const limiteC = 25 * valorK;
  
  return {
    rangoA: { inferior: 0, superior: limiteA },
    rangoB: { inferior: limiteA, superior: limiteB },
    rangoC: { inferior: limiteB, superior: limiteC },
    rangoD: { inferior: limiteC, superior: Number.MAX_SAFE_INTEGER }
  };
}

function determinarRango(coeficienteK) {
  if (coeficienteK < 0.5) return 'rangoA';
  if (coeficienteK < 5) return 'rangoB';
  if (coeficienteK < 25) return 'rangoC';
  return 'rangoD';
}

function formatearPorcentaje(coeficiente) {
  const porcentaje = coeficiente * 100;
  
  if (Number.isInteger(porcentaje)) {
    return `${porcentaje}%`;
  }
  
  return `${porcentaje.toFixed(2).replace(/\.?0+$/, '')}%`;
}

function procesarTareaProgresiva(items, nombreTarea, coeficientes, limites, valorObra, valorK, porcentajeTarea, rangoFinal) {
  const rangos = ['rangoA', 'rangoB', 'rangoC', 'rangoD'];
  
  for (const rango of rangos) {
    const limInferior = limites[rango].inferior;
    const limSuperior = limites[rango].superior;
    
    const limSupEfectivo = valorObra > limSuperior ? limSuperior : valorObra;
    
    if (limSupEfectivo <= limInferior) {
      break;
    }
    
    const montoAfectado = limSupEfectivo - limInferior;
    const coef = coeficientes[rango];
    const nombreRango = NOMBRES_RANGO[rango];
    
    if (coef.obra > 0) {
      const importeObra = Math.round(coef.obra * montoAfectado * porcentajeTarea);
      
      items.push({
        tareaProfesional: nombreTarea,
        descripcion: `Rango ${nombreRango} (coef ${formatearPorcentaje(coef.obra)})`,
        importe: importeObra
      });
    }
    
    if (coef.k > 0 && rango === rangoFinal) {
      const importeK = Math.round(coef.k * valorK * porcentajeTarea);
      
      items.push({
        tareaProfesional: nombreTarea,
        descripcion: `Rango ${nombreRango} (coef K ${formatearPorcentaje(coef.k)})`,
        importe: importeK
      });
    }
    
    if (valorObra <= limSuperior) {
      break;
    }
  }
}

function calcularHonorariosProgresivo(formData, valorK = VALOR_K_DEFAULT) {
  const valorObra = formData?.valorObra || 0;
  
  if (valorObra <= 0 || !valorK || valorK <= 0) {
    return [];
  }
  
  const tareas = formData || {};
  
  if (!Object.values(tareas).some(t => t === true)) {
    return [];
  }
  
  const limites = calcularLimitesRangos(valorK);
  const coeficienteK = valorObra / valorK;
  const rangoFinal = determinarRango(coeficienteK);
  
  const items = [];
  
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
  
  return items;
}

function extraerRangosAfectados(detalleHonorarios) {
  const rangos = new Set();
  
  for (const item of detalleHonorarios) {
    const match = item.descripcion.match(/Rango ([A-D])/);
    if (match) {
      rangos.add(match[1]);
    }
  }
  
  return Array.from(rangos).sort();
}

// ============================================================================
// VERCEL HANDLER
// ============================================================================

module.exports = async function handler(req, res) {
  // CORS Headers
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'https://ch2026-qa.neosisweb.ar'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST Handler
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido',
      message: 'Solo se acepta POST',
      method: req.method
    });
  }

  try {
    const datosCompletos = req.body;

    if (!datosCompletos || typeof datosCompletos !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'El body debe contener los datos del cálculo'
      });
    }

    const { tipoCalculo, datosObra, tareasProfesionales } = datosCompletos;

    if (!tipoCalculo) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: tipoCalculo'
      });
    }

    if (!datosObra || !datosObra.valorObra) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: datosObra.valorObra'
      });
    }

    if (!tareasProfesionales) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: tareasProfesionales'
      });
    }

    // Preparar datos para el cálculo progresivo
    const formData = {
      valorObra: datosObra.valorObra,
      superficie: datosObra.superficie,
      tipologia: datosObra.tipologia,
      complejidad: datosObra.complejidad,
      ...tareasProfesionales
    };

    // Obtener valor K
    const valorK = datosCompletos.parametros?.valorK || 
                  process.env.VALOR_K_DEFAULT || 
                  VALOR_K_DEFAULT;

    // ========================================================================
    // EJECUTAR CÁLCULO PROGRESIVO (SPEC-CALC-002)
    // ========================================================================

    const detalleHonorarios = calcularHonorariosProgresivo(formData, valorK);
    
    const totalHonorarios = detalleHonorarios.reduce(
      (sum, item) => sum + item.importe, 
      0
    );
    
    const coeficienteK = datosObra.valorObra / valorK;
    const rangoFinal = determinarRango(coeficienteK);
    const rangosAfectados = extraerRangosAfectados(detalleHonorarios);
    const limitesRangos = calcularLimitesRangos(valorK);

    // Generar respuesta
    const calculoId = `calc_${Date.now()}`;
    const fechaCalculo = new Date().toISOString();

    const resultado = {
      calculoId,
      tipoCalculo,
      fechaCalculo,
      resultado: {
        detalleHonorarios,
        totalHonorarios,
        metadata: {
          valorK,
          coeficienteK: parseFloat(coeficienteK.toFixed(4)),
          rangoFinal: NOMBRES_RANGO[rangoFinal],
          rangosAfectados,
          numeroItems: detalleHonorarios.length,
          limitesRangos: {
            rangoA: {
              inferior: limitesRangos.rangoA.inferior,
              superior: Math.round(limitesRangos.rangoA.superior)
            },
            rangoB: {
              inferior: Math.round(limitesRangos.rangoB.inferior),
              superior: Math.round(limitesRangos.rangoB.superior)
            },
            rangoC: {
              inferior: Math.round(limitesRangos.rangoC.inferior),
              superior: Math.round(limitesRangos.rangoC.superior)
            },
            rangoD: {
              inferior: Math.round(limitesRangos.rangoD.inferior),
              superior: limitesRangos.rangoD.superior
            }
          }
        }
      }
    };

    if (datosCompletos.datosProyecto) {
      resultado.datosProyecto = {
        nombre: datosCompletos.datosProyecto.nombre,
        ubicacion: datosCompletos.datosProyecto.ubicacion,
        cliente: datosCompletos.datosProyecto.cliente
      };
    }

    console.log('✅ Cálculo progresivo completado:', {
      calculoId,
      tipoCalculo,
      valorObra: datosObra.valorObra,
      totalHonorarios,
      rangoFinal: NOMBRES_RANGO[rangoFinal],
      rangosAfectados,
      numeroItems: detalleHonorarios.length
    });

    return res.status(200).json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Error en calcular honorarios:', error);

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error procesando el cálculo'
    });
  }
};
/**
 * Vercel Serverless Function - Calcular Honorarios
 * Endpoint: POST /api/v1/honorarios/calcular
 */

// ============================================================================
// CONSTANTES Y TABLAS DE COEFICIENTES
// ============================================================================

const COEFICIENTES_PROYECTO_DIRECCION = {
  rangoA: { obra: 0.14, k: 0 },
  rangoB: { obra: 0.08, k: 0.03 },
  rangoC: { obra: 0.06, k: 0.13 },
  rangoD: { obra: 0.04, k: 0.63 }
};

const COEFICIENTES_INSTALACIONES = {
  rangoA: { obra: 0.0023, k: 0 },
  rangoB: { obra: 0.0012, k: 0 },
  rangoC: { obra: 0.0008, k: 0 },
  rangoD: { obra: 0.0004, k: 0 }
};

const COEFICIENTES_ESTRUCTURAS = {
  rangoA: { obra: 0.0030, k: 0 },
  rangoB: { obra: 0.0026, k: 0 },
  rangoC: { obra: 0.0021, k: 0 },
  rangoD: { obra: 0.0016, k: 0 }
};

const PORCENTAJES_TAREA = {
  proyectoObra: 0.6,
  direccionObra: 0.4,
  instalaciones: 1.0,
  estructuras: 1.0
};

const NOMBRES_RANGO = {
  rangoA: 'A',
  rangoB: 'B',
  rangoC: 'C',
  rangoD: 'D'
};

const VALOR_K_DEFAULT = 522181756.33;

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

function determinarRango(rangoCostoDeObra) {
  if (rangoCostoDeObra < 0.5) return 'rangoA';
  if (rangoCostoDeObra < 5) return 'rangoB';
  if (rangoCostoDeObra < 25) return 'rangoC';
  return 'rangoD';
}

function formatearPorcentaje(coeficiente) {
  return `${(coeficiente * 100).toFixed(2)}%`.replace('.00%', '%');
}

function agregarItemsTarea(items, tareaProfesional, coeficientes, nombreRango, valorObra, valorK, porcentajeTarea) {
  const { obra: coefRangoObra, k: coefRangoK } = coeficientes;
  
  if (coefRangoObra > 0) {
    items.push({
      item: items.length + 1,
      tareaProfesional,
      descripcion: `Rango de Costos de Obra ${nombreRango} (coef ${formatearPorcentaje(coefRangoObra)})`,
      importe: coefRangoObra * valorObra * porcentajeTarea
    });
  }
  
  if (coefRangoK > 0) {
    items.push({
      item: items.length + 1,
      tareaProfesional,
      descripcion: `Rango de Costos de Obra ${nombreRango} (coef K ${formatearPorcentaje(coefRangoK)})`,
      importe: coefRangoK * valorK * porcentajeTarea
    });
  }
}

function agruparItemsPorTarea(items) {
  if (!Array.isArray(items) || items.length === 0) return items;
  
  const gruposPorTarea = {};
  
  items.forEach(item => {
    const tarea = item.tareaProfesional;
    
    if (!gruposPorTarea[tarea]) {
      gruposPorTarea[tarea] = {
        tareaProfesional: tarea,
        descripciones: [],
        importeTotal: 0
      };
    }
    
    gruposPorTarea[tarea].descripciones.push(item.descripcion);
    gruposPorTarea[tarea].importeTotal += item.importe;
  });
  
  const itemsAgrupados = Object.values(gruposPorTarea).map((grupo, index) => ({
    item: index + 1,
    tareaProfesional: grupo.tareaProfesional,
    descripcion: grupo.descripciones.join(' // '),
    importe: grupo.importeTotal
  }));
  
  return itemsAgrupados;
}

function calcularHonorariosBasico(formData, valorK = VALOR_K_DEFAULT) {
  const items = [];
  
  if (!formData.valorObra || formData.valorObra <= 0) {
    console.warn('valorObra no válido:', formData.valorObra);
    return items;
  }
  
  if (!valorK || valorK <= 0) {
    valorK = VALOR_K_DEFAULT;
  }
  
  const rangoCostoDeObra = formData.valorObra / valorK;
  const rango = determinarRango(rangoCostoDeObra);
  const nombreRango = NOMBRES_RANGO[rango];
  
  console.log('Cálculo de Honorarios Básico:', {
    valorObra: formData.valorObra,
    valorK,
    rangoCostoDeObra: rangoCostoDeObra.toFixed(4),
    rango: nombreRango
  });
  
  if (formData.obraProyecto) {
    agregarItemsTarea(items, 'Proyecto de Obra', COEFICIENTES_PROYECTO_DIRECCION[rango], nombreRango, formData.valorObra, valorK, PORCENTAJES_TAREA.proyectoObra);
  }
  
  if (formData.obraDireccion) {
    agregarItemsTarea(items, 'Dirección de Obra', COEFICIENTES_PROYECTO_DIRECCION[rango], nombreRango, formData.valorObra, valorK, PORCENTAJES_TAREA.direccionObra);
  }
  
  if (formData.instalacionSanitaria) {
    agregarItemsTarea(items, 'Proyecto de Instalación Sanitaria', COEFICIENTES_INSTALACIONES[rango], nombreRango, formData.valorObra, valorK, PORCENTAJES_TAREA.instalaciones);
  }
  
  if (formData.instalacionElectrica) {
    agregarItemsTarea(items, 'Proyecto de Instalación Eléctrica', COEFICIENTES_INSTALACIONES[rango], nombreRango, formData.valorObra, valorK, PORCENTAJES_TAREA.instalaciones);
  }
  
  if (formData.instalacionContraIncendio) {
    agregarItemsTarea(items, 'Proyecto de Instalación contra Incendios', COEFICIENTES_INSTALACIONES[rango], nombreRango, formData.valorObra, valorK, PORCENTAJES_TAREA.instalaciones);
  }
  
  if (formData.proyectoEstructuras) {
    agregarItemsTarea(items, 'Proyecto de Estructuras', COEFICIENTES_ESTRUCTURAS[rango], nombreRango, formData.valorObra, valorK, PORCENTAJES_TAREA.estructuras);
  }
  
  const itemsAgrupados = agruparItemsPorTarea(items);
  return itemsAgrupados;
}

function calcularTotalHonorarios(detalleHonorarios) {
  if (!Array.isArray(detalleHonorarios)) return 0;
  return detalleHonorarios.reduce((sum, item) => sum + (item.importe || 0), 0);
}

function obtenerMetadataCalculo(formData, valorK = VALOR_K_DEFAULT) {
  const rangoCostoDeObra = formData.valorObra / valorK;
  const rango = determinarRango(rangoCostoDeObra);
  const nombreRango = NOMBRES_RANGO[rango];
  
  return {
    rango: nombreRango,
    valorK,
    rangoCostoObra: parseFloat(rangoCostoDeObra.toFixed(4))
  };
}

// ============================================================================
// VERCEL HANDLER
// ============================================================================

module.exports = async function handler(req, res) {
  // CORS Headers
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'https://ch2026-qa.neosisweb.ar'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST Handler
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido',
      message: 'Solo se acepta POST',
      method: req.method
    });
  }

  try {
    const datosCompletos = req.body;

    if (!datosCompletos || typeof datosCompletos !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'El body debe contener los datos del cálculo'
      });
    }

    const { tipoCalculo, datosObra, tareasProfesionales } = datosCompletos;

    if (!tipoCalculo) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: tipoCalculo'
      });
    }

    if (!datosObra || !datosObra.valorObra) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: datosObra.valorObra'
      });
    }

    if (!tareasProfesionales) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: tareasProfesionales'
      });
    }

    // Preparar datos para el cálculo
    const formData = {
      valorObra: datosObra.valorObra,
      superficie: datosObra.superficie,
      tipologia: datosObra.tipologia,
      complejidad: datosObra.complejidad,
      ...tareasProfesionales
    };

    // Obtener valor K
    const valorK = datosCompletos.parametros?.valorK || process.env.VALOR_K_DEFAULT || VALOR_K_DEFAULT;

    // Ejecutar cálculo
    const detalleHonorarios = calcularHonorariosBasico(formData, valorK);
    const totalHonorarios = calcularTotalHonorarios(detalleHonorarios);
    const metadata = obtenerMetadataCalculo(formData, valorK);

    // Generar respuesta
    const calculoId = `calc_${Date.now()}`;
    const fechaCalculo = new Date().toISOString();

    const resultado = {
      calculoId,
      tipoCalculo,
      fechaCalculo,
      resultado: {
        detalleHonorarios,
        totalHonorarios,
        metadata: {
          ...metadata,
          numeroItems: detalleHonorarios.length
        }
      }
    };

    if (datosCompletos.datosProyecto) {
      resultado.datosProyecto = {
        nombre: datosCompletos.datosProyecto.nombre,
        ubicacion: datosCompletos.datosProyecto.ubicacion,
        cliente: datosCompletos.datosProyecto.cliente
      };
    }

    console.log('✅ Cálculo completado:', {
      calculoId,
      tipoCalculo,
      valorObra: datosObra.valorObra,
      totalHonorarios,
      rango: metadata.rango,
      numeroItems: detalleHonorarios.length
    });

    return res.status(200).json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Error en calcular honorarios:', error);

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error procesando el cálculo'
    });
  }
};
