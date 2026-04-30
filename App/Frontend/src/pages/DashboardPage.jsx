import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import { ROUTES } from '../utils/constants';
import styles from './DashboardPage.module.css';

/**
 * Página Dashboard
 * Pantalla principal con las opciones de navegación
 */
const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.twoColumnLayout}>
            
            {/* COLUMNA 1 - Texto de Bienvenida */}
            <div className={styles.welcomeSection}>
              <p className={styles.welcomeTitle}>
                Bienvenido/a a la Calculadora de Honorarios del CPAU.
              </p>
              <p className={styles.welcomeTitle}>
                Esta herramienta permite estimar de manera orientativa los 
                honorarios profesionales, en base a los sugeridos por el MEPAU.
              </p>
              <p className={styles.welcomeTitle}>
                Su objetivo es brindar una guía clara para acompañar el 
                ejercicio profesional.
              </p>
            </div>

            {/* COLUMNA 2 - Card Único */}
            <div className={styles.cardSection}>
              <Card
                title="Nuevo cálculo"
                title2="de honorarios"
                description="Genera un nuevo proyecto para cálculo de honorarios profesionales"
                icon={<img src="/assets/icons/calculadora.svg" alt="Calculadora" style={{ width: '60px', height: '60px' }} />}
                onClick={() => navigate(ROUTES.NUEVO_CALCULO)}
              />
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
