import styles from './Spinner.module.css';

/**
 * Componente Spinner - Loading indicator
 * @param {string} size - Tamaño del spinner: 'sm', 'md', 'lg' (default: 'md')
 */
const Spinner = ({ size = 'md' }) => {
  return (
    <div 
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default Spinner;
