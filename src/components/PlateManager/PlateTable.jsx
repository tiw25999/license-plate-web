import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component สำหรับแสดงตารางข้อมูลทะเบียนรถ
 */
const PlateTable = ({ 
  plates, 
  currentPage, 
  itemsPerPage,
  getPlateNumber,
  totalRecords,
  onItemsPerPageChange 
}) => {
  // ถ้าไม่มีข้อมูล ไม่ต้องแสดงตาราง
  if (!plates || plates.length === 0) {
    return <div className="alert alert-info">ไม่พบข้อมูลทะเบียน</div>;
  }

  return (
    <>
      {/* ตัวเลือกการแสดงผล */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="total-records">
          แสดง <strong>{totalRecords}</strong> รายการ
        </div>
        <div className="items-per-page">
          <label className="me-2">แสดง:</label>
          <select 
            className="form-select form-select-sm" 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th className="text-center" style={{ width: '10%' }}>ลำดับ</th>
                <th style={{ width: '40%' }}>เลขทะเบียน</th>
                <th style={{ width: '50%' }}>วันที่บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {plates.map((plate, index) => (
                <tr key={index}>
                  <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="plate-number">{getPlateNumber(plate)}</td>
                  <td>{plate.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

PlateTable.propTypes = {
  plates: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  getPlateNumber: PropTypes.func.isRequired,
  totalRecords: PropTypes.number.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired
};

export default PlateTable;