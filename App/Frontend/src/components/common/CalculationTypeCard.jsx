import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CalculationTypeCard.module.css';

/**
 * Card para seleccionar tipo de cálculo
 * @param {Object} props
 * @param {number} props.tareaId - ID de la tarea profesional
 * @param {string} props.codi - Código de la tarea
 * @param {string} props.title - Título del tipo de cálculo
 * @param {string} props.fullDescription - Descripción completa del cálculo
 * @param {string} props.iconUrl - URL del ícono SVG
 * @param {string} props.path - Ruta a navegar
 * @param {boolean} props.vigente - Indica si está disponible o en construcción
 */
const CalculationTypeCard = ({ tareaId, codi, title, fullDescription, iconUrl, path, vigente }) => {
  const navigate = useNavigate();
  const [iconError, setIconError] = useState(false);
  const isVigente = vigente === true || vigente === 1 || vigente === 'Si';

  const handleClick = () => {
    if (!isVigente) return; // No permitir click si no está vigente
    
    navigate(path, { 
      state: { 
        tareaId: tareaId,
        tipo: codi,
        tipoNombre: title,
        descripcion: fullDescription 
      } 
    });
  };

  const handleIconError = () => {
    setIconError(true);
  };

  return (
    <div 
      className={`${styles.card} ${!isVigente ? styles.noVigente : ''}`}
      onClick={handleClick}
    >
      <div className={styles.headerRow}>
        <div className={styles.iconWrapper}>
          <img 
            src={iconError ? '/assets/icons/tareas/DEFAULT.svg' : iconUrl}
            alt={`Ícono de ${title}`}
            className={styles.icon}
            onError={handleIconError}
          />
        </div>
        {!isVigente && (
          <div className={styles.badge}>
            <span>EN CONSTRUCCIÓN</span>
          </div>
        )}
      </div>
      
      {fullDescription && (
        <h2 className={styles.description}>{fullDescription}</h2>
      )}
      
      <div className={styles.titleBox}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  );
};

export default CalculationTypeCard;
