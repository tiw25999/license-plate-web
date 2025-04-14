import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Component ค้นหาขั้นสูงแบบรวมในฟอร์มเดียว
 */
const AdvancedSearch = ({ 
  initialSearchTerm,
  initialStartDate,
  initialEndDate,
  onSearch,
  onReset,
  loading
}) => {
  // State สำหรับการค้นหา
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  // State สำหรับช่วงวันที่
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  // State สำหรับข้อผิดพลาด
  const [error, setError] = useState(null);

  // ฟังก์ชันสำหรับจัดการการ submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // สร้างพารามิเตอร์การค้นหา
    let searchParams = {};
    
    // พารามิเตอร์ทะเบียนรถ
    if (searchTerm.trim()) {
      searchParams.searchTerm = searchTerm.trim();
    }
    
    // พารามิเตอร์ช่วงวันที่
    if (startDate && endDate) {
      searchParams.startDate = startDate;
      searchParams.endDate = endDate;
    } else if (startDate || endDate) {
      // ถ้ามีแค่อันใดอันหนึ่ง ให้แจ้งเตือน
      setError('กรุณาระบุทั้งวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }
    
    // ตรวจสอบว่ามีพารามิเตอร์การค้นหาอย่างน้อย 1 อย่าง
    if (Object.keys(searchParams).length === 0) {
      setError('กรุณาระบุเงื่อนไขการค้นหาอย่างน้อย 1 รายการ');
      return;
    }
    
    // ล้างข้อผิดพลาด
    setError(null);
    
    // เรียกใช้ callback การค้นหา
    onSearch(searchParams);
  };

  // ฟังก์ชันสำหรับล้างฟอร์ม
  const handleReset = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setError(null);
    onReset();
  };

  return (
    <div className="advanced-search-container">
      {/* ช่องค้นหาทะเบียน */}
      <div className="mb-4">
        <label htmlFor="searchTerm" className="form-label fw-bold mb-2">ค้นหาเลขทะเบียน</label>
        <div className="input-group">
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            id="searchTerm"
            className="form-control"
            placeholder="ป้อนทะเบียนที่ต้องการค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <small className="text-muted">สามารถค้นหาด้วยเลขทะเบียนบางส่วนได้</small>
      </div>

      {/* ค้นหาตามช่วงวันที่ */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <i className="bi bi-calendar me-2"></i> ค้นหาตามช่วงวันที่
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="startDate" className="form-label">วันที่เริ่มต้น</label>
              <input
                type="text"
                id="startDate"
                className="form-control"
                placeholder="DD/MM/YYYY"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="endDate" className="form-label">วันที่สิ้นสุด</label>
              <input
                type="text"
                id="endDate"
                className="form-control"
                placeholder="DD/MM/YYYY"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-text">
            รูปแบบ: วัน/เดือน/ปี (เช่น 10/01/2002 - 31/12/2003)
          </div>
          <div className="form-text text-muted">
            ช่วงวันที่จะถูกใช้ในการค้นหาทะเบียนรถที่บันทึกในช่วงเวลาดังกล่าว
          </div>
        </div>
      </div>

      {/* แสดงข้อผิดพลาด */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* ปุ่มค้นหาและล้างการค้นหา */}
      <div className="row mt-4">
        <div className="col-12 d-flex justify-content-center">
          <button 
            type="button" 
            className="btn btn-primary btn-lg me-2 px-4"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                กำลังค้นหา...
              </>
            ) : (
              <>
                <i className="bi bi-search me-2"></i> ค้นหา
              </>
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-lg px-4"
            onClick={handleReset}
          >
            <i className="bi bi-x-circle me-2"></i> ล้างการค้นหา
          </button>
        </div>
      </div>
    </div>
  );
};

AdvancedSearch.propTypes = {
  initialSearchTerm: PropTypes.string,
  initialStartDate: PropTypes.string,
  initialEndDate: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default AdvancedSearch;