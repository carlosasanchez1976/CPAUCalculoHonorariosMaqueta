import { useEffect, useState } from 'react';
import Input from '../../common/Input';
import { formatCurrencyARS } from '../../../utils/formatters';
import styles from './DatosObraBasico.module.css';

/**
 * Paso 2 - Datos Específicos de la Obra
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 * Incluye cálculo automático del valor de obra
 */
const DatosObraBasico = ({ formData, onChange, stepTitle }) => {
  const [valorObraCalculado, setValorObraCalculado] = useState(0);
  const [camposCompletos, setCamposCompletos] = useState(false);

  // Verificar si los campos principales están completos
  useEffect(() => {
    const completos = formData.superficieTotal && formData.valorMetro2;
    setCamposCompletos(!!completos);
  }, [formData.superficieTotal, formData.valorMetro2]);

  // Calcular valor de obra automáticamente
  useEffect(() => {
    const superficie = parseFloat(formData.superficieTotal) || 0;
    const valorM2 = parseFloat(formData.valorMetro2) || 0;

    const valorBase = superficie * valorM2;

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
  }, [formData.superficieTotal, formData.valorMetro2, formData.valorObra, onChange]);

  return (
    <div className={styles.container}>
      <h2 className="stepTitle">{stepTitle}</h2>

      <div className={styles.formGrid}>
        {/* Row 1: 2 inputs + campo calculado (3 columnas) */}
        <div className={styles.inputRow}>
          <Input
            label="Superficie total"
            name="superficieTotal"
            type="number"
            value={formData.superficieTotal}
            onChange={onChange}
            required
            min="0"
            step="0.01"
          />

          <Input
            label="Costo por m²"
            name="valorMetro2"
            type="number"
            value={formData.valorMetro2}
            onChange={onChange}
            required
            min="0"
            step="0.01"
          />

          {/* Campo calculado que se ve como input */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              Costo estimado de obra (ARS)
            </label>
            <div className={styles.calculatedInput}>
              {formData.superficieTotal && formData.valorMetro2 ? (
                `$ ${formatCurrencyARS(valorObraCalculado, false)}`
              ) : (
                '$ 0'
              )}
            </div>
          </div>
        </div>

        {/* Row 2: 3 notas, una por columna */}
        <div className={styles.notesRow}>
          {/* Nota columna 1 - Superficie */}
          <div className={styles.noteItem}>
            <p>
              <strong>NOTA:</strong> La superficie consideradora deberá definirse en función de las 
              características específicas de la obra y de los valores de referencia disponibles, 
              según el criterio técnico profesional, a fin de obtener la superficie total equivalente.
            </p>
          </div>

          {/* Nota columna 2 - Costo m2 */}
          <div className={styles.noteItem}>
            <p>
              <strong>NOTA:</strong> El valor considerador deberá definirse en función de las 
              características específicas de la obra y de los valores de referencia disponibles, 
              según el criterio técnico profesional.
            </p>
          </div>

          {/* Nota columna 3 - Costo total */}
          <div className={styles.noteItem}>
            {!camposCompletos && (
              <p>
                Completá los campos para ver el cálculo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosObraBasico;
