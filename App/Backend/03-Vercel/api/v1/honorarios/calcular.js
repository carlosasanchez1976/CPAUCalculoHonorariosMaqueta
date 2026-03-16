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
