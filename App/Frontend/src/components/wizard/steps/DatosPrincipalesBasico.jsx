import Input from '../../common/Input';
import styles from './DatosPrincipalesBasico.module.css';

/**
 * Paso 0 - Datos Principales del Proyecto
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const DatosPrincipalesBasico = ({ formData, onChange }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.stepTitle}>Datos Principales del Proyecto</h2>
      <p className={styles.stepDescription}>
        Ingrese la información básica del proyecto para el cálculo de honorarios
      </p>

      <div className={styles.formGrid}>
        <Input
          label="Nombre del Proyecto"
          name="nombreProyecto"
          value={formData.nombreProyecto}
          onChange={onChange}
          placeholder="Ej: Edificio Residencial Torre Sur"
          required
        />

        <Input
          label="Cliente"
          name="cliente"
          value={formData.cliente}
          onChange={onChange}
          placeholder="Ej: Constructora ABC S.A."
          required
        />

        <Input
          label="Ubicación"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={onChange}
          placeholder="Ej: CABA, Palermo"
          required
        />

        <div className={styles.selectWrapper}>
          <label className={styles.label}>
            Tipo de Obra
            <span className={styles.required}>*</span>
          </label>
          <select
            name="tipoObra"
            value={formData.tipoObra}
            onChange={onChange}
            className={styles.select}
          >
            <option value="">Seleccione...</option>
            <option value="Vivienda">Vivienda</option>
            <option value="Edificio">Edificio</option>
            <option value="Industrial">Industrial</option>
            <option value="Comercial">Comercial</option>
          </select>
        </div>

        <Input
          label="Plazo de Ejecución (meses)"
          name="plazoEjecucion"
          type="number"
          value={formData.plazoEjecucion}
          onChange={onChange}
          placeholder="Ej: 12"
          min="1"
        />

        <div className={styles.textareaWrapper}>
          <label className={styles.label}>
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={onChange}
            className={styles.textarea}
            placeholder="Ingrese cualquier observación adicional sobre el proyecto"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default DatosPrincipalesBasico;
