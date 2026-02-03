import { createContext, useContext, useState, useEffect } from 'react';
import { VALID_CREDENTIALS, STORAGE_KEYS } from '../utils/constants';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

/**
 * Provider del contexto de autenticación
 * Maneja el estado de autenticación y persistencia en localStorage
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión existente al cargar la aplicación
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (savedSession) {
        const userData = JSON.parse(savedSession);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Función de login
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @param {boolean} remember - Si debe recordar la sesión
   * @returns {Object} - {success: boolean, message: string}
   */
  const login = (username, password, remember = false) => {
    try {
      // Validar credenciales
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        const userData = { username };
        
        // Guardar usuario en estado
        setUser(userData);
        setIsAuthenticated(true);

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(userData));
        
        // Guardar preferencia de "recordarme"
        if (remember) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBER);
        }

        return { success: true, message: 'Login exitoso' };
      } else {
        return { success: false, message: 'Usuario o contraseña incorrectos' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  };

  /**
   * Función de logout
   * Limpia el estado y localStorage
   */
  const logout = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      
      // Mantener la preferencia de "recordarme" si existía
      // pero limpiar la sesión actual
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  /**
   * Verificar si tiene la opción "recordarme" activada
   * @returns {boolean}
   */
  const hasRememberMe = () => {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRememberMe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación
 * @returns {Object} - Contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
