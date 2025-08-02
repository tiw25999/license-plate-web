import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useContext
} from 'react';
// เส้นทาง import เดียวกันกับโครงสร้างไฟล์ของคุณ
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
  const isAdmin = user?.role === 'admin';

  // ─── ดึงข้อมูลจาก usePlates ────────────────────────────────────────
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
    deletePlate            // ← เพิ่มฟังก์ชันลบตรงนี้
  } = usePlates();

  // ─── state สำหรับ Quick + Advanced Search ──────────────────────────
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

  // ─── advanced search ────────────────────────────────────────────────
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

  // ─── filter by N days ──────────────────────────────────────────────
  const handleDateRangeSearch = useCallback(days => {
    searchLastNDays(days);
  }, [searchLastNDays]);

  // ─── เลือกโหมด quick/advanced ─────────────────────────────────────
  const handleSearchModeChange = useCallback(mode => {
    setSearchMode(mode);
  }, []);

  // ─── รีเซ็ตทุกอย่าง ────────────────────────────────────────────────
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

  // ─── โหลดข้อมูลตอน mount & เมื่อ bumpRefresh เปลี่ยน ───────────────
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates, refreshCount]);

  // ─── pagination ────────────────────────────────────────────────────
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

  // ─── แปลง timestamp → dateStr/timeStr ไทย ─────────────────────────
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

  // ─── ลบป้าย (เรียก API) ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('คุณแน่ใจจะลบรายการนี้หรือไม่?')) return;
    try {
      await deletePlate(id);
      loadLatestPlates();
    } catch (err) {
      console.error(err);
      alert('ลบรายการไม่สำเร็จ');
    }
  };

  return (
    <div className="container mt-4 plate-manager">
      <ApiStatus status={apiStatus} />

      <SearchForm
        searchMode={searchMode}
        searchTerm={searchTerm}
        startDate={startDate}
        endDate={endDate}
        startHour={startHour}
        endHour={endHour}
        province={province}
        idCamera={idCamera}
        cameraName={cameraName}
        lastSearchParams={lastSearchParams}
        loading={loading}
        onSearchTermChange={handleSearchTermChange}
        onSearch={handleAdvancedSearch}
        onSearchLastNDays={handleDateRangeSearch}
        onSearchModeChange={handleSearchModeChange}
        onReset={handleResetSearch}
        onLoadLatestPlates={loadLatestPlates}
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
            onItemsPerPageChange={changeItemsPerPage}
            canDelete={isAdmin}       // เฉพาะ admin เท่านั้น
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            itemsPerPage={itemsPerPage}
            goToPrevPage={goToPrevPage}
            goToNextPage={goToNextPage}
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
