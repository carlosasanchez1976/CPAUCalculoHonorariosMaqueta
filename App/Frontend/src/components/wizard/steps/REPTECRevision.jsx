import { useEffect } from 'react';
import { formatCurrencyARS } from '../../../utils/formatters';
import { getServicioText } from '../../../utils/tareasHelper';
import Button from '../../common/Button';
import sharedStyles from './SharedStepStyles.module.css';
import styles from './RevisionBasico.module.css';

/**
 * Paso 3 - Revisión de Datos
 * Específico para el cálculo REPTEC (Representación técnica)
 */
const REPTECRevision = ({ formData, onEditStep, onChange, stepTitle }) => {
  
  // Setear labels dinámicos para usar en ResultadoBasicoDetalle
  useEffect(() => {
    if (formData.tipoObra) {
      // Setear labelTipoDeObra y textoTipoDeObra basados en el servicio seleccionado
      onChange({ 
        target: { 
          name: 'labelTipoDeObra', 
          value: 'Tipo de servicio' 
        } 
      });
      
      onChange({ 
        target: { 
          name: 'textoTipoDeObra', 
          value: getServicioText(formData.tipoObra)
        } 
      });
    }
  }, [formData.tipoObra, onChange]);
  const DataRow = ({ label, value }) => (
    <div className={styles.dataRow}>
      <span className={styles.dataLabel}>{label}:</span>
      <span className={styles.dataValue}>{value || 'No especificado'}</span>
    </div>
  );
  
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
                label={formData.labelTipoDeObra}
                value={formData.textoTipoDeObra}
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

          {/* Datos Específicos - No se muestran para cálculos de tipo HABI */}
          {/* Datos Específicos - Condicional según tipo de servicio */}
          {formData.tipoCalculo !== 'HABI' && (
            <>
              <h3 className={styles.sectionTitle}>Datos específicos del servicio</h3>
              
              <div className={styles.section}>
                <div className={styles.sectionContent}>
                    <>
                      <DataRow 
                        label={formData.valorObraLabel || "Valor de la obra (ARS)"}
                        value={formData.valorObra ? `$ ${formatCurrencyARS(formData.valorObra, false)}` : 'No especificado'} 
                      />
                    </>



                  {/* Si es POL */}
                  {formData.tipoObra === 'POL' && (
                    <>
                      <DataRow 
                        label="Tipo de tarea profesional" 
                        value={formData.obraProyecto ? 'La empresa ha designado otro profesional' : 'La oferta de licitación no fué adjudicada'}
                      />
                    </>
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
            </>
          )}
        </div>
      </div>

      <div className={styles.infoBox}>
        Si todos los datos son correctos, hacé clic en "Siguiente" para proceder con el cálculo de honorarios.
      </div>
    </div>
  );
};

export default REPTECRevision;
