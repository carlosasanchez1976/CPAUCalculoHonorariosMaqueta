import UserMenu from './UserMenu';
/*import cpauLogo from '../../assets/images/cpau.svg';*/
import marcaLogo from '../../assets/images/logoCalculadora.svg';
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
            src={marcaLogo} 
            alt="Logo Marca" 
            className={styles.logo}
          />
        </div>
        
        
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
