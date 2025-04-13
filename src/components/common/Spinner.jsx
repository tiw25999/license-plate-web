import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component สำหรับแสดงสถานะกำลังโหลด
 */
const Spinner = ({ size = 'medium', color = 'primary', className = '' }) => {
  // กำหนดขนาดตาม prop
  let spinnerSize = '';
  switch (size) {
    case 'small':
      spinnerSize = 'spinner-border-sm';
      break;
    case 'large':
      spinnerSize = ' spinner-border-lg';
      break;
    default:
      spinnerSize = '';
  }
  
  return (
    <div className={`spinner-border text-${color} ${spinnerSize} ${className}`} role="status">
      <span className="visually-hidden">กำลังโหลด...</span>
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  className: PropTypes.string
};

export default Spinner;