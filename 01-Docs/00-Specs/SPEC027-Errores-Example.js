// ============================================================================
// EJEMPLOS DE ERRORES - ENDPOINT /api/calculos/dashboard
// ============================================================================
// Estos son los posibles errores que el endpoint puede retornar.
// Úsenlos para manejar casos de error en el frontend.
// ============================================================================

// ----------------------------------------------------------------------------
// ERROR 400: Formato de fecha inválido
// ----------------------------------------------------------------------------
/*
{
  "success": false,
  "error": "Formato de fecha inválido. Use YYYY-MM-DD",
  "version": "1.0"
}

// Request que causaría este error:
// GET /api/calculos/dashboard?fechaDesde=31/07/2026


// ----------------------------------------------------------------------------
// ERROR 400: Rango de fechas excede 1 año
// ----------------------------------------------------------------------------
{
  "success": false,
  "error": "Rango de fechas excede el máximo permitido de 1 año",
  "version": "1.0"
}

// Request que causaría este error:
// GET /api/calculos/dashboard?fechaDesde=2024-01-01&fechaHasta=2026-07-31


// ----------------------------------------------------------------------------
// ERROR 400: fechaHasta en el futuro
// ----------------------------------------------------------------------------
{
  "success": false,
  "error": "fechaHasta no puede ser mayor a la fecha actual",
  "version": "1.0"
}

// Request que causaría este error:
// GET /api/calculos/dashboard?fechaHasta=2027-12-31


// ----------------------------------------------------------------------------
// ERROR 400: fechaDesde > fechaHasta (fechas invertidas)
// ----------------------------------------------------------------------------
{
  "success": false,
  "error": "fechaDesde no puede ser mayor a fechaHasta",
  "version": "1.0"
}

// Request que causaría este error:
// GET /api/calculos/dashboard?fechaDesde=2026-07-31&fechaHasta=2026-07-01


// ----------------------------------------------------------------------------
// ERROR 401: Token JWT faltante o inválido
// ----------------------------------------------------------------------------
{
  "success": false,
  "error": "Token de autenticación inválido o expirado",
  "version": "1.0"
}

// Request que causaría este error:
// GET /api/calculos/dashboard
// (sin header Authorization)


// ----------------------------------------------------------------------------
// ERROR 500: Error interno del servidor
// ----------------------------------------------------------------------------
{
  "success": false,
  "error": "Error interno del servidor. Por favor contacte al administrador.",
  "version": "1.0"
}

// Este error puede ocurrir por:
// - Error en la base de datos
// - Stored procedure no encontrado
// - Timeout de consulta
// - Error en el código del backend

*/

// ============================================================================
// MANEJO DE ERRORES EN FRONTEND - EJEMPLO CON AXIOS
// ============================================================================

/*
import axios from 'axios';

export const getDashboard = async (fechaDesde, fechaHasta) => {
  try {
    const response = await axios.get('/api/calculos/dashboard', {
      params: { fechaDesde, fechaHasta },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
    
  } catch (error) {
    // Verificar si es un error de respuesta HTTP
    if (error.response) {
      const { status, data } = error.response;
      
      // Errores de validación (400)
      if (status === 400) {
        throw new Error(data.error || 'Parámetros inválidos');
      }
      
      // Error de autenticación (401)
      if (status === 401) {
        // Redirigir al login
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      
      // Error interno del servidor (500)
      if (status === 500) {
        throw new Error('Error del servidor. Intente nuevamente en unos minutos.');
      }
    }
    
    // Error de red (sin respuesta del servidor)
    if (error.request) {
      throw new Error('No se pudo conectar al servidor. Verifique su conexión a internet.');
    }
    
    // Otro tipo de error
    throw new Error('Error inesperado al cargar el dashboard');
  }
};
*/


// ============================================================================
// MANEJO DE ERRORES EN FRONTEND - EJEMPLO CON REACT
// ============================================================================

/*
import React, { useState, useEffect } from 'react';
import { getDashboard } from '../services/dashboardService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getDashboard(null, null); // Últimos 30 días
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Error desconocido');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Cargando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error al cargar el dashboard</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      { Renderizar gráficos con data }
    </div>
  );
};
*/


// ============================================================================
// VALIDACIÓN FRONTEND (ANTES DE LLAMAR AL ENDPOINT)
// ============================================================================

/*
const validarFechas = (fechaDesde, fechaHasta) => {
  // Validar formato ISO 8601
  const regexISO = /^\d{4}-\d{2}-\d{2}$/;
  
  if (fechaDesde && !regexISO.test(fechaDesde)) {
    return 'fechaDesde debe estar en formato YYYY-MM-DD';
  }
  
  if (fechaHasta && !regexISO.test(fechaHasta)) {
    return 'fechaHasta debe estar en formato YYYY-MM-DD';
  }
  
  // Validar rango máximo de 1 año
  if (fechaDesde && fechaHasta) {
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    const diffDias = (hasta - desde) / (1000 * 60 * 60 * 24);
    
    if (diffDias > 365) {
      return 'El rango no puede ser mayor a 1 año';
    }
    
    if (diffDias < 0) {
      return 'fechaDesde no puede ser mayor a fechaHasta';
    }
  }
  
  // Validar que fechaHasta no sea futura
  if (fechaHasta) {
    const hasta = new Date(fechaHasta);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (hasta > hoy) {
      return 'fechaHasta no puede ser mayor a la fecha actual';
    }
  }
  
  return null; // Sin errores
};

// Uso:
const error = validarFechas('2026-07-01', '2026-07-31');
if (error) {
  alert(error);
  return;
}
*/
