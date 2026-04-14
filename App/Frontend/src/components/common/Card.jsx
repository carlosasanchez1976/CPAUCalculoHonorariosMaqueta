import styles from './Card.module.css';

/**
 * Componente Card - Tarjeta clickeable para acciones del dashboard
 * @param {string} title - Título de la card
 * @param {string} title2 - Segundo título de la card
 * @param {string} description - Descripción de la card
 * @param {React.ReactNode} icon - Ícono de react-icons
 * @param {Function} onClick - Función a ejecutar al hacer click
 */
const Card = ({ title, title2, description, icon, onClick }) => {
  // Manejador de eventos de teclado para accesibilidad
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={title}
    >
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <div className={styles.titleBox}>
        <h3 className={styles.title}>{title}</h3>
        <h3 className={styles.title}>{title2}</h3>
      </div>
      {/* no se muestra la descripción en el diseño actual, pero se mantiene para futuras mejoras */}
      {/* <p className={styles.description}>{description}</p> */}
    </div>
  );
};

export default Card;
