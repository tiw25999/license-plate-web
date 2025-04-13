import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component สำหรับเลือกช่วงวันที่
 */
const DateRangeSelector = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  className = ''
}) => {
  return (
    <div className={`row mb-3 ${className}`}>
      <div className="col-md-5">
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">วันที่เริ่มต้น</label>
          <input
            type="text"
            id="startDate"
            className="form-control"
            placeholder="DD/MM/YYYY"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="col-md-5">
        <div className="form-group">
          <label htmlFor="endDate" className="form-label">วันที่สิ้นสุด</label>
          <input
            type="text"
            id="endDate"
            className="form-control"
            placeholder="DD/MM/YYYY"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="col-md-2 d-flex align-items-end">
        <span className="text-muted w-100 text-center">ช่วงวันที่</span>
      </div>
      <div className="col-12 mt-1">
        <small className="form-text text-muted">
          รูปแบบ: วัน/เดือน/ปี (เช่น 01/12/2023) - ต้องระบุทั้งวันที่เริ่มต้นและสิ้นสุด
        </small>
      </div>
    </div>
  );
};

DateRangeSelector.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default DateRangeSelector;