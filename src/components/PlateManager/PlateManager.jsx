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

const PlateManager = () => {
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
    deletePlate
  } = usePlates();

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

  const debouncedSearch = useDebounce(async (term) => {
    if (term.length >= 1) {
      await searchPlatesWithParams({ searchTerm: term });
    } else if (term === '') {
      loadLatestPlates();
    }
  }, 500);

  const handleSearchTermChange = useCallback((term) => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  const handleAdvancedSearch = useCallback((params) => {
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
    searchPlatesWithParams(params);
  }, [searchPlatesWithParams]);

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

  const handleDateRangeSearch = useCallback((days) => {
    searchLastNDays(days);
  }, [searchLastNDays]);

  const handleSearchModeChange = useCallback((mode) => {
    setSearchMode(mode);
  }, []);

  const handleDeletePlate = useCallback(async (plateId) => {
    if (window.confirm('คุณต้องการลบทะเบียนนี้ใช่หรือไม่?')) {
      try {
        await deletePlate(plateId);
        loadLatestPlates();
      } catch (error) {
        console.error('Error deleting plate:', error);
      }
    }
  }, [deletePlate, loadLatestPlates]);

  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates]);

  return (
    <div className="container mt-4 plate-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">ระบบจัดการทะเบียนรถ</h2>
      </div>

      <ApiStatus status={apiStatus} />

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

      <StatusDisplay loading={loading} error={error} />

      {!loading && !error && displayPlates.length > 0 && (
        <>
          <PlateTable
            plates={displayPlates}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            getPlateNumber={getPlateNumber}
            totalRecords={totalRecords}
            onItemsPerPageChange={changeItemsPerPage}
            onDelete={handleDeletePlate}
          />

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

      {!loading && !error && displayPlates.length === 0 && (
        <div className="alert alert-info">ไม่พบข้อมูลทะเบียน</div>
      )}
    </div>
  );
};

export default PlateManager;
