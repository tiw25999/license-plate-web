import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component แสดงสถานะการโหลดและข้อผิดพลาด
 */
const StatusDisplay = ({ loading, error }) => {
  return (
    <>
      {/* แสดงข้อความ loading */}
      {loading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary"></div>
        </div>
      )}
      
      {/* แสดงข้อความ error */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
    </>
  );
};

StatusDisplay.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string
};

export default StatusDisplay;