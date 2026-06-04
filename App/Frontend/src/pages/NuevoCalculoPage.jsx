import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalculationTypeCard from '../components/common/CalculationTypeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApiCache } from '../hooks/useApiCache';
import { obtenerTareasProfesionales } from '../services/tareasProfesionalesService';
import { CACHE_TTL } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { ajustarVigenciaPorRol } from '../utils/tareasHelper';
import styles from './NuevoCalculoPage.module.css';

/**
 * Página de selección de tipo de cálculo de honorarios
 */
const NuevoCalculoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Usar hook de caché para tareas profesionales
  const { 
    data: tareas, 
    loading, 
    error,
    refresh 
  } = useApiCache(
    'tareas_profesionales',           // Cache key único
    obtenerTareasProfesionales,       // Función de fetch
    { 
      ttl: CACHE_TTL.TAREAS_PROFESIONALES,  // 10 minutos
      onError: (err) => {
        console.error('Error al cargar tareas:', err);
      }
    }
  );

  // ============================================================================
  // CAPA INTERMEDIA PARA TESTING - Ajuste de vigencia por rol de usuario
  // ============================================================================
  // Ajusta el campo "vigente" de cada tarea según el rol del usuario.
  // Para roles con permisos especiales (ej: admin), fuerza vigente=1 en tareas
  // configuradas en TAREAS_A_VALID_POR_ROL, removiendo el badge "EN CONSTRUCCIÓN"
  // y habilitando la funcionalidad para pruebas.
  // Ver documentación en: src/utils/tareasHelper.js
  const tareasAjustadas = tareas 
    ? ajustarVigenciaPorRol(tareas, user?.role).sort((a, b) => {
        // Ordenar por vigente (descendente) y luego por descripción (alfabético)
        if (b.vigente !== a.vigente) {
          return b.vigente - a.vigente; // Vigentes primero
        }
        return a.descripcion.localeCompare(b.descripcion); // Orden alfabético
      })
    : [];

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          {/* <button 
            className={styles.backButton}
            onClick={() => navigate('/dashboard')}
            aria-label="Volver al panel"
          >
            <FaArrowLeft className={styles.backIcon} />
            <span>Volver al panel</span>
          </button> */}
          

          <div className={styles.header}>
            <h1 className={styles.title}>Nuevo cálculo de honorarios</h1>
            <p className={styles.subtitle}>
              Seleccioná la tarea profesional para la cual deseás realizar el cálculo de honorarios.
            </p>
          </div>

          {loading && (
            <div className={styles.loadingContainer}>
              <LoadingSpinner 
                size="lg"
                variant="spinner"
                message="Cargando tareas profesionales..."
              />
            </div>
          )}
          {error && (
            <div className={styles.errorContainer}>
              <span className={styles.errorMessage}>
                {typeof error === 'string' ? error : 'No se pudieron cargar las tareas profesionales.'}
              </span>
              <button className={styles.retryButton} onClick={refresh}>Reintentar</button>
            </div>
          )}
          {!loading && !error && tareasAjustadas && tareasAjustadas.length > 0 && (
            <div className={styles.cardsGrid}>
              {tareasAjustadas.map((tarea) => (
                <CalculationTypeCard
                  key={tarea.tarea_id}
                  tareaId={tarea.tarea_id}
                  codi={tarea.codi}
                  title={tarea.descripcion}
                  fullDescription={tarea.descripcion_larga}
                  iconUrl={tarea.iconUrl}
                  path="/proceso-calculo"
                  vigente={tarea.vigente}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NuevoCalculoPage;
