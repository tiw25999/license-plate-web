import { useCallback, useEffect, useState } from 'react';
import { plateService } from '../services/api';
import { formatDate } from '../utils/dateUtils';

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

  // ฟังก์ชันสำหรับเรียงลำดับข้อมูล
  const sortPlatesByDate = useCallback((plates) => {
    return [...plates].sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
  
      // แยกวันที่และเวลา
      const [dateA, timeA] = a.timestamp.split(' ');
      const [dateB, timeB] = b.timestamp.split(' ');
  
      // แยกวัน เดือน ปี
      const [dayA, monthA, yearA] = dateA.split('/').map(Number);
      const [dayB, monthB, yearB] = dateB.split('/').map(Number);
  
      // เรียงตามปีก่อน (จากมากไปน้อย)
      if (yearA !== yearB) return yearB - yearA;
  
      // ถ้าปีเท่ากัน เรียงตามเดือนจากน้อยไปมาก
      if (monthA !== monthB) return monthA - monthB;
  
      // ถ้าเดือนเท่ากัน เรียงตามวันจากน้อยไปมาก
      if (dayA !== dayB) return dayA - dayB;
  
      // ถ้าวันเดือนปีเท่ากัน เรียงตามเวลา
      return timeA.localeCompare(timeB);
    });
  }, []);

  // โหลดรายการทะเบียนล่าสุด
  const loadLatestPlates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLastSearchParams({});
      
      const data = await plateService.getLatestPlates(300);
      const platesArray = Array.isArray(data) ? data : [data];
      const sortedPlates = sortPlatesByDate(platesArray);
      
      setAllPlates(sortedPlates);
      return sortedPlates;
    } catch (err) {
      const errorMsg = 'ไม่สามารถโหลดข้อมูลทะเบียนได้: ' + (err.message || err);
      setError(errorMsg);
      setAllPlates([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [sortPlatesByDate]);

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
      const sortedResults = sortPlatesByDate(searchResults);
      
      setAllPlates(sortedResults);
      return sortedResults;
    } catch (err) {
      const errorMsg = err.message || 'เกิดข้อผิดพลาดในการค้นหา';
      setError(errorMsg);
      setAllPlates([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadLatestPlates, sortPlatesByDate]);

  // ค้นหาทะเบียนตามช่วงเวลา
  const searchLastNDays = useCallback((days) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - (days - 1)); // -1 เพื่อให้นับรวมวันนี้ด้วย
    
    const endDateStr = formatDate(today);
    const startDateStr = formatDate(pastDate);
    
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

  // ฟังก์ชันสำหรับแสดงเลขทะเบียน
  const getPlateNumber = useCallback((plateObj) => {
    if (!plateObj) return '-';
    if (plateObj.plate) return plateObj.plate;
    if (plateObj.plate_number) return plateObj.plate_number;
    return JSON.stringify(plateObj);
  }, []);

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