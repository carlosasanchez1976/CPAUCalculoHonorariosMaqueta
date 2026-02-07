import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaSave, FaCalculator, FaHome } from 'react-icons/fa';
import { formatCurrencyARS, formatDate, generateCalculationNumber } from '../../utils/formatters';
import Button from '../common/Button';
import { ROUTES } from '../../utils/constants';
import styles from './ResultadoBasicoDetalle.module.css';

/**
 * Paso 5 - Resultado del Cálculo
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const ResultadoBasicoDetalle = ({ formData, calculationResult, onAcceptTerms, termsAccepted }) => {
  const navigate = useNavigate();
  const [calculationNumber] = useState(generateCalculationNumber());
  const currentDate = formatDate(new Date());

  const handleNuevoCalculo = () => {
    navigate('/nuevo-calculo');
  };

  const handleVolverDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className={styles.container}>
      {/* Header del Certificado */}
      <div className={styles.certificateHeader}>
        <div className={styles.headerBorder}></div>
        <div className={styles.headerContent}>
          <h1 className={styles.organization}>CPAU</h1>
          <h2 className={styles.organizationFull}>
            CONSEJO PROFESIONAL DE<br />
            ARQUITECTURA Y URBANISMO
          </h2>
          <div className={styles.divider}></div>
          <h3 className={styles.title}>CÁLCULO DE HONORARIOS PROFESIONALES</h3>
          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Tipo:</span>
              <span className={styles.metadataValue}>Honorarios de Especialidades - Básico</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Fecha:</span>
              <span className={styles.metadataValue}>{currentDate}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Nº de Cálculo:</span>
              <span className={styles.metadataValue}>{calculationNumber}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerBorder}></div>
      </div>

      {/* Resumen del Proyecto */}
      <div className={styles.proyectoResumen}>
        <h4 className={styles.sectionTitle}>Resumen del Proyecto</h4>
        <div className={styles.resumenGrid}>
          <div className={styles.resumenItem}>
            <span className={styles.resumenLabel}>Proyecto:</span>
            <span className={styles.resumenValue}>{formData.nombreProyecto}</span>
          </div>
          <div className={styles.resumenItem}>
            <span className={styles.resumenLabel}>Cliente:</span>
            <span className={styles.resumenValue}>{formData.cliente}</span>
          </div>
          <div className={styles.resumenItem}>
            <span className={styles.resumenLabel}>Tipo de Obra:</span>
            <span className={styles.resumenValue}>{formData.tipoObra}</span>
          </div>
          <div className={styles.resumenItem}>
            <span className={styles.resumenLabel}>Superficie:</span>
            <span className={styles.resumenValue}>{formData.superficieTotal} m²</span>
          </div>
          {formData.complejidad && (
            <div className={styles.resumenItem}>
              <span className={styles.resumenLabel}>Complejidad:</span>
              <span className={styles.resumenValue}>{formData.complejidad}</span>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer Legal */}
      <div className={styles.disclaimer}>
        <h4 className={styles.disclaimerTitle}>⚠️ IMPORTANTE</h4>
        <p className={styles.disclaimerText}>
          Este cálculo es una <strong>estimación de referencia</strong> basada en los datos proporcionados 
          y factores estándar del mercado. Los valores finales pueden variar según condiciones particulares 
          de cada proyecto. <strong>No constituye una cotización formal ni un compromiso contractual.</strong> Para 
          un cálculo definitivo, consulte con un profesional matriculado del CPAU.
        </p>
        <div className={styles.disclaimerMeta}>
          <span><strong>Vigencia de índices:</strong> Febrero 2026</span>
          <span><strong>Base de cálculo:</strong> Resolución CPAU 3220 (adaptada)</span>
        </div>
      </div>

      {/* Tabla de Resultados */}
      {calculationResult && (
        <div className={styles.resultsSection}>
          <h4 className={styles.sectionTitle}>Detalle de Honorarios</h4>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th className={styles.rightAlign}>Horas</th>
                  <th className={styles.rightAlign}>Tarifa/Hora</th>
                  <th className={styles.rightAlign}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {calculationResult.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.concepto}</td>
                    <td className={styles.rightAlign}>{item.horas}</td>
                    <td className={styles.rightAlign}>{formatCurrencyARS(item.tarifa)}</td>
                    <td className={styles.rightAlign}>{formatCurrencyARS(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.subtotalRow}>
                  <td colSpan={3}><strong>Subtotal Honorarios Profesionales</strong></td>
                  <td className={styles.rightAlign}>
                    <strong>{formatCurrencyARS(calculationResult.honorariosProfesionales)}</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>IVA (21%)</td>
                  <td className={styles.rightAlign}>{formatCurrencyARS(calculationResult.impuestos)}</td>
                </tr>
                <tr>
                  <td colSpan={3}>Gastos Administrativos (5%)</td>
                  <td className={styles.rightAlign}>{formatCurrencyARS(calculationResult.gastosAdministrativos)}</td>
                </tr>
                <tr className={styles.totalRow}>
                  <td colSpan={3}><strong>TOTAL GENERAL</strong></td>
                  <td className={styles.rightAlign}>
                    <strong className={styles.totalAmount}>{formatCurrencyARS(calculationResult.totalGeneral)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Checkbox de Términos */}
      <div className={styles.termsCheckbox}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onAcceptTerms(e.target.checked)}
            className={styles.checkbox}
          />
          <span>He leído y acepto las condiciones del cálculo</span>
        </label>
      </div>

      {/* Botones de Acción */}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={handleNuevoCalculo}
          icon={<FaCalculator />}
        >
          Nuevo Cálculo
        </Button>

        <Button
          variant="secondary"
          disabled
          icon={<FaDownload />}
          title="Próximamente"
        >
          Descargar PDF
        </Button>

        <Button
          variant="secondary"
          disabled
          icon={<FaSave />}
          title="Próximamente"
        >
          Guardar Cálculo
        </Button>

        <Button
          variant="primary"
          onClick={handleVolverDashboard}
          icon={<FaHome />}
        >
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ResultadoBasicoDetalle;
