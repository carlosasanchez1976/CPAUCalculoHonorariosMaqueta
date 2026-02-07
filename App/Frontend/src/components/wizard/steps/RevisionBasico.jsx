import { FaEdit } from 'react-icons/fa';
import { formatCurrencyARS, formatCurrencyUSD } from '../../../utils/formatters';
import Button from '../../common/Button';
import styles from './RevisionBasico.module.css';

/**
 * Paso 3 - Revisión de Datos
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const RevisionBasico = ({ formData, onEditStep }) => {
  const DataRow = ({ label, value }) => (
    <div className={styles.dataRow}>
      <span className={styles.dataLabel}>{label}:</span>
      <span className={styles.dataValue}>{value || 'No especificado'}</span>
    </div>
  );

  const getBooleanText = (value) => {
    if (value === true || value === 'Si') return 'Sí';
    if (value === false || value === 'No') return 'No';
    return 'No especificado';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.stepTitle}>Revisión de Datos Ingresados</h2>
      <p className={styles.stepDescription}>
        Verifique que todos los datos sean correctos antes de proceder con el cálculo
      </p>

      {/* Sección 1: Datos Principales */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Datos Principales del Proyecto</h3>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEditStep(0)}
            icon={<FaEdit />}
          >
            Editar
          </Button>
        </div>
        <div className={styles.sectionContent}>
          <DataRow label="Nombre del Proyecto" value={formData.nombreProyecto} />
          <DataRow label="Cliente" value={formData.cliente} />
          <DataRow label="Ubicación" value={formData.ubicacion} />
          <DataRow label="Tipo de Obra" value={formData.tipoObra} />
          <DataRow label="Plazo de Ejecución" value={formData.plazoEjecucion ? `${formData.plazoEjecucion} meses` : ''} />
          <DataRow label="Observaciones" value={formData.observaciones} />
        </div>
      </div>

      {/* Sección 2: Datos de la Obra */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Datos Específicos de la Obra</h3>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEditStep(1)}
            icon={<FaEdit />}
          >
            Editar
          </Button>
        </div>
        <div className={styles.sectionContent}>
          <DataRow 
            label="Superficie Total" 
            value={formData.superficieTotal ? `${formData.superficieTotal} m²` : ''} 
          />
          <DataRow 
            label="Valor por m²" 
            value={formData.valorMetro2 ? formatCurrencyUSD(formData.valorMetro2) : ''} 
          />
          <DataRow 
            label="Cotización del Dólar" 
            value={formData.cotizDolar ? formatCurrencyARS(formData.cotizDolar) : ''} 
          />
          <DataRow 
            label="Complejidad" 
            value={formData.complejidad} 
          />
          <div className={styles.highlightRow}>
            <span className={styles.dataLabel}>Valor Total de la Obra:</span>
            <span className={styles.highlightValue}>
              {formData.valorObra ? formatCurrencyARS(formData.valorObra) : 'No calculado'}
            </span>
          </div>
          {formData.complejidad && formData.complejidad !== 'Media' && (
            <p className={styles.adjustmentNote}>
              * Incluye ajuste por complejidad {formData.complejidad === 'Baja' ? '(-10%)' : '(+10%)'}
            </p>
          )}
        </div>
      </div>

      {/* Sección 3: Tareas Seleccionadas */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Tareas Profesionales Seleccionadas</h3>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEditStep(2)}
            icon={<FaEdit />}
          >
            Editar
          </Button>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.tareasGrid}>
            <div className={styles.tareaItem}>
              <span className={styles.tareaLabel}>Proyecto de Obra:</span>
              <span className={getBooleanText(formData.obraProyecto) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                {getBooleanText(formData.obraProyecto)}
              </span>
            </div>
            <div className={styles.tareaItem}>
              <span className={styles.tareaLabel}>Dirección de Obra:</span>
              <span className={getBooleanText(formData.obraDireccion) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                {getBooleanText(formData.obraDireccion)}
              </span>
            </div>
            <div className={styles.tareaItem}>
              <span className={styles.tareaLabel}>Instalación Sanitaria:</span>
              <span className={getBooleanText(formData.instalacionSanitaria) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                {getBooleanText(formData.instalacionSanitaria)}
              </span>
            </div>
            <div className={styles.tareaItem}>
              <span className={styles.tareaLabel}>Instalación Eléctrica:</span>
              <span className={getBooleanText(formData.instalacionElectrica) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                {getBooleanText(formData.instalacionElectrica)}
              </span>
            </div>
            <div className={styles.tareaItem}>
              <span className={styles.tareaLabel}>Instalación Contra Incendio:</span>
              <span className={getBooleanText(formData.instalacionContraIncendio) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                {getBooleanText(formData.instalacionContraIncendio)}
              </span>
            </div>
            <div className={styles.tareaItem}>
              <span className={styles.tareaLabel}>Proyecto de Estructuras:</span>
              <span className={getBooleanText(formData.proyectoEstructuras) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                {getBooleanText(formData.proyectoEstructuras)}
              </span>
            </div>
          </div>
          {formData.observacionesTareas && (
            <div className={styles.observacionesBox}>
              <strong>Observaciones:</strong>
              <p>{formData.observacionesTareas}</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.infoBox}>
        💡 Si todos los datos son correctos, haga clic en "Siguiente" para proceder con el cálculo de honorarios.
      </div>
    </div>
  );
};

export default RevisionBasico;
