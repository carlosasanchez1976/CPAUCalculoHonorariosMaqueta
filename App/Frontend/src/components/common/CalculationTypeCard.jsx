import { useNavigate } from 'react-router-dom';
import styles from './CalculationTypeCard.module.css';

/**
 * Card para seleccionar tipo de cálculo
 * @param {Object} props
 * @param {string} props.title - Título del tipo de cálculo
 * @param {string} props.shortDescription - Descripción corta (1 línea) del cálculo
 * @param {string} props.fullDescription - Descripción completa del cálculo
 * @param {React.ReactNode} props.icon - Ícono del tipo
 * @param {string} props.color - Color de acento
 * @param {string} props.path - Ruta a navegar
 * @param {string} props.tipoId - Identificador corto del tipo ('Básico', 'Arancel', etc.)
 * @param {string} props.vigente - 'Si' o 'No' indica si está disponible o en construcción
 */
const CalculationTypeCard = ({ title, shortDescription, fullDescription, icon, color, path, tipoId, vigente }) => {
  const navigate = useNavigate();
  const isVigente = vigente === 'Si';

  const handleClick = () => {
    if (!isVigente) return; // No permitir click si no está vigente
    
    navigate(path, { 
      state: { 
        tipo: tipoId || title,
        tipoNombre: title,
        descripcion: fullDescription 
      } 
    });
  };

  return (
    <div 
      className={`${styles.card} ${!isVigente ? styles.noVigente : ''}`}
      onClick={handleClick}
      style={{ '--accent-color': color }}
    >
      <div className={styles.headerRow}>
        <div className={styles.iconWrapper}>
          {icon}
        </div>
        {!isVigente && (
          <div className={styles.badge}>
            <span>En Construcción</span>
          </div>
        )}
      </div>
      
      {fullDescription && (
        <p className={styles.description}>{fullDescription}</p>
      )}
      
      <div className={styles.titleBox}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  );
};

export default CalculationTypeCard;
