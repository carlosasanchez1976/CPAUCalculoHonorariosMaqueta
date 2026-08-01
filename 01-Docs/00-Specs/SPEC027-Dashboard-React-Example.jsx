// ============================================================================
// EJEMPLO DE COMPONENTE DASHBOARD - REACT + RECHARTS
// ============================================================================
// Este es un ejemplo completo de cómo consumir el endpoint de dashboard
// y renderizar los gráficos con Recharts.
//
// INSTALACIÓN:
// npm install recharts date-fns
//
// O con pnpm:
// pnpm add recharts date-fns
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './Dashboard.css';

// ============================================================================
// SERVICIO DE API
// ============================================================================

const getDashboard = async (fechaDesde = null, fechaHasta = null) => {
  // En desarrollo, usar mock
  if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
    const mockData = await import('./SPEC027-Response-Example.json');
    return new Promise(resolve => setTimeout(() => resolve(mockData.default), 500));
  }

  // En producción, llamar al endpoint real
  const params = new URLSearchParams();
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);

  const response = await fetch(`/api/calculos/dashboard?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar dashboard');
  }

  return response.json();
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Cargar datos al montar y cuando cambian las fechas
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboard(fechaDesde || null, fechaHasta || null);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError('Error al cargar datos');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    fetchDashboard();
  };

  // Estados de loading y error
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>⚠️ Error al cargar el dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboard}>Reintentar</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="dashboard-container">
      <h1>Dashboard de Cálculos CPAU</h1>
      
      {/* Filtros de fecha */}
      <FiltrosFecha
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
        onFiltrar={handleFiltrar}
        periodo={data.periodo}
      />

      {/* Resumen (tarjetas) */}
      <ResumenCards resumen={data.resumen} />

      {/* Gráficos */}
      <div className="dashboard-charts">
        <div className="chart-section">
          <h2>Evolución Temporal</h2>
          <SerieTemporalChart data={data.serieTemporal} />
        </div>

        <div className="chart-row">
          <div className="chart-section chart-half">
            <h2>Distribución por Tarea</h2>
            <DistribucionTareasChart data={data.distribucionTareas} />
          </div>

          <div className="chart-section chart-half">
            <h2>Distribución de Puntajes</h2>
            <DistribucionPuntajesChart data={data.distribucionPuntajes} />
          </div>
        </div>

        <div className="chart-section">
          <h2>Top 5 Usuarios Más Activos</h2>
          <TopUsuariosTable usuarios={data.topUsuarios} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENTES
// ============================================================================

// Filtros de fecha
const FiltrosFecha = ({ fechaDesde, fechaHasta, onFechaDesdeChange, onFechaHastaChange, onFiltrar, periodo }) => (
  <div className="filtros-fecha">
    <div className="periodo-actual">
      <strong>Período actual:</strong> {periodo.desde} a {periodo.hasta}
    </div>
    <form onSubmit={onFiltrar} className="filtros-form">
      <div className="form-group">
        <label>Desde:</label>
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => onFechaDesdeChange(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Hasta:</label>
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => onFechaHastaChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      <button type="submit">Filtrar</button>
      <button type="button" onClick={() => {
        onFechaDesdeChange('');
        onFechaHastaChange('');
      }}>
        Últimos 30 días
      </button>
    </form>
  </div>
);

// Tarjetas de resumen
const ResumenCards = ({ resumen }) => (
  <div className="resumen-cards">
    <Card
      titulo="Usuarios Nuevos"
      valor={resumen.totalUsuariosNuevos}
      icono="👤"
      color="#00a8e8"
    />
    <Card
      titulo="Cálculos Nuevos"
      valor={resumen.totalCalculosNuevos}
      icono="📊"
      color="#0077b6"
    />
    <Card
      titulo="Usuarios Activos"
      valor={resumen.usuariosActivos}
      icono="✅"
      color="#06d6a0"
    />
    <Card
      titulo="Promedio Puntaje"
      valor={resumen.promedioPuntaje ? `${resumen.promedioPuntaje.toFixed(1)} / 5.0` : 'N/A'}
      icono="⭐"
      color="#ffd60a"
    />
    <Card
      titulo="Valor Promedio Obra"
      valor={formatCurrency(resumen.valorPromedioObra)}
      icono="💰"
      color="#118ab2"
      small
    />
    <Card
      titulo="Evaluaciones"
      valor={`${resumen.totalCalculosConPuntaje} cálculos`}
      icono="📝"
      color="#073b4c"
      small
    />
  </div>
);

const Card = ({ titulo, valor, icono, color, small }) => (
  <div className="metric-card" style={{ borderTopColor: color }}>
    <div className="card-icon" style={{ backgroundColor: color }}>{icono}</div>
    <div className="card-content">
      <h3>{titulo}</h3>
      <p className={small ? 'small' : ''}>{valor}</p>
    </div>
  </div>
);

// Gráfico de serie temporal (líneas)
const SerieTemporalChart = ({ data }) => {
  // Formatear datos para Recharts
  const chartData = data.map(item => ({
    fecha: format(parseISO(item.fecha), 'dd/MM', { locale: es }),
    fechaCompleta: format(parseISO(item.fecha), 'dd MMM yyyy', { locale: es }),
    usuarios: item.usuariosNuevos,
    calculos: item.calculosNuevos
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="fecha" 
          tick={{ fontSize: 12 }}
          interval={Math.floor(chartData.length / 10)} // Mostrar solo algunas etiquetas
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(value, payload) => payload[0]?.payload?.fechaCompleta}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="usuarios" 
          stroke="#00a8e8" 
          name="Usuarios Nuevos"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line 
          type="monotone" 
          dataKey="calculos" 
          stroke="#0077b6" 
          name="Cálculos Nuevos"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Gráfico de distribución de tareas (torta)
const DistribucionTareasChart = ({ data }) => {
  const COLORS = ['#00a8e8', '#0077b6', '#06d6a0', '#ffd60a', '#ff9f1c', '#ef476f', '#8338ec'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ tareaCodigo, porcentaje }) => `${tareaCodigo} (${porcentaje.toFixed(1)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="totalCalculos"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [
            `${value} cálculos (${props.payload.porcentaje.toFixed(1)}%)`,
            props.payload.tareaDescripcion
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Gráfico de distribución de puntajes (barras)
const DistribucionPuntajesChart = ({ data }) => {
  const PUNTAJE_COLORS = {
    1: '#ef476f',
    2: '#ff9f1c',
    3: '#ffd60a',
    4: '#06d6a0',
    5: '#118ab2'
  };

  const chartData = data.map(item => ({
    ...item,
    puntajeLabel: `⭐ ${item.puntaje}`,
    fill: PUNTAJE_COLORS[item.puntaje]
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="puntajeLabel" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="cantidad" name="Cantidad">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Tabla de top usuarios
const TopUsuariosTable = ({ usuarios }) => (
  <div className="top-usuarios-table">
    <table>
      <thead>
        <tr>
          <th>Posición</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Total Cálculos</th>
          <th>Última Actividad</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario, index) => (
          <tr key={usuario.usuarioId}>
            <td className="posicion">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `#${index + 1}`}
            </td>
            <td>{usuario.nombreCompleto}</td>
            <td>{usuario.email}</td>
            <td className="total-calculos">{usuario.totalCalculos}</td>
            <td>
              {format(parseISO(usuario.ultimaActividad), "dd/MM/yyyy HH:mm", { locale: es })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================================================
// UTILIDADES
// ============================================================================

const formatCurrency = (value) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default Dashboard;
