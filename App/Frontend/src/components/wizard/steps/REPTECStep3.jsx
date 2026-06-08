import { useState, useEffect } from 'react';
import Input from '../../common/Input';
import sharedStyles from './SharedStepStyles.module.css';
import styles from './TareasProfesionalesBasico.module.css';

/**
 * Paso 3 - Tareas Profesionales a Realizar
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const TareasProfesionalesBasico = ({ formData, onChange, stepTitle }) => {
  
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

  // Renderizado condicional según tipo de obra
  if (formData.tipoObra === 'IEC') {
    return (
      <div className={styles.container}>
        <h2 className="stepTitle">{stepTitle}</h2>
        <div className={styles.tareasContainer}>
          <div className={styles.tareasColumn}>

            <div className={styles.selectWrapper}>
              <label className={sharedStyles.label}>
                Capacidad de contratación de la empresa constructora
                <span className={sharedStyles.required}>*</span>
              </label>
            <div className={sharedStyles.inputRow}>

            <Input
              // label="Nombre del Proyecto"
              name="valorObra"
              type="number"
              value={formData.valorObra}
              onChange={onChange}
              placeholder="(ARS) *"
              required
            />

            </div>
          </div>

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
    </div>
    );
  }
  
  if (formData.tipoObra === 'RTE') {
    return (
      <div className={styles.container}>
        <h2 className="stepTitle">{stepTitle}</h2>
        <div className={styles.tareasContainer}>
          <div className={styles.tareasColumn}>

            <div className={styles.selectWrapper}>
              <label className={sharedStyles.label}>
                Capacidad de contratación de la empresa constructora
                <span className={sharedStyles.required}>*</span>
              </label>
            <div className={sharedStyles.inputRow}>

            <Input
              // label="Nombre del Proyecto"
              name="valorObra"
              type="number"
              value={formData.valorObra}
              onChange={onChange}
              placeholder="(ARS) *"
              required
            />

            </div>
          </div>

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
    </div>
    );
  }

  // Render por defecto para otros casos (POL u otros)
  // Asegurar que obraProyecto sea un número (0 o 1)
  if (formData.obraProyecto !== 0 && formData.obraProyecto !== 1) {
    formData.obraProyecto = 0;
  }
  return (

    <div className={styles.container}>
      <h2 className="stepTitle">{stepTitle}</h2>

      <div className={styles.tareasContainer}>

          <div className={styles.tareasColumn}>
            
            <div className={styles.selectWrapper}>
              <label className={sharedStyles.label}>
                Monto de la obra
                <span className={sharedStyles.required}>*</span>
              </label>
            <div className={sharedStyles.inputRow}>

            <Input
              // label="Nombre del Proyecto"
              name="valorObra"
              type="number"
              value={formData.valorObra}
              onChange={onChange}
              placeholder="(ARS) *"
              required
            />
            </div>
          </div>


            {/* Grupo 1: Obra */}
            <label className={styles.label}>
              Tipo de tarea profesional
              <span className={sharedStyles.required}>*</span>
            </label>
  
            <div className={styles.tareaGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="obraProyecto"
                  value="0"
                  checked={formData.obraProyecto === 0}
                  onChange={(e) => onChange({ target: { name: 'obraProyecto', value: parseInt(e.target.value, 10) }})}
                  className={styles.radio}
                />
                <span className={styles.radioText}>La oferta de licitación no fué adjudicada</span>
              </label>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="obraProyecto"
                  value="1"
                  checked={formData.obraProyecto === 1}
                  onChange={(e) => onChange({ target: { name: 'obraProyecto', value: parseInt(e.target.value, 10) }})}
                  className={styles.radio}
                />
                <span className={styles.radioText}>La empresa ha designado otro profesional</span>
              </label>
            </div>
    
            </div>
      </div>
      
    </div>
  );

};

export default TareasProfesionalesBasico;
