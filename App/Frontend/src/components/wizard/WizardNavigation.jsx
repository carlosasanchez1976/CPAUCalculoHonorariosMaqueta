import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaQuestionCircle, FaHome } from 'react-icons/fa';
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
 */
const WizardNavigation = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  nextLabel
}) => {
  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);

  const getNextButtonLabel = () => {
    if (nextLabel) return nextLabel;
    
    if (currentStep === 3) return 'Revisar';
    if (currentStep === 4) return 'Calcular';
    if (currentStep === 5) return 'Finalizar';
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
          >
            <FaChevronLeft className={styles.icon} />
            {getPrevButtonLabel()}
          </Button>

          {/* Botones Centrales */}
          <div className={styles.centerButtons}>
            {/* Botón Ayuda */}
            <Button
              variant="outline"
              onClick={() => setShowHelpModal(true)}
              className={styles.helpButton}
              title="Ayuda"
            >
              <FaQuestionCircle className={styles.iconLarge} />
            </Button>

            {/* Botón Volver (oculto en paso 0) */}
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBackToSelection}
                className={styles.backButton}
                title="Volver a selección de tipo de cálculo"
              >
                <FaHome className={styles.iconLarge} />
              </Button>
            )}
          </div>

          {/* Botón Siguiente */}
          <Button
            variant="primary"
            onClick={onNext}
            className={styles.nextButton}
          >
            {getNextButtonLabel()}
            <FaChevronRight className={styles.icon} />
          </Button>
        </div>
      </div>

      {/* Modal de Ayuda */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Ayuda"
        footer={
          <Button variant="primary" onClick={() => setShowHelpModal(false)}>
            Entendido
          </Button>
        }
      >
        <p>
          Aquí se mostrará un texto de ayuda y tutoriales y documentación para 
          comprender el proceso del cálculo específico.
        </p>
      </Modal>

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
