import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Component ค้นหาขั้นสูงแบบรวมในฟอร์มเดียว
 */
const AdvancedSearch = ({ 
  initialSearchTerm,
  initialStartDate,
  initialEndDate,
  initialStartHour,
  initialEndHour,
  initialProvince,
  initialIdCamera,
  initialCameraName,
  provinces = [],
  cameras = [],
  loadingOptions = false,
  onSearch,
  onReset,
  loading
}) => {
  // State สำหรับการค้นหา
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  // State สำหรับช่วงวันที่
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  // State สำหรับช่วงเวลา
  const [startHour, setStartHour] = useState(initialStartHour || '');
  const [endHour, setEndHour] = useState(initialEndHour || '');
  // State สำหรับจังหวัดและกล้อง
  const [province, setProvince] = useState(initialProvince || '');
  const [idCamera, setIdCamera] = useState(initialIdCamera || '');
  const [cameraName, setCameraName] = useState(initialCameraName || '');
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
    
    // พารามิเตอร์ช่วงเวลา (ถ้ามีการระบุ)
    if (startHour && endHour) {
      // ตรวจสอบความถูกต้องของช่วงเวลา
      const startHourNum = parseInt(startHour);
      const endHourNum = parseInt(endHour);
      
      if (isNaN(startHourNum) || isNaN(endHourNum) || startHourNum < 0 || startHourNum > 23 || endHourNum < 0 || endHourNum > 23) {
        setError('ช่วงเวลาต้องเป็นตัวเลข 0-23');
        return;
      }
      
      if (startHourNum > endHourNum) {
        setError('เวลาเริ่มต้นต้องน้อยกว่าหรือเท่ากับเวลาสิ้นสุด');
        return;
      }
      
      searchParams.startHour = startHour;
      searchParams.endHour = endHour;
    } else if (startHour || endHour) {
      // ถ้ามีแค่อันใดอันหนึ่ง ให้แจ้งเตือน
      setError('กรุณาระบุทั้งเวลาเริ่มต้นและเวลาสิ้นสุด');
      return;
    }
    
    // พารามิเตอร์จังหวัดและกล้อง
    if (province) searchParams.province = province;
    if (idCamera) searchParams.id_camera = idCamera;
    if (cameraName) searchParams.camera_name = cameraName;
    
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
    setStartHour('');
    setEndHour('');
    setProvince('');
    setIdCamera('');
    setCameraName('');
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

      {/* ค้นหาตามจังหวัด */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <i className="bi bi-geo-alt me-2"></i> ค้นหาตามจังหวัด
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="province" className="form-label">จังหวัด</label>
              {loadingOptions ? (
                <div className="form-control text-center py-2">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                </div>
              ) : (
                <select
                  id="province"
                  className="form-select"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ค้นหาตามกล้อง */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <i className="bi bi-camera me-2"></i> ค้นหาตามกล้อง
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="idCamera" className="form-label">รหัสกล้อง</label>
              {loadingOptions ? (
                <div className="form-control text-center py-2">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status">
                    <span className="visually-hidden">กำลังโหลด...</span>
                  </div>
                </div>
              ) : (
                <select
                  id="idCamera"
                  className="form-select"
                  value={idCamera}
                  onChange={(e) => setIdCamera(e.target.value)}
                >
                  <option value="">-- เลือกรหัสกล้อง --</option>
                  {cameras.map((cam) => (
                    <option key={cam.id_camera} value={cam.id_camera}>{cam.id_camera}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="cameraName" className="form-label">ชื่อกล้อง</label>
              <input
                type="text"
                id="cameraName"
                className="form-control"
                placeholder="ป้อนชื่อกล้องที่ต้องการค้นหา..."
                value={cameraName}
                onChange={(e) => setCameraName(e.target.value)}
              />
            </div>
          </div>
        </div>
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
            รูปแบบ: วัน/เดือน/ปี (เช่น 10/01/2023 - 31/12/2023)
          </div>
        </div>
      </div>

      {/* ค้นหาตามช่วงเวลา */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <i className="bi bi-clock me-2"></i> ค้นหาตามช่วงเวลา (ชั่วโมง)
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="startHour" className="form-label">เวลาเริ่มต้น</label>
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
            <div className="col-md-6 mb-3">
              <label htmlFor="endHour" className="form-label">เวลาสิ้นสุด</label>
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
          <div className="form-text">
            กรอกชั่วโมงในรูปแบบ 24 ชั่วโมง (0-23) ถ้าไม่กรอกจะค้นหาทุกช่วงเวลา
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
  initialStartHour: PropTypes.string,
  initialEndHour: PropTypes.string,
  initialProvince: PropTypes.string,
  initialIdCamera: PropTypes.string,
  initialCameraName: PropTypes.string,
  provinces: PropTypes.array,
  cameras: PropTypes.array,
  loadingOptions: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default AdvancedSearch;