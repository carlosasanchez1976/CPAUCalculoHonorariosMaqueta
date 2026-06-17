import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaSpinner } from 'react-icons/fa';

import { formatCurrencyARS, formatDate } from '../../utils/formatters';
import { descargarCertificadoPDF } from '../../services/pdfService';
import Button from '../common/Button';
import { ROUTES } from '../../utils/constants';
import DetalleItemsModal from './DetalleItemsModal';
import styles from './ResultadoBasicoDetalle.module.css';
import sharedStyles from './steps/SharedStepStyles.module.css';

/**
 * Paso 5 - Resultado del Cálculo
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const ResultadoBasicoDetalle = ({ formData, calculationResult, onAcceptTerms, termsAccepted }) => {
  const navigate = useNavigate();
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [errorPDF, setErrorPDF] = useState(null);
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

  /**
   * Handler para descargar PDF desde el backend
   * Llama al endpoint /api/calculos/exportar-pdf y dispara la descarga
   */
  const handleDescargarPDF = async () => {
    setLoadingPDF(true);
    setErrorPDF(null);

    try {
      // Llamar al backend para generar el PDF
      const blob = await descargarCertificadoPDF({
        tipoCalculo: 'basico-proyecto-direccion',
        formData,
        calculationResult
      });

      // Crear URL temporal del blob
      const url = URL.createObjectURL(blob);
      
      // Crear elemento <a> temporal para disparar descarga
      const link = document.createElement('a');
      link.href = url;
      //transformar formdata.calculoId a un string tipo 000275 para usar en el nombre del archivo
      const calculoIdStr = String(formData.calculoId).padStart(6, '0');
      link.download = `Honorarios-CPAU-${calculoIdStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      


      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error descargando PDF:', error);
      setErrorPDF(error.message || 'Error al generar el PDF');
    } finally {
      setLoadingPDF(false);
    }
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

  /**
   * Categoriza honorarios en 3 grupos según nombre de tarea
   * @param {Array} detalleHonorarios - Array de objetos { tareaProfesional, importe }
   * @returns {Object} { obra: [], adicionales: [], especialidades: [] }
   */
  const categorizarHonorarios = (detalleHonorarios) => {
    const obra = [];
    const adicionales = [];
    const especialidades = [];

    detalleHonorarios.forEach((item, index) => {
      const nombreTarea = item.tareaProfesional.toLowerCase();
      
      if (nombreTarea.includes('proyecto de obra') || nombreTarea.includes('dirección de obra')) {
        obra.push({ ...item, indice: index + 1 });
      } else if (nombreTarea.includes('documentación ejecutiva') || nombreTarea.includes('supervisión de obra')) {
        adicionales.push({ ...item, indice: index + 1 });
      } else {
        especialidades.push({ ...item, indice: index + 1 });
      }
    });

    return { obra, adicionales, especialidades };
  };

  /**
   * Calcula importe en USD
   * @param {number} importeARS - Importe en pesos argentinos
   * @param {number} cotizDolar - Tipo de cambio ARS/USD
   * @returns {number|null} Importe en USD o null si cotizDolar es 0
   */
  const calcularImporteUSD = (importeARS, cotizDolar) => {
    if (!cotizDolar || cotizDolar === 0) return null;
    return importeARS / cotizDolar;
  };

  /**
   * Calcula subtotal de una categoría
   * @param {Array} items - Array de honorarios de la categoría
   * @param {number} cotizDolar - Tipo de cambio ARS/USD
   * @param {number} valorObra - Valor de obra en ARS
   * @returns {Object} { totalARS, totalUSD, totalPorcentaje }
   */
  const calcularSubtotal = (items, cotizDolar, valorObra) => {
    const totalARS = items.reduce((sum, item) => sum + item.importe, 0);
    const totalUSD = calcularImporteUSD(totalARS, cotizDolar);
    const totalPorcentaje = (totalARS / valorObra) * 100;
    
    return { totalARS, totalUSD, totalPorcentaje };
  };

  const honorariosAgrupados = agruparHonorariosPorTarea(formData.detalleHonorarios);

  // Categorizar honorarios y calcular subtotales
  const { obra, adicionales, especialidades } = categorizarHonorarios(honorariosAgrupados);
  
  const subtotalObra = calcularSubtotal(obra, formData.cotizDolar, formData.valorObra);
  const subtotalAdicionales = calcularSubtotal(adicionales, formData.cotizDolar, formData.valorObra);
  const subtotalEspecialidades = calcularSubtotal(especialidades, formData.cotizDolar, formData.valorObra);

  // Calcular total general
  const totalGeneral = {
    totalARS: subtotalObra.totalARS + subtotalAdicionales.totalARS + subtotalEspecialidades.totalARS,
    totalUSD: 
      (subtotalObra.totalUSD !== null && 
       subtotalAdicionales.totalUSD !== null && 
       subtotalEspecialidades.totalUSD !== null)
        ? subtotalObra.totalUSD + subtotalAdicionales.totalUSD + subtotalEspecialidades.totalUSD
        : null,
    totalPorcentaje: subtotalObra.totalPorcentaje + subtotalAdicionales.totalPorcentaje + subtotalEspecialidades.totalPorcentaje
  };
 

  return (
    <div className={sharedStyles.container}>
      {/* PÁGINA 1: Datos del cálculo */}
      <div className={styles.page}>
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
                  <span className={styles.metadataValue}>{formData.tipoNombre}</span>
                </div>
                <div className={styles.metadataItem}>
                  <span>Fecha:</span>
                  <span>{currentDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layout de Dos Columnas */}
          <div className={styles.twoColumnLayout}>
        {/* COLUMNA IZQUIERDA */}
        <div className={styles.leftColumn}>
          {/* Resumen del Proyecto */}
          <h4 className={styles.sectionTitle}>Resumen del Proyecto</h4>
          <div className={styles.proyectoResumen}>
            
            <div className={styles.resumenGrid}>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Nombre del Proyecto:</span>
                <span className={styles.resumenValue}>{formData.nombreProyecto}</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Comitente:</span>
                <span className={styles.resumenValue}>{formData.cliente}</span>
              </div>

              {/* Aquí se deben mostrar los datos que tengan valores */}
              {formData.tipoObra !== '' && (
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>{formData.labelTipoDeObra !== '' ? formData.labelTipoDeObra : 'Tipo de obra'}:</span>
                  <span className={styles.resumenValue}>{formData.textoTipoDeObra !== '' ? formData.textoTipoDeObra : formData.tipoObra}</span>
                </div>
              )}

              {formData.destinoUso !== '' && (
                 <div className={styles.resumenItem}>
                   <span className={styles.resumenLabel}>Destino/Uso:</span>
                   <span className={styles.resumenValue}>{formData.destinoUso}</span>
                 </div>
              )}
              {formData.superficieTotal !== '' && (
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Superficie total:</span>
                  <span className={styles.resumenValue}>{formData.superficieTotal} m²</span>
                </div>
              )}

              {formData.valorObra > 0 && (
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>{formData.valorObraLabel !== '' ? formData.valorObraLabel : 'Monto de la obra'} (ARS):</span>
                  <span className={styles.resumenValue}>{formatCurrencyARS(formData.valorObra)}</span>
                </div>
              )}
              {formData.cotizDolar > 0 && (
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Costo estimado de obra (USD):</span>
                  <span className={styles.resumenValue}>
                    {formData.cotizDolar && formData.cotizDolar > 0 
                      ? formatCurrencyARS(formData.valorObra / formData.cotizDolar)
                      : 'N/A'}
                  </span>
                </div>
              )}

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
              <br />
              <span>Vigencia de índices: Febrero 2026</span>
              <br />
              <span>Base de cálculo: arancel sugerido CPAU (versión 2026)</span>
            </p>
          </div>
          {/* Checkbox de Términos - Visible en pantalla, oculto en PDF */}
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

          {/* Botón de descarga - Visible en pantalla, oculto en PDF */}
          <div className={styles.footerContainer}>
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
                      disabled={!termsAccepted || loadingPDF}
                      onClick={handleDescargarPDF}
                    >
                      {loadingPDF ? (
                        <>
                          <FaSpinner className={styles.spinner} />
                          Generando PDF...
                        </>
                      ) : (
                        <>
                          <FaDownload />
                          Descargar PDF
                        </>
                      )}
                    </Button>
                    {errorPDF && (
                      <div className={styles.errorMessage} role="alert">
                        {errorPDF}
                      </div>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>




        </div>

        {/* COLUMNA DERECHA */}
        <div className={styles.rightColumn}>
          {/* Tabla de Resultados */}
          <h4 className={styles.sectionTitle}>Detalle de honorarios</h4>
          {formData.detalleHonorarios && formData.detalleHonorarios.length > 0 && (
            <>
              {/* SECCIÓN: Honorarios Obra */}
              {obra.length > 0 && (
                <div className={styles.resultsSection}>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.centered}>Ítem</th>
                          <th>Tarea Profesional</th>
                          <th className={styles.rightAlign}>Importe ARS</th>
                          <th className={styles.rightAlign}>Importe USD</th>
                          <th className={styles.centered}>% sobre costo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {obra.map((item) => (
                          <tr key={`obra-${item.indice}`}>
                            <td className={styles.centered}>{item.indice}</td>
                            <td>{item.tareaProfesional}</td>
                            <td className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
                            <td className={styles.rightAlign}>
                              {calcularImporteUSD(item.importe, formData.cotizDolar) !== null
                                ? formatCurrencyARS(calcularImporteUSD(item.importe, formData.cotizDolar))
                                : 'N/A'}
                            </td>
                            <td className={styles.centered}>{formData.valorObra > 0 ? ((item.importe / formData.valorObra) * 100).toFixed(2) : 'N/A'}%</td>
                          </tr>
                        ))}
                        
                        {/* Subtotal Obra */}
                        <tr className={styles.totalRow}>
                          <td colSpan={2}>
                            <strong>Total honorarios obra</strong>
                          </td>
                          <td className={styles.rightAlign}>
                            <strong>{formatCurrencyARS(subtotalObra.totalARS)}</strong>
                          </td>
                          <td className={styles.rightAlign}>
                            <strong>
                              {subtotalObra.totalUSD !== null
                                ? formatCurrencyARS(subtotalObra.totalUSD)
                                : 'N/A'}
                            </strong>
                          </td>
                          <td className={styles.centered}>
                            <strong>{subtotalObra.totalPorcentaje.toFixed(2)}%</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECCIÓN: Honorarios Adicionales */}
              {adicionales.length > 0 && (
                <div className={styles.resultsSection}>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.centered}>Ítem</th>
                          <th>Tarea Profesional</th>
                          <th className={styles.rightAlign}>Importe ARS</th>
                          <th className={styles.rightAlign}>Importe USD</th>
                          <th className={styles.centered}>% sobre costo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adicionales.map((item) => (
                          <tr key={`adic-${item.indice}`}>
                            <td className={styles.centered}>{item.indice}</td>
                            <td>{item.tareaProfesional}</td>
                            <td className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
                            <td className={styles.rightAlign}>
                              {calcularImporteUSD(item.importe, formData.cotizDolar) !== null
                                ? formatCurrencyARS(calcularImporteUSD(item.importe, formData.cotizDolar))
                                : 'N/A'}
                            </td>
                            <td className={styles.centered}>
                              {formData.valorObra > 0 ? ((item.importe / formData.valorObra) * 100).toFixed(2) : 'N/A'}%
                            </td>
                          </tr>
                        ))}
                        
                        {/* Subtotal Adicionales */}
                        <tr className={styles.totalRow}>
                          <td colSpan={2}>
                            <strong>Total honorarios adicionales</strong>
                          </td>
                          <td className={styles.rightAlign}>
                            <strong>{formatCurrencyARS(subtotalAdicionales.totalARS)}</strong>
                          </td>
                          <td className={styles.rightAlign}>
                            <strong>
                              {subtotalAdicionales.totalUSD !== null
                                ? formatCurrencyARS(subtotalAdicionales.totalUSD)
                                : 'N/A'}
                            </strong>
                          </td>
                          <td className={styles.centered}>
                            <strong>{subtotalAdicionales.totalPorcentaje.toFixed(2)}%</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECCIÓN: Honorarios Especialidades */}
              {especialidades.length > 0 && (
                <div className={styles.resultsSection}>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.centered}>Ítem</th>
                          <th>Tarea Profesional</th>
                          <th className={styles.rightAlign}>Importe ARS</th>
                          <th className={styles.rightAlign}>Importe USD</th>
                          <th className={styles.centered}>% sobre costo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {especialidades.map((item) => (
                          <tr key={`esp-${item.indice}`}>
                            <td className={styles.centered}>{item.indice}</td>
                            <td>{item.tareaProfesional}</td>
                            <td className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
                            <td className={styles.rightAlign}>
                              {calcularImporteUSD(item.importe, formData.cotizDolar) !== null
                                ? formatCurrencyARS(calcularImporteUSD(item.importe, formData.cotizDolar))
                                : 'N/A'}
                            </td>
                            <td className={styles.centered}>
                              {formData.valorObra > 0 ? ((item.importe / formData.valorObra) * 100).toFixed(2) + '%' : 'N/A'}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Subtotal Especialidades */}
                        <tr className={styles.totalRow}>
                          <td colSpan={2}>
                            <strong>Total honorarios especialidades</strong>
                          </td>
                          <td className={styles.rightAlign}>
                            <strong>{formatCurrencyARS(subtotalEspecialidades.totalARS)}</strong>
                          </td>
                          <td className={styles.rightAlign}>
                            <strong>
                              {subtotalEspecialidades.totalUSD !== null
                                ? formatCurrencyARS(subtotalEspecialidades.totalUSD)
                                : 'N/A'}
                            </strong>
                          </td>
                          <td className={styles.centered}>
                            {formData.valorObra > 0 ? (
                              <strong>{subtotalEspecialidades.totalPorcentaje.toFixed(2)}%</strong>
                            ) : (
                              <strong>N/A</strong>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TOTAL GENERAL */}
              <div className={styles.resultsSection}>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <tbody>
                      <tr 
                        className={styles.totalRow}
                        onDoubleClick={mostrarDetalleItems}
                        style={{ cursor: 'pointer' }}
                        title="Doble click para ver detalle de ítems"
                      >
                        <td colSpan={2}>
                          <strong>TOTAL GENERAL</strong>
                        </td>
                        <td className={styles.rightAlign}>
                          <strong>{formatCurrencyARS(totalGeneral.totalARS)}</strong>
                        </td>
                        <td className={styles.rightAlign}>
                          <strong>
                            {totalGeneral.totalUSD !== null
                              ? formatCurrencyARS(totalGeneral.totalUSD)
                              : 'N/A'}
                          </strong>
                        </td>
                        {/* necesito que lo siguiente ocupe lugar pero no lo vea el usuario, para que el porcentaje quede centrado respecto a los importes */}
                        <td className={styles.centered}>
                          <strong>{formData.valorObra > 0 ? totalGeneral.totalPorcentaje.toFixed(2) + '%' : 'N/A'}</strong>
                        </td>
                      </tr>
                      <tr className={styles.totalRow}>
                        <td colSpan={5}>
                          {formData.plazoEjecucion > 0
                            ? <strong>Plazo estimado de ejecución: {formData.plazoEjecucion} meses</strong>
                            : null}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
            
          )}

          <div className={styles.notaFinal}>
            <p>
              NOTA: Este honorario corresponde únicamente a las tareas profesionales seleccionadas. NO incluye IVA.
            </p>
          </div>

        </div>
        {/* Fin rightColumn */}
      </div>
      {/* Fin twoColumnLayout */}
      </div>
      {/* Fin página 1 */}

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
