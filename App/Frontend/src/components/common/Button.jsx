import styles from './Button.module.css';

/**
 * Componente Button - Botón reutilizable con estados
 * @param {React.ReactNode} children - Contenido del botón
 * @param {Function} onClick - Función a ejecutar al hacer click
 * @param {boolean} loading - Estado de carga
 * @param {boolean} disabled - Estado deshabilitado
 * @param {string} variant - Variante del botón: 'primary' o 'secondary' (default: 'primary')
 * @param {string} type - Tipo de botón: 'button', 'submit', 'reset' (default: 'button')
 */
const Button = ({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false, 
  variant = 'primary',
  type = 'button',
  ...props 
}) => {
  const buttonClasses = `${styles.button} ${styles[variant]} ${loading ? styles.loading : ''}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
