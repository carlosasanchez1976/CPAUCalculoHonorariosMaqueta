import styles from './Input.module.css';

/**
 * Componente Input - Input con floating label
 * @param {string} label - Etiqueta del input
 * @param {string} type - Tipo de input (text, password, email, etc.)
 * @param {string} value - Valor del input
 * @param {Function} onChange - Función para manejar cambios
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Si el campo es requerido
 * @param {string} name - Nombre del input
 * @param {string} id - ID del input
 */
const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false,
  name,
  id,
  ...props 
}) => {
  const inputId = id || name || label.toLowerCase().replace(/\s/g, '-');
  const inputClasses = `${styles.input} ${error ? styles.hasError : ''}`;

  return (
    <div className={styles.inputWrapper}>
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClasses}
        placeholder=" "
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        required={required}
        {...props}
      />
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {error && (
        <span 
          id={`${inputId}-error`} 
          className={styles.errorMessage}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
