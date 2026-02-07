import { useState, useEffect } from 'react';
import styles from './TareasProfesionalesBasico.module.css';

/**
 * Paso 2 - Tareas Profesionales a Realizar
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const TareasProfesionalesBasico = ({ formData, onChange }) => {
  const [hasError, setHasError] = useState(false);

  // Validar que al menos una tarea esté en "Sí"
  useEffect(() => {
    const todasEnNo = [
      formData.obraProyecto,
      formData.obraDireccion,
      formData.instalacionSanitaria,
      formData.instalacionElectrica,
      formData.instalacionContraIncendio,
      formData.proyectoEstructuras
    ].every(tarea => tarea === false || tarea === 'No');

    setHasError(todasEnNo);
  }, [
    formData.obraProyecto,
    formData.obraDireccion,
    formData.instalacionSanitaria,
    formData.instalacionElectrica,
    formData.instalacionContraIncendio,
    formData.proyectoEstructuras
  ]);

  const handleRadioChange = (fieldName, value) => {
    onChange({
      target: {
        name: fieldName,
        value: value === 'Si'
      }
    });
  };

  const RadioGroup = ({ label, fieldName, value }) => (
    <div className={styles.radioGroup}>
      <span className={styles.radioLabel}>{label}</span>
      <div className={styles.radioButtons}>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name={fieldName}
            checked={value === true || value === 'Si'}
            onChange={() => handleRadioChange(fieldName, 'Si')}
            className={styles.radio}
          />
          <span className={styles.radioText}>Sí</span>
        </label>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name={fieldName}
            checked={value === false || value === 'No'}
            onChange={() => handleRadioChange(fieldName, 'No')}
            className={styles.radio}
          />
          <span className={styles.radioText}>No</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.stepTitle}>Tareas Profesionales a Realizar</h2>
      <p className={styles.stepDescription}>
        Seleccione las tareas profesionales que se incluirán en el cálculo de honorarios
      </p>

      {hasError && (
        <div className={styles.errorAlert}>
          ⚠️ Debe seleccionar al menos una tarea profesional para continuar
        </div>
      )}

      <div className={styles.tareasContainer}>
        {/* Grupo 1: Obra */}
        <div className={styles.tareaGroup}>
          <h3 className={styles.groupTitle}>Obra de Arquitectura</h3>
          <RadioGroup
            label="Proyecto de Obra"
            fieldName="obraProyecto"
            value={formData.obraProyecto}
          />
          <RadioGroup
            label="Dirección de Obra"
            fieldName="obraDireccion"
            value={formData.obraDireccion}
          />
        </div>

        {/* Grupo 2: Instalaciones */}
        <div className={styles.tareaGroup}>
          <h3 className={styles.groupTitle}>Proyectos de Instalaciones</h3>
          <RadioGroup
            label="Instalación Sanitaria"
            fieldName="instalacionSanitaria"
            value={formData.instalacionSanitaria}
          />
          <RadioGroup
            label="Instalación Eléctrica"
            fieldName="instalacionElectrica"
            value={formData.instalacionElectrica}
          />
          <RadioGroup
            label="Instalación Contra Incendio"
            fieldName="instalacionContraIncendio"
            value={formData.instalacionContraIncendio}
          />
        </div>

        {/* Grupo 3: Estructuras */}
        <div className={styles.tareaGroup}>
          <h3 className={styles.groupTitle}>Estructuras</h3>
          <RadioGroup
            label="Proyecto de Estructuras"
            fieldName="proyectoEstructuras"
            value={formData.proyectoEstructuras}
          />
        </div>

        {/* Observaciones */}
        <div className={styles.observacionesWrapper}>
          <label className={styles.label}>
            Observaciones de las Tareas
          </label>
          <textarea
            name="observacionesTareas"
            value={formData.observacionesTareas}
            onChange={onChange}
            className={styles.textarea}
            placeholder="Ingrese observaciones adicionales sobre las tareas seleccionadas"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default TareasProfesionalesBasico;
