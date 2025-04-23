import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // เพิ่มการ import useAuth
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePlates } from '../../hooks/usePlates';
import ApiStatus from './ApiStatus';
import AuthStatus from './AuthStatus'; // เพิ่มการ import AuthStatus
import Pagination from './Pagination';
import './PlateManager.css';
import PlateTable from './PlateTable';
import SearchForm from './SearchForm';
import StatusDisplay from './StatusDisplay';

/**
 * Component หลักสำหรับการจัดการทะเบียนรถ
 */
const PlateManager = () => {
  // ใช้ custom hook สำหรับจัดการข้อมูลทะเบียนรถ
  const {
    allPlates,
    loading,
    error,
    apiStatus,
    lastSearchParams,
    loadLatestPlates,
    searchPlatesWithParams,
    searchLastNDays,
    getPlateNumber,
    addPlate,
    deletePlate
  } = usePlates();
  
  // ใช้ custom hook สำหรับจัดการ auth
  const { isAuthenticated, isAdmin } = useAuth();

  // State สำหรับการค้นหา
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [province, setProvince] = useState('');
  const [idCamera, setIdCamera] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [searchMode, setSearchMode] = useState('quick');
  
  // State สำหรับการเพิ่มทะเบียน
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newProvince, setNewProvince] = useState('');
  const [newIdCamera, setNewIdCamera] = useState('');
  const [newCameraName, setNewCameraName] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  
  // ใช้ custom hook สำหรับการแบ่งหน้า
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    displayItems: displayPlates,
    totalItems: totalRecords,
    changeItemsPerPage,
    goToNextPage,
    goToPrevPage,
    goToPage
  } = usePagination(allPlates, 50);

  // สร้าง debounce สำหรับการค้นหา
  const debouncedSearch = useDebounce(async (term) => {
    if (term.length >= 1) {
      await searchPlatesWithParams({ searchTerm: term });
    } else if (term === '') {
      // ถ้าลบคำค้นหาจนหมด ให้โหลดข้อมูลล่าสุด
      loadLatestPlates();
    }
  }, 500);

  // ฟังก์ชันสำหรับการเปลี่ยนแปลงคำค้นหา
  const handleSearchTermChange = useCallback((term) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  // ฟังก์ชันสำหรับการค้นหาขั้นสูง
  const handleAdvancedSearch = useCallback((params) => {
    // อัพเดต state ตาม params ที่ได้รับ
    if (params.searchTerm !== undefined) setSearchTerm(params.searchTerm);
    if (params.startDate !== undefined) setStartDate(params.startDate);
    if (params.endDate !== undefined) setEndDate(params.endDate);
    if (params.startMonth !== undefined) setStartMonth(params.startMonth);
    if (params.endMonth !== undefined) setEndMonth(params.endMonth);
    if (params.startYear !== undefined) setStartYear(params.startYear);
    if (params.endYear !== undefined) setEndYear(params.endYear);
    if (params.startHour !== undefined) setStartHour(params.startHour);
    if (params.endHour !== undefined) setEndHour(params.endHour);
    if (params.province !== undefined) setProvince(params.province);
    if (params.id_camera !== undefined) setIdCamera(params.id_camera);
    if (params.camera_name !== undefined) setCameraName(params.camera_name);
    
    // ทำการค้นหา
    searchPlatesWithParams(params);
  }, [searchPlatesWithParams]);

  // ฟังก์ชันสำหรับรีเซ็ตการค้นหา
  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStartMonth('');
    setEndMonth('');
    setStartYear('');
    setEndYear('');
    setStartHour('');
    setEndHour('');
    setProvince('');
    setIdCamera('');
    setCameraName('');
    loadLatestPlates();
  }, [loadLatestPlates]);

  // ฟังก์ชันสำหรับการค้นหาตามช่วงเวลาล่าสุด
  const handleDateRangeSearch = useCallback((days) => {
    searchLastNDays(days);
  }, [searchLastNDays]);

  // ฟังก์ชันสำหรับเปลี่ยนโหมดการค้นหา
  const handleSearchModeChange = useCallback((mode) => {
    setSearchMode(mode);
  }, []);
  
  // ฟังก์ชันสำหรับเพิ่มทะเบียนใหม่
  const handleAddPlate = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newPlate) {
      return;
    }
    
    try {
      await addPlate(newPlate, newProvince, newIdCamera, newCameraName);
      
      // Reset form
      setNewPlate('');
      setNewProvince('');
      setNewIdCamera('');
      setNewCameraName('');
      setShowAddForm(false);
      
      // Set success message
      setAddSuccess('เพิ่มทะเบียนสำเร็จ');
      setTimeout(() => setAddSuccess(''), 3000);
      
      // Refresh data
      loadLatestPlates();
    } catch (error) {
      console.error('Error adding plate:', error);
    }
  }, [newPlate, newProvince, newIdCamera, newCameraName, addPlate, loadLatestPlates]);
  
  // ฟังก์ชันสำหรับลบทะเบียน
  const handleDeletePlate = useCallback(async (plateId) => {
    if (window.confirm('คุณต้องการลบทะเบียนนี้ใช่หรือไม่?')) {
      try {
        await deletePlate(plateId);
        
        // Refresh data
        loadLatestPlates();
      } catch (error) {
        console.error('Error deleting plate:', error);
      }
    }
  }, [deletePlate, loadLatestPlates]);

  // เรียกข้อมูลเมื่อโหลดหน้าแรก
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates]);

  return (
    <div className="container mt-4 plate-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">ระบบจัดการทะเบียนรถ</h2>
        
        {/* แสดงสถานะการเข้าสู่ระบบ */}
        <AuthStatus />
      </div>
      
      {/* แสดงสถานะการเชื่อมต่อ API */}
      <ApiStatus status={apiStatus} />
      
      {/* ส่วนการค้นหา */}
      <SearchForm 
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        startDate={startDate}
        endDate={endDate}
        startMonth={startMonth}
        endMonth={endMonth}
        startYear={startYear}
        endYear={endYear}
        startHour={startHour}
        endHour={endHour}
        province={province}
        idCamera={idCamera}
        cameraName={cameraName}
        searchMode={searchMode}
        lastSearchParams={lastSearchParams}
        loading={loading}
        onSearch={handleAdvancedSearch}
        onReset={handleResetSearch}
        onLoadLatestPlates={loadLatestPlates}
        onSearchLastNDays={handleDateRangeSearch}
        onSearchModeChange={handleSearchModeChange}
      />

      {/* แสดงสถานะการโหลดและข้อผิดพลาด */}
      <StatusDisplay loading={loading} error={error} />
      
      {/* ปุ่มเพิ่มทะเบียนใหม่ (สำหรับผู้ใช้ที่ login แล้วเท่านั้น) */}
      {isAuthenticated && (
        <div className="mb-4">
          <button 
            className="btn btn-success"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'ยกเลิก' : '+ เพิ่มทะเบียนใหม่'}
          </button>
          
          {showAddForm && (
            <div className="card mt-3">
              <div className="card-header bg-success text-white">
                เพิ่มทะเบียนใหม่
              </div>
              <div className="card-body">
                <form onSubmit={handleAddPlate}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="newPlate" className="form-label">เลขทะเบียน *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="newPlate"
                        value={newPlate}
                        onChange={(e) => setNewPlate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="newProvince" className="form-label">จังหวัด</label>
                      <input
                        type="text"
                        className="form-control"
                        id="newProvince"
                        value={newProvince}
                        onChange={(e) => setNewProvince(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="newIdCamera" className="form-label">รหัสกล้อง</label>
                      <input
                        type="text"
                        className="form-control"
                        id="newIdCamera"
                        value={newIdCamera}
                        onChange={(e) => setNewIdCamera(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="newCameraName" className="form-label">ชื่อกล้อง</label>
                      <input
                        type="text"
                        className="form-control"
                        id="newCameraName"
                        value={newCameraName}
                        onChange={(e) => setNewCameraName(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">บันทึก</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {addSuccess && (
            <div className="alert alert-success mt-2">{addSuccess}</div>
          )}
        </div>
      )}

      {/* ตารางแสดงทะเบียน */}
      {!loading && !error && displayPlates.length > 0 && (
        <>
          <PlateTable 
            plates={displayPlates}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            getPlateNumber={getPlateNumber}
            totalRecords={totalRecords}
            onItemsPerPageChange={changeItemsPerPage}
            canDelete={isAdmin()} // เพิ่ม prop นี้
            onDelete={handleDeletePlate} // เพิ่ม prop นี้
          />

          {/* ส่วนแสดงการแบ่งหน้า */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            itemsPerPage={itemsPerPage}
            goToNextPage={goToNextPage}
            goToPrevPage={goToPrevPage}
            goToPage={goToPage}
          />
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