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
        
        <div className={styles.titleWrapper}>
          <h1 className={styles.titleLine1}>Calculadora</h1>
          <h1 className={styles.titleLine2}>DE HONORARIOS</h1>
        </div>
        
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
