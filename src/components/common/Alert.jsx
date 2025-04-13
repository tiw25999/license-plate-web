import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component สำหรับแสดงข้อความแจ้งเตือน
 */
const Alert = ({ type = 'info', message, onClose, className = '', dismissible = false }) => {
  if (!message) return null;
  
  return (
    <div className={`alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} ${className}`} role="alert">
      {message}
      {dismissible && (
        <button 
          type="button" 
          className="btn-close" 
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
  dismissible: PropTypes.bool
};

export default Alert;