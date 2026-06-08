import Input from '../../common/Input';
import sharedStyles from './SharedStepStyles.module.css';
import styles from './DatosPrincipalesBasico.module.css';

/**
 * Paso 2 - Datos Específicos del Proyecto
 * Específico para el cálculo HABI, pero puede ser adaptado para otros cálculos que requieran información detallada sobre la obra.
 */
const HABIStep2 = ({ formData, onChange, stepTitle }) => {
  return (
    <div className={sharedStyles.container}>
      <h2 className="stepTitle">{stepTitle}</h2>

      <div className={sharedStyles.formGrid}>

        {/* FILA 2: Dos desplegables */}
        <div className={sharedStyles.selectRow}>
          <div className={styles.selectWrapper}>
            <label className={sharedStyles.label}>
              Tipo de Local a habilitar
              <span className={sharedStyles.required}>*</span>
            </label>
            <select
              name="tipoObra"
              value={formData.tipoObra}
              onChange={onChange}
              className={styles.select}
            >
              <option value="">Seleccioná...</option>
              <option value="H100SEP">Locales hasta 100 m2</option>
              <option value="H100CEP">Locales hasta 100 m2 con ejecución de plano</option>
              <option value="H500SEP">Locales hasta 500 m2</option>
              <option value="H500CEP">Locales hasta 500 m2 con ejecución de plano</option>
              <option value="M500CEP">Locales de más de 500 m2 con ejecución de plano</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HABIStep2;
