import Input from '../../common/Input';
import sharedStyles from './SharedStepStyles.module.css';
import styles from './DatosPrincipalesBasico.module.css';

/**
 * Paso 2 - Datos Específicos del Proyecto
 * Específico para el cálculo REPTEC, pero puede ser adaptado para otros cálculos que requieran información detallada sobre la obra.
 */
const REPTECStep2 = ({ formData, onChange, stepTitle }) => {
  return (
    <div className={sharedStyles.container}>
      <h2 className="stepTitle">{stepTitle}</h2>

      <div className={sharedStyles.formGrid}>

        {/* FILA 2: Dos desplegables */}
        <div className={sharedStyles.selectRow}>
          <div className={styles.selectWrapper}>
            <label className={sharedStyles.label}>
              Servicio a prestar
              <span className={sharedStyles.required}>*</span>
            </label>
            <select
              name="tipoObra"
              value={formData.tipoObra}
              onChange={onChange}
              className={styles.select}
            >
              <option value="">Seleccioná...</option>
              <option value="IEC">Inscripción de Empresa Constructora</option>
              <option value="POL">Presentación de ofertas y licitaciones</option>
              <option value="RTE">Representación técnica</option>
            </select>
          </div>

        </div>




      </div>
    </div>
  );
};

export default REPTECStep2;
