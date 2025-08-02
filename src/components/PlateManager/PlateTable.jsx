// src/components/PlateTable.jsx

import React from 'react';
import PropTypes from 'prop-types';

export default function PlateTable({
  plates,
  currentPage,
  itemsPerPage,
  getPlateNumber,
  totalRecords,
  onItemsPerPageChange,
  canDelete,
  onDelete,
}) {
  if (!plates || plates.length === 0) {
    return <div className="alert alert-info">ไม่พบข้อมูลทะเบียน</div>;
  }

  // แปลง timestamp → date/time แบบไทย
  const formatThaiDateTime = (ts) => {
    if (!ts) return { date: '-', time: '-' };
    const dt = new Date(ts);
    if (!isNaN(dt)) {
      return {
        date: dt.toLocaleDateString('th-TH', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        time: dt.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    }
    const [date, time] = ts.split(' ');
    return { date: date || '-', time: time || '-' };
  };

  return (
    <>
      {/* — Header — */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="total-records">
          แสดง <strong>{totalRecords}</strong> รายการ
        </div>
        <div className="items-per-page d-flex align-items-center">
          <label className="me-2 mb-0">แสดง:</label>
          <select
            className="form-select form-select-sm"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* — Table — */}
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
              {plates.map((plate, idx) => {
                const seq = (currentPage - 1) * itemsPerPage + idx + 1;
                const ts = plate.timestamp;
                const { date, time } = formatThaiDateTime(ts);
                return (
                  <tr key={plate.id}>
                    <td className="text-center">{seq}</td>
                    <td>{getPlateNumber(plate)}</td>
                    <td>{plate.province || '-'}</td>
                    <td>{date}</td>
                    <td>{time}</td>
                    <td>{plate.camera_name || '-'}</td>
                    {canDelete && (
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          title="ลบรายการนี้"
                          onClick={() => {
                            // เรียก onDelete ตรง ๆ
                            onDelete(plate.id);
                          }}
                        >
                          ❌
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
}

PlateTable.propTypes = {
  plates:               PropTypes.array.isRequired,
  currentPage:          PropTypes.number.isRequired,
  itemsPerPage:         PropTypes.number.isRequired,
  getPlateNumber:       PropTypes.func.isRequired,
  totalRecords:         PropTypes.number.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  canDelete:            PropTypes.bool,
  onDelete:             PropTypes.func,
};
