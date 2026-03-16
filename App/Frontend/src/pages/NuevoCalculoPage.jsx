import { FaBuilding, FaHammer, FaShieldAlt, FaCertificate, FaUserTie, FaSearchDollar, FaArrowLeft, FaCog, FaRulerCombined, FaLeaf, FaGavel, FaDollarSign, FaHardHat, FaFire, FaBalanceScale, FaFileContract, FaCity, FaCouch, FaTree } from 'react-icons/fa';
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
      title: 'Proyecto y Dirección de Obra',
      shortDescription: 'Proyecto y dirección de obra de baja, mediana y alta complejidad',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de proyecto y dirección de obra de baja, mediana y alta complejidad. Incluye la opción de incorporar proyecto de instalaciones y cálculo de estructuras.',
      icon: <FaBuilding />,
      color: '#2D5016',
      path: '/proceso-calculo',
      tipoId: 'Básico',
      Vigente: 'Si'
    },
    {
      title: 'Proyecto y Dirección de Demoliciones',
      shortDescription: 'Proyecto y dirección de obras de demolición',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de proyecto y dirección de obras de demolición.',
      icon: <FaHammer />,
      color: '#D4A574',
      path: '/proceso-calculo',
      tipoId: 'Demoliciones',
      Vigente: 'No'
    },
    {
      title: 'Gerencia de Proyectos y Construcciones',
      shortDescription: 'Gerenciamiento de proyectos y dirección de obras',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de gerenciamiento de proyecto y de dirección de obras.',
      icon: <FaCog />,
      color: '#457B9D',
      path: '/proceso-calculo',
      tipoId: 'Gerencia',
      Vigente: 'No'
    },
    {
      title: 'Habilitaciones',
      shortDescription: 'Habilitaciones de locales, comercios e industrias',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de habilitaciones de locales, comercios e industrias.',
      icon: <FaCertificate />,
      color: '#28A745',
      path: '/proceso-calculo',
      tipoId: 'Habilitaciones',
      Vigente: 'No'
    },
    {
      title: 'Conservación de Fachadas',
      shortDescription: 'Conservación de fachadas de edificios',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de conservación de fachadas.',
      icon: <FaBuilding />,
      color: '#6C757D',
      path: '/proceso-calculo',
      tipoId: 'Fachadas',
      Vigente: 'No'
    },
    {
      title: 'Consultas y Tareas por Tiempo',
      shortDescription: 'Honorarios en base al valor hora profesional',
      fullDescription: 'Cálculo de honorarios profesionales en base al valor hora profesional. Incluye Consultas, Estudios e Informe Técnico, Asesoramiento, y Liquidación de Medianería.',
      icon: <FaUserTie />,
      color: '#17A2B8',
      path: '/proceso-calculo',
      tipoId: 'PorTiempo',
      Vigente: 'No'
    },
    {
      title: 'Medición y Ejecución de Planos',
      shortDescription: 'Medición y ejecución de planos',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de medición y ejecución de planos.',
      icon: <FaRulerCombined />,
      color: '#FFC107',
      path: '/proceso-calculo',
      tipoId: 'Planos',
      Vigente: 'No'
    },
    {
      title: 'Impacto Ambiental',
      shortDescription: 'Evaluación de impacto ambiental',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de impacto ambiental para todo tipo de uso.',
      icon: <FaLeaf />,
      color: '#28A745',
      path: '/proceso-calculo',
      tipoId: 'Ambiental',
      Vigente: 'No'
    },
    {
      title: 'Peritajes',
      shortDescription: 'Tareas de peritaje profesional',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de peritaje.',
      icon: <FaGavel />,
      color: '#6F42C1',
      path: '/proceso-calculo',
      tipoId: 'Peritajes',
      Vigente: 'No'
    },
    {
      title: 'Higiene y Seguridad',
      shortDescription: 'Tareas de higiene y seguridad',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de higiene y seguridad.',
      icon: <FaShieldAlt />,
      color: '#DC3545',
      path: '/proceso-calculo',
      tipoId: 'HyS',
      Vigente: 'No'
    },
    {
      title: 'Sistemas de Autoprotección',
      shortDescription: 'Diseño e implementación de planes de emergencia',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de diseño, implementación y actualización de planes de emergencia en edificios y establecimientos.',
      icon: <FaFire />,
      color: '#FD7E14',
      path: '/proceso-calculo',
      tipoId: 'Autoproteccion',
      Vigente: 'No'
    },
    {
      title: 'Arbitraje',
      shortDescription: 'Tareas de arbitraje profesional',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de arbitraje.',
      icon: <FaBalanceScale />,
      color: '#6C757D',
      path: '/proceso-calculo',
      tipoId: 'Arbitraje',
      Vigente: 'No'
    },
    {
      title: 'Tasación',
      shortDescription: 'Justipreciación de bienes muebles e inmuebles',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de estudio que realiza el/la profesional tendiente a justipreciar bienes muebles o inmuebles o su valor locativo.',
      icon: <FaDollarSign />,
      color: '#20C997',
      path: '/proceso-calculo',
      tipoId: 'Tasacion',
      Vigente: 'No'
    },
    {
      title: 'Representación Técnica',
      shortDescription: 'Representación técnica en obra',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de Representación Técnica en Obra.',
      icon: <FaHardHat />,
      color: '#E83E8C',
      path: '/proceso-calculo',
      tipoId: 'RepTecnica',
      Vigente: 'No'
    },
    {
      title: 'Urbanismo',
      shortDescription: 'Planificación y diseño urbano',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de planificación y diseño urbano.',
      icon: <FaCity />,
      color: '#007BFF',
      path: '/proceso-calculo',
      tipoId: 'Urbanismo',
      Vigente: 'No'
    },
    {
      title: 'Diseño de Interiores',
      shortDescription: 'Diseño de interiores y equipamiento',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de diseño de interiores y equipamiento.',
      icon: <FaCouch />,
      color: '#D63384',
      path: '/proceso-calculo',
      tipoId: 'Interiores',
      Vigente: 'No'
    },
    {
      title: 'Diseño de Paisaje',
      shortDescription: 'Planificación y diseño del paisaje',
      fullDescription: 'Cálculo de honorarios profesionales para tareas de planificación y diseño del paisaje.',
      icon: <FaTree />,
      color: '#198754',
      path: '/proceso-calculo',
      tipoId: 'Paisaje',
      Vigente: 'No'
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
              Seleccione la tarea profesional para la cual desea realizar el cálculo de honorarios.
            </p>
          </div>

          <div className={styles.cardsGrid}>
            {calculationTypes.map((type, index) => (
              <CalculationTypeCard
                key={index}
                title={type.title}
                shortDescription={type.shortDescription}
                fullDescription={type.fullDescription}
                icon={type.icon}
                color={type.color}
                path={type.path}
                tipoId={type.tipoId}
                vigente={type.Vigente}
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
