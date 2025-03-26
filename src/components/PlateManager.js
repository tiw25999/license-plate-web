import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { plateService } from '../services/api';
import './PlateManager.css';

const PlateManager = () => {
  const [allPlates, setAllPlates] = useState([]); // เก็บข้อมูลทั้งหมด
  const [displayPlates, setDisplayPlates] = useState([]); // เก็บข้อมูลที่แสดงในหน้าปัจจุบัน
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  
  // ตัวแปรสำหรับการแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);

  // ตัวแปรสำหรับการกรอง
  const [searchMode, setSearchMode] = useState('quick'); // 'quick', 'date', 'month', 'year', 'time'
  const [lastSearchParams, setLastSearchParams] = useState({});

  // อัพเดตข้อมูลที่แสดงตามหน้าปัจจุบัน
  const updateDisplayPlates = useCallback((plates, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayPlates(plates.slice(startIndex, endIndex));
  }, [itemsPerPage]);

  // ฟังก์ชันสำหรับแสดงเลขทะเบียน
  const getPlateNumber = useCallback((plateObj) => {
    if (!plateObj) return '-';
    if (plateObj.plate) return plateObj.plate;
    if (plateObj.plate_number) return plateObj.plate_number;
    return JSON.stringify(plateObj);
  }, []);

  // โหลดรายการทะเบียนล่าสุด
  const loadLatestPlates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // รีเซ็ตค่าการค้นหา
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setStartMonth('');
      setEndMonth('');
      setStartYear('');
      setEndYear('');
      setStartHour('');
      setEndHour('');
      setLastSearchParams({});
      
      const data = await plateService.getLatestPlates(500);
      
      const platesArray = Array.isArray(data) ? data : [data];
      setAllPlates(platesArray);
      setTotalRecords(platesArray.length);
      
      // คำนวณจำนวนหน้าทั้งหมด
      const pages = Math.ceil(platesArray.length / itemsPerPage);
      setTotalPages(pages || 1);
      
      // เซ็ตข้อมูลสำหรับหน้าแรก
      setCurrentPage(1);
      updateDisplayPlates(platesArray, 1);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลทะเบียนได้: ' + (err.message || err));
      setAllPlates([]);
      setDisplayPlates([]);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, updateDisplayPlates]);

  // ค้นหาทะเบียน (แบบใหม่ใช้ endpoint ค้นหา)
  const searchPlatesWithParams = useCallback(async (params = {}) => {
    // สร้าง search params ตามโหมดการค้นหา
    let searchParams = { ...params, limit: 500 };
    
    // ถ้าไม่มีค่าการค้นหาเลย ให้โหลดข้อมูลล่าสุด
    if (!Object.values(searchParams).some(value => value)) {
      return loadLatestPlates();
    }
    
    try {
      setLoading(true);
      setError(null);
      // เก็บพารามิเตอร์การค้นหาล่าสุด
      setLastSearchParams(searchParams);
      
      const data = await plateService.searchPlates(searchParams);
      
      // ตรวจสอบโครงสร้างข้อมูลและแปลงให้อยู่ในรูปแบบที่ถูกต้อง
      let searchResults = Array.isArray(data) ? data : [data];
      
      setAllPlates(searchResults);
      setTotalRecords(searchResults.length);
      
      // คำนวณจำนวนหน้าทั้งหมด
      const pages = Math.ceil(searchResults.length / itemsPerPage);
      setTotalPages(Math.max(1, pages));
      
      // เซ็ตข้อมูลสำหรับหน้าแรก
      setCurrentPage(1);
      updateDisplayPlates(searchResults, 1);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหา');
      setAllPlates([]);
      setDisplayPlates([]);
      setTotalRecords(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, updateDisplayPlates, loadLatestPlates]);

  // ฟังก์ชัน debounce สำหรับการค้นหา
  const debounce = useCallback((func, delay) => {
    let debounceTimer;
    return function(...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
  }, []);

  // การค้นหาแบบทันที (debounced)
  const debouncedSearch = useMemo(
    () => debounce(async (term) => {
      if (term.length >= 2) { // ต้องพิมพ์อย่างน้อย 2 ตัวอักษร
        await searchPlatesWithParams({ searchTerm: term });
      } else if (term === '') {
        // ถ้าลบคำค้นหาจนหมด ให้โหลดข้อมูลล่าสุด
        loadLatestPlates();
      }
    }, 500), 
    [debounce, searchPlatesWithParams, loadLatestPlates]
  );

  // ไปหน้าถัดไป
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateDisplayPlates(allPlates, nextPage);
      
      // เลื่อนขึ้นไปด้านบนของตาราง
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage, totalPages, allPlates, updateDisplayPlates]);

  // ไปหน้าก่อนหน้า
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      updateDisplayPlates(allPlates, prevPage);
      
      // เลื่อนขึ้นไปด้านบนของตาราง
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage, allPlates, updateDisplayPlates]);

  // ไปยังหน้าที่ระบุ
  const goToPage = useCallback((page) => {
    const pageNum = parseInt(page);
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      updateDisplayPlates(allPlates, pageNum);
      
      // เลื่อนขึ้นไปด้านบนของตาราง
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [totalPages, allPlates, updateDisplayPlates]);

  // ฟังก์ชันสำหรับค้นหาด้วยฟอร์ม
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    
    // สร้างพารามิเตอร์การค้นหาตามโหมดที่เลือก
    let searchParams = {};
    
    // พารามิเตอร์ทั่วไป - ทะเบียนรถ
    if (searchTerm.trim()) {
      searchParams.searchTerm = searchTerm.trim();
    }
    
    // พารามิเตอร์เฉพาะโหมด
    switch (searchMode) {
      case 'date':
        if (startDate) {
          searchParams.startDate = startDate;
          searchParams.endDate = startDate; // ใช้วันเดียวกันสำหรับการค้นหา
        }
        break;
      case 'month':
        if (startMonth) searchParams.startMonth = startMonth;
        if (endMonth) searchParams.endMonth = endMonth;
        if (startYear) searchParams.startYear = startYear;
        if (endYear) searchParams.endYear = endYear;
        break;
      case 'year':
        if (startYear) searchParams.startYear = startYear;
        if (endYear) searchParams.endYear = endYear;
        break;
      case 'time':
        if (startHour) searchParams.startHour = startHour;
        if (endHour) searchParams.endHour = endHour;
        break;
      default:
        break;
    }
    
    searchPlatesWithParams(searchParams);
  }, [searchMode, searchTerm, startDate, startMonth, endMonth, startYear, endYear, startHour, endHour, searchPlatesWithParams]);

  // ปรับเปลี่ยนจำนวนรายการต่อหน้า
  const handleItemsPerPageChange = useCallback((e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    
    // คำนวณหน้าใหม่
    const newTotalPages = Math.ceil(allPlates.length / newItemsPerPage);
    setTotalPages(newTotalPages || 1);
    
    // ปรับหน้าปัจจุบันถ้าเกินหน้าสุดท้าย
    const newCurrentPage = Math.min(currentPage, newTotalPages || 1);
    setCurrentPage(newCurrentPage);
    
    // อัพเดตการแสดงผล
    updateDisplayPlates(allPlates, newCurrentPage);
  }, [allPlates, currentPage, updateDisplayPlates]);

  // ฟังก์ชันสำหรับรีเซ็ตฟอร์มทั้งหมด
  const resetAllForms = useCallback(() => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStartMonth('');
    setEndMonth('');
    setStartYear('');
    setEndYear('');
    setStartHour('');
    setEndHour('');
    loadLatestPlates();
  }, [loadLatestPlates]);

  // ตรวจสอบสถานะ API เมื่อโหลดครั้งแรก
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const status = await plateService.checkHealth();
        setApiStatus(status.status === 'ok' ? 'online' : 'issue');
      } catch (error) {
        setApiStatus('offline');
      }
    };
    
    checkApiStatus();
  }, []);

  // เรียกข้อมูลเมื่อโหลดหน้าแรก
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates]);

  // ค้นหาแบบทันทีเมื่อมีการเปลี่ยนแปลงคำค้นหา (กรณีที่เปิดใช้งาน)
  useEffect(() => {
    if (searchMode !== 'quick') return; // ใช้แบบ auto-search เฉพาะในโหมด quick
    
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch, searchMode]);

  // สร้างปุ่มสำหรับการแบ่งหน้า
  const renderPaginationButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = 5; // จำนวนปุ่มสูงสุดที่แสดง
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // ปรับ startPage ถ้า endPage ถึงจำนวนหน้าสูงสุดแล้ว
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // ปุ่มหน้าแรก
    if (currentPage > 2) {
      buttons.push(
        <button 
          key="first" 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(1)}
        >
          1
        </button>
      );
      
      // แสดงจุดไข่ปลาถ้าหน้าแรกไม่ติดกับช่วงปุ่มที่แสดง
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }
    
    // ปุ่มหน้าในช่วง
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }
    
    // ปุ่มหน้าสุดท้าย
    if (currentPage < totalPages - 1) {
      // แสดงจุดไข่ปลาถ้าหน้าสุดท้ายไม่ติดกับช่วงปุ่มที่แสดง
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      
      buttons.push(
        <button 
          key="last" 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  }, [currentPage, totalPages, goToPage]);

  // แสดงผล
  return (
    <div className="container mt-4 plate-manager">
      <h2 className="mb-4 text-center">ระบบจัดการทะเบียนรถ</h2>
      
      {/* แสดงสถานะการเชื่อมต่อ API */}
      {apiStatus && (
        <div className={`api-status api-status-${apiStatus} mb-2`}>
          <small>
            {apiStatus === 'online' ? '✅ เชื่อมต่อกับ API สำเร็จ' : 
             apiStatus === 'offline' ? '❌ ไม่สามารถเชื่อมต่อกับ API ได้' : 
             '⚠️ API อาจมีปัญหาบางส่วน'}
          </small>
        </div>
      )}

      {/* สลับระหว่างโหมดการค้นหาต่างๆ */}
      <div className="search-tabs mb-3">
        <div className="btn-group w-100">
          <button 
            className={`btn ${searchMode === 'quick' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSearchMode('quick')}
          >
            <i className="bi bi-search"></i> ค้นหาด่วน
          </button>
          <button 
            className={`btn ${searchMode === 'date' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSearchMode('date')}
          >
            <i className="bi bi-calendar-date"></i> ค้นหาตามวันที่
          </button>
          <button 
            className={`btn ${searchMode === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSearchMode('month')}
          >
            <i className="bi bi-calendar-month"></i> ค้นหาตามเดือน
          </button>
          <button 
            className={`btn ${searchMode === 'year' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSearchMode('year')}
          >
            <i className="bi bi-calendar-range"></i> ค้นหาตามปี
          </button>
          <button 
            className={`btn ${searchMode === 'time' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSearchMode('time')}
          >
            <i className="bi bi-clock"></i> ค้นหาตามเวลา
          </button>
        </div>
      </div>

      {/* แสดงฟอร์มการค้นหาตามโหมดที่เลือก */}
      <form onSubmit={handleSearchSubmit} className="mb-4 search-form">
        {/* ช่องค้นหาทะเบียน - แสดงในทุกโหมด */}
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text">ทะเบียนรถ</span>
            <input
              type="text"
              className="form-control"
              placeholder={searchMode === 'quick' ? "พิมพ์เพื่อค้นหาอัตโนมัติ..." : "ป้อนทะเบียนที่ต้องการค้นหา..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchMode === 'quick' && (
              <button 
                type="button"
                className="btn btn-success" 
                onClick={loadLatestPlates}
                disabled={loading}
              >
                {loading ? 'กำลังโหลด...' : 'แสดงทั้งหมด'}
              </button>
            )}
          </div>
          {searchMode === 'quick' && (
            <small className="form-text text-muted">พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อเริ่มค้นหาอัตโนมัติ</small>
          )}
        </div>

        {/* ฟอร์มค้นหาตามวันที่ */}
        {searchMode === 'date' && (
          <div className="row mb-3">
            <div className="col-md-8 mx-auto">
              <div className="input-group">
                <span className="input-group-text">วันที่</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="DD/MM/YYYY"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate(e.target.value); // ตั้งวันที่สิ้นสุดเป็นวันเดียวกัน
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary search-button"
                  disabled={loading}
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </div>
              <small className="form-text text-muted">รูปแบบ: วัน/เดือน/ปี (เช่น 01/12/2023)</small>
            </div>
          </div>
        )}

        {/* ฟอร์มค้นหาตามเดือน */}
        {searchMode === 'month' && (
          <div className="row mb-3">
            <div className="col-md-8 mx-auto">
              <div className="row g-2">
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="startMonth" className="form-label">เดือนเริ่มต้น (1-12)</label>
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
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="startYear" className="form-label">ปีเริ่มต้น</label>
                    <input
                      type="number"
                      id="startYear"
                      className="form-control"
                      placeholder="เช่น 2023"
                      min="2000"
                      max="2100"
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="endMonth" className="form-label">เดือนสิ้นสุด (1-12)</label>
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
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="endYear" className="form-label">ปีสิ้นสุด</label>
                    <input
                      type="number"
                      id="endYear"
                      className="form-control"
                      placeholder="เช่น 2023"
                      min="2000"
                      max="2100"
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 d-flex justify-content-center">
                <button 
                  type="submit" 
                  className="btn btn-primary search-button mx-2"
                  disabled={loading}
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary mx-2"
                  onClick={resetAllForms}
                >
                  ล้างการค้นหา
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ฟอร์มค้นหาตามปี */}
        {searchMode === 'year' && (
          <div className="row mb-3">
            <div className="col-md-8 mx-auto">
              <div className="row g-2">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="startYear" className="form-label">ปีเริ่มต้น</label>
                    <input
                      type="number"
                      id="startYear"
                      className="form-control"
                      placeholder="เช่น 2020"
                      min="2000"
                      max="2100"
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="endYear" className="form-label">ปีสิ้นสุด</label>
                    <input
                      type="number"
                      id="endYear"
                      className="form-control"
                      placeholder="เช่น 2025"
                      min="2000"
                      max="2100"
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 d-flex justify-content-center">
                <button 
                  type="submit" 
                  className="btn btn-primary search-button mx-2"
                  disabled={loading}
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary mx-2"
                  onClick={resetAllForms}
                >
                  ล้างการค้นหา
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ฟอร์มค้นหาตามเวลา */}
        {searchMode === 'time' && (
          <div className="row mb-3">
            <div className="col-md-8 mx-auto">
              <div className="row g-2">
                <div className="col-md-5">
                  <div className="form-group">
                    <label htmlFor="startHour" className="form-label">เวลาเริ่มต้น (0-23)</label>
                    <input
                      type="number"
                      id="startHour"
                      className="form-control"
                      placeholder="0-23"
                      min="0"
                      max="23"
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="form-group">
                    <label htmlFor="endHour" className="form-label">เวลาสิ้นสุด (0-23)</label>
                    <input
                      type="number"
                      id="endHour"
                      className="form-control"
                      placeholder="0-23"
                      min="0"
                      max="23"
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 d-flex justify-content-center">
                <button 
                  type="submit" 
                  className="btn btn-primary search-button mx-2"
                  disabled={loading}
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary mx-2"
                  onClick={resetAllForms}
                >
                  ล้างการค้นหา
                </button>
              </div>
              <div className="col-12 mt-1 text-center">
                <small className="form-text text-muted">
                  เป็นการค้นหาตามเวลาที่บันทึก เช่น 8-17 สำหรับช่วง 8:00-17:00 น.
                </small>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* แสดงเงื่อนไขการค้นหาล่าสุด */}
      {Object.keys(lastSearchParams).length > 0 && (
        <div className="alert alert-info search-params-alert">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>เงื่อนไขการค้นหา: </strong>
              {lastSearchParams.searchTerm && <span>ทะเบียน: {lastSearchParams.searchTerm}</span>}
              {lastSearchParams.startDate && <span> | วันที่เริ่มต้น: {lastSearchParams.startDate}</span>}
              {lastSearchParams.endDate && <span> | วันที่สิ้นสุด: {lastSearchParams.endDate}</span>}
              {lastSearchParams.startMonth && <span> | เดือนเริ่มต้น: {lastSearchParams.startMonth}</span>}
              {lastSearchParams.endMonth && <span> | เดือนสิ้นสุด: {lastSearchParams.endMonth}</span>}
              {lastSearchParams.startYear && <span> | ปีเริ่มต้น: {lastSearchParams.startYear}</span>}
              {lastSearchParams.endYear && <span> | ปีสิ้นสุด: {lastSearchParams.endYear}</span>}
              {lastSearchParams.startHour && <span> | เวลาเริ่มต้น: {lastSearchParams.startHour}:00</span>}
              {lastSearchParams.endHour && <span> | เวลาสิ้นสุด: {lastSearchParams.endHour}:00</span>}
            </div>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={resetAllForms}
            >
              ล้างการค้นหา
            </button>
          </div>
        </div>
      )}

      {/* แสดงข้อความ loading หรือ error */}
      {loading && <div className="text-center my-3"><div className="spinner-border text-primary"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ตารางแสดงทะเบียน */}
      {!loading && !error && displayPlates.length > 0 && (
        <>
          {/* ตัวเลือกการแสดงผล */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="total-records">
              พบทั้งหมด <strong>{totalRecords}</strong> รายการ
            </div>
            <div className="items-per-page">
              <label className="me-2">แสดง:</label>
              <select 
                className="form-select form-select-sm" 
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
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
                  {displayPlates.map((plate, index) => (
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

          {/* ส่วนแสดงการแบ่งหน้า */}
          <div className="pagination-container mt-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div className="pagination-info mb-2">
                <span>หน้า {currentPage} จาก {totalPages} | </span>
                <span>รายการ {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} จากทั้งหมด {totalRecords} รายการ</span>
              </div>
              <div className="pagination-controls mb-2">
                <button 
                  className="btn btn-sm btn-outline-primary me-1" 
                  onClick={goToPrevPage} 
                  disabled={currentPage === 1}
                >
                  &larr;
                </button>
                
                {renderPaginationButtons}
                
                <button 
                  className="btn btn-sm btn-outline-primary ms-1" 
                  onClick={goToNextPage} 
                  disabled={currentPage === totalPages}
                >
                  &rarr;
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* แสดงข้อความเมื่อไม่พบข้อมูล */}
      {!loading && !error && displayPlates.length === 0 && (
        <div className="alert alert-info">ไม่พบข้อมูลทะเบียน</div>
      )}
    </div>
  );
};

export default PlateManager;