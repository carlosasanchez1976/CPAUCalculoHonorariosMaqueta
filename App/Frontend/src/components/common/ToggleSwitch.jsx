import PropTypes from 'prop-types';
import styles from './ToggleSwitch.module.css';

/**
 * Componente Toggle Switch
 * Control deslizable tipo iOS/Material para valores booleanos
 */
const ToggleSwitch = ({ id, checked, onChange, disabled = false }) => {
  return (
    <div className={styles.toggleContainer}>
      <input
        type="checkbox"
        id={id}
        className={styles.toggleInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id} className={styles.toggleLabel}>
        <span className={styles.toggleButton} />
      </label>
      <span className={styles.toggleText}>
        {checked ? 'Sí' : 'No'}
      </span>
    </div>
  );
};

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default ToggleSwitch;
