import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useCallback, useEffect, useState } from 'react';
import { plateService } from '../services/api';

const PlateManager = () => {
  const [allPlates, setAllPlates] = useState([]); // เก็บข้อมูลทั้งหมด 250 รายการ
  const [displayPlates, setDisplayPlates] = useState([]); // เก็บข้อมูลที่แสดงในหน้าปัจจุบัน
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ตัวแปรสำหรับการแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  // อัพเดตข้อมูลที่แสดงตามหน้าปัจจุบัน
  const updateDisplayPlates = useCallback((plates, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayPlates(plates.slice(startIndex, endIndex));
  }, [itemsPerPage]);

  // โหลดรายการทะเบียนล่าสุด 250 รายการ
  const loadLatestPlates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plateService.getLatestPlates(250); // เปลี่ยนเป็นดึง 250 รายการ
      console.log('Latest plates data:', data);
      
      const platesArray = Array.isArray(data) ? data : [data];
      setAllPlates(platesArray);
      
      // คำนวณจำนวนหน้าทั้งหมด
      const pages = Math.ceil(platesArray.length / itemsPerPage);
      setTotalPages(pages);
      
      // เซ็ตข้อมูลสำหรับหน้าแรก
      setCurrentPage(1);
      updateDisplayPlates(platesArray, 1);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลทะเบียนได้: ' + err.message);
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
    }
  }, [currentPage, totalPages, allPlates, updateDisplayPlates]);

  // ไปหน้าก่อนหน้า
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      updateDisplayPlates(allPlates, prevPage);
    }
  }, [currentPage, allPlates, updateDisplayPlates]);

  // ค้นหาทะเบียน
  const searchPlate = async () => {
    if (!searchTerm.trim()) {
      alert('กรุณากรอกเลขทะเบียนที่ต้องการค้นหา');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await plateService.searchPlate(searchTerm);
      console.log('Search result data:', data);
      
      // ตรวจสอบโครงสร้างข้อมูลและแปลงให้อยู่ในรูปแบบที่ถูกต้อง
      if (data) {
        let searchResults = [];
        
        if (Array.isArray(data)) {
          searchResults = data;
        } else if (data.plate_number) {
          searchResults = [{ plate: data.plate_number, timestamp: data.timestamp }];
        } else {
          searchResults = [data];
        }
        
        // กำหนดผลลัพธ์การค้นหาเป็นข้อมูลทั้งหมดและแสดงหน้าแรก
        setAllPlates(searchResults);
        setTotalPages(Math.ceil(searchResults.length / itemsPerPage));
        setCurrentPage(1);
        updateDisplayPlates(searchResults, 1);
      } else {
        setAllPlates([]);
        setDisplayPlates([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('ไม่พบทะเบียนที่ค้นหา');
        setAllPlates([]);
        setDisplayPlates([]);
      } else {
        setError('เกิดข้อผิดพลาดในการค้นหา: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // เรียกข้อมูลเมื่อโหลดหน้าแรก
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates]);  // เพิ่ม loadLatestPlates เป็น dependency

  // ฟังก์ชันสำหรับแสดงเลขทะเบียน
  const getPlateNumber = (plateObj) => {
    if (!plateObj) return '-';
    if (plateObj.plate) return plateObj.plate;
    if (plateObj.plate_number) return plateObj.plate_number;
    return JSON.stringify(plateObj);
  };

  // แสดงผล
  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">ระบบจัดการทะเบียนรถ</h2>

      {/* ส่วนค้นหาและปุ่มแสดงล่าสุด */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="ค้นหาเลขทะเบียน/เบื้องต้นจะแสดง250ทะเบียนล่าสุดในระบบ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              onClick={searchPlate}
              disabled={loading}
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
            <button 
              className="btn btn-success" 
              onClick={loadLatestPlates}
              disabled={loading}
            >
              {loading ? 'กำลังโหลด...' : 'แสดง 250 รายการล่าสุด'}
            </button>
          </div>
        </div>
      </div>

      {/* แสดงข้อความ loading หรือ error */}
      {loading && <div className="text-center my-3"><div className="spinner-border text-primary"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ตารางแสดงทะเบียน */}
      {!loading && !error && displayPlates.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ลำดับ</th>
                  <th>เลขทะเบียน</th>
                  <th>วันที่บันทึก</th>
                </tr>
              </thead>
              <tbody>
                {displayPlates.map((plate, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{getPlateNumber(plate)}</td>
                    <td>{plate.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ส่วนแสดงการแบ่งหน้า */}
          <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
            <div>
              <span className="me-2">หน้า {currentPage} จาก {totalPages}</span>
              <span>แสดงรายการ {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, allPlates.length)} จากทั้งหมด {allPlates.length} รายการ</span>
            </div>
            <div>
              <button 
                className="btn btn-outline-primary me-2" 
                onClick={goToPrevPage} 
                disabled={currentPage === 1}
              >
                &larr; ก่อนหน้า
              </button>
              <button 
                className="btn btn-outline-primary" 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
              >
                ถัดไป &rarr;
              </button>
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