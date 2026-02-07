import { useNavigate } from 'react-router-dom';
import styles from './CalculationTypeCard.module.css';

/**
 * Card para seleccionar tipo de cálculo
 * @param {Object} props
 * @param {string} props.title - Título del tipo de cálculo
 * @param {string} props.description - Descripción del cálculo
 * @param {React.ReactNode} props.icon - Ícono del tipo
 * @param {string} props.color - Color de acento
 * @param {string} props.path - Ruta a navegar
 * @param {string} props.tipoId - Identificador corto del tipo ('Básico', 'Arancel', etc.)
 */
const CalculationTypeCard = ({ title, description, icon, color, path, tipoId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path, { 
      state: { 
        tipo: tipoId || title,
        tipoNombre: title,
        descripcion: description 
      } 
    });
  };

  return (
    <div 
      className={styles.card}
      onClick={handleClick}
      style={{ '--accent-color': color }}
    >
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default CalculationTypeCard;
