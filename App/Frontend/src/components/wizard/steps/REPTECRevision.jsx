import { formatCurrencyARS } from '../../../utils/formatters';
import Button from '../../common/Button';
import sharedStyles from './SharedStepStyles.module.css';
import styles from './RevisionBasico.module.css';

/**
 * Paso 3 - Revisión de Datos
 * Específico para el cálculo REPTEC (Representación técnica)
 */
const REPTECRevision = ({ formData, onEditStep, stepTitle }) => {
  const DataRow = ({ label, value }) => (
    <div className={styles.dataRow}>
      <span className={styles.dataLabel}>{label}:</span>
      <span className={styles.dataValue}>{value || 'No especificado'}</span>
    </div>
  );

  // Mapeo de códigos a textos legibles
  const getServicioText = (codigo) => {
    const servicios = {
      'IEC': 'Inscripción de Empresa Constructora',
      'POL': 'Presentación de ofertas y licitaciones',
      'RTE': 'Representación técnica'
    };
    return servicios[codigo] || codigo;
  };

  const getTipoTareaText = (valor) => {
    if (valor === 'proyecto') return 'Proyecto de obra';
    if (valor === 'direccion') return 'Dirección de obra';
    return 'No especificado';
  };

  return (
    <div className={sharedStyles.container}>
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
              {formData.observaciones && (
                <DataRow label="Observaciones" value={formData.observaciones} />
              )}
              
              <div className={styles.buttonRow}>
                <Button
                  size="small"
                  onClick={() => onEditStep(0)}
                >
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna 2: Servicio y Datos Específicos */}
        <div className={styles.column}>
          {/* Servicio a prestar */}
          <h3 className={styles.sectionTitle}>Servicio a prestar</h3>
          
          <div className={styles.section}>
            <div className={styles.sectionContent}>
              <DataRow 
                label="Tipo de servicio" 
                value={getServicioText(formData.tipoObra)} 
              />
              
              <div className={styles.buttonRow}>
                <Button
                  size="small"
                  onClick={() => onEditStep(1)}
                >
                  Editar
                </Button>
              </div>
            </div>
          </div>

          {/* Datos Específicos - Condicional según tipo de servicio */}
          <h3 className={styles.sectionTitle}>Datos específicos del servicio</h3>
          
          <div className={styles.section}>
            <div className={styles.sectionContent}>
              {/* Si es IEC */}
              {formData.tipoObra === 'IEC' && (
                <>
                  <div className={styles.highlightRow}>
                    <span className={styles.dataLabel}>Capacidad de contratación (ARS):</span>
                    <span className={styles.highlightValue}>
                      {formData.valorObra ? `$ ${formatCurrencyARS(formData.valorObra, false)}` : 'No especificado'}
                    </span>
                  </div>
                  {formData.observaciones && (
                    <div className={styles.observacionesBox}>
                      <strong>Observaciones:</strong>
                      <p>{formData.observaciones}</p>
                    </div>
                  )}
                </>
              )}

              {/* Si es RTE */}
              {formData.tipoObra === 'RTE' && (
                <>
                  <div className={styles.highlightRow}>
                    <span className={styles.dataLabel}>Monto de obra estimado (ARS):</span>
                    <span className={styles.highlightValue}>
                      {formData.valorObra ? `$ ${formatCurrencyARS(formData.valorObra, false)}` : 'No especificado'}
                    </span>
                  </div>
                  {formData.observaciones && (
                    <div className={styles.observacionesBox}>
                      <strong>Observaciones:</strong>
                      <p>{formData.observaciones}</p>
                    </div>
                  )}
                </>
              )}

              {/* Si es POL */}
              {formData.tipoObra === 'POL' && (
                <DataRow 
                  label="Tipo de tarea profesional" 
                  value={getTipoTareaText(formData.obraProyecto)} 
                />
              )}
              
              <div className={styles.buttonRow}>
                <Button
                  size="small"
                  onClick={() => onEditStep(2)}
                >
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.infoBox}>
        Si todos los datos son correctos, hacé clic en "Siguiente" para proceder con el cálculo de honorarios.
      </div>
    </div>
  );
};

export default REPTECRevision;
