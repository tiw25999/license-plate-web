import React, { useCallback, useState } from 'react';
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
    searchPlatesWithParams(params);
  }, [searchPlatesWithParams]);

  // ฟังก์ชันสำหรับรีเซ็ตการค้นหา
  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
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
        lastSearchParams={lastSearchParams}
        loading={loading}
        onSearch={handleAdvancedSearch}
        onReset={handleResetSearch}
        onLoadLatestPlates={loadLatestPlates}
        onSearchLastNDays={searchLastNDays}
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