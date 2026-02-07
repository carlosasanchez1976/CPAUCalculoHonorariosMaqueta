import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Context para gestión de parámetros generales del sistema
 * MODO MAQUETA: Sin persistencia, solo memoria durante la sesión
 */
const ParametrosContext = createContext();

/**
 * Hook personalizado para usar el contexto de parámetros
 */
export const useParametros = () => {
  const context = useContext(ParametrosContext);
  if (!context) {
    throw new Error('useParametros debe usarse dentro de ParametrosProvider');
  }
  return context;
};

/**
 * Parámetros iniciales hardcodeados
 */
const PARAMETROS_INICIALES = [
  {
    id: 1,
    nombre: 'validarUsuarioCPAU',
    tipo: 'toggle',
    valor: true,
    descripcion: 'Validar usuario con la base del CPAU'
  },
  {
    id: 2,
    nombre: 'valorK',
    tipo: 'number',
    valor: 522181756.33,
    descripcion: 'Valor índice de referencia cálculo de Honorarios CPAU'
  },
  {
    id: 3,
    nombre: 'limpiarMemoria',
    tipo: 'toggle',
    valor: true,
    descripcion: 'Limpiar memoria al ingresar a la aplicación'
  }
];

/**
 * Provider del contexto de parámetros
 */
export const ParametrosProvider = ({ children }) => {
  const [parametros, setParametros] = useState(PARAMETROS_INICIALES);

  /**
   * Obtener un parámetro por nombre
   */
  const getParametro = (nombre) => {
    const parametro = parametros.find(p => p.nombre === nombre);
    return parametro ? parametro.valor : null;
  };

  /**
   * Obtener un parámetro por ID
   */
  const getParametroById = (id) => {
    return parametros.find(p => p.id === id);
  };

  /**
   * Actualizar el valor de un parámetro
   */
  const updateParametro = (id, nuevoValor) => {
    setParametros(prevParametros =>
      prevParametros.map(p =>
        p.id === id ? { ...p, valor: nuevoValor } : p
      )
    );
  };

  /**
   * Resetear todos los parámetros a valores iniciales
   */
  const resetParametros = () => {
    setParametros(PARAMETROS_INICIALES);
  };

  /**
   * Obtener todos los parámetros
   */
  const getAllParametros = () => {
    return parametros;
  };

  const value = {
    parametros,
    getParametro,
    getParametroById,
    updateParametro,
    resetParametros,
    getAllParametros
  };

  return (
    <ParametrosContext.Provider value={value}>
      {children}
    </ParametrosContext.Provider>
  );
};

ParametrosProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ParametrosContext;
