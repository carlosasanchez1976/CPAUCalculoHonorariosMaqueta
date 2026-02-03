import { FaInstagram, FaFacebook } from 'react-icons/fa';
import styles from './Footer.module.css';

/**
 * Componente Footer - Pie de página de la aplicación
 */
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p className={styles.copyright}>
          © 2026 - Desarrollado por neosis para el CPAU
        </p>
        
        <div className={styles.socialLinks}>
          <a
            href="#"
            className={styles.socialLink}
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
          <a
            href="#"
            className={styles.socialLink}
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
