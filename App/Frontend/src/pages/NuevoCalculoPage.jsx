import { FaCalculator, FaFileInvoiceDollar, FaChartLine, FaCog, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalculationTypeCard from '../components/common/CalculationTypeCard';
import styles from './NuevoCalculoPage.module.css';

/**
 * Página de selección de tipo de cálculo de honorarios
 */
const NuevoCalculoPage = () => {
  const navigate = useNavigate();

  const calculationTypes = [
    {
      title: 'Honorarios de Especialidades – Básico',
      description: 'Cálculo de honorarios enfocado en tareas profesionales específicas, ideal para proyectos de menor complejidad o para obtener una estimación rápida de honorarios con datos básicos.',
      icon: <FaCalculator />,
      color: '#2D5016',
      path: '/proceso-calculo',
      tipoId: 'Básico'
    },
    {
      title: 'Arancel CPAU',
      description: 'Arancel propuesto por el CPAU en su resolución número 3220 y actualizaciones, a partir de un índice K de referencia y haciendo hincapié de manera detallada en cada tarea y rol que puede desarrollar el profesional matriculado',
      icon: <FaFileInvoiceDollar />,
      color: '#D4A574',
      path: '/proceso-calculo',
      tipoId: 'Arancel'
    },
    {
      title: 'Costo+Arancel',
      description: 'Cálculo basado en el Arancel CPAU, tomando como base el Cálculo de Costo de Obra realizado previamente de manera detallada',
      icon: <FaChartLine />,
      color: '#A8DADC',
      path: '/proceso-calculo',
      tipoId: 'Costo+Arancel'
    },
    {
      title: 'Personalizado',
      description: 'Cálculo que permite al usuario cambiar los valores de referencia y los índices para poder analizar impacto de esos cambios en el resultado final',
      icon: <FaCog />,
      color: '#457B9D',
      path: '/proceso-calculo',
      tipoId: 'Personalizado'
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/dashboard')}
            aria-label="Volver al Dashboard"
          >
            <FaArrowLeft className={styles.backIcon} />
            <span>Volver al Dashboard</span>
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Nuevo Cálculo de Honorarios</h1>
            <p className={styles.subtitle}>
              Seleccione el tipo de cálculo que desea realizar según sus necesidades
            </p>
          </div>

          <div className={styles.cardsGrid}>
            {calculationTypes.map((type, index) => (
              <CalculationTypeCard
                key={index}
                title={type.title}
                description={type.description}
                icon={type.icon}
                color={type.color}
                path={type.path}
                tipoId={type.tipoId}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NuevoCalculoPage;
