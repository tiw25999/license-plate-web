import { useCallback, useEffect, useState } from 'react';
import { plateService }               from '../services/api';
import { formatDate }                 from '../utils/dateUtils';

/**
 * Custom hook สำหรับจัดการข้อมูลทะเบียนรถและการค้นหา
 */
export const usePlates = () => {
  // ─── State ────────────────────────────────────────────────────────────
  const [allPlates,        setAllPlates]        = useState([]);
  const [displayPlates,    setDisplayPlates]    = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);
  const [apiStatus,        setApiStatus]        = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState({});

  // search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [searchMode, setSearchMode] = useState('quick');

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [itemsPerPage,setItemsPerPage]= useState(50);
  const [totalRecords,setTotalRecords]= useState(0);

  // ─── Helpers ──────────────────────────────────────────────────────────
  const updateDisplayPlates = useCallback((plates, page) => {
    const start = (page - 1) * itemsPerPage;
    const end   = start + itemsPerPage;
    setDisplayPlates(plates.slice(start, end));
  }, [itemsPerPage]);

  const getPlateNumber = useCallback(p => {
    if (!p) return '-';
    return p.plate || p.plate_number || JSON.stringify(p);
  }, []);

  // ─── โหลดรายการล่าสุด ─────────────────────────────────────────────────
  const loadLatestPlates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // รีเซ็ต search state
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setLastSearchParams({});

      // ดึง 300 เรคคอร์ดแรกจาก server
      const data = await plateService.getLatestPlates(300);
      const arr  = Array.isArray(data) ? data : [data];

      setAllPlates(arr);
      setTotalRecords(arr.length);

      const pages = Math.ceil(arr.length / itemsPerPage);
      setTotalPages(pages || 1);
      setCurrentPage(1);

      updateDisplayPlates(arr, 1);
      return arr;
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลทะเบียนได้: ' + (err.message || err));
      setAllPlates([]);
      setDisplayPlates([]);
      setTotalRecords(0);
      setTotalPages(1);
      return [];
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, updateDisplayPlates]);

  // ─── ค้นหาด้วยพารามิเตอร์ ────────────────────────────────────────────
  const searchPlatesWithParams = useCallback(async params => {
    const p = { ...params, limit: 300 };
    if (!Object.values(p).some(v => v)) {
      return loadLatestPlates();
    }

    try {
      setLoading(true);
      setError(null);
      setLastSearchParams(p);

      const data = await plateService.searchPlates(p);
      const arr  = Array.isArray(data) ? data : [data];

      setAllPlates(arr);
      setTotalRecords(arr.length);

      const pages = Math.ceil(arr.length / itemsPerPage);
      setTotalPages(Math.max(1, pages));
      setCurrentPage(1);

      updateDisplayPlates(arr, 1);
      return arr;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการค้นหา');
      setAllPlates([]);
      setDisplayPlates([]);
      setTotalRecords(0);
      setTotalPages(1);
      setCurrentPage(1);
      return [];
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, updateDisplayPlates, loadLatestPlates]);

  // ─── ค้นหาในช่วง N วันที่ผ่านมา ───────────────────────────────────────
  const searchLastNDays = useCallback(async days => {
    const today = new Date();
    const past  = new Date();
    past.setDate(today.getDate() - (days - 1));

    setStartDate(formatDate(past));
    setEndDate(formatDate(today));
    setSearchMode('advanced');

    return searchPlatesWithParams({
      start_date: formatDate(past),
      end_date:   formatDate(today)
    });
  }, [searchPlatesWithParams]);

  // ─── เพิ่ม / ลบ / ตรวจสถานะ API ────────────────────────────────────────
  const addPlate = useCallback(async (pn, prov, camId, camName) => {
    try {
      setLoading(true);
      setError(null);
      await plateService.addPlate(pn, prov, camId, camName);
      await loadLatestPlates();
      return true;
    } catch (err) {
      setError(err.message || 'ไม่สามารถเพิ่มทะเบียนได้');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadLatestPlates]);

  const deletePlate = useCallback(async id => {
    try {
      setLoading(true);
      setError(null);
      await plateService.deletePlate(id);
      await loadLatestPlates();
      return true;
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบทะเบียนได้');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadLatestPlates]);

  // ─── ตรวจสุขภาพ API ─────────────────────────────────────────────────
  const checkApiStatus = useCallback(async () => {
    try {
      const st = await plateService.checkHealth();
      setApiStatus(st.status === 'ok' ? 'online' : 'issue');
    } catch {
      setApiStatus('offline');
    }
  }, []);

  useEffect(() => { checkApiStatus(); }, [checkApiStatus]);

  return {
    allPlates,
    displayPlates,
    loading,
    error,
    apiStatus,
    lastSearchParams,
    searchTerm,
    startDate,
    endDate,
    searchMode,
    currentPage,
    totalPages,
    itemsPerPage,
    totalRecords,
    setSearchTerm,
    setStartDate,
    setEndDate,
    setSearchMode,
    setItemsPerPage,
    updateDisplayPlates,
    loadLatestPlates,
    searchPlatesWithParams,
    searchLastNDays,
    getPlateNumber,
    addPlate,
    deletePlate
  };
};

export default usePlates;
