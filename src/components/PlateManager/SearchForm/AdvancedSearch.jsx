import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Component ค้นหาขั้นสูงแบบรวม
 */
const AdvancedSearch = ({ 
  initialSearchTerm,
  initialStartDate,
  initialEndDate,
  initialStartMonth,
  initialEndMonth,
  initialStartYear,
  initialEndYear,
  onSearch,
  onReset,
  loading
}) => {
  // State สำหรับการค้นหา
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  
  // State สำหรับการค้นหาตามวันที่
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  
  // State สำหรับการค้นหาตามเดือน
  const [startMonth, setStartMonth] = useState(initialStartMonth || '');
  const [endMonth, setEndMonth] = useState(initialEndMonth || '');
  
  // State สำหรับการค้นหาตามปี
  const [startYear, setStartYear] = useState(initialStartYear || '');
  const [endYear, setEndYear] = useState(initialEndYear || '');
  
  // State สำหรับข้อผิดพลาด
  const [error, setError] = useState(null);

  // ฟังก์ชันสำหรับจัดการการ submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // สร้างพารามิเตอร์การค้นหา
    let searchParams = {};
    
    // พารามิเตอร์ทั่วไป - ทะเบียนรถ
    if (searchTerm.trim()) {
      searchParams.searchTerm = searchTerm.trim();
    }
    
    // ตรวจสอบและเพิ่มพารามิเตอร์วันที่
    if (startDate && endDate) {
      searchParams.startDate = startDate;
      searchParams.endDate = endDate;
    } else if (startDate || endDate) {
      // ถ้ามีแค่อันใดอันหนึ่ง ให้แจ้งเตือน
      setError('หากต้องการค้นหาตามช่วงวันที่ กรุณาระบุทั้งวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }
    
    // ตรวจสอบและเพิ่มพารามิเตอร์เดือน/ปี
    if ((startMonth || endMonth) && (startYear && endYear)) {
      if (startMonth && endMonth) {
        searchParams.startMonth = startMonth;
        searchParams.endMonth = endMonth;
        searchParams.startYear = startYear;
        searchParams.endYear = endYear;
      } else {
        setError('หากต้องการค้นหาตามช่วงเดือน กรุณาระบุทั้งเดือนเริ่มต้นและเดือนสิ้นสุด');
        return;
      }
    } else if ((startMonth || endMonth) && (!startYear || !endYear)) {
      setError('หากต้องการค้นหาตามช่วงเดือน กรุณาระบุทั้งปีเริ่มต้นและปีสิ้นสุด');
      return;
    }
    
    // ตรวจสอบปีโดยไม่มีเดือน
    if (!startMonth && !endMonth && startYear && endYear) {
      searchParams.startYear = startYear;
      searchParams.endYear = endYear;
    } else if ((!startMonth && !endMonth) && (startYear || endYear)) {
      setError('หากต้องการค้นหาตามช่วงปี กรุณาระบุทั้งปีเริ่มต้นและปีสิ้นสุด');
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
    setStartMonth('');
    setEndMonth('');
    setStartYear('');
    setEndYear('');
    setError(null);
    onReset();
  };

  return (
    <div className="advanced-search-container">
      {/* ช่องค้นหาทะเบียน */}
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">ทะเบียนรถ</span>
          <input
            type="text"
            className="form-control"
            placeholder="ป้อนทะเบียนที่ต้องการค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ค้นหาตามวันที่ */}
      <div className="card mb-3">
        <div className="card-header bg-light">
          <i className="bi bi-calendar-date me-2"></i> ค้นหาตามวันที่
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
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
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
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
          </div>
          <small className="text-muted">
            รูปแบบ: วัน/เดือน/ปี (เช่น 01/12/2023) - หากต้องการค้นหาตามวันที่ ต้องระบุทั้งวันที่เริ่มต้นและสิ้นสุด
          </small>
        </div>
      </div>

      {/* ค้นหาตามเดือน/ปี */}
      <div className="card mb-3">
        <div className="card-header bg-light">
          <i className="bi bi-calendar-month me-2"></i> ค้นหาตามเดือน/ปี
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="form-group">
                <label htmlFor="startMonth" className="form-label">เดือนเริ่มต้น</label>
                <input
                  type="number"
                  id="startMonth"
                  className="form-control"
                  placeholder="1-12"
                  min="1"
                  max="12"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="form-group">
                <label htmlFor="endMonth" className="form-label">เดือนสิ้นสุด</label>
                <input
                  type="number"
                  id="endMonth"
                  className="form-control"
                  placeholder="1-12"
                  min="1"
                  max="12"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="form-group">
                <label htmlFor="startYear" className="form-label">ปีเริ่มต้น</label>
                <input
                  type="number"
                  id="startYear"
                  className="form-control"
                  placeholder="เช่น 2023"
                  min="1900"
                  max="2100"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="form-group">
                <label htmlFor="endYear" className="form-label">ปีสิ้นสุด</label>
                <input
                  type="number"
                  id="endYear"
                  className="form-control"
                  placeholder="เช่น 2023"
                  min="1900"
                  max="2100"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                />
              </div>
            </div>
          </div>
          <small className="text-muted">
            สำหรับค้นหาตามเดือน: ต้องระบุทั้งเดือน (1-12) และปีให้ครบทั้งเริ่มต้นและสิ้นสุด<br/>
            สำหรับค้นหาตามปี: หากต้องการค้นหาเฉพาะปี ไม่ต้องระบุเดือน แต่ต้องระบุปีเริ่มต้นและสิ้นสุดให้ครบ
          </small>
        </div>
      </div>

      {/* แสดงข้อผิดพลาด */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* ปุ่มค้นหาและล้างการค้นหา */}
      <div className="row">
        <div className="col-12 d-flex justify-content-center">
          <button 
            type="button" 
            className="btn btn-primary search-button mx-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary mx-2"
            onClick={handleReset}
          >
            ล้างการค้นหา
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
  initialStartMonth: PropTypes.string,
  initialEndMonth: PropTypes.string,
  initialStartYear: PropTypes.string,
  initialEndYear: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default AdvancedSearch;