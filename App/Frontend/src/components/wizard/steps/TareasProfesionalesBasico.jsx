import { useState, useEffect } from 'react';
import styles from './TareasProfesionalesBasico.module.css';

/**
 * Paso 3 - Tareas Profesionales a Realizar
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const TareasProfesionalesBasico = ({ formData, onChange, stepTitle }) => {
  const [hasError, setHasError] = useState(false);

  // Validar que al menos una tarea esté en "Sí"
  useEffect(() => {
    const todasEnNo = [
      formData.obraProyecto,
      formData.obraDireccion,
      formData.instalacionSanitaria,
      formData.instalacionElectrica,
      formData.instalacionContraIncendio,
      formData.instalacionTermomecanica,
      formData.proyectoEstructuras
    ].every(tarea => tarea === false || tarea === 'No');

    setHasError(todasEnNo);
  }, [
    formData.obraProyecto,
    formData.obraDireccion,
    formData.instalacionSanitaria,
    formData.instalacionElectrica,
    formData.instalacionContraIncendio,
    formData.instalacionTermomecanica,
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
          <span className={styles.radioText}>SÍ</span>
          <input
            type="radio"
            name={fieldName}
            checked={value === true || value === 'Si'}
            onChange={() => handleRadioChange(fieldName, 'Si')}
            className={styles.radio}
          />
          
        </label>
        <label className={styles.radioOption}>
          <span className={styles.radioText}>NO</span>
          <input
            type="radio"
            name={fieldName}
            checked={value === false || value === 'No'}
            onChange={() => handleRadioChange(fieldName, 'No')}
            className={styles.radio}
          />
          
        </label>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <h2 className="stepTitle">{stepTitle}</h2>

      {hasError && (
        <div className={styles.errorAlert}>
          ⚠️ Debe seleccionar al menos una tarea profesional para continuar
        </div>
      )}

      <div className={styles.tareasContainer}>
        {/* Columna 1: Grupos de tareas */}

        <div className={styles.tareasColumn}>
          {/* Grupo 1: Obra */}
            
            <label className={styles.label}>
              Obra de Arquitectura
            </label>

          <div className={styles.tareaGroup}>
            
            <RadioGroup
              label="Proyecto de obra"
              fieldName="obraProyecto"
              value={formData.obraProyecto}
            />
            <RadioGroup
              label="Dirección de obra"
              fieldName="obraDireccion"
              value={formData.obraDireccion}
            />
          </div>

            <label className={styles.label}>

            </label>

            <label className={styles.label}>
              Estructuras
            </label>


          {/* Grupo 2: Estructuras */}
          <div className={styles.tareaGroup}>
            
            <RadioGroup
              label="Proyecto de estructuras"
              fieldName="proyectoEstructuras"
              value={formData.proyectoEstructuras}
            />
          </div>

            <label className={styles.label}>

            </label>

            <label className={styles.label}>
              Proyecto de instalaciones
            </label>


          {/* Grupo 3: Instalaciones */}
          <div className={styles.tareaGroup}>

            <RadioGroup
              label="Instalaciones sanitarias y gas"
              fieldName="instalacionSanitaria"
              value={formData.instalacionSanitaria}
            />
            <RadioGroup
              label="Instalaciones eléctricas"
              fieldName="instalacionElectrica"
              value={formData.instalacionElectrica}
            />
            <RadioGroup
              label="Instalaciones contra incendio"
              fieldName="instalacionContraIncendio"
              value={formData.instalacionContraIncendio}
            />
            <RadioGroup
              label="Instalaciones termomecánicas"
              fieldName="instalacionTermomecanica"
              value={formData.instalacionTermomecanica}
            />
          </div>
        </div>

        {/* Columna 2: Observaciones */}
        <div className={styles.observacionesColumn}>
          <div className={styles.observacionesWrapper}>
            <label className={styles.label}>
              Observaciones
            </label>
            <textarea
              name="observacionesTareas"
              value={formData.observacionesTareas}
              onChange={onChange}
              className={styles.textarea}
              placeholder="Ingrese aquí cualquier observación relevante sobre las tareas profesionales a realizar..."
              rows={12}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TareasProfesionalesBasico;
