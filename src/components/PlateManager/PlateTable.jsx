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

  /**
   * แยกหรือแปลง timestamp ให้เป็น date/time แบบไทย
   * รองรับทั้ง ISO string หรือ "DD/MM/YYYY HH:MM:SS"
   */
  const formatThaiDateTime = (ts) => {
    if (!ts) return { date: '-', time: '-' };

    // พยายาม parse เป็น JS Date (รองรับ ISO)
    const dt = new Date(ts);
    if (!isNaN(dt)) {
      const date = dt.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const time = dt.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return { date, time };
    }

    // ถ้า parse ไม่ได้ ให้ fallback แยกจาก string โดยใช้ space
    const parts = ts.split(' ');
    return {
      date: parts[0] || '-',
      time: parts[1] || '-',
    };
  };

  return (
    <>
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
                // คำนวณลำดับบนหน้า
                const seq = (currentPage - 1) * itemsPerPage + idx + 1;
                // แปลง timestamp
                const { date, time } = formatThaiDateTime(plate.timestamp);
                return (
                  <tr key={plate.id || idx}>
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
  onDelete: PropTypes.func,
};

export default PlateTable;
