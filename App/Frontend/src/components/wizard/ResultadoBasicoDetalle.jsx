import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaSave, FaCalculator, FaHome } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
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
  const pdfRef = useRef(null);
  const [calculationNumber] = useState(generateCalculationNumber());
  const currentDate = formatDate(new Date());

  const handleNuevoCalculo = () => {
    navigate('/nuevo-calculo');
  };

  const handleVolverDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const handleDescargarPDF = () => {
    const element = pdfRef.current;
    
    // Aplicar clase temporal para estilos compactos de PDF
    element.classList.add(styles.pdfExport);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Honorarios-CPAU-${calculationNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        windowWidth: 1000
      },
      jsPDF: { unit: 'mm', format: 'legal', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Quitar clase temporal después de generar el PDF
      element.classList.remove(styles.pdfExport);
    });
  };

  return (
    <div className={styles.container}>
      {/* Contenido para PDF */}
      <div ref={pdfRef}>
      {/* Header del Certificado */}
      <div className={styles.certificateHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.logoPlaceholder}>CPAU</div>
        </div>
        <div className={styles.headerRight}>
          <h3 className={styles.title}>Cálculo de honorarios profesionales</h3>
          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Tipo:</span>
              <span className={styles.metadataValue}>Proyecto y Dirección de obras de arquitectura</span>
            </div>
            <div className={styles.metadataItem}>
              <span >Fecha:</span>
              <span >{currentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout de Dos Columnas */}
      <div className={styles.twoColumnLayout}>
        {/* COLUMNA IZQUIERDA */}
        <div className={styles.leftColumn}>
          {/* Resumen del Proyecto */}
          <div className={styles.proyectoResumen}>
            <h4 className={styles.sectionTitle}>Resumen del Proyecto</h4>
            <div className={styles.resumenGrid}>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Nombre del Proyecto:</span>
                <span className={styles.resumenValue}>{formData.nombreProyecto}</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Comitente:</span>
                <span className={styles.resumenValue}>{formData.cliente}</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Tipo de obra:</span>
                <span className={styles.resumenValue}>{formData.tipoObra}</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Destino/Uso:</span>
                <span className={styles.resumenValue}>{formData.destinoUso}</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Superficie total:</span>
                <span className={styles.resumenValue}>{formData.superficieTotal} m²</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Costo estimado de obra (ARS):</span>
                <span className={styles.resumenValue}>{formatCurrencyARS(formData.valorObra)}</span>
              </div>
            </div>
          </div>

          {/* Disclaimer Legal */}
          <div className={styles.disclaimer}>
            <h4 className={styles.disclaimerTitle}>IMPORTANTE</h4>
            <p className={styles.disclaimerText}>
              Este cálculo es una <strong>estimación de referencia</strong> basada en los datos proporcionados 
              y factores estándar del mercado. Los valores finales pueden variar según condiciones particulares 
              de cada proyecto. <strong>No constituye una cotización formal ni un compromiso contractual.</strong>
              <br />
              <span>Vigencia de índices: Febrero 2026</span>
              <br />
              <span>Base de cálculo: arancel sugerido CPAU (versión 2026)</span>
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className={styles.rightColumn}>
          {/* Tabla de Resultados */}
          {formData.detalleHonorarios && formData.detalleHonorarios.length > 0 && (
            <div className={styles.resultsSection}>
              <h4 className={styles.sectionTitle}>Detalle de honorarios</h4>
              
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ítem</th>
                      <th>Tarea Profesional</th>
                      <th className={styles.rightAlign}>Importe</th>
                      <th className={styles.centered}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.detalleHonorarios.map((item) => (
                      <tr key={item.item}>
                        <td className={styles.centered}>{item.item}</td>
                        <td>{item.tareaProfesional}</td>
                        <td className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
                        <td className={styles.centered}>00%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.totalRow}>
                      <td colSpan={2}><strong>Total honorarios profesionales</strong></td>
                      <td className={styles.rightAlign}>
                        <strong className={styles.totalAmount}>
                          {formatCurrencyARS(
                            formData.detalleHonorarios.reduce((sum, item) => sum + item.importe, 0)
                          )}
                        </strong>
                      </td>
                      <td className={styles.centered}><strong>00%</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
            </div>
            
          )}

          <div className={styles.notaFinal}>
            <p>
              Nota: Este honorario corresponde únicamente a las tareas profesionales seleccionadas. NO incluye IVA.
            </p>
          </div>

          {/* Checkbox de Términos - Movido aquí */}
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

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <tfoot>
                    <tr className={styles.table}>
                      <td colSpan={2}><strong>Recomendamos leer las notas anexas al PDF descargable</strong></td>
                      <td colSpan={2}>
                        <Button
                          
                          disabled={!termsAccepted}
                          onClick={handleDescargarPDF}
                          icon={<FaDownload />}
                        >
                          Descargar PDF
                        </Button>

                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>




        </div>
      </div>

      </div>
      {/* Fin contenido para PDF */}

    </div>
  );
};

export default ResultadoBasicoDetalle;
