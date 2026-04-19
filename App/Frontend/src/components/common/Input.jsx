import { useState } from 'react';
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
 * @param {boolean} showPasswordToggle - Mostrar botón para ver/ocultar contraseña (solo para type="password")
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
  showPasswordToggle = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputId = id || name || label.toLowerCase().replace(/\s/g, '-');
  const inputClasses = `${styles.input} ${error ? styles.hasError : ''} ${showPasswordToggle ? styles.inputWithToggle : ''}`;
  const labelClasses = `${styles.label} ${error ? styles.labelError : ''}`;
  
  // Determinar el tipo de input (password o text si se muestra la contraseña)
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Manejar toggle de visibilidad de contraseña
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={inputId} className={labelClasses}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputContainer}>
        <input
          type={inputType}
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
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={handleTogglePassword}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>
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
