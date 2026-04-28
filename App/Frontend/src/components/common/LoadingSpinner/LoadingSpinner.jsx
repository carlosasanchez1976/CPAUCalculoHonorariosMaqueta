import styles from './LoadingSpinner.module.css';

/**
 * Componente de loading visual reutilizable
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - Tipo: 'spinner' | 'dots' | 'pulse'
 * @param {string} message - Mensaje opcional
 * @param {boolean} overlay - Mostrar sobre overlay oscuro
 * @param {string} color - Color personalizado (CSS var o hex)
 */
const LoadingSpinner = ({ 
  size = 'md',
  variant = 'spinner',
  message = '',
  overlay = false,
  color = 'var(--color-primary)'
}) => {
  const spinnerContent = (
    <div className={`${styles.container} ${styles[size]}`}>
      {variant === 'spinner' && (
        <div 
          className={styles.spinner} 
          style={{ borderTopColor: color }}
        />
      )}
      
      {variant === 'dots' && (
        <div className={styles.dots}>
          <span style={{ backgroundColor: color }} />
          <span style={{ backgroundColor: color }} />
          <span style={{ backgroundColor: color }} />
        </div>
      )}
      
      {variant === 'pulse' && (
        <div 
          className={styles.pulse}
          style={{ backgroundColor: color }}
        />
      )}
      
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
  
  if (overlay) {
    return (
      <div className={styles.overlay}>
        {spinnerContent}
      </div>
    );
  }
  
  return spinnerContent;
};

export default LoadingSpinner;
