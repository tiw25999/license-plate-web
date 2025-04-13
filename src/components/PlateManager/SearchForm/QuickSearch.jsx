import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component ค้นหาด่วน
 */
const QuickSearch = ({ 
  searchTerm, 
  onSearchTermChange, 
  onLoadLatestPlates, 
  loading 
}) => {
  return (
    <div className="mb-3">
      <div className="input-group">
        <span className="input-group-text">ทะเบียนรถ</span>
        <input
          type="text"
          className="form-control"
          placeholder="พิมพ์เพื่อค้นหาอัตโนมัติ..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
        <button 
          type="button"
          className="btn btn-success" 
          onClick={onLoadLatestPlates}
          disabled={loading}
        >
          {loading ? 'กำลังโหลด...' : 'แสดงทั้งหมด'}
        </button>
      </div>
      <small className="form-text text-muted">
        พิมพ์อย่างน้อย 1 ตัวอักษรเพื่อเริ่มค้นหาอัตโนมัติ ระบบจะค้นหาทะเบียนที่มีตัวอักษรหรือตัวเลขที่พิมพ์อยู่ (ไม่จำเป็นต้องขึ้นต้น)
      </small>
    </div>
  );
};

QuickSearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  onLoadLatestPlates: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default QuickSearch;