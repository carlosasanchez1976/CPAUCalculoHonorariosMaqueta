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
import styles from './ProcesoCalculoPage.module.css';

const ProcesoCalculoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [formData, setFormData] = useState({
    // Datos del tipo de cálculo
    tipoCalculo: location.state?.tipo || 'Básico',
    descripcionTipo: location.state?.descripcion || '',
    
    // Paso 0: Tarea Profesional + Datos Principales
    tareaProfesional: '',
    nombreProyecto: '',
    cliente: '',
    ubicacion: '',
    tipoObra: '',
    
    // Paso 1: Datos Específicos
    metrosCuadrados: '',
    costoMetroCuadrado: '',
    realizaRecalculo: false,
    
    // Paso 2: Datos Adicionales
    gastosViaticos: '',
    gastosOperativos: '',
    cantidadOperarios: '',
    otrosGastos: '',
    
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
    'Datos Principales',
    'Datos Específicos',
    'Datos Adicionales',
    'Revisión',
    'Cálculo',
    'Resultado'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep === 3) {
      // Paso Revisión → Cálculo
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
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const performCalculation = () => {
    setIsCalculating(true);
    
    // Simular cálculo con timeout
    setTimeout(() => {
      const result = generateMockResults();
      setCalculationResult(result);
      setIsCalculating(false);
      setCurrentStep(5); // Avanzar a Resultado
    }, 1500);
  };

  const generateMockResults = () => {
    const base = Math.floor(Math.random() * (2000000 - 500000) + 500000);
    const iva = Math.floor(base * 0.21);
    const gastosAdmin = Math.floor(base * 0.05);
    const total = base + iva + gastosAdmin;

    return {
      honorariosProfesionales: base,
      impuestos: iva,
      gastosAdministrativos: gastosAdmin,
      totalGeneral: total,
      items: [
        {
          concepto: 'Proyecto arquitectónico',
          horas: Math.floor(Math.random() * (150 - 50) + 50),
          tarifa: 15000,
          get subtotal() { return this.horas * this.tarifa; }
        },
        {
          concepto: 'Dirección de obra',
          horas: Math.floor(Math.random() * (300 - 100) + 100),
          tarifa: 18000,
          get subtotal() { return this.horas * this.tarifa; }
        },
        {
          concepto: 'Cómputos y presupuestos',
          horas: Math.floor(Math.random() * (80 - 30) + 30),
          tarifa: 12000,
          get subtotal() { return this.horas * this.tarifa; }
        },
        {
          concepto: 'Documentación municipal',
          horas: Math.floor(Math.random() * (60 - 20) + 20),
          tarifa: 14000,
          get subtotal() { return this.horas * this.tarifa; }
        }
      ]
    };
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

  const renderStep0 = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.stepTitle}>Datos Principales del Proyecto</h2>
      <p className={styles.stepDescription}>
        Ingrese los datos básicos del proyecto para el cálculo de honorarios
      </p>

      <div className={styles.formGrid}>
        {/* Tarea Profesional - Campo FUNDAMENTAL como primer campo */}
        <div style={{ gridColumn: '1 / -1' }}>
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
          label="Cliente"
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

  const renderStep1 = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.stepTitle}>Datos Específicos</h2>
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

  const renderStep2 = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.stepTitle}>Datos Adicionales</h2>
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

  const renderStep3 = () => {
    const tareaSeleccionada = tareasProfesionales.find(t => t.codigo === formData.tareaProfesional);
    
    return (
      <div className={styles.formContainer}>
        <h2 className={styles.stepTitle}>Revisión de Datos</h2>
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
        Procesando datos según {formData.tipoCalculo}
      </p>
    </div>
  );

  const renderStep5 = () => (
    <div className={styles.formContainer}>
      <h2 className={styles.stepTitle}>Resultado del Cálculo</h2>
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

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <div className={styles.wizardHeader}>
        <h1 className={styles.wizardTitle}>{formData.tipoCalculo}</h1>
        <p className={styles.wizardSubtitle}>{formData.descripcionTipo}</p>
      </div>

      <StepperProgress currentStep={currentStep} steps={steps} />

      <main className={styles.main}>
        <div className={styles.content}>
          {renderStepContent()}
        </div>
      </main>

      <WizardNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <Footer />
    </div>
  );
};

export default ProcesoCalculoPage;
