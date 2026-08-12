/**
 * Datos de prueba para tests de SPEC030
 */

module.exports = {
  // Errores SQL típicos
  sqlErrors: {
    connectionError: {
      code: 'ECONNREFUSED',
      errno: 1045,
      sqlState: 'HY000',
      sqlMessage: 'Access denied for user'
    },
    
    syntaxError: {
      code: 'ER_PARSE_ERROR',
      errno: 1064,
      sqlState: '42000',
      sqlMessage: "You have an error in your SQL syntax"
    },
    
    constraintViolation: {
      code: 'ER_DUP_ENTRY',
      errno: 1062,
      sqlState: '23000',
      sqlMessage: "Duplicate entry 'test' for key 'PRIMARY'"
    },
    
    tableNotFound: {
      code: 'ER_NO_SUCH_TABLE',
      errno: 1146,
      sqlState: '42S02',
      sqlMessage: "Table 'db.nonexistent' doesn't exist"
    }
  },
  
  // Payloads válidos para endpoints
  validPayloads: {
    calcular: {
      tareaId: 1,
      tareaCodi: 'PYDOA',
      datosObra: {
        valorObra: 1000000
      },
      tareasProfesionales: {
        proyecto: true,
        direccion: false
      }
    },
    
    login: {
      username_web: 'test@example.com',
      idmatricula: 12345,
      user_nombre_web: 'Juan',
      user_apellido_web: 'Pérez'
    },
    
    adminTemplateUpdate: {
      html: '<html><body>{{profesional.nombre}}</body></html>'
    }
  },
  
  // Payloads inválidos
  invalidPayloads: {
    calcularSinTareaId: {
      datosObra: { valorObra: 1000000 }
    },
    
    calcularConTareaIdInvalida: {
      tareaId: 'abc',
      datosObra: { valorObra: 1000000 }
    },
    
    calcularSinValorObra: {
      tareaId: 1,
      tareaCodi: 'PYDOA',
      datosObra: {},
      tareasProfesionales: { proyecto: true }
    },
    
    loginSinCampos: {
      username_web: 'test@example.com'
    },
    
    loginConIdMatriculaInvalida: {
      username_web: 'test@example.com',
      idmatricula: 'abc',
      user_nombre_web: 'Juan',
      user_apellido_web: 'Pérez'
    },
    
    adminTemplateHtmlVacio: {
      html: ''
    },
    
    adminTemplateHtmlGrande: {
      html: 'x'.repeat(600 * 1024) // 600 KB
    }
  },
  
  // Respuestas mock de DB
  mockDbResponses: {
    usuarioActivo: {
      user_id: 1,
      user_mail: 'test@example.com',
      user_nombre: 'Juan',
      user_apellido: 'Pérez',
      rol: 'USER',
      baja_fecha: null
    },
    
    usuarioInactivo: {
      user_id: 2,
      user_mail: 'inactive@example.com',
      user_nombre: 'Pedro',
      user_apellido: 'López',
      rol: 'USER',
      baja_fecha: new Date('2025-01-01')
    },
    
    tareaProfesional: {
      tarea_id: 1,
      codi: 'PYDOA',
      descripcion: 'Proyecto y Dirección de Obra de Arquitectura',
      vigente: true
    },
    
    calculoGuardado: {
      calculo_id: 123,
      tarea_id: 1,
      honorarios_total: 50000,
      fecha_creacion: new Date()
    },
    
    tycVigente: {
      tyc_id: 1,
      version: '1.0',
      contenido_md: '# Términos y Condiciones',
      vigente: true,
      fecha_vigencia: new Date()
    }
  }
};
