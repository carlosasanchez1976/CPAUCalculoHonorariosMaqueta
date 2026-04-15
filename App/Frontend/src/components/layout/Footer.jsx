import { FaInstagram, FaFacebook } from 'react-icons/fa';
import cpauLogo from '../../assets/images/cpau.svg';
import styles from './Footer.module.css';

/**
 * Componente Footer - Pie de página de la aplicación
 */
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLeft}>
          <img 
            src={cpauLogo} 
            alt="Logo CPAU" 
            className={styles.footerLogo}
          />
        </div>
        
        <p className={styles.copyright}>
          © Consejo Profesional de Arquitectura y Urbanismo. 25 de Mayo 482. C1002ABJ CABA. Tel: +5411 5238 1068. Email: rect@cpau.org. Atención: lunes a viernes de 9 a 16 horas.
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;
