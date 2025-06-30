import PropTypes from 'prop-types';
import React from 'react';

const PlateTable = ({
  plates,
  currentPage,
  itemsPerPage,
  getPlateNumber,
  totalRecords,
  onItemsPerPageChange,
  canDelete = false,
  onDelete
}) => {
  if (!plates || plates.length === 0) {
    return <div className="alert alert-info">ไม่พบข้อมูลทะเบียน</div>;
  }

  const splitDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: '-', time: '-' };
    const parts = dateTimeStr.split(' ');
    return {
      date: parts[0] || '-',
      time: parts[1] || '-'
    };
  };

  return (
    <>
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
                <th className="text-center" style={{ width: '5%' }}>ลำดับ</th>
                <th style={{ width: '15%' }}>เลขทะเบียน</th>
                <th style={{ width: '12%' }}>จังหวัด</th>
                <th style={{ width: '12%' }}>วันที่บันทึก</th>
                <th style={{ width: '12%' }}>เวลาที่บันทึก</th>
                <th style={{ width: '20%' }}>ชื่อกล้อง</th>
                {canDelete && <th style={{ width: '8%' }}>จัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {plates.map((plate, index) => {
                const { date, time } = splitDateTime(plate.timestamp);
                return (
                  <tr key={plate.id || index}>
                    <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{getPlateNumber(plate)}</td>
                    <td>{plate.province || '-'}</td>
                    <td>{date}</td>
                    <td>{time}</td>
                    <td>{plate.camera_name || '-'}</td>
                    {canDelete && (
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onDelete(plate.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
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
  onItemsPerPageChange: PropTypes.func.isRequired,
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func
};

export default PlateTable;
