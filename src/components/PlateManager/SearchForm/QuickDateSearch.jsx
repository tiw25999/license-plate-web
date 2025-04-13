import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component ปุ่มค้นหาตามช่วงเวลาล่าสุด
 */
const QuickDateSearch = ({ onSearchLastNDays, loading }) => {
  return (
    <div className="quick-date-search mb-3">
      <div className="d-flex justify-content-center mb-3">
        <div className="btn-group">
          <button 
            className="btn btn-outline-info"
            onClick={() => onSearchLastNDays(3)}
            disabled={loading}
          >
            <i className="bi bi-calendar-check"></i> 3 วันล่าสุด
          </button>
          <button 
            className="btn btn-outline-info"
            onClick={() => onSearchLastNDays(7)}
            disabled={loading}
          >
            <i className="bi bi-calendar-week"></i> 7 วันล่าสุด
          </button>
          <button 
            className="btn btn-outline-info"
            onClick={() => onSearchLastNDays(30)}
            disabled={loading}
          >
            <i className="bi bi-calendar-month"></i> 30 วันล่าสุด
          </button>
        </div>
      </div>
    </div>
  );
};

QuickDateSearch.propTypes = {
  onSearchLastNDays: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default QuickDateSearch;