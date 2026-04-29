import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { FaCopy, FaTimes } from 'react-icons/fa';
import { formatCurrencyARS } from '../../utils/formatters';
import styles from './DetalleItemsModal.module.css';

/**
 * Modal que muestra el detalle completo de items de honorarios
 * Permite copiar los datos al portapapeles en formato tabular
 */
const DetalleItemsModal = ({ isOpen, onClose, detalleHonorarios }) => {
  const [copiadoExitoso, setCopiadoExitoso] = useState(false);

  const copiarAlPortapapeles = async () => {
    try {
      // Crear texto con tabulaciones para Excel
      const header = 'Item Nro\tTarea Profesional\tDescripción\tImporte\n';
      const rows = detalleHonorarios.map(item => 
        `${item.itemNumero}\t${item.tareaProfesional}\t${item.descripcion}\t${item.importe}`
      ).join('\n');
      
      const textoCompleto = header + rows;
      
      await navigator.clipboard.writeText(textoCompleto);
      setCopiadoExitoso(true);
      
      // Resetear el mensaje después de 2 segundos
      setTimeout(() => setCopiadoExitoso(false), 2000);
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      alert('No se pudo copiar al portapapeles');
    }
  };

  const footer = (
    <div className={styles.footerButtons}>
      <Button 
        onClick={copiarAlPortapapeles}
        icon={<FaCopy />}
        variant="primary"
      >
        {copiadoExitoso ? '✓ Copiado' : 'Copiar'}
      </Button>
      <Button 
        onClick={onClose}
        icon={<FaTimes />}
        variant="primary"
      >
        Salir
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle completo de items calculados"
      footer={footer}
      modalClassName={styles.wideModal}
    >
      <div className={styles.container}>
        <p className={styles.instruccion}>
          Los datos se pueden copiar directamente desde esta tabla o usar el botón "Copiar" para pegarlos en Excel.
        </p>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item Nro</th>
                <th>Tarea Profesional</th>
                <th>Descripción</th>
                <th className={styles.rightAlign}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {detalleHonorarios.map((item, index) => (
                <tr key={item.calculoItemId || index}>
                  <td className={styles.centered}>{item.itemNumero}</td>
                  <td>{item.tareaProfesional}</td>
                  <td>{item.descripcion}</td>
                  <td className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.resumen}>
          <strong>Total de items:</strong> {detalleHonorarios.length}
        </div>
      </div>
    </Modal>
  );
};

export default DetalleItemsModal;
