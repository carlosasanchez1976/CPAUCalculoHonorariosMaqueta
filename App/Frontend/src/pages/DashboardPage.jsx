import { useNavigate } from 'react-router-dom';
import { 
  FaCalculator, 
  FaListAlt, 
  FaHardHat, 
  FaFolderOpen, 
  FaSearchDollar, 
  FaCog 
} from 'react-icons/fa';
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

  // Definición de las tarjetas del dashboard
  const dashboardCards = [
    {
      id: 1,
      title: 'Nuevo Cálculo de Honorarios',
      description: 'Genera un nuevo proyecto para cálculo de honorarios profesionales',
      icon: <FaCalculator />,
      route: ROUTES.NUEVO_CALCULO
    },
    {
      id: 2,
      title: 'Cálculos Realizados',
      description: 'Permite consultar cálculos realizados anteriormente',
      icon: <FaListAlt />,
      route: ROUTES.CALCULOS_REALIZADOS
    },
    {
      id: 3,
      title: 'Nuevo Proyecto de Obra',
      description: 'Genera un nuevo proyecto para la gestión de una obra de construcción',
      icon: <FaHardHat />,
      route: ROUTES.NUEVO_PROYECTO
    },
    {
      id: 4,
      title: 'Proyectos Realizados',
      description: 'Permite consultar proyectos de gestión de obra realizados',
      icon: <FaFolderOpen />,
      route: ROUTES.PROYECTOS_REALIZADOS
    },
    {
      id: 5,
      title: 'Consulta de Precios',
      description: 'Permite consultar precios de materiales, insumos y servicios',
      icon: <FaSearchDollar />,
      route: ROUTES.CONSULTA_PRECIOS
    },
    {
      id: 6,
      title: 'Personalizar',
      description: 'Permite preestablecer opciones para una experiencia personalizada',
      icon: <FaCog />,
      route: ROUTES.PERSONALIZAR
    }
  ];

  /**
   * Manejar click en una card
   */
  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.cardsGrid}>
            {dashboardCards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onClick={() => handleCardClick(card.route)}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
