import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalculationTypeCard from '../components/common/CalculationTypeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { obtenerTareasProfesionales } from '../services/tareasProfesionalesService';
import styles from './NuevoCalculoPage.module.css';

/**
 * Página de selección de tipo de cálculo de honorarios
 */
const NuevoCalculoPage = () => {
  const navigate = useNavigate();


  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarTareas = async () => {
      try {
        setLoading(true);
        setError(null);
        const tareasAPI = await obtenerTareasProfesionales();
        setTareas(tareasAPI);
      } catch (err) {
        setError('No se pudieron cargar las tareas profesionales.');
      } finally {
        setLoading(false);
      }
    };
    cargarTareas();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/dashboard')}
            aria-label="Volver al panel"
          >
            <FaArrowLeft className={styles.backIcon} />
            <span>Volver al panel</span>
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Nuevo cálculo de honorarios</h1>
            <p className={styles.subtitle}>
              Seleccione la tarea profesional para la cual desea realizar el cálculo de honorarios.
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
              <span className={styles.errorMessage}>{error}</span>
              <button className={styles.retryButton} onClick={() => window.location.reload()}>Reintentar</button>
            </div>
          )}
          {!loading && !error && (
            <div className={styles.cardsGrid}>
              {tareas.map((tarea) => (
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
