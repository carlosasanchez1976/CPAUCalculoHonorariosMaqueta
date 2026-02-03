import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateLoginForm } from '../utils/validation';
import { ROUTES } from '../utils/constants';
import isoLogo from '../assets/images/iso.svg';
import styles from './LoginPage.module.css';

/**
 * Página de Login
 * Formulario de autenticación con validación en tiempo real
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  /**
   * Manejar cambios en los inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Limpiar error general
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * Manejar cambio en checkbox "Recordarme"
   */
  const handleRememberChange = (e) => {
    setRemember(e.target.checked);
  };

  /**
   * Validar formulario antes de enviar
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Validar formulario
    const validation = validateLoginForm(formData.username, formData.password);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Intentar login
    setIsLoading(true);
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = login(formData.username, formData.password, remember);
      
      if (result.success) {
        navigate(ROUTES.DASHBOARD);
      } else {
        setGeneralError(result.message);
      }
    } catch (error) {
      console.error('Error en login:', error);
      setGeneralError('Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Logo y título */}
        <div className={styles.logoSection}>
          <img 
            src={isoLogo} 
            alt="CPAU Logo" 
            className={styles.logo}
          />
          <h1 className={styles.appTitle}>CH2026</h1>
        </div>

        {/* Error general */}
        {generalError && (
          <div className={styles.errorAlert} role="alert">
            {generalError}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
          <Input
            label="Usuario"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            autoComplete="username"
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          {/* Checkbox Recordarme */}
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={handleRememberChange}
              className={styles.checkbox}
            />
            <label htmlFor="remember" className={styles.checkboxLabel}>
              Recordarme en este equipo
            </label>
          </div>

          {/* Botón de submit */}
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* Links adicionales */}
        <div className={styles.linksSection}>
          <a href="#" className={styles.link}>
            ¿Olvidó su contraseña?
          </a>
          <a href="#" className={styles.link}>
            Regístrese
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
