import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePlates } from '../../hooks/usePlates';
import ApiStatus from './ApiStatus';
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
    getPlateNumber
  } = usePlates();

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
  const [searchMode, setSearchMode] = useState('quick');
  
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

  // เรียกข้อมูลเมื่อโหลดหน้าแรก
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates]);

  return (
    <div className="container mt-4 plate-manager">
      <h2 className="mb-4 text-center">ระบบจัดการทะเบียนรถ</h2>
      
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