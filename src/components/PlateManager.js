import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { plateService } from '../services/api';

const PlateManager = () => {
  const [plates, setPlates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลดรายการทะเบียนล่าสุด
  const loadLatestPlates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plateService.getLatestPlates();
      console.log('Latest plates data:', data); // เพิ่มการแสดงข้อมูลที่ได้รับ
      setPlates(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลทะเบียนได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('Search result data:', data); // เพิ่มการแสดงข้อมูลที่ได้รับ
      
      // ตรวจสอบโครงสร้างข้อมูลและแปลงให้อยู่ในรูปแบบที่ถูกต้อง
      if (data) {
        if (Array.isArray(data)) {
          setPlates(data);
        } else if (data.plate_number) {
          // กรณีที่ API ส่งกลับข้อมูลในรูปแบบ { plate_number: '...', timestamp: '...' }
          setPlates([{ plate: data.plate_number, timestamp: data.timestamp }]);
        } else {
          // กรณีทั่วไป
          setPlates([data]);
        }
      } else {
        setPlates([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('ไม่พบทะเบียนที่ค้นหา');
        setPlates([]);
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
  }, []);

  // ดูข้อมูลที่ได้จากการ setState
  useEffect(() => {
    console.log('Current plates state:', plates);
  }, [plates]);

  // ฟังก์ชันสำหรับแสดงเลขทะเบียน (ตรวจสอบทั้งรูปแบบ plate และ plate_number)
  const getPlateNumber = (plateObj) => {
    if (!plateObj) return '-';
    if (plateObj.plate) return plateObj.plate;
    if (plateObj.plate_number) return plateObj.plate_number;
    
    // กรณีที่เป็นออบเจกต์แต่ไม่มีทั้ง plate และ plate_number
    return JSON.stringify(plateObj);
  };

  // แสดงผล
  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">ระบบจัดการทะเบียนรถ</h2>

      {/* ส่วนค้นหาและปุ่มแสดงล่าสุด */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="ค้นหาเลขทะเบียน"
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
          </div>
        </div>
        <div className="col-md-4">
          <button 
            className="btn btn-success w-100"
            onClick={loadLatestPlates}
            disabled={loading}
          >
            {loading ? 'กำลังโหลด...' : 'แสดง 50 รายการล่าสุด'}
          </button>
        </div>
      </div>

      {/* แสดงข้อความ loading หรือ error */}
      {loading && <div className="text-center my-3"><div className="spinner-border text-primary"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ตารางแสดงทะเบียน */}
      {!loading && !error && plates.length > 0 && (
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
              {plates.map((plate, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{getPlateNumber(plate)}</td>
                  <td>{plate.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* แสดงข้อความเมื่อไม่พบข้อมูล */}
      {!loading && !error && plates.length === 0 && (
        <div className="alert alert-info">ไม่พบข้อมูลทะเบียน</div>
      )}
    </div>
  );
};

export default PlateManager;