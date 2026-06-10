import { useState, useEffect } from 'react';
import styles from './TareasProfesionalesBasico.module.css';

/**
 * Paso 3 - Tareas Profesionales a Realizar
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const TareasProfesionalesBasico = ({ formData, onChange, stepTitle }) => {
  const [hasError, setHasError] = useState(false);
  const [exclusionMessage, setExclusionMessage] = useState('');

  // Validar que al menos una tarea esté en "Sí"
  useEffect(() => {
    const todasEnNo = [
      formData.obraProyecto,
      formData.obraDireccion,
      formData.instalacionSanitaria,
      formData.instalacionElectrica,
      formData.instalacionContraIncendio,
      formData.instalacionTermomecanica,
      formData.proyectoEstructuras,
      formData.documentacionEjecutiva,
      formData.supervisionObra
    ].every(tarea => tarea === false || tarea === 'No');

    setHasError(todasEnNo);
  }, [
    formData.obraProyecto,
    formData.obraDireccion,
    formData.instalacionSanitaria,
    formData.instalacionElectrica,
    formData.instalacionContraIncendio,
    formData.instalacionTermomecanica,
    formData.proyectoEstructuras,
    formData.documentacionEjecutiva,
    formData.supervisionObra
  ]);

  const handleRadioChange = (fieldName, value) => {
    const isActivating = value === 'Si';
    
    // Validación de exclusión mutua: supervisionObra y obraDireccion no pueden estar ambos en true
    if (isActivating) {
      if (fieldName === 'supervisionObra' && formData.obraDireccion === true) {
        // Si activo supervisionObra, desactivo obraDireccion
        onChange({
          target: {
            name: 'obraDireccion',
            value: false
          }
        });
        setExclusionMessage('Se desactivó "Dirección de obra" porque es incompatible con "Supervisión de obra".');
        setTimeout(() => setExclusionMessage(''), 5000);
      } else if (fieldName === 'obraDireccion' && formData.supervisionObra === true) {
        // Si activo obraDireccion, desactivo supervisionObra
        onChange({
          target: {
            name: 'supervisionObra',
            value: false
          }
        });
        setExclusionMessage('Se desactivó "Supervisión de obra" porque es incompatible con "Dirección de obra".');
        setTimeout(() => setExclusionMessage(''), 5000);
      }
    }
    
    // Aplicar el cambio solicitado
    onChange({
      target: {
        name: fieldName,
        value: isActivating
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

      {exclusionMessage && (
        <div className={styles.infoAlert}>
          ℹ️ {exclusionMessage}
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
      
            </label>

            <label className={styles.label}>
              Especialidades
            </label>


          {/* Grupo 2: Especialidades */}
          <div className={styles.tareaGroup}>
            

            <RadioGroup
              label="Proyecto de estructuras"
              fieldName="proyectoEstructuras"
              value={formData.proyectoEstructuras}
            />


            <RadioGroup
              label="Proyecto de instalaciones sanitarias y gas"
              fieldName="instalacionSanitaria"
              value={formData.instalacionSanitaria}
            />
            <RadioGroup
              label="Proyecto de instalaciones eléctricas"
              fieldName="instalacionElectrica"
              value={formData.instalacionElectrica}
            />
            <RadioGroup
              label="Proyecto de instalaciones contra incendio"
              fieldName="instalacionContraIncendio"
              value={formData.instalacionContraIncendio}
            />
            <RadioGroup
              label="Proyecto de instalaciones termomecánicas"
              fieldName="instalacionTermomecanica"
              value={formData.instalacionTermomecanica}
            />
          </div>
        </div>



        <div className={styles.observacionesColumn}>

        {/* Columna 2: Observaciones */}
        {/* Grupo 3: Tareas adicionales */}
        
        <label className={styles.label}>
          Obra de Arquitectura
        </label>

        <div className={styles.tareaGroup}>
          
          <RadioGroup
            label="Documentación ejecutiva"
            fieldName="documentacionEjecutiva"
            value={formData.documentacionEjecutiva}
          />
          <RadioGroup
            label="Supervisión de obra"
            fieldName="supervisionObra"
            value={formData.supervisionObra}
          />
        </div>

            <label className={styles.label}>

            </label>

            <label className={styles.label}>
      
            </label>

            <div className={styles.noteItem}>
              <p>NOTAS: 1. La documentación ejecutiva puede tener diferentes alcances, por lo cual es
                indispensable explicitar los entregables que implica. 2. La supervisión de obra es una tarea
                de acompañamiento para la fiel interpretación del proyecto por parte de la dirección de
                obra, no incluye firma profesional y no reemplaza la obligatoriedad de un director de obra.
              </p>
            </div>
            
            <label className={styles.label}>

            </label>

            <label className={styles.label}>
      
            </label>




          <div className={styles.observacionesWrapper}>
            <label className={styles.label}>
              Observaciones
            </label>
            <textarea
              name="observTareas"
              value={formData.observTareas}
              onChange={onChange}
              className={styles.textarea}
              placeholder="Ingrese aquí cualquier observación relevante sobre las tareas profesionales a realizar..."
              rows={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TareasProfesionalesBasico;
