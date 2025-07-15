import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Component ค้นหาขั้นสูงแบบรวมในฟอร์มเดียว
 */
// ... import เหมือนเดิม ...

const AdvancedSearch = ({ 
  initialSearchTerm,
  initialStartDate,
  initialEndDate,
  initialStartHour,
  initialEndHour,
  initialProvince,
  initialCameraName,
  provinces = [],
  loadingOptions = false,
  onSearch,
  onReset,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [startHour, setStartHour] = useState(initialStartHour || '');
  const [endHour, setEndHour] = useState(initialEndHour || '');
  const [province, setProvince] = useState(initialProvince || '');
  const [cameraName, setCameraName] = useState(initialCameraName || '');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    let searchParams = {};
    if (searchTerm.trim()) searchParams.searchTerm = searchTerm.trim();
    if (startDate && endDate) {
      searchParams.startDate = startDate;
      searchParams.endDate = endDate;
    } else if (startDate || endDate) {
      setError('กรุณาระบุทั้งวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }

    if (startHour && endHour) {
      const start = parseInt(startHour);
      const end = parseInt(endHour);
      if (isNaN(start) || isNaN(end) || start < 0 || start > 23 || end < 0 || end > 23) {
        setError('ช่วงเวลาต้องเป็นตัวเลข 0-23');
        return;
      }
      if (start > end) {
        setError('เวลาเริ่มต้นต้องน้อยกว่าหรือเท่ากับเวลาสิ้นสุด');
        return;
      }
      searchParams.startHour = startHour;
      searchParams.endHour = endHour;
    } else if (startHour || endHour) {
      setError('กรุณาระบุทั้งเวลาเริ่มต้นและเวลาสิ้นสุด');
      return;
    }

    if (province) searchParams.province = province;
    if (cameraName) searchParams.camera_name = cameraName;

    if (Object.keys(searchParams).length === 0) {
      setError('กรุณาระบุเงื่อนไขการค้นหาอย่างน้อย 1 รายการ');
      return;
    }

    setError(null);
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStartHour('');
    setEndHour('');
    setProvince('');
    setCameraName('');
    setError(null);
    onReset();
  };

  return (
    <div className="advanced-search-container">
      {/* ค้นหาเลขทะเบียน */}
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

      {/* จังหวัด */}
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

      {/* ชื่อกล้อง */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <i className="bi bi-camera me-2"></i> ค้นหาตามตำแหน่งกล้อง
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="cameraName" className="form-label">ตำแหน่งกล้อง</label>
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

      {/* วันที่ */}
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
        </div>
      </div>

      {/* เวลา */}
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
        </div>
      </div>

      {/* error + ปุ่มค้นหา */}
      {error && <div className="alert alert-danger">{error}</div>}

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
  initialCameraName: PropTypes.string,
  provinces: PropTypes.array,
  loadingOptions: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

export default AdvancedSearch;
