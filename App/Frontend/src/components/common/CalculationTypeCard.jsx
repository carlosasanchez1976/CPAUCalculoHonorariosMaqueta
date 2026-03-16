import { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Handler para expandir/colapsar descripción en móvil
  const handleExpandClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`${styles.card} ${!isVigente ? styles.noVigente : ''}`}
      onClick={handleClick}
      style={{ '--accent-color': color }}
    >
      <div className={styles.iconWrapper}>
        {icon}
        {/* Tooltip con descripción completa - Desktop */}
        {fullDescription && (
          <div className={styles.tooltip}>
            {fullDescription}
          </div>
        )}
      </div>
      
      <h3 className={styles.title}>{title}</h3>

      {/* Botón expandir - Móvil */}
      {fullDescription && (
        <button 
          className={styles.expandButton}
          onClick={handleExpandClick}
          aria-expanded={isExpanded}
          disabled={!isVigente}
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}

      {/* Descripción completa expandida - Móvil */}
      {isExpanded && fullDescription && (
        <p className={styles.fullDescription}>{fullDescription}</p>
      )}
      
      {!isVigente && (
        <div className={styles.badge}>
          <span>En Construcción</span>
        </div>
      )}
    </div>
  );
};

export default CalculationTypeCard;
