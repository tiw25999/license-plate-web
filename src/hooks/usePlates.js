import { useCallback, useEffect, useState } from 'react';
import { plateService } from '../services/api';

/**
 * Custom hook สำหรับจัดการข้อมูลทะเบียนรถและการค้นหา
 */
export const usePlates = () => {
  // State
  const [allPlates, setAllPlates] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState({});

  // ฟังก์ชันสำหรับแสดงเลขทะเบียน
  const getPlateNumber = useCallback((plateObj) => {
    if (!plateObj) return '-';
    if (plateObj.plate) return plateObj.plate;
    if (plateObj.plate_number) return plateObj.plate_number;
    return JSON.stringify(plateObj);
  }, []);

  // ฟังก์ชันสำหรับโหลดรายการทะเบียนล่าสุด
  const loadLatestPlates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // รีเซ็ตค่าการค้นหา
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setStartMonth('');
      setEndMonth('');
      setStartYear('');
      setEndYear('');
      setLastSearchParams({});
      
      const data = await plateService.getLatestPlates(300);
      
      const platesArray = Array.isArray(data) ? data : [data];
      
      // ไม่ต้องเรียงลำดับเพราะ backend ส่งมาเรียงแล้ว
      setAllPlates(platesArray);
      setTotalRecords(platesArray.length);
      
      // คำนวณจำนวนหน้าทั้งหมด
      const pages = Math.ceil(platesArray.length / itemsPerPage);
      setTotalPages(pages || 1);
      
      // เซ็ตข้อมูลสำหรับหน้าแรก
      setCurrentPage(1);
      updateDisplayPlates(platesArray, 1);
      
      return platesArray;
    } catch (err) {
      const errorMsg = 'ไม่สามารถโหลดข้อมูลทะเบียนได้: ' + (err.message || err);
      setError(errorMsg);
      setAllPlates([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, updateDisplayPlates]);

  // ค้นหาทะเบียนด้วยพารามิเตอร์
  const searchPlatesWithParams = useCallback(async (params = {}) => {
    // สร้าง search params ตามโหมดการค้นหา
    let searchParams = { ...params, limit: 300 };
    
    // ถ้าไม่มีค่าการค้นหาเลย ให้โหลดข้อมูลล่าสุด
    if (!Object.values(searchParams).some(value => value)) {
      return loadLatestPlates();
    }
    
    try {
      setLoading(true);
      setError(null);
      setLastSearchParams(searchParams);
      
      const data = await plateService.searchPlates(searchParams);
      
      const searchResults = Array.isArray(data) ? data : [data];
      
      // ไม่ต้องเรียงลำดับเพราะ backend ส่งมาเรียงแล้ว
      setAllPlates(searchResults);
      setTotalRecords(searchResults.length);
      
      // คำนวณจำนวนหน้าทั้งหมด
      const pages = Math.ceil(searchResults.length / itemsPerPage);
      setTotalPages(Math.max(1, pages));
      
      // เซ็ตข้อมูลสำหรับหน้าแรก
      setCurrentPage(1);
      updateDisplayPlates(searchResults, 1);
      
      return searchResults;
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

  // ค้นหาทะเบียนตามช่วงเวลา
  const searchLastNDays = useCallback((days) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - (days - 1)); // -1 เพื่อให้นับรวมวันนี้ด้วย
    
    const endDateStr = formatDate(today);
    const startDateStr = formatDate(pastDate);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    setSearchMode('advanced');
    
    // เรียกค้นหาอัตโนมัติ
    return searchPlatesWithParams({
      startDate: startDateStr,
      endDate: endDateStr
    });
  }, [searchPlatesWithParams]);

  // ตรวจสอบสถานะ API
  const checkApiStatus = useCallback(async () => {
    try {
      const status = await plateService.checkHealth();
      setApiStatus(status.status === 'ok' ? 'online' : 'issue');
    } catch (error) {
      setApiStatus('offline');
    }
  }, []);

  // ตรวจสอบสถานะ API เมื่อโหลดครั้งแรก
  useEffect(() => {
    checkApiStatus();
  }, [checkApiStatus]);

  // เรียกข้อมูลเมื่อโหลดหน้าแรก
  useEffect(() => {
    loadLatestPlates();
  }, [loadLatestPlates]);

  return {
    allPlates,
    loading,
    error,
    apiStatus,
    lastSearchParams,
    loadLatestPlates,
    searchPlatesWithParams,
    searchLastNDays,
    getPlateNumber
  };
};