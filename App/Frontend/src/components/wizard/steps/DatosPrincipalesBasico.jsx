import Input from '../../common/Input';
import styles from './DatosPrincipalesBasico.module.css';

/**
 * Paso 0 - Datos Principales del Proyecto
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const DatosPrincipalesBasico = ({ formData, onChange, stepTitle }) => {
  return (
    <div className={styles.container}>
      <h2 className="stepTitle">{stepTitle}</h2>

      <div className={styles.formGrid}>
        {/* FILA 1: Tres campos en una fila */}
        <div className={styles.inputRow}>
          <Input
            // label="Nombre del Proyecto"
            name="nombreProyecto"
            value={formData.nombreProyecto}
            onChange={onChange}
            placeholder="Nombre del proyecto"
            required
          />

          <Input
            // label="Comitente"
            name="cliente"
            value={formData.cliente}
            onChange={onChange}
            placeholder="Comitente"
            required
          />

          <Input
            // label="Ubicación"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={onChange}
            placeholder="Ubicación"
            required
          />
        </div>

        {/* FILA 2: Dos desplegables */}
        <div className={styles.selectRow}>
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
              <option value="Nueva">Nueva</option>
              <option value="Remodelación">Remodelación</option>
              <option value="Ampliación">Ampliación</option>
              <option value="Remodelación y ampliación">Remodelación y ampliación</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label className={styles.label}>
              Destino/Uso
              <span className={styles.required}>*</span>
            </label>
            <select
              name="destinoUso"
              value={formData.destinoUso}
              onChange={onChange}
              className={styles.select}
            >
              <option value="">Seleccione...</option>
              <option value="Residencial Unifamiliar">Residencial Unifamiliar</option>
              <option value="Residencial Multifamiliar">Residencial Multifamiliar</option>
              <option value="Industrial">Industrial</option>
              <option value="Comercial">Comercial</option>
              <option value="Administrativo/oficina">Administrativo/oficina</option>
              <option value="Infraestructura">Infraestructura</option>
              <option value="Arquitectura para la Salud">Arquitectura para la Salud</option>
              <option value="Hoteles">Hoteles</option>
              <option value="Cultural">Cultural</option>
              <option value="Uso público">Uso público</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>

        {/* Observaciones a todo el ancho */}
        <div className={styles.textareaWrapper}>
          <label className={styles.label}>
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

export default DatosPrincipalesBasico;
