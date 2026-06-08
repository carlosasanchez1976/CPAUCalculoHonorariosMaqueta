import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StepperProgress from '../components/wizard/StepperProgress';
import WizardNavigation from '../components/wizard/WizardNavigation';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { ROUTES } from '../utils/constants';
import { useParametros } from '../contexts/ParametrosContext';
import { calcularHonorarios, formatearErrorAPI } from '../services/honorariosService';
import styles from './ProcesoCalculoPage.module.css';

// Componentes específicos para Cálculo PYDOA (Proyecto y Dirección de Obras)
import DatosPrincipalesBasico from '../components/wizard/steps/DatosPrincipalesBasico';
import DatosObraBasico from '../components/wizard/steps/DatosObraBasico';
import TareasProfesionalesBasico from '../components/wizard/steps/TareasProfesionalesBasico';
import RevisionBasico from '../components/wizard/steps/RevisionBasico';
import ResultadoBasicoDetalle from '../components/wizard/ResultadoBasicoDetalle';

import REPTECStep1 from '../components/wizard/steps/REPTECStep1';
import REPTECStep2 from '../components/wizard/steps/REPTECStep2';
import REPTECStep3 from '../components/wizard/steps/REPTECStep3';
import REPTECRevision from '../components/wizard/steps/REPTECRevision';




const ProcesoCalculoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getParametro } = useParametros();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [showUnderConstructionModal, setShowUnderConstructionModal] = useState(false);
  
  // [T009.1] Extraer datos desde location.state
  const { tareaId, tipo, tipoNombre, descripcion } = location.state || {};
  
  // [T009.2-T009.3] Validación: redirigir si no hay tareaId
  useEffect(() => {
    if (!tareaId) {
      console.warn('⚠️ No se recibió tareaId, redirigiendo a selección de tarea');
      navigate('/nuevo-calculo', { replace: true });
    }
  }, [tareaId, navigate]);
  const [formData, setFormData] = useState({
    // Datos del tipo de cálculo
    calculoId: null,
    usuarioId: null,
    tareaId: tareaId || null,  // [T009.1] Valor dinámico desde location.state
    tipoCalculo: tipo || 'PYDOA',  // Valor de 'codi' desde API (ej: PYDOA, DEMO, GPYC)
    tipoNombre: tipoNombre ,
    descripcionTipo: descripcion || '',
    
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
    
    // --- CAMPOS ESPECÍFICOS PARA CÁLCULO PYDOA (Proyecto y Dirección de Obras) ---
    // Paso 0: Datos Principales PYDOA
    plazoEjecucion: '',
    observaciones: '',
    
    // Paso 1: Datos de la Obra PYDOA
    superficieTotal: '',
    valorMetro2: '',
    cotizDolar: '',
    valorObra: '',
    complejidad: '',
    
    // Paso 2: Tareas Profesionales PYDOA
    obraProyecto: false,
    obraDireccion: false,
    instalacionSanitaria: false,
    instalacionElectrica: false,
    instalacionContraIncendio: false,
    instalacionTermomecanica: false,
    proyectoEstructuras: false,
    observacionesTareas: '',
    
    // Paso 5: Aceptación
    aceptaTerminos: false,


    // --- CAMPOS ESPECÍFICOS PARA CÁLCULO REPTEC ---
    ValorNum1: '',
    ValorNum2: '',
    ValorNum3: '',
    ValorBol1: false,
    ValorBol2: false,
    ValorStr1: '',
    ValorStr2: ''

  });


  // Definir steps según tipo de tarea profesional
  const steps = tipo === 'PYDOA' 
    ? [
        'Datos principales del proyecto',
        'Datos específicos de la obra',
        'Tareas profesionales a realizar',
        'Revisión de datos ingresados',
        'Cálculo'
      ]
    : tipo === 'REPTEC'
    ? [
        'Datos principales del proyecto',
        'Tareas profesionales a realizar',
        'Datos específicos',
        'Revisión de datos ingresados',
        'Cálculo'
      ]
    : []; // Default vacío si no hay tipo definido

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
      
        
        // Preparar datos para API según contrato
        const datosAPI = {
          calculoId: null, // Se asignará en backend al guardar el cálculo
          
          // ⚠️ PARÁMETROS TEMPORALES/DINÁMICOS
          // - usuarioId: temporal para testing (futuro: contexto de autenticación)
          // - tareaId: ✅ DINÁMICO desde location.state (Ticket #009)
          usuarioId: 1,  // Usuario temporal para testing (ID válido en DB)
          tareaId: formData.tareaId,  // [T009.4] ✅ Dinámico desde selección
          tareaCodi: formData.tipoCalculo, // Código del tipo de cálculo (ej: PYDOA, REPTEC)
          
          datosProyecto: {
            nombre: formData.nombreProyecto,
            ubicacion: formData.ubicacion,
            cliente: formData.cliente,
            tipoObra: formData.tipoObra,
            destinoUso: formData.destinoUso,
            observaciones: formData.observaciones
          },
          datosObra: {
            valorObra: parseFloat(formData.valorObra) || 0,
            superficie: parseFloat(formData.superficieTotal) || 0,
            valorMetro2: parseFloat(formData.valorMetro2) || 0,
            tipologia: formData.tipoObra,
            complejidad: formData.destinoUso
          },
          tareasProfesionales: {
            obraProyecto: formData.obraProyecto,
            obraDireccion: formData.obraDireccion,
            instalacionSanitaria: formData.instalacionSanitaria,
            instalacionElectrica: formData.instalacionElectrica,
            instalacionTermomecanica: formData.instalacionTermomecanica,
            instalacionContraIncendio: formData.instalacionContraIncendio,
            proyectoEstructuras: formData.proyectoEstructuras
          }
        };
        
        // Llamada a API backend Node.js
        const apiResult = await calcularHonorarios(datosAPI);
        
        // Extraer datos de la respuesta (el service ya retorna 'data' directamente)
        const detalleHonorarios = apiResult.detalleHonorarios;
        
        // Guardar detalle en formData para uso en ResultadoBasicoDetalle
        setFormData(prev => ({ 
          ...prev, 
          detalleHonorarios,
          calculoId: apiResult.calculoId,
          fechaCalculo: apiResult.metadata.fechaCalculo,
          metadataCalculo: apiResult.metadata
        }));
        
        result = {
          detalleHonorarios,
          tipoCalculo: formData.tipoCalculo,  // Dinámico desde state
          calculoId: apiResult.calculoId,
          metadata: apiResult.metadata
        };
      
      
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
    // Si es Cálculo PYDOA (Proyecto y Dirección de Obras), usar componente específico
    if (formData.tipoCalculo === 'PYDOA') {
      return <DatosPrincipalesBasico formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }

    // Si es Cálculo REPTEC, usar componente específico
    if (formData.tipoCalculo === 'REPTEC') {
      return <REPTECStep1 formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }

    // Mostrar modal de tarea en desarrollo y retornar null
    if (!showUnderConstructionModal) {
      setShowUnderConstructionModal(true);
    }
    return null;

  };

  const renderStep1 = () => {
    // Si es Cálculo PYDOA (Proyecto y Dirección de Obras), usar componente específico
    if (formData.tipoCalculo === 'PYDOA') {
      return <DatosObraBasico formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }
    
    // Si es Cálculo REPTEC, usar componente específico
    if (formData.tipoCalculo === 'REPTEC') {
      return <REPTECStep2 formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }

    // Mostrar modal de tarea en desarrollo y retornar null
    if (!showUnderConstructionModal) {
      setShowUnderConstructionModal(true);
    }
    return null;



  };

  const renderStep2 = () => {
    // Si es Cálculo PYDOA (Proyecto y Dirección de Obras), usar componente específico
    if (formData.tipoCalculo === 'PYDOA') {
      return <TareasProfesionalesBasico formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }

    // Si es Cálculo REPTEC, usar componente específico
    if (formData.tipoCalculo === 'REPTEC') {
      return <REPTECStep3 formData={formData} onChange={handleInputChange} stepTitle={steps[currentStep]} />;
    }



        // Mostrar modal de tarea en desarrollo y retornar null
    if (!showUnderConstructionModal) {
      setShowUnderConstructionModal(true);
    }
    return null;


  };

  const renderStep3 = () => {
    // Si es Cálculo PYDOA (Proyecto y Dirección de Obras), usar componente específico
    if (formData.tipoCalculo === 'PYDOA') {
      return <RevisionBasico formData={formData} onEditStep={(step) => setCurrentStep(step)} stepTitle={steps[currentStep]} />;
    }

    // Si es Cálculo REPTEC, usar componente específico
    if (formData.tipoCalculo === 'REPTEC') {
      return <REPTECRevision formData={formData} onEditStep={(step) => setCurrentStep(step)} stepTitle={steps[currentStep]} />;
    }

    // Mostrar modal de tarea en desarrollo y retornar null
    if (!showUnderConstructionModal) {
      setShowUnderConstructionModal(true);
    }
    return null;
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
    // Si es Cálculo PYDOA (Proyecto y Dirección de Obras) o REPTEC, usar componente específico
    if (formData.tipoCalculo === 'PYDOA' || formData.tipoCalculo === 'REPTEC') {
      return (
        <ResultadoBasicoDetalle 
          formData={formData}
          calculationResult={calculationResult}
          onAcceptTerms={handleAcceptTerms}
          termsAccepted={formData.aceptaTerminos}
        />
      );
    }

    // Mostrar modal de tarea en desarrollo y retornar null
    if (!showUnderConstructionModal) {
      setShowUnderConstructionModal(true);
    }
    return null;
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      {/* Loading overlay durante cálculo */}
      {isCalculating && (
        <LoadingSpinner 
          size="xl"
          variant="spinner"
          message="Calculando honorarios profesionales..."
          overlay
        />
      )}
      
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
      
      {/* Modal de tarea en desarrollo */}
      <Modal
        isOpen={showUnderConstructionModal}
        onClose={() => {
          setShowUnderConstructionModal(false);
          navigate('/nuevo-calculo');
        }}
        title="Funcionalidad en mantenimiento"
        footer={
          <Button
            variant="primary"
            onClick={() => {
              setShowUnderConstructionModal(false);
              navigate('/nuevo-calculo');
            }}
          >
            Volver a selección de tareas
          </Button>
        }
      >
        <div className={styles.modalContent}>
          <div className={styles.modalIcon}>
            <FaExclamationTriangle />
          </div>
          <p className={styles.modalMessage}>
            Esta tarea profesional no se encuentra disponible en éste momento. Por favor, intente más tarde, seleccione otra tarea disponible o contacte al administrador.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ProcesoCalculoPage;
