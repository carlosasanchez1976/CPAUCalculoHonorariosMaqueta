import { useEffect, useState } from 'react';
import Input from '../../common/Input';
import { formatCurrencyARS, formatCurrencyUSD } from '../../../utils/formatters';
import styles from './DatosObraBasico.module.css';

/**
 * Paso 1 - Datos Específicos de la Obra
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 * Incluye cálculo automático del valor de obra
 */
const DatosObraBasico = ({ formData, onChange }) => {
  const [valorObraCalculado, setValorObraCalculado] = useState(0);

  // Calcular valor de obra automáticamente
  useEffect(() => {
    const superficie = parseFloat(formData.superficieTotal) || 0;
    const valorM2 = parseFloat(formData.valorMetro2) || 0;
    const cotizacion = parseFloat(formData.cotizDolar) || 0;

    let valorBase = superficie * valorM2 * cotizacion;

    // Aplicar ajuste por complejidad
    if (formData.complejidad === 'Baja') {
      valorBase = valorBase * 0.9;
    } else if (formData.complejidad === 'Alta') {
      valorBase = valorBase * 1.1;
    }
    // Media no modifica el valor

    setValorObraCalculado(valorBase);
    
    // Actualizar en formData solo si el valor cambió para evitar loops infinitos
    const valorActual = parseFloat(formData.valorObra) || 0;
    if (Math.abs(valorActual - valorBase) > 0.01) {
      onChange({
        target: {
          name: 'valorObra',
          value: valorBase.toString()
        }
      });
    }
  }, [formData.superficieTotal, formData.valorMetro2, formData.cotizDolar, formData.complejidad, formData.valorObra, onChange]);

  const getComplejidadInfo = () => {
    switch (formData.complejidad) {
      case 'Baja':
        return { text: 'Se aplica un descuento del 10% al valor de obra', factor: '×0.9' };
      case 'Alta':
        return { text: 'Se aplica un incremento del 10% al valor de obra', factor: '×1.1' };
      case 'Media':
        return { text: 'No se aplican modificadores al valor de obra', factor: '×1.0' };
      default:
        return { text: '', factor: '' };
    }
  };

  const complejidadInfo = getComplejidadInfo();

  return (
    <div className={styles.container}>
      <h2 className={styles.stepTitle}>Datos Específicos de la Obra</h2>
      <p className={styles.stepDescription}>
        Ingrese las características técnicas y económicas del proyecto
      </p>

      <div className={styles.formGrid}>
        <Input
          label="Superficie Total (m²)"
          name="superficieTotal"
          type="number"
          value={formData.superficieTotal}
          onChange={onChange}
          placeholder="Ej: 1500"
          required
          min="0"
          step="0.01"
        />

        <Input
          label="Valor por m² (USD)"
          name="valorMetro2"
          type="number"
          value={formData.valorMetro2}
          onChange={onChange}
          placeholder="Ej: 1200"
          required
          min="0"
          step="0.01"
        />

        <Input
          label="Cotización del Dólar (ARS)"
          name="cotizDolar"
          type="number"
          value={formData.cotizDolar}
          onChange={onChange}
          placeholder="Ej: 1000"
          required
          min="0"
          step="0.01"
        />

        <div className={styles.selectWrapper}>
          <label className={styles.label}>
            Complejidad de la Obra
            <span className={styles.required}>*</span>
          </label>
          <select
            name="complejidad"
            value={formData.complejidad}
            onChange={onChange}
            className={styles.select}
          >
            <option value="">Seleccione...</option>
            <option value="Baja">Baja (Factor 0.9)</option>
            <option value="Media">Media (Factor 1.0)</option>
            <option value="Alta">Alta (Factor 1.1)</option>
          </select>
          {complejidadInfo.text && (
            <p className={styles.complejidadInfo}>
              <span className={styles.factor}>{complejidadInfo.factor}</span>
              {complejidadInfo.text}
            </p>
          )}
        </div>

        {/* Campo calculado - Valor de Obra */}
        <div className={styles.calculatedField}>
          <label className={styles.label}>
            Valor Total de la Obra (ARS)
          </label>
          <div className={styles.calculatedValue}>
            <span className={styles.currencySymbol}>$</span>
            <span className={styles.amount}>
              {formatCurrencyARS(valorObraCalculado, false)}
            </span>
          </div>
          <p className={styles.calculationFormula}>
            {formData.superficieTotal && formData.valorMetro2 && formData.cotizDolar ? (
              <>
                <strong>Cálculo:</strong> {formData.superficieTotal} m² × {formatCurrencyUSD(formData.valorMetro2, false)} USD × ${formData.cotizDolar}
                {formData.complejidad && formData.complejidad !== 'Media' && (
                  <span> {complejidadInfo.factor}</span>
                )}
              </>
            ) : (
              'Complete los campos para ver el cálculo'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatosObraBasico;
