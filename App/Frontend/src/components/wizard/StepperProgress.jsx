import { FaCheck } from 'react-icons/fa';
import styles from './StepperProgress.module.css';

/**
 * Componente visual de progreso para wizard
 * @param {Object} props
 * @param {number} props.currentStep - Paso actual (0-5)
 * @param {Array} props.steps - Array de nombres de pasos
 */
const StepperProgress = ({ currentStep, steps }) => {
  return (
    <div className={styles.container}>
      <div className={styles.stepper}>
        {steps.map((step, index) => (
          <div key={index} className={styles.stepWrapper}>
            {/* Círculo del paso */}
            <div className={styles.stepItem}>
              <div 
                className={`${styles.stepCircle} ${
                  index < currentStep ? styles.completed : 
                  index === currentStep ? styles.current : 
                  styles.pending
                }`}
              >
                {index < currentStep ? (
                  <FaCheck className={styles.checkIcon} />
                ) : (
                  <span className={styles.stepNumber}>{index + 1}</span>
                )}
              </div>
              
              {/* Label del paso */}
              <div className={styles.stepLabel}>
                {step}
              </div>
            </div>

            {/* Línea conectora (no mostrar después del último paso) */}
            {index < steps.length - 1 && (
              <div 
                className={`${styles.connector} ${
                  index < currentStep ? styles.connectorCompleted : styles.connectorPending
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepperProgress;
