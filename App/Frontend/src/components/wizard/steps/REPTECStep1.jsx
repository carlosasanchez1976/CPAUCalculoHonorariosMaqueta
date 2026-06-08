import Input from '../../common/Input';
import sharedStyles from './SharedStepStyles.module.css';
import styles from './DatosPrincipalesBasico.module.css';

/**
 * Paso 1 - Datos Principales del Proyecto
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const REPTECStep1 = ({ formData, onChange, stepTitle }) => {
  return (
    <div className={sharedStyles.container}>
      <h2 className="stepTitle">{stepTitle}</h2>

      <div className={sharedStyles.formGrid}>
        {/* FILA 1: Tres campos en una fila */}
        <div className={sharedStyles.inputRow}>
          <Input
            // label="Nombre del Proyecto"
            name="nombreProyecto"
            value={formData.nombreProyecto}
            onChange={onChange}
            placeholder="Nombre del proyecto *"
            required
          />

          <Input
            // label="Comitente"
            name="cliente"
            value={formData.cliente}
            onChange={onChange}
            placeholder="Comitente *"
            required
          />

          <Input
            // label="Ubicación"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={onChange}
            placeholder="Ubicación *"
            required
          />
        </div>

        {/* FILA 2: Tres campos en una fila */}
        {/* Observaciones a todo el ancho */}
        <div className={styles.textareaWrapper}>
          <label className={sharedStyles.label}>
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={onChange}
            className="textarea"
            placeholder="Ingrese cualquier observación adicional sobre el proyecto"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default REPTECStep1;
