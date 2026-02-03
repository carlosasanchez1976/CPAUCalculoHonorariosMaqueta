import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../utils/constants';
import Spinner from '../components/common/Spinner';

/**
 * Componente ProtectedRoute
 * Protege rutas que requieren autenticación
 * Redirige a login si no está autenticado
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Si está autenticado, mostrar el componente hijo
  return children;
};

export default ProtectedRoute;
