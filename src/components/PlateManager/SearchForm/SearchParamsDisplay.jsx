import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component แสดงข้อมูลการค้นหาล่าสุด
 */
const SearchParamsDisplay = ({ params, onReset }) => {
  // ถ้าไม่มีพารามิเตอร์การค้นหา ไม่ต้องแสดง
  if (!params || Object.keys(params).length === 0) {
    return null;
  }

  return (
    <div className="alert alert-info search-params-alert">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>เงื่อนไขการค้นหา: </strong>
          {params.searchTerm && <span>ทะเบียน: {params.searchTerm}</span>}
          {params.startDate && <span> | วันที่เริ่มต้น: {params.startDate}</span>}
          {params.endDate && <span> | วันที่สิ้นสุด: {params.endDate}</span>}
          {params.startMonth && <span> | เดือนเริ่มต้น: {params.startMonth}</span>}
          {params.endMonth && <span> | เดือนสิ้นสุด: {params.endMonth}</span>}
          {params.startYear && <span> | ปีเริ่มต้น: {params.startYear}</span>}
          {params.endYear && <span> | ปีสิ้นสุด: {params.endYear}</span>}
        </div>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={onReset}
        >
          ล้างการค้นหา
        </button>
      </div>
    </div>
  );
};

SearchParamsDisplay.propTypes = {
  params: PropTypes.object,
  onReset: PropTypes.func.isRequired
};

export default SearchParamsDisplay;