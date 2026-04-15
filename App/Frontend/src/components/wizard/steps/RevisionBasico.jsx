import { FaEdit } from 'react-icons/fa';
import { formatCurrencyARS, formatCurrencyUSD } from '../../../utils/formatters';
import Button from '../../common/Button';
import styles from './RevisionBasico.module.css';

/**
 * Paso 4 - Revisión de Datos
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const RevisionBasico = ({ formData, onEditStep, stepTitle }) => {
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
      <h2 className="stepTitle">{stepTitle}</h2>

      <div className={styles.mainGrid}>
        {/* Columna 1: Datos Principales */}
        <div className={styles.column}>
          <h3 className={styles.sectionTitle}>Datos principales del proyecto</h3>

          <div className={styles.section}>
            <div className={styles.sectionContent}>
              <DataRow label="Nombre del Proyecto" value={formData.nombreProyecto} />
              <DataRow label="Comitente" value={formData.cliente} />
              <DataRow label="Ubicación" value={formData.ubicacion} />
              <DataRow label="Tipo de obra" value={formData.tipoObra} />
              <DataRow label="Destino/Uso" value={formData.destinoUso} />
              <DataRow label="Plazo estimado de ejecución" value={formData.plazoEjecucion ? `${formData.plazoEjecucion} meses` : ''} />
              <DataRow label="Observaciones" value={formData.observaciones} />
              
              <div className={styles.buttonRow}>
                <Button
                  size="small"
                  onClick={() => onEditStep(0)}
                  icon={<FaEdit />}
                >
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna 2: Datos de Obra y Tareas */}
        <div className={styles.column}>
          {/* Datos Específicos de la Obra */}
          <h3 className={styles.sectionTitle}>Datos específicos de la obra</h3>
          
          <div className={styles.section}>
            <div className={styles.sectionContent}>
              <DataRow 
                label="Superficie total" 
                value={formData.superficieTotal ? `${formData.superficieTotal} m²` : ''} 
              />
              <DataRow 
                label="Costo por m²" 
                value={formData.valorMetro2 ? formatCurrencyARS(formData.valorMetro2) : ''} 
              />
              <div className={styles.highlightRow}>
                <span className={styles.dataLabel}>Costo estimado de obra (ARS):</span>
                <span className={styles.highlightValue}>
                  {formData.valorObra ? `$ ${formatCurrencyARS(formData.valorObra, false)}` : 'No calculado'}
                </span>
              </div>
              
              <div className={styles.buttonRow}>
                <Button
                  size="small"
                  onClick={() => onEditStep(1)}
                  icon={<FaEdit />}
                >
                  Editar
                </Button>
              </div>
            </div>
          </div>

          {/* Tareas Profesionales */}
          <h3 className={styles.sectionTitle}>Tareas profesionales a realizar</h3>
          
          <div className={styles.section}>
            <div className={styles.sectionContent}>
              <div className={styles.tareasGrid}>
                <div className={styles.tareaItem}>
                  <span className={styles.tareaLabel}>Proyecto de obra</span>
                  <span className={getBooleanText(formData.obraProyecto) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                    {getBooleanText(formData.obraProyecto).toUpperCase()}
                  </span>
                </div>
                <div className={styles.tareaItem}>
                  <span className={styles.tareaLabel}>Dirección de obra</span>
                  <span className={getBooleanText(formData.obraDireccion) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                    {getBooleanText(formData.obraDireccion).toUpperCase()}
                  </span>
                </div>
                <div className={styles.tareaItem}>
                  <span className={styles.tareaLabel}>Proyecto de estructuras</span>
                  <span className={getBooleanText(formData.proyectoEstructuras) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                    {getBooleanText(formData.proyectoEstructuras).toUpperCase()}
                  </span>
                </div>
                <div className={styles.tareaItem}>
                  <span className={styles.tareaLabel}>Instalaciones sanitarias y gas</span>
                  <span className={getBooleanText(formData.instalacionSanitaria) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                    {getBooleanText(formData.instalacionSanitaria).toUpperCase()}
                  </span>
                </div>
                <div className={styles.tareaItem}>
                  <span className={styles.tareaLabel}>Instalaciones eléctricas</span>
                  <span className={getBooleanText(formData.instalacionElectrica) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                    {getBooleanText(formData.instalacionElectrica).toUpperCase()}
                  </span>
                </div>
                <div className={styles.tareaItem}>
                  <span className={styles.tareaLabel}>Instalaciones contra incendio</span>
                  <span className={getBooleanText(formData.instalacionContraIncendio) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                    {getBooleanText(formData.instalacionContraIncendio).toUpperCase()}
                  </span>
                </div>
                <div className={styles.tareaItem}>
                  <span className={styles.tareaLabel}>Instalaciones termomecánicas</span>
                  <span className={getBooleanText(formData.instalacionTermomecanica) === 'Sí' ? styles.tareaYes : styles.tareaNo}>
                    {getBooleanText(formData.instalacionTermomecanica).toUpperCase()}
                  </span>
                </div>
              </div>
              {formData.observacionesTareas && (
                <div className={styles.observacionesBox}>
                  <strong>Observaciones:</strong>
                  <p>{formData.observacionesTareas}</p>
                </div>
              )}
              
              <div className={styles.buttonRow}>
                <Button
                  size="small"
                  onClick={() => onEditStep(2)}
                  icon={<FaEdit />}
                >
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.infoBox}>
        💡 Si todos los datos son correctos, haga clic en "Calcular" para proceder con el cálculo de honorarios.
      </div>
    </div>
  );
};

export default RevisionBasico;
