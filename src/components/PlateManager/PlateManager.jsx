// src/components/PlateManager/PlateManager.jsx

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useContext
} from 'react';
import { useDebounce }    from '../../hooks/useDebounce';
import { usePagination }  from '../../hooks/usePagination';
import { usePlates }      from '../../hooks/usePlates';
import { useAuth }        from '../../contexts/AuthContext';
import { RefreshContext } from '../../contexts/RefreshContext';

import ApiStatus     from './ApiStatus';
import SearchForm    from './SearchForm';
import StatusDisplay from './StatusDisplay';
import PlateTable    from './PlateTable';
import Pagination    from './Pagination';
import './PlateManager.css';

export default function PlateManager() {
  const { refreshCount } = useContext(RefreshContext);
  const { user }         = useAuth();

  // ─── ดึงข้อมูลหลักจาก usePlates ───────────────────────────────────
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
    // deletePlate ยังเรียกได้ แต่จะไม่ส่งเข้า PlateTable
  } = usePlates();

  // ─── search/filter state ────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [startHour,  setStartHour]  = useState('');
  const [endHour,    setEndHour]    = useState('');
  const [province,   setProvince]   = useState('');
  const [idCamera,   setIdCamera]   = useState('');
  const [cameraName, setCameraName] = useState('');
  const [searchMode, setSearchMode] = useState('quick');

  // ─── debounced quick search ─────────────────────────────────────────
  const debouncedSearch = useDebounce(async term => {
    if (term.length >= 1) {
      await searchPlatesWithParams({ search_term: term });
    } else {
      loadLatestPlates();
    }
  }, 500);

  const handleSearchTermChange = useCallback(term => {
    setSearchTerm(term);
    debouncedSearch(term);
  }, [debouncedSearch]);

  const handleAdvancedSearch = useCallback(params => {
    setSearchTerm(params.search_term || '');
    setStartDate(params.start_date || '');
    setEndDate(params.end_date || '');
    setStartHour(params.start_hour || '');
    setEndHour(params.end_hour || '');
    setProvince(params.province || '');
    setIdCamera(params.id_camera || '');
    setCameraName(params.camera_name || '');
    searchPlatesWithParams(params);
  }, [searchPlatesWithParams]);

  const handleDateRangeSearch = useCallback(days => {
    searchLastNDays(days);
  }, [searchLastNDays]);

  const handleSearchModeChange = useCallback(mode => {
    setSearchMode(mode);
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStartHour('');
    setEndHour('');
    setProvince('');
    setIdCamera('');
    setCameraName('');
    loadLatestPlates();
  }, [loadLatestPlates]);

  // ─── load on mount & whenever bumpRefresh() is called ───────────────
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates, refreshCount]);

  // ─── pagination บน allPlates ──────────────────────────────────────
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    displayItems,
    totalItems: totalRecords,
    changeItemsPerPage,
    goToNextPage,
    goToPrevPage,
    goToPage
  } = usePagination(allPlates, 50);

  // ─── format timestamp → Thai date/time ─────────────────────────────
  const formattedPlates = useMemo(() => {
    return displayItems.map(p => {
      const dt = p.timestamp ? new Date(p.timestamp) : null;
      const dateStr = dt
        ? dt.toLocaleDateString('th-TH-u-ca-gregory', {
            day:   '2-digit',
            month: '2-digit',
            year:  'numeric',
          })
        : '-';
      const timeStr = dt
        ? dt.toLocaleTimeString('th-TH', {
            hour:   '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : '-';
      return { ...p, dateStr, timeStr };
    });
  }, [displayItems]);

  return (
    <div className="container mt-4 plate-manager">
      <ApiStatus status={apiStatus} />

      <SearchForm
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        startDate={startDate}
        endDate={endDate}
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

      {!loading && !error && formattedPlates.length > 0 && (
        <>
          <PlateTable
            plates={formattedPlates}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalRecords={totalRecords}
            getPlateNumber={getPlateNumber}
            canDelete={false}               // ปิดปุ่มลบชั่วคราว
            onItemsPerPageChange={changeItemsPerPage}
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

      {!loading && !error && formattedPlates.length === 0 && (
        <div className="alert alert-info">ไม่พบข้อมูลทะเบียน</div>
      )}
    </div>
  );
}
