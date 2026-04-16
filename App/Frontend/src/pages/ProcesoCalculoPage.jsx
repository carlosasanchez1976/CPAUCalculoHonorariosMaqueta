import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StepperProgress from '../components/wizard/StepperProgress';
import WizardNavigation from '../components/wizard/WizardNavigation';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { ROUTES } from '../utils/constants';
import { useParametros } from '../contexts/ParametrosContext';
import { calcularHonorarios, formatearErrorAPI } from '../services/honorariosService';
import styles from './ProcesoCalculoPage.module.css';

// Componentes específicos para Cálculo Básico
import DatosPrincipalesBasico from '../components/wizard/steps/DatosPrincipalesBasico';
import DatosObraBasico from '../components/wizard/steps/DatosObraBasico';
import TareasProfesionalesBasico from '../components/wizard/steps/TareasProfesionalesBasico';
import RevisionBasico from '../components/wizard/steps/RevisionBasico';
import ResultadoBasicoDetalle from '../components/wizard/ResultadoBasicoDetalle';

const ProcesoCalculoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getParametro } = useParametros();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [formData, setFormData] = useState({
    // Datos del tipo de cálculo
    tipoCalculo: location.state?.tipo || 'Básico',
    tipoNombre: location.state?.tipoNombre || 'Honorarios de Especialidades – Básico',
    descripcionTipo: location.state?.descripcion || '',
    
    // Paso 0: Tarea Profesional + Datos Principales (GENÉRICO)
    tareaProfesional: '',
    nombreProyecto: '',
    cliente: '',
    ubicacion: '',
    tipoObra: '',
    destinoUso: '',
    
    // Paso 1: Datos Específicos (GENÉRICO)
    metrosCuadrados: '',
    costoMetroCuadrado: '',
    realizaRecalculo: false,
    
    // Paso 2: Datos Adicionales (GENÉRICO)
    gastosViaticos: '',
    gastosOperativos: '',
    cantidadOperarios: '',
    otrosGastos: '',
    
    // --- CAMPOS ESPECÍFICOS PARA CÁLCULO BÁSICO ---
    // Paso 0: Datos Principales Básico
    plazoEjecucion: '',
    observaciones: '',
    
    // Paso 1: Datos de la Obra Básico
    superficieTotal: '',
    valorMetro2: '',
    cotizDolar: '',
    valorObra: '',
    complejidad: '',
    
    // Paso 2: Tareas Profesionales Básico
    obraProyecto: false,
    obraDireccion: false,
    instalacionSanitaria: false,
    instalacionElectrica: false,
    instalacionContraIncendio: false,
    instalacionTermomecanica: false,
    proyectoEstructuras: false,
    observacionesTareas: '',
    
    // Paso 5: Aceptación
    aceptaTerminos: false
  });

  const tareasProfesionales = [
    { codigo: 'PTA', descripcion: 'Planificación, Territorio y Ambiente' },
    { codigo: 'PYDOA', descripcion: 'Proyecto y Dirección de Obras de Arquitectura' },
    { codigo: 'PYDEI', descripcion: 'Proyecto y Dirección de estructuras e instalaciones' },
    { codigo: 'PYDD', descripcion: 'Proyecto y Dirección de Demoliciones' },
    { codigo: 'HYS', descripcion: 'Higiene y Seguridad' },
    { codigo: 'RT', descripcion: 'Representaciones técnicas' },
    { codigo: 'SA', descripcion: 'Supervisiones/Auditorías' },
    { codigo: 'GPGC', descripcion: 'Gerencia de Proyecto/Gerencia de Construcciones' },
    { codigo: 'CONS', descripcion: 'Consultas' },
    { codigo: 'ASE', descripcion: 'Asesoramientos' },
    { codigo: 'EST', descripcion: 'Estudios' },
    { codigo: 'HAB', descripcion: 'Habilitaciones' },
    { codigo: 'PER', descripcion: 'Peritajes' },
    { codigo: 'TAS', descripcion: 'Tasaciones' },
    { codigo: 'ARB', descripcion: 'Arbitrajes' },
    { codigo: 'MED', descripcion: 'Medianería' }
  ];

  const steps = [
    'Datos Principales del Proyecto',
    'Datos Específicos de la Obra',
    'Tareas profesionales a realizar',
    'Revisión de datos ingresados',
    'Cálculo'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAcceptTerms = (accepted) => {
    setFormData(prev => ({
      ...prev,
      aceptaTerminos: accepted
    }));
  };

  const handleNext = () => {
    if (currentStep === 3) {
      // Paso Revisión → Cálculo
      setIsCalculating(true); // Deshabilitar botones ANTES de cambiar de paso
      setCurrentStep(4);
      performCalculation();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finalizar
      navigate(ROUTES.DASHBOARD);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 0) {
      navigate('/nuevo-calculo');
    } else if (currentStep === 5) {
      // Desde Resultado (paso 5) volver a Revisión (paso 3), saltando el paso de Cálculo
      setCurrentStep(3);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const performCalculation = async () => {
    // isCalculating ya se puso en true en handleNext
    
    try {
      let result;
      
      if (formData.tipoCalculo === 'Básico') {
        // CÁLCULO REAL para tipo Básico - Llamada a API
        const valorK = getParametro('valorK') || 522181756.33;
        
        // Preparar datos para API según contrato
        const datosAPI = {
          tipoCalculo: 'basico',
          datosProyecto: {
            nombre: formData.nombreProyecto,
            ubicacion: formData.ubicacion,
            cliente: formData.cliente
          },
          datosObra: {
            valorObra: formData.valorObra,
            superficie: formData.superficieTotal,
            tipologia: formData.tipoObra,
            complejidad: formData.complejidad
          },
          tareasProfesionales: {
            obraProyecto: formData.obraProyecto,
            obraDireccion: formData.obraDireccion,
            instalacionSanitaria: formData.instalacionSanitaria,
            instalacionElectrica: formData.instalacionElectrica,
            instalacionTermomecanica: formData.instalacionTermomecanica,
            instalacionContraIncendio: formData.instalacionContraIncendio,
            proyectoEstructuras: formData.proyectoEstructuras
          },
          parametros: {
            valorK: valorK
          }
        };
        
        // Llamada a API serverless
        const apiResult = await calcularHonorarios(datosAPI);
        
        // Extraer datos de la respuesta
        const detalleHonorarios = apiResult.resultado.detalleHonorarios;
        
        // Guardar detalle en formData para uso en ResultadoBasicoDetalle
        setFormData(prev => ({ 
          ...prev, 
          detalleHonorarios,
          calculoId: apiResult.calculoId,
          fechaCalculo: apiResult.fechaCalculo,
          metadataCalculo: apiResult.resultado.metadata
        }));
        
        result = {
          detalleHonorarios,
          tipoCalculo: 'Básico',
          calculoId: apiResult.calculoId,
          metadata: apiResult.resultado.metadata
        };
      } else {
        // Mock para otros tipos de cálculo (temporal)
        result = 1;
      }
      
      setCalculationResult(result);
      setIsCalculating(false);
      setCurrentStep(5); // Avanzar a Resultado
      
    } catch (error) {
      console.error('Error al calcular honorarios:', error);
      
      // Mostrar error al usuario
      const errorMessage = formatearErrorAPI(error);
      alert(`Error en el cálculo:\n\n${errorMessage}\n\nPor favor, verifique los datos e intente nuevamente.`);
      
      // Volver a paso de revisión
      setIsCalculating(false);
      setCurrentStep(3);
    }
  };


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  const renderStep0 = () => {
    // Si es Cálculo Básico, usar componente específico
    if (formData.tipoCalculo === 'Básico') {
      return <DatosPrincipalesBasico formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }

    // Componente genérico para otros tipos
    return (
      <div className={styles.formContainer}>
        <h2 className="stepTitle">Datos Principales del Proyecto</h2>
        <p className={styles.stepDescription}>
          Ingrese los datos básicos del proyecto para el cálculo de honorarios
        </p>

        <div className={styles.formGrid}>
          {/* Tarea Profesional - Campo FUNDAMENTAL como primer campo */}
          <div className={styles.fullGridWidth}>
            <label className={styles.label}>
              Tarea Profesional *
              <select
                name="tareaProfesional"
                value={formData.tareaProfesional}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Seleccione la tarea profesional...</option>
                {tareasProfesionales.map((tarea) => (
                  <option key={tarea.codigo} value={tarea.codigo}>
                    {tarea.codigo} - {tarea.descripcion}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Input
            label="Nombre del Proyecto"
            name="nombreProyecto"
            value={formData.nombreProyecto}
            onChange={handleInputChange}
            placeholder="Ej: Edificio Residencial Torre Sur"
          />

          <Input
            label="Comitente"
            name="cliente"
            value={formData.cliente}
            onChange={handleInputChange}
            placeholder="Ej: Constructora ABC S.A."
          />

          <Input
            label="Ubicación"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleInputChange}
            placeholder="Ej: CABA, Palermo"
          />

          <div>
            <label className={styles.label}>
              Tipo de Obra
              <select
                name="tipoObra"
                value={formData.tipoObra}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Seleccione...</option>
                <option value="Vivienda">Vivienda</option>
                <option value="Edificio">Edificio</option>
                <option value="Industrial">Industrial</option>
                <option value="Comercial">Comercial</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    // Si es Cálculo Básico, usar componente específico
    if (formData.tipoCalculo === 'Básico') {
      return <DatosObraBasico formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }

    // Componente genérico para otros tipos
    return (
      <div className={styles.formContainer}>
        <h2 className="stepTitle">Datos Específicos</h2>
        <p className={styles.stepDescription}>
          Detalles técnicos y económicos del proyecto
        </p>

        <div className={styles.formGrid}>
          <Input
            label="Cantidad de metros cuadrados"
            name="metrosCuadrados"
            type="number"
            value={formData.metrosCuadrados}
            onChange={handleInputChange}
            placeholder="Ej: 1500"
          />

          <Input
            label="Costo del metro cuadrado ($)"
            name="costoMetroCuadrado"
            type="number"
            value={formData.costoMetroCuadrado}
            onChange={handleInputChange}
            placeholder="Ej: 250000"
          />

          <div className={styles.checkboxWrapper}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="realizaRecalculo"
                checked={formData.realizaRecalculo}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              Realiza recálculo final
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    // Si es Cálculo Básico, usar componente específico
    if (formData.tipoCalculo === 'Básico') {
      return <TareasProfesionalesBasico formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }

    // Componente genérico para otros tipos
    return (
      <div className={styles.formContainer}>
        <h2 className="stepTitle">Datos Adicionales</h2>
        <p className={styles.stepDescription}>
          Costos adicionales asociados al proyecto
        </p>

        <div className={styles.formGrid}>
          <Input
            label="Gastos de viáticos ($)"
            name="gastosViaticos"
            type="number"
            value={formData.gastosViaticos}
            onChange={handleInputChange}
            placeholder="Ej: 50000"
          />

          <Input
            label="Gastos operativos ($)"
            name="gastosOperativos"
            type="number"
            value={formData.gastosOperativos}
            onChange={handleInputChange}
            placeholder="Ej: 75000"
          />

          <Input
            label="Cantidad de operarios"
            name="cantidadOperarios"
            type="number"
            value={formData.cantidadOperarios}
            onChange={handleInputChange}
            placeholder="Ej: 5"
          />

          <Input
            label="Otros gastos ($)"
            name="otrosGastos"
            type="number"
            value={formData.otrosGastos}
            onChange={handleInputChange}
            placeholder="Ej: 25000"
          />
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    // Si es Cálculo Básico, usar componente específico
    if (formData.tipoCalculo === 'Básico') {
      return <RevisionBasico formData={formData} onEditStep={(step) => setCurrentStep(step)} stepTitle={steps[currentStep]} />;
    }

    // Componente genérico para otros tipos
    const tareaSeleccionada = tareasProfesionales.find(t => t.codigo === formData.tareaProfesional);
    
    return (
      <div className={styles.formContainer}>
        <h2 className="stepTitle">Revisión de Datos</h2>
        <p className={styles.stepDescription}>
          Verifique que todos los datos ingresados sean correctos
        </p>

        <div className={styles.reviewSection}>
          <div className={styles.reviewGroup}>
            <h3 className={styles.reviewGroupTitle}>Tipo de Cálculo</h3>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Método:</span>
              <span className={styles.reviewValue}>{formData.tipoCalculo}</span>
            </div>
            <div className={styles.reviewItemFull}>
              <span className={styles.reviewLabel}>Descripción:</span>
              <span className={styles.reviewValue}>{formData.descripcionTipo}</span>
            </div>
          </div>

          <div className={styles.reviewGroup}>
            <h3 className={styles.reviewGroupTitle}>Tarea Profesional</h3>
            {tareaSeleccionada ? (
              <div className={styles.reviewItemFull}>
                <span className={styles.reviewValue}>
                  <strong>{tareaSeleccionada.codigo}</strong> - {tareaSeleccionada.descripcion}
                </span>
              </div>
            ) : (
              <div className={styles.reviewItemFull}>
                <span className={styles.reviewValue}>No seleccionada</span>
              </div>
            )}
          </div>

          <div className={styles.reviewGroup}>
            <h3 className={styles.reviewGroupTitle}>Datos Principales</h3>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Proyecto:</span>
              <span className={styles.reviewValue}>{formData.nombreProyecto || '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Cliente:</span>
              <span className={styles.reviewValue}>{formData.cliente || '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Ubicación:</span>
              <span className={styles.reviewValue}>{formData.ubicacion || '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Tipo de Obra:</span>
              <span className={styles.reviewValue}>{formData.tipoObra || '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Destino/Uso:</span>
              <span className={styles.reviewValue}>{formData.destinoUso || '-'}</span>
            </div>
          </div>

          <div className={styles.reviewGroup}>
            <h3 className={styles.reviewGroupTitle}>Datos Específicos</h3>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Superficie:</span>
              <span className={styles.reviewValue}>{formData.metrosCuadrados ? `${formData.metrosCuadrados} m²` : '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Costo por m²:</span>
              <span className={styles.reviewValue}>{formData.costoMetroCuadrado ? formatCurrency(parseFloat(formData.costoMetroCuadrado)) : '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Recálculo final:</span>
              <span className={styles.reviewValue}>{formData.realizaRecalculo ? 'Sí' : 'No'}</span>
            </div>
          </div>

          <div className={styles.reviewGroup}>
            <h3 className={styles.reviewGroupTitle}>Datos Adicionales</h3>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Viáticos:</span>
              <span className={styles.reviewValue}>{formData.gastosViaticos ? formatCurrency(parseFloat(formData.gastosViaticos)) : '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Gastos operativos:</span>
              <span className={styles.reviewValue}>{formData.gastosOperativos ? formatCurrency(parseFloat(formData.gastosOperativos)) : '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Operarios:</span>
              <span className={styles.reviewValue}>{formData.cantidadOperarios || '-'}</span>
            </div>
            <div className={styles.reviewItem}>
              <span className={styles.reviewLabel}>Otros gastos:</span>
              <span className={styles.reviewValue}>{formData.otrosGastos ? formatCurrency(parseFloat(formData.otrosGastos)) : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className={styles.calculatingContainer}>
      <FaSpinner className={styles.spinner} />
      <h2 className={styles.calculatingTitle}>Calculando honorarios...</h2>
      <p className={styles.calculatingText}>
        Procesando datos según {formData.tipoNombre}
      </p>
    </div>
  );

  const renderStep5 = () => {
    // Si es Cálculo Básico, usar componente específico
    if (formData.tipoCalculo === 'Básico') {
      return (
        <ResultadoBasicoDetalle 
          formData={formData}
          calculationResult={calculationResult}
          onAcceptTerms={handleAcceptTerms}
          termsAccepted={formData.aceptaTerminos}
        />
      );
    }

    // Componente genérico para otros tipos
    return (
      <div className={styles.formContainer}>
        <h2 className="stepTitle">Resultado del Cálculo</h2>
        <p className={styles.stepDescription}>
          Cálculo de honorarios para: {formData.nombreProyecto || 'Proyecto sin nombre'}
        </p>

        {calculationResult && (
          <div className={styles.resultContainer}>
            <div className={styles.resultSummary}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Honorarios Profesionales:</span>
                <span className={styles.resultValue}>{formatCurrency(calculationResult.honorariosProfesionales)}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Impuestos (21%):</span>
                <span className={styles.resultValue}>{formatCurrency(calculationResult.impuestos)}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Gastos Administrativos (5%):</span>
                <span className={styles.resultValue}>{formatCurrency(calculationResult.gastosAdministrativos)}</span>
              </div>
              <div className={`${styles.resultItem} ${styles.resultTotal}`}>
                <span className={styles.resultLabel}>TOTAL GENERAL:</span>
                <span className={styles.resultValue}>{formatCurrency(calculationResult.totalGeneral)}</span>
              </div>
            </div>

            <div className={styles.detailTable}>
              <h3 className={styles.tableTitle}>Desglose por Concepto</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Horas</th>
                    <th>Tarifa/Hora</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {calculationResult.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.concepto}</td>
                      <td>{item.horas}</td>
                      <td>{formatCurrency(item.tarifa)}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.disclaimer}>
              <p>
                Los valores informados aquí son resultado del cálculo de múltiples variables e índices 
                afectados a este momento. Los resultados pueden variar entre cálculos de obras del mismo 
                tipo en diferentes momentos. El arancel propuesto debe ser considerado como referencia y 
                de ninguna manera el CPAU dispone el valor final que el profesional debe informar.
              </p>
            </div>

            <div className={styles.termsWrapper}>
              <label className={styles.termsLabel}>
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleInputChange}
                  className={styles.termsCheckbox}
                />
                Acepta las condiciones del servicio y el reglamento de uso de datos del CPAU
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <div className={styles.wizardHeader}>
        <h1 className={styles.wizardTitle}>{formData.tipoNombre}</h1>
      </div>

      <StepperProgress currentStep={currentStep} steps={steps} />

      <main className={styles.main}>
        <div className={styles.content}>
          {renderStepContent()}
        </div>
      </main>

      {/* Ocultar navegación durante el cálculo (paso 4) */}
      {currentStep !== 4 && (
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isCalculating={isCalculating}
        />
      )}

      <Footer />
    </div>
  );
};

export default ProcesoCalculoPage;
