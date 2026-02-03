import { useNavigate } from 'react-router-dom';
import { FaSearchDollar } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import styles from './PlaceholderPage.module.css';

/**
 * Página: Consulta de Precios
 * Placeholder - En desarrollo
 */
const ConsultaPreciosPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.placeholderCard}>
            <div className={styles.placeholderIcon}>
              <FaSearchDollar />
            </div>
            <h2 className={styles.pageTitle}>Consulta de Precios</h2>
            <p className={styles.pageSubtitle}>Página en desarrollo</p>
            <p>Esta sección permitirá consultar precios de materiales, insumos y servicios.</p>
            
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

export default ConsultaPreciosPage;
