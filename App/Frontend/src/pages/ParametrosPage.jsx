import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaCheck, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ToggleSwitch from '../components/common/ToggleSwitch';
import Modal from '../components/common/Modal';
import { useParametros } from '../contexts/ParametrosContext';
import { useCache } from '../contexts/CacheContext';
import styles from './ParametrosPage.module.css';

/**
 * Página de Parámetros Generales
 * Permite visualizar y modificar parámetros del sistema en memoria
 */
const ParametrosPage = () => {
  const navigate = useNavigate();
  const { getAllParametros, updateParametro } = useParametros();
  const { invalidateAll, getStats } = useCache();
  const parametros = getAllParametros();

  // Estado local para ediciones temporales
  const [editedValues, setEditedValues] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  
  // Estado para modal de recarga de caché
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  /**
   * Formatear número con estilo español (punto miles, coma decimal)
   */
  const formatNumberES = (value) => {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  /**
   * Parse número español a float
   */
  const parseNumberES = (value) => {
    if (!value) return 0;
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  };

  /**
   * Obtener valor actual (editado o original)
   */
  const getCurrentValue = (parametro) => {
    if (editedValues[parametro.id] !== undefined) {
      return editedValues[parametro.id];
    }
    return parametro.valor;
  };

  /**
   * Manejar cambio en toggle
   */
  const handleToggleChange = (id, newValue) => {
    setEditedValues(prev => ({ ...prev, [id]: newValue }));
  };

  /**
   * Manejar cambio en input numérico
   */
  const handleNumberChange = (id, value) => {
    setEditedValues(prev => ({ ...prev, [id]: value }));
  };

  /**
   * Guardar parámetro individual
   */
  const handleSaveParametro = (parametro) => {
    const newValue = editedValues[parametro.id] !== undefined 
      ? editedValues[parametro.id] 
      : parametro.valor;

    // Si es tipo number, parsear antes de guardar
    const valueToSave = parametro.tipo === 'number' 
      ? parseNumberES(newValue.toString())
      : newValue;

    updateParametro(parametro.id, valueToSave);
    
    // Limpiar valor editado
    setEditedValues(prev => {
      const updated = { ...prev };
      delete updated[parametro.id];
      return updated;
    });

    // Mostrar feedback visual
    setSavedStatus(prev => ({ ...prev, [parametro.id]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [parametro.id]: false }));
    }, 2000);
  };

  /**
   * Verificar si hay cambios sin guardar
   */
  const hasUnsavedChanges = (id) => {
    return editedValues[id] !== undefined;
  };

  /**
   * Invalida todo el caché del sistema
   * Útil después de modificar parámetros que afectan cálculos
   */
  const handleReloadCache = async () => {
    setIsReloading(true);
    try {
      // Limpiar todo el caché
      invalidateAll();
      
      console.log('✅ Caché limpiado completamente');
      console.log('📊 Stats:', getStats());
      
      // Cerrar modal
      setShowConfirmModal(false);
      
      // Mostrar feedback
      alert('Caché renovado exitosamente. Los datos se recargarán en la próxima navegación.');
    } catch (err) {
      console.error('❌ Error al limpiar caché:', err);
      alert('Error al renovar el caché');
    } finally {
      setIsReloading(false);
    }
  };

  /**
   * Renderizar control según tipo de parámetro
   */
  const renderControl = (parametro) => {
    const currentValue = getCurrentValue(parametro);

    switch (parametro.tipo) {
      case 'toggle':
        return (
          <ToggleSwitch
            id={`toggle-${parametro.id}`}
            checked={currentValue}
            onChange={(value) => handleToggleChange(parametro.id, value)}
          />
        );

      case 'number':
        return (
          <input
            type="text"
            className={styles.numberInput}
            value={typeof currentValue === 'number' ? formatNumberES(currentValue) : currentValue}
            onChange={(e) => handleNumberChange(parametro.id, e.target.value)}
            placeholder="0,00"
          />
        );

      default:
        return <span>-</span>;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <button 
              className={styles.backButton}
              onClick={() => navigate('/dashboard')}
              aria-label="Volver al Dashboard"
            >
              <FaArrowLeft className={styles.backIcon} />
              <span>Volver al Dashboard</span>
            </button>
            
            <button
              className={styles.reloadCacheButton}
              onClick={() => setShowConfirmModal(true)}
              title="Limpiar caché y forzar recarga de datos"
            >
              <FaSync />
              Recargar Parámetros
            </button>
          </div>

          <div className={styles.header}>
            <h1 className={styles.title}>Parámetros Generales</h1>
            <p className={styles.subtitle}>
              Configure los parámetros del sistema que afectan el cálculo de honorarios y comportamiento de la aplicación.
              <br />
              <strong>Importante:</strong> Después de modificar parámetros, use el botón "Recargar Parámetros" 
              para que los cambios se apliquen en toda la aplicación.
            </p>
          </div>

          <div className={styles.parametrosGrid}>
            {parametros.map((parametro) => (
              <div key={parametro.id} className={styles.parametroCard}>
                <div className={styles.parametroContent}>
                  <div className={styles.parametroInfo}>
                    <h3 className={styles.parametroDescripcion}>
                      {parametro.descripcion}
                    </h3>
                    {parametro.nombre === 'valorK' && (
                      <p className={styles.parametroNote}>
                        Índice oficial vigente según resolución CPAU
                      </p>
                    )}
                  </div>

                  <div className={styles.parametroControl}>
                    {renderControl(parametro)}
                  </div>
                </div>

                <div className={styles.parametroActions}>
                  <button
                    className={`${styles.saveButton} ${savedStatus[parametro.id] ? styles.saved : ''}`}
                    onClick={() => handleSaveParametro(parametro)}
                    disabled={savedStatus[parametro.id]}
                  >
                    {savedStatus[parametro.id] ? (
                      <>
                        <FaCheck /> Guardado
                      </>
                    ) : (
                      <>
                        <FaSave /> Guardar
                      </>
                    )}
                  </button>
                  {hasUnsavedChanges(parametro.id) && !savedStatus[parametro.id] && (
                    <span className={styles.unsavedIndicator}>
                      Cambios sin guardar
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>Nota:</strong> Los cambios realizados en estos parámetros se mantienen solo durante la sesión actual. 
              Al recargar la página, los valores volverán a sus valores por defecto (Modo Maqueta - Sin Persistencia).
            </p>
          </div>
        </div>
      </main>

      {/* Modal de confirmación */}
      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)}
        title="¿Recargar todos los parámetros?"
      >
        <div className={styles.confirmModal}>
          <div className={styles.modalIcon}>
            <FaExclamationTriangle />
          </div>
          <p className={styles.modalMessage}>
            Esta acción limpiará el caché completo del sistema.
            <br />
            Todos los datos se recargarán desde el servidor en la próxima navegación.
          </p>
          <div className={styles.modalActions}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowConfirmModal(false)}
              disabled={isReloading}
            >
              Cancelar
            </button>
            <button
              className={styles.confirmButton}
              onClick={handleReloadCache}
              disabled={isReloading}
            >
              <FaSync className={isReloading ? styles.spinning : ''} />
              {isReloading ? 'Recargando...' : 'Recargar Caché'}
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default ParametrosPage;
