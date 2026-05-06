import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaSave, FaCalculator, FaHome } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import { formatCurrencyARS, formatDate, generateCalculationNumber } from '../../utils/formatters';
import Button from '../common/Button';
import { ROUTES } from '../../utils/constants';
import DetalleItemsModal from './DetalleItemsModal';
import styles from './ResultadoBasicoDetalle.module.css';

/**
 * Paso 5 - Resultado del Cálculo
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const ResultadoBasicoDetalle = ({ formData, calculationResult, onAcceptTerms, termsAccepted }) => {
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [calculationNumber] = useState(generateCalculationNumber());
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const currentDate = formatDate(new Date());

  const mostrarDetalleItems = () => {
    setModalDetalleAbierto(true);
  };

  const cerrarModalDetalle = () => {
    setModalDetalleAbierto(false);
  };

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

  // Agrupar y totalizar honorarios por tarea profesional
  const agruparHonorariosPorTarea = (detalleHonorarios) => {
    if (!detalleHonorarios || detalleHonorarios.length === 0) return [];

    const agrupado = [];
    const mapaIndices = {};
    
    detalleHonorarios.forEach((item) => {
      const tarea = item.tareaProfesional;
      
      if (!(tarea in mapaIndices)) {
        // Primera vez que aparece esta tarea, agregarla al array
        mapaIndices[tarea] = agrupado.length;
        agrupado.push({
          tareaProfesional: tarea,
          importe: 0,
          items: []
        });
      }
      
      const indice = mapaIndices[tarea];
      agrupado[indice].importe += item.importe;
      agrupado[indice].items.push(item);
    });

    // Retornar array en orden original (sin ordenar)
    return agrupado;
  };

  const honorariosAgrupados = agruparHonorariosPorTarea(formData.detalleHonorarios);

  return (
    <div className={styles.container}>
      {/* Contenido para PDF */}
      <div ref={pdfRef}>
      {/* Header del Certificado */}
      <div className={styles.certificateHeader}>
        <div className={styles.headerLeft}>
          <img src="/assets/icons/logoBlanco.svg" alt="CPAU Logo" className={styles.logo} />
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
                      <th colSpan={1}>Ítem</th>
                      <th colSpan={2}>Tarea Profesional</th>
                      <th colSpan={3} className={styles.rightAlign}>Importe</th>
                      <th colSpan={2} className={styles.centered}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {honorariosAgrupados.map((grupo, index) => (
                      <tr key={grupo.tareaProfesional}>
                        <td colSpan={1} className={styles.centered}>{index + 1}</td>
                        <td colSpan={2}>{grupo.tareaProfesional}</td>
                        <td colSpan={3} className={styles.rightAlign}>{formatCurrencyARS(grupo.importe)}</td>
                        <td colSpan={2} className={styles.centered}>{((grupo.importe / formData.valorObra) * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.totalRow}>
                      <td colSpan={3}><strong>Total honorarios profesionales</strong></td>
                      <td 
                        colSpan={3} 
                        className={styles.rightAlign}
                        onDoubleClick={mostrarDetalleItems}
                        title="Doble click para ver detalle completo"
                        style={{ cursor: 'pointer' }}
                      >
                        <strong className={styles.totalAmount}>
                          {formatCurrencyARS(
                            honorariosAgrupados.reduce((sum, grupo) => sum + grupo.importe, 0)
                          )}
                        </strong>
                      </td>
                      <td colSpan={2} className={styles.centered}>
                        <strong>
                          {((honorariosAgrupados.reduce((sum, grupo) => sum + grupo.importe, 0) / formData.valorObra) * 100).toFixed(2)}%
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
            </div>
            
          )}

          <div className={styles.notaFinal}>
            <p>
              NOTA: Este honorario corresponde únicamente a las tareas profesionales seleccionadas. NO incluye IVA.
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
                      <td colSpan={2} className={styles.alignedCell}>
                        <div className={styles.noteBox}>
                          <strong>Recomendamos leer las notas anexas al PDF descargable</strong>
                        </div>
                      </td>
                      <td colSpan={2} className={styles.alignedCell}>
                        <Button
                          className={styles.downloadButton}
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

      {/* Modal de detalle de items */}
      {formData.detalleHonorarios && formData.detalleHonorarios.length > 0 && (
        <DetalleItemsModal
          isOpen={modalDetalleAbierto}
          onClose={cerrarModalDetalle}
          detalleHonorarios={formData.detalleHonorarios}
        />
      )}

    </div>
  );
};

export default ResultadoBasicoDetalle;
