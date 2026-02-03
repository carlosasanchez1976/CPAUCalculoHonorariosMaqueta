import UserMenu from './UserMenu';
import cpauLogo from '../../assets/images/cpau.svg';
import styles from './Header.module.css';

/**
 * Componente Header - Cabecera principal de la aplicación
 */
const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logoSection}>
          <img 
            src={cpauLogo} 
            alt="Logo CPAU" 
            className={styles.logo}
          />
        </div>
        
        <h1 className={styles.title}>
          Gestión de Cálculo de Honorarios
        </h1>
        
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
