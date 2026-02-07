import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaChevronDown, FaCog, FaUserCircle, FaSignOutAlt, FaSlidersH } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';
import styles from './UserMenu.module.css';

/**
 * Componente UserMenu - Menú desplegable del usuario
 */
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Manejador de teclado para accesibilidad
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.userMenuWrapper} ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        className={`${styles.userButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FaUser className={styles.userIcon} />
        <span className={styles.userName}>{user?.username || 'Usuario'}</span>
        <FaChevronDown className={styles.chevronIcon} />
      </button>

      <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`} role="menu">
        <button
          className={styles.menuItem}
          onClick={() => handleMenuItemClick(ROUTES.PREFERENCIAS)}
          role="menuitem"
        >
          <FaCog className={styles.menuIcon} />
          <span>Preferencias</span>
        </button>

        <button
          className={styles.menuItem}
          onClick={() => handleMenuItemClick(ROUTES.PARAMETROS)}
          role="menuitem"
        >
          <FaSlidersH className={styles.menuIcon} />
          <span>Parámetros</span>
        </button>

        <button
          className={styles.menuItem}
          onClick={() => handleMenuItemClick(ROUTES.MI_CUENTA)}
          role="menuitem"
        >
          <FaUserCircle className={styles.menuIcon} />
          <span>Mi Cuenta</span>
        </button>

        <div className={styles.divider} role="separator" />

        <button
          className={styles.menuItem}
          onClick={handleLogout}
          role="menuitem"
        >
          <FaSignOutAlt className={styles.menuIcon} />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
