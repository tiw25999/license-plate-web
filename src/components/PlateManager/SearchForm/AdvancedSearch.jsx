import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
    isDateRangeComplete,
    isMonthRangeComplete,
    isYearRangeComplete
} from '../../../utils/dateUtils';

/**
 * Component ค้นหาขั้นสูง
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
  const [advancedSearchType, setAdvancedSearchType] = useState('date');
  
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
    
    // สร้างพารามิเตอร์การค้นหาตามโหมดที่เลือก
    let searchParams = {};
    
    // พารามิเตอร์ทั่วไป - ทะเบียนรถ
    if (searchTerm.trim()) {
      searchParams.searchTerm = searchTerm.trim();
    }
    
    // พารามิเตอร์ตามโหมดค้นหาขั้นสูง
    switch (advancedSearchType) {
      case 'date':
        if (isDateRangeComplete(startDate, endDate)) {
          searchParams.startDate = startDate;
          searchParams.endDate = endDate;
        } else {
          setError('กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุดให้ครบถ้วน');
          return;
        }
        break;
      case 'month':
        if (isMonthRangeComplete(startMonth, endMonth, startYear, endYear)) {
          searchParams.startMonth = startMonth;
          searchParams.endMonth = endMonth;
          searchParams.startYear = startYear;
          searchParams.endYear = endYear;
        } else {
          setError('กรุณาระบุเดือนและปีเริ่มต้น รวมถึงเดือนและปีสิ้นสุดให้ครบถ้วน');
          return;
        }
        break;
      case 'year':
        if (isYearRangeComplete(startYear, endYear)) {
          searchParams.startYear = startYear;
          searchParams.endYear = endYear;
        } else {
          setError('กรุณาระบุปีเริ่มต้นและปีสิ้นสุดให้ครบถ้วน');
          return;
        }
        break;
      default:
        break;
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

      {/* ตัวเลือกประเภทการค้นหา */}
      <div className="search-type-selector mb-3">
        <div className="btn-group w-100">
          <button 
            type="button" 
            className={`btn ${advancedSearchType === 'date' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setAdvancedSearchType('date')}
          >
            <i className="bi bi-calendar-date"></i> ค้นหาตามวันที่
          </button>
          <button 
            type="button" 
            className={`btn ${advancedSearchType === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setAdvancedSearchType('month')}
          >
            <i className="bi bi-calendar-month"></i> ค้นหาตามเดือน
          </button>
          <button 
            type="button" 
            className={`btn ${advancedSearchType === 'year' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setAdvancedSearchType('year')}
          >
            <i className="bi bi-calendar-range"></i> ค้นหาตามปี
          </button>
        </div>
      </div>

      {/* แสดงฟอร์มตามประเภทการค้นหา */}
      {advancedSearchType === 'date' && (
        <div className="row mb-3">
          <div className="col-md-5">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">วันที่เริ่มต้น</label>
              <input
                type="text"
                id="startDate"
                className="form-control"
                placeholder="DD/MM/YYYY"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                onChange={(e) => setEndDate(e.target.value)}
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
      )}

      {/* ฟอร์มค้นหาตามเดือน */}
      {advancedSearchType === 'month' && (
        <div className="row mb-3">
          <div className="col-md-3">
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
                required
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group">
              <label htmlFor="startYear" className="form-label">ปีเริ่มต้น</label>
              <input
                type="number"
                id="startYear"
                className="form-control"
                placeholder="เช่น 1990"
                min="1900"
                max="2100"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-md-3">
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
                required
              />
            </div>
          </div>
          <div className="col-md-3">
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
                required
              />
            </div>
          </div>
          <div className="col-12 mt-1">
            <small className="form-text text-muted">
              ต้องระบุทั้งเดือนและปีเริ่มต้น พร้อมกับเดือนและปีสิ้นสุด
            </small>
          </div>
        </div>
      )}

      {/* ฟอร์มค้นหาตามปี */}
      {advancedSearchType === 'year' && (
        <div className="row mb-3">
          <div className="col-md-5">
            <div className="form-group">
              <label htmlFor="startYear" className="form-label">ปีเริ่มต้น</label>
              <input
                type="number"
                id="startYear"
                className="form-control"
                placeholder="เช่น 1990"
                min="1900"
                max="2100"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-md-5">
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
                required
              />
            </div>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <span className="text-muted w-100 text-center">ช่วงปี</span>
          </div>
          <div className="col-12 mt-1">
            <small className="form-text text-muted">
              ต้องระบุทั้งปีเริ่มต้นและปีสิ้นสุด
            </small>
          </div>
        </div>
      )}

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