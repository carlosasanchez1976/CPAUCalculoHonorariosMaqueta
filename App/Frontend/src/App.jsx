import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ParametrosProvider } from './contexts/ParametrosContext';
import { CacheProvider } from './contexts/CacheContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NuevoCalculoPage from './pages/NuevoCalculoPage';
import ProcesoCalculoPage from './pages/ProcesoCalculoPage';
import PreferenciasPage from './pages/PreferenciasPage';
import MiCuentaPage from './pages/MiCuentaPage';
import ParametrosPage from './pages/ParametrosPage';
import { ROUTES } from './utils/constants';
import './styles/fonts.css';
import './styles/variables.css';

/**
 * Componente principal de la aplicación CH2026
 * Configura el routing y los providers
 */
function App() {
  return (
    <AuthProvider>
      <CacheProvider>
        <ParametrosProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
          <Routes>
            {/* Ruta pública - Login */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          {/* Ruta raíz - Redirige a Dashboard */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            } 
          />

          {/* Rutas protegidas */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.NUEVO_CALCULO}
            element={
              <ProtectedRoute>
                <NuevoCalculoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proceso-calculo"
            element={
              <ProtectedRoute>
                <ProcesoCalculoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.PREFERENCIAS}
            element={
              <ProtectedRoute>
                <PreferenciasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.PARAMETROS}
            element={
              <ProtectedRoute>
                <ParametrosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.MI_CUENTA}
            element={
              <ProtectedRoute>
                <MiCuentaPage />
              </ProtectedRoute>
            }
          />

          {/* Ruta 404 - Página no encontrada */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <Navigate to={ROUTES.DASHBOARD} replace />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
        </ParametrosProvider>
      </CacheProvider>
    </AuthProvider>
  );
}

export default App;
