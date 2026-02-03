import { useNavigate } from 'react-router-dom';
import { FaListAlt } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import styles from './PlaceholderPage.module.css';

/**
 * Página: Cálculos Realizados
 * Placeholder - En desarrollo
 */
const CalculosRealizadosPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.placeholderCard}>
            <div className={styles.placeholderIcon}>
              <FaListAlt />
            </div>
            <h2 className={styles.pageTitle}>Cálculos Realizados</h2>
            <p className={styles.pageSubtitle}>Página en desarrollo</p>
            <p>Esta sección permitirá consultar cálculos realizados anteriormente.</p>
            
            <div className={styles.backButtonWrapper}>
              <Button 
                variant="primary" 
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CalculosRealizadosPage;
