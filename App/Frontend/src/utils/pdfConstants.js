/**
 * Constantes de texto para el PDF de Honorarios Profesionales
 * Página 2: Notas institucionales CPAU
 * 
 * @fileoverview Textos fijos definidos por el cliente CPAU para el entregable PDF
 * @version 1.0
 * @date 28/05/2026
 */

export const PDF_NOTAS = {
  alcance: {
    titulo: 'Alcance y carácter del cálculo',
    contenido: `La presente calculadora de honorarios profesionales sugeridos, de carácter orientativo, calculado a partir de las variables ingresadas (tipo de obra, superficie, costo estimado por m2, alcance del encargo, entre otros), con el objetivo de obtener un honorario equitativo.

El monto resultante podrá pactarse como honorario fijo o ajustable según lo que acuerden las partes.
Tanto el cambio en el alcance de las tareas profesionales encomendadas, como cualquiera de las variables ingresadas habilita la revisión de los honorarios originalmente pactados.`
  },
  
  costo: {
    titulo: 'Costo de obra considerado',
    contenido: `El costo de obra por m2 utilizado en el cálculo constituye una estimación consensuada entre profesional y comitente. El CPAU publica mensualmente índices de referencia de costos de construcción, elaborados por distintos organismos y/o medios, disponibles en la web institucional, quedando a criterio del/la profesional y del comitente seleccionar el valor que consideren adecuado.`
  },

  etapas: {
    titulo: 'Etapas del proyecto',
    items: [
      { etapa: 'Croquis preliminar', porcentaje: '10%' },
      { etapa: 'Anteproyecto', porcentaje: '15%' },
      { etapa: 'Proyecto básico', porcentaje: '15%' },
      { etapa: 'Documentación licitatoria', porcentaje: '20%' },
      { etapa: 'Total proyecto', porcentaje: '60%' },
      { etapa: 'Dirección de obra', porcentaje: '40%' }
    ],
    nota: 'A fin de conocer el contenido y alcance de cada una de las etapas del proyecto, se recomienda consultar el MEPAU.'
  },

  alcanceHonorarios: {
    titulo: 'Alcance de los honorarios sugeridos',
    contenido: `Los honorarios resultantes de esta calculadora contemplan las tareas profesionales correspondientes a un encargo ordinario, de acuerdo con los alcances definidos por la normativa y usos profesionales vigentes, ver MEPAU.
Para los encargos de Proyecto y Dirección, las tareas profesionales vinculadas al interiorismo, equipamiento no edilicio, mobiliario, iluminación, cortinas u otros elementos no habituales en una propiedad vacía del mercado inmobiliario no están incluidas y requerirán honorarios adicionales a pactar.
Se recomienda a los profesionales acompañar la encomienda con el detalle de tareas, la modalidad de prestación y la lista de documentos entregables, pudiendo indicarse también su modo de ejecución (AutoCAD, BIM), a fin de clarificar el alcance del encargo y evitar confusiones.`
  },

  noIncluidos: {
    titulo: 'Conceptos no incluidos en los honorarios',
    contenido: `IVA, en caso de corresponder.
Gestión municipal, derechos de construcción y/o cualquier tipo de gravámenes, tasas o derechos.
Cálculo estructural, salvo el caso que se encuentre específicamente agregado al cálculo realizado.
Proyecto de instalaciones, salvo el caso que se encuentren específicamente agregados al cálculo realizado.
Documentación y planos comerciales, renders, maquetas, etc.
Cualquier otro concepto que no esté expresado en el cálculo.`
  },

  resolucion: {
    titulo: 'Resolución de los honorarios',
    contenido: `En caso de que alguna de las partes decida no continuar con la totalidad del encargo, deberán abonarse los honorarios de las tareas efectivamente realizadas según lo acordado por las partes, y considerando las etapas de proyecto previamente mencionadas en este documento.
En caso de rescisión unilateral por parte del comitente, se deberá convenir un resarcimiento en favor del profesional por las tareas encomendadas y no ejecutadas, de acuerdo a la normativa vigente.

Para ampliar la información consultar al MEPAU, capítulo 02 Honorarios, o ponerse en contacto con tecnica@cpau.org`
  }
};
