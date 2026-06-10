import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

import { formatCurrencyARS, formatDate, generateCalculationNumber } from '../../utils/formatters';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { ROUTES } from '../../utils/constants';
import DetalleItemsModal from './DetalleItemsModal';
import { PDF_NOTAS } from '../../utils/pdfConstants';
import styles from './ResultadoBasicoDetalle.module.css';
import sharedStyles from './steps/SharedStepStyles.module.css';

/**
 * Paso 5 - Resultado del Cálculo
 * Específico para el cálculo "Honorarios de Especialidades - Básico"
 */
const ResultadoBasicoDetalle = ({ formData, calculationResult, onAcceptTerms, termsAccepted }) => {
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  const [calculationNumber] = useState(generateCalculationNumber());
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
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
   * Abre ventana de previsualización del PDF
   * Permite al usuario revisar el contenido antes de generar el PDF
   */
  const handleDescargarPDF = () => {
    abrirVentanaPreview();
  };

  /**
   * Función expuesta globalmente para que la ventana de preview la pueda llamar
   */
  const mostrarModalMantenimiento = () => {
    setShowMaintenanceModal(true);
  };

  /**
   * Convierte rutas relativas de imágenes a rutas absolutas
   */
  const convertirRutasAAbsolutas = (elemento) => {
    const imagenes = elemento.querySelectorAll('img');
    imagenes.forEach(img => {
      if (img.src && !img.src.startsWith('http')) {
        const rutaAbsoluta = new URL(img.getAttribute('src'), window.location.origin).href;
        img.src = rutaAbsoluta;
      }
    });
  };

  /**
   * Copia todos los estilos CSS del documento principal a la ventana de previsualización
   * Retorna una Promise que se resuelve cuando todos los estilos están cargados
   */
  const copiarEstilosAVentana = (ventanaDestino) => {
    return new Promise((resolve) => {
      const promesasCSS = [];
      
      // Copiar todos los <link> de CSS
      const linksCSS = document.querySelectorAll('link[rel="stylesheet"]');
      linksCSS.forEach(link => {
        const promesa = new Promise((resolveLink) => {
          const nuevoLink = ventanaDestino.document.createElement('link');
          nuevoLink.rel = 'stylesheet';
          nuevoLink.href = link.href;
          nuevoLink.onload = () => resolveLink();
          nuevoLink.onerror = () => resolveLink(); // Continuar aunque falle
          ventanaDestino.document.head.appendChild(nuevoLink);
        });
        promesasCSS.push(promesa);
      });
      
      // Copiar todos los <style> inline
      const stylesInline = document.querySelectorAll('style');
      stylesInline.forEach(style => {
        const nuevoStyle = ventanaDestino.document.createElement('style');
        nuevoStyle.textContent = style.textContent;
        ventanaDestino.document.head.appendChild(nuevoStyle);
      });
      
      // Agregar estilos específicos para la ventana de preview
      const stylePreview = ventanaDestino.document.createElement('style');
      stylePreview.textContent = `
        body {
          margin: 0;
          padding: 0 0 80px 0;
          font-family: system-ui, -apple-system, sans-serif;
          background: #f5f5f5;
        }
        #preview-container {
          max-width: 900px;
          margin: 20px auto;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .preview-actions {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 2px solid #ddd;
          padding: 15px;
          text-align: center;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        .preview-actions button {
          padding: 12px 30px;
          font-size: 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin: 0 10px;
          transition: background-color 0.2s;
        }
        .btnCerrar {
          background: #6c757d;
          color: white;
        }
        .btnCerrar:hover {
          background: #5a6268;
        }
        .btnGenerarPDF {
          background: #007bff;
          color: white;
        }
        .btnGenerarPDF:hover {
          background: #0056b3;
        }
        .btnGenerarPDF:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        /* CRÍTICO: Estilos de impresión SOLO para esta ventana */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body {
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
          }

          #preview-container {
            margin: 0 !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          .preview-actions {
            display: none !important;
          }

          /* ============================================
             FIX HEADER: Forzar tamaños fijos en impresión
             Usa [class*="..."] para matchear clases hasheadas de CSS Modules
             ============================================ */
          [class*="certificateHeader"] {
            display: grid !important;
            grid-template-columns: 180px 1fr !important;
            gap: 0.5rem !important;
            align-items: stretch !important;
          }

          [class*="headerLeft"] {
            width: 180px !important;
            min-width: 180px !important;
            max-width: 180px !important;
            min-height: 100px !important;
            height: auto !important;
            padding: 1.2rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 8px !important;
          }

          [class*="headerRight"] {
            padding: 1rem 1.2rem !important;
            border-radius: 8px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }

          [class*="logo"]:not([class*="logoPlaceholder"]) {
            width: 130px !important;
            max-width: 130px !important;
            max-height: 65px !important;
            height: auto !important;
            object-fit: contain !important;
            display: block !important;
          }

          [class*="title"] {
            font-size: 1.4rem !important;
            margin: 0 !important;
            padding-bottom: 0.5rem !important;
            letter-spacing: 0.05rem !important;
          }

          [class*="metadata"]:not([class*="metadataItem"]):not([class*="metadataLabel"]):not([class*="metadataValue"]) {
            font-size: 0.9rem !important;
            gap: 1rem !important;
            margin-top: 0.5rem !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-wrap: wrap !important;
          }

          [class*="metadataItem"] {
            font-size: 0.9rem !important;
            display: flex !important;
            gap: 0.5rem !important;
          }
        }
      `;
      ventanaDestino.document.head.appendChild(stylePreview);
      
      // Esperar a que todos los CSS se carguen
      Promise.all(promesasCSS).then(() => {
        // Dar un poco más de tiempo para asegurar que los estilos se apliquen
        setTimeout(resolve, 200);
      });
    });
  };

  /**
   * Abre ventana de previsualización con el contenido del PDF
   */
  const abrirVentanaPreview = async () => {
    // Aplicar clase temporal para estilos de PDF
    const element = pdfRef.current;
    element.classList.add(styles.pdfExport);
    
    // Clonar el elemento
    const clonado = element.cloneNode(true);
    
    // Convertir rutas de imágenes a absolutas
    convertirRutasAAbsolutas(clonado);
    
    // Abrir nueva ventana
    const ventana = window.open('', '_blank', 'width=950,height=1200,scrollbars=yes');
    
    // Verificar si fue bloqueada por popup blocker
    if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
      alert(
        'Por favor, habilita las ventanas emergentes para ver la previsualización del PDF.\n\n' +
        'Instrucciones:\n' +
        '1. Haz clic en el ícono de configuración en la barra de direcciones\n' +
        '2. Permite ventanas emergentes para este sitio\n' +
        '3. Intenta nuevamente'
      );
      element.classList.remove(styles.pdfExport);
      return;
    }
    
    // Construir estructura HTML de la ventana
    ventana.document.open();
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Previsualización - Honorarios CPAU ${calculationNumber}</title>
      </head>
      <body>
        <div id="preview-container"></div>
        
        <div class="preview-actions">
          <button class="btnCerrar" onclick="window.close()">
            ✕ Cerrar
          </button>
          <button class="btnGenerarPDF" id="btn-generar" onclick="generarPDFDesdeVentana()">
            📄 Generar PDF
          </button>
        </div>
        
        <script>
          function generarPDFDesdeVentana() {
            // Llamar a la función del padre para mostrar el modal
            if (window.opener && window.opener.mostrarModalMantenimiento) {
              window.opener.mostrarModalMantenimiento();
              // Cerrar la ventana de preview para que no tape el modal
              window.close();
            } else {
              alert(
                'Funcionalidad en mantenimiento\\n\\n' +
                'La generación de PDF no se encuentra disponible en este momento.\\n\\n' +
                'Por favor, intente más tarde o contacte al administrador.'
              );
            }
          }
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
    
    // Copiar estilos y esperar a que se carguen
    await copiarEstilosAVentana(ventana);
    
    // Insertar contenido clonado DESPUÉS de que los estilos estén cargados
    ventana.document.getElementById('preview-container').appendChild(clonado);
    
    // Exponer función al objeto window para que la ventana de preview pueda accederla
    window.mostrarModalMantenimiento = mostrarModalMantenimiento;
    
    // Remover clase temporal del original
    element.classList.remove(styles.pdfExport);
    
    // Dar foco a la nueva ventana
    ventana.focus();
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
      {/* Contenido para PDF y visualización en pantalla */}
      <div ref={pdfRef}>
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
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Costo estimado de obra (USD):</span>
                <span className={styles.resumenValue}>
                  {formData.cotizDolar && formData.cotizDolar > 0 
                    ? formatCurrencyARS(formData.valorObra / formData.cotizDolar)
                    : 'N/A'}
                </span>
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
                      disabled={!termsAccepted}
                      onClick={handleDescargarPDF}
                    >
                      Descargar PDF
                    </Button>
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
                            <td className={styles.centered}>
                              {((item.importe / formData.valorObra) * 100).toFixed(2)}%
                            </td>
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
                              {((item.importe / formData.valorObra) * 100).toFixed(2)}%
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
                              {((item.importe / formData.valorObra) * 100).toFixed(2)}%
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
                            <strong>{subtotalEspecialidades.totalPorcentaje.toFixed(2)}%</strong>
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
                      <tr className={styles.totalRow}>
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
                        <td className={styles.centered} style={{ visibility: 'hidden' }}>
                          <strong>{totalGeneral.totalPorcentaje.toFixed(2)}%</strong>
                        </td>
                      </tr>
                      <tr className={styles.totalRow}>
                        <td colSpan={5}>
                          <strong>Plazo estimado de ejecución: {formData.plazoEjecucion} meses</strong>
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
      </div>
        </div>
        {/* Fin página 1 */}

        {/* ========================================
            PÁGINA 2: SOLO EN PDF (oculta en pantalla)
            ======================================== */}
        <div className={`${styles.page} ${styles.pageBreak}`}>
          {/* Header (repetido para PDF) */}
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

          {/* Contenido de Notas */}
          <div className={styles.notasSection}>
            <h2 className={styles.notasTitle}>Notas</h2>
            
            {/* Alcance y carácter del cálculo */}
            <section className={styles.notaBlock}>
              <h4>{PDF_NOTAS.alcance.titulo}</h4>
              <p>{PDF_NOTAS.alcance.contenido}</p>
            </section>

            {/* Costo de obra considerado */}
            <section className={styles.notaBlock}>
              <h4>{PDF_NOTAS.costo.titulo}</h4>
              <p>{PDF_NOTAS.costo.contenido}</p>
            </section>

            {/* Etapas del proyecto */}
            <section className={styles.notaBlock}>
              <h4>{PDF_NOTAS.etapas.titulo}</h4>
              <table className={styles.etapasTable}>
                <tbody>
                  {PDF_NOTAS.etapas.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.etapa}</td>
                      <td>{item.porcentaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.etapasNota}>{PDF_NOTAS.etapas.nota}</p>
            </section>

            {/* Alcance de los honorarios sugeridos */}
            <section className={styles.notaBlock}>
              <h4>{PDF_NOTAS.alcanceHonorarios.titulo}</h4>
              <p>{PDF_NOTAS.alcanceHonorarios.contenido}</p>
            </section>

            {/* Conceptos no incluidos */}
            <section className={styles.notaBlock}>
              <h4>{PDF_NOTAS.noIncluidos.titulo}</h4>
              <p>{PDF_NOTAS.noIncluidos.contenido}</p>
            </section>

            {/* Resolución de los honorarios */}
            <section className={styles.notaBlock}>
              <h4>{PDF_NOTAS.resolucion.titulo}</h4>
              <p>{PDF_NOTAS.resolucion.contenido}</p>
            </section>
          </div>
        </div>
        {/* Fin página 2 - Solo en PDF */}

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

      {/* Modal de funcionalidad en mantenimiento */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Funcionalidad en mantenimiento"
        footer={
          <Button
            variant="primary"
            onClick={() => setShowMaintenanceModal(false)}
          >
            Aceptar
          </Button>
        }
      >
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '1rem' }}>
            <FaExclamationTriangle />
          </div>
          <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
            La generación de PDF no se encuentra disponible en este momento.
            <br /><br />
            Por favor, intente más tarde o contacte al administrador.
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default ResultadoBasicoDetalle;
