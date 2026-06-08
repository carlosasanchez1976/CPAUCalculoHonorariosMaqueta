import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';
import styles from './WizardNavigation.module.css';

/**
 * Componente de navegación para wizard
 * @param {Object} props
 * @param {number} props.currentStep - Paso actual
 * @param {number} props.totalSteps - Total de pasos
 * @param {Function} props.onPrevious - Callback para botón anterior
 * @param {Function} props.onNext - Callback para botón siguiente
 * @param {string} props.nextLabel - Label personalizado para botón siguiente
 * @param {boolean} props.isCalculating - Indica si se está ejecutando un cálculo
 */
const WizardNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  nextLabel,
  isCalculating = false
}) => {
  const navigate = useNavigate();
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);

  const getNextButtonLabel = () => {
    if (nextLabel) return nextLabel;
    
    // Detección dinámica según totalSteps
    const revisionStepIndex = totalSteps - 2;  // Penúltimo paso (Revisión)
    const resultadoStepIndex = totalSteps;     // Paso de resultados (fuera del array)
    
    // Mostrar "Revisar" cuando el SIGUIENTE paso es la revisión
    if (currentStep === revisionStepIndex - 1) return 'Revisar';
    if (currentStep === resultadoStepIndex) return 'Finalizar';
    
    return 'Siguiente';
  };

  const getPrevButtonLabel = () => {
    if (currentStep === 0) return 'Cambiar Tipo de Cálculo';
    return 'Anterior';
  };

  const handleBackToSelection = () => {
    setShowBackConfirmModal(true);
  };

  const confirmBackToSelection = () => {
    setShowBackConfirmModal(false);
    navigate('/nuevo-calculo');
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.buttonGroup}>
          {/* Botón Anterior */}
          <Button
            variant="secondary"
            onClick={onPrevious}
            className={styles.prevButton}
            disabled={isCalculating}
          >
            <FaChevronLeft className={styles.icon} />
            {getPrevButtonLabel()}
          </Button>

          {/* Botones Centrales */}
          <div className={styles.centerButtons}>
            {/* Botón Home */}
            <button
              onClick={() => navigate('/')}
              className={styles.homeButton}
              title="Ir al inicio"
              disabled={isCalculating}
            >
              <img src="/assets/icons/home.svg" alt="Home" className={styles.homeIcon} />
            </button>
          </div>

          {/* Botón Siguiente */}
          <Button
            variant="primary"
            onClick={onNext}
            className={styles.nextButton}
            disabled={isCalculating}
          >
            {getNextButtonLabel()}
            <FaChevronRight className={styles.icon} />
          </Button>
        </div>
      </div>

      {/* Modal de Confirmación Volver */}
      <Modal
        isOpen={showBackConfirmModal}
        onClose={() => setShowBackConfirmModal(false)}
        title="¿Volver a la selección?"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowBackConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={confirmBackToSelection}
            >
              Sí, volver
            </Button>
          </>
        }
      >
        <p>
          Si vuelve a la selección de tipo de cálculo, perderá todos los datos 
          ingresados en esta sesión.
        </p>
        <p>
          ¿Está seguro de que desea continuar?
        </p>
      </Modal>
    </>
  );
};

export default WizardNavigation;
