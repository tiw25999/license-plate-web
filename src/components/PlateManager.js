import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { plateService } from '../services/api';
import './PlateManager.css'; // เพิ่มไฟล์ CSS ใหม่

const PlateManager = () => {
  const [allPlates, setAllPlates] = useState([]); // เก็บข้อมูลทั้งหมด
  const [displayPlates, setDisplayPlates] = useState([]); // เก็บข้อมูลที่แสดงในหน้าปัจจุบัน
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  
  // ตัวแปรสำหรับการแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalRecords, setTotalRecords] = useState(0);

  // ตัวแปรสำหรับการกรอง
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState({});

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

  // ฟังก์ชัน debounce สำหรับการค้นหา
  const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
  };

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
    []
  );

  // โหลดรายการทะเบียนล่าสุด
  const loadLatestPlates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // รีเซ็ตค่าการค้นหา
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setLastSearchParams({});
      
      const data = await plateService.getLatestPlates(500); // เพิ่มเป็น 500 รายการ
      
      const platesArray = Array.isArray(data) ? data : [data];
      setAllPlates(platesArray);
      setTotalRecords(platesArray.length);
      
      // คำนวณจำนวนหน้าทั้งหมด
      const pages = Math.ceil(platesArray.length / itemsPerPage);
      setTotalPages(pages);
      
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

  // ค้นหาทะเบียน (แบบใหม่ใช้ endpoint ค้นหา)
  const searchPlatesWithParams = async (params = {}) => {
    const searchParams = {
      ...params,
      limit: 500 // จำกัดผลลัพธ์สูงสุด
    };
    
    // ถ้าไม่มีค่าการค้นหาเลย ให้โหลดข้อมูลล่าสุด
    if (!searchParams.searchTerm && !searchParams.startDate && !searchParams.endDate) {
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
  };

  // ฟังก์ชันสำหรับค้นหาด้วยฟอร์ม
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchPlatesWithParams({
      searchTerm: searchTerm.trim(),
      startDate,
      endDate
    });
  };

  // ปรับเปลี่ยนจำนวนรายการต่อหน้า
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    
    // คำนวณหน้าใหม่
    const newTotalPages = Math.ceil(allPlates.length / newItemsPerPage);
    setTotalPages(newTotalPages);
    
    // ปรับหน้าปัจจุบันถ้าเกินหน้าสุดท้าย
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    setCurrentPage(newCurrentPage);
    
    // อัพเดตการแสดงผล
    updateDisplayPlates(allPlates, newCurrentPage);
  };

  // เรียกข้อมูลเมื่อโหลดหน้าแรก
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates]);

  // ค้นหาแบบทันทีเมื่อมีการเปลี่ยนแปลงคำค้นหา (กรณีที่เปิดใช้งาน)
  useEffect(() => {
    if (advancedSearch) return; // ไม่ใช้ auto-search ในโหมดการค้นหาขั้นสูง
    
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch, advancedSearch]);

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

      {/* สลับระหว่างการค้นหาแบบง่ายและขั้นสูง */}
      <div className="search-type-toggle mb-2">
        <button 
          className={`btn btn-sm ${!advancedSearch ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setAdvancedSearch(false)}
        >
          ค้นหาแบบด่วน
        </button>
        <button 
          className={`btn btn-sm ${advancedSearch ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setAdvancedSearch(true)}
        >
          ค้นหาขั้นสูง
        </button>
      </div>

      {/* ส่วนค้นหา */}
      {!advancedSearch ? (
        // การค้นหาแบบด่วน (auto-search)
        <div className="row mb-4">
          <div className="col-12">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="ป้อนเลขทะเบียนที่ต้องการค้นหา (ค้นหาแบบอัตโนมัติเมื่อพิมพ์)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="btn btn-success" 
                onClick={loadLatestPlates}
                disabled={loading}
              >
                {loading ? 'กำลังโหลด...' : 'แสดงทั้งหมด'}
              </button>
            </div>
            <small className="text-muted">พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อเริ่มค้นหาอัตโนมัติ</small>
          </div>
        </div>
      ) : (
        // การค้นหาขั้นสูง (ใช้ฟอร์ม)
        <form onSubmit={handleSearchSubmit} className="mb-4 advanced-search-form">
          <div className="row g-2">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="searchTerm">เลขทะเบียน</label>
                <input
                  type="text"
                  id="searchTerm"
                  className="form-control"
                  placeholder="ค้นหาเลขที่ขึ้นต้นด้วย..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="startDate">วันที่เริ่มต้น</label>
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
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="endDate">วันที่สิ้นสุด</label>
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
            <div className="col-md-2 d-flex align-items-end">
              <div className="form-group w-100">
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </div>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12">
              <small className="text-muted">
                รูปแบบวันที่: วัน/เดือน/ปี (เช่น 01/12/2023) 
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary ml-2"
                  onClick={loadLatestPlates}
                >
                  ล้างการค้นหา
                </button>
              </small>
            </div>
          </div>
        </form>
      )}

      {/* แสดงเงื่อนไขการค้นหาล่าสุด */}
      {(lastSearchParams.searchTerm || lastSearchParams.startDate || lastSearchParams.endDate) && (
        <div className="alert alert-info search-params-alert">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>เงื่อนไขการค้นหา: </strong>
              {lastSearchParams.searchTerm && <span>ทะเบียน: {lastSearchParams.searchTerm}</span>}
              {lastSearchParams.startDate && <span> | เริ่ม: {lastSearchParams.startDate}</span>}
              {lastSearchParams.endDate && <span> | ถึง: {lastSearchParams.endDate}</span>}
            </div>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={loadLatestPlates}
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