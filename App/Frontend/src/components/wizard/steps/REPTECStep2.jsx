import Input from '../../common/Input';
import sharedStyles from './SharedStepStyles.module.css';
import styles from './DatosPrincipalesBasico.module.css';

/**
 * Paso 2 - Datos Específicos del Proyecto
 * Específico para el cálculo REPTEC, pero puede ser adaptado para otros cálculos que requieran información detallada sobre la obra.
 */
const REPTECStep2 = ({ formData, onChange, stepTitle }) => {


  // Handler personalizado para el cambio de tipo de obra
  const handleTipoObraChange = (e) => {
    const tipoObraSeleccionado = e.target.value;
    
    // Determinar los valores según el tipo de obra
    let valorObraLabel, valorObraPlaceHolder;
    
    if (tipoObraSeleccionado === 'IEC' || tipoObraSeleccionado === 'RTE') {
      valorObraLabel = 'Capacidad de contratación de la empresa constructora';
      valorObraPlaceHolder = '(ARS) *';
    } else {
      valorObraLabel = 'Monto de la obra';
      valorObraPlaceHolder = '(ARS) *';
    }
    
    // Actualizar todos los valores usando onChange
    onChange(e); // Actualizar tipoObra
    
    onChange({ 
      target: { 
        name: 'valorObraLabel', 
        value: valorObraLabel 
      } 
    });
    
    onChange({ 
      target: { 
        name: 'valorObraPlaceHolder', 
        value: valorObraPlaceHolder 
      } 
    });
  };
  


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
              onChange={handleTipoObraChange}
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
