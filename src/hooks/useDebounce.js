import { useCallback, useRef } from 'react';

/**
 * Custom hook สำหรับ Debounce ฟังก์ชัน
 * ใช้สำหรับป้องกันการเรียกฟังก์ชันบ่อยเกินไป เช่น ระหว่างการพิมพ์ค้นหา
 * @param {Function} func ฟังก์ชันที่ต้องการทำ debounce
 * @param {number} delay ระยะเวลาที่ต้องรอก่อนเรียกฟังก์ชัน (ms)
 */
export const useDebounce = (func, delay = 500) => {
  const timerRef = useRef(null);

  const debouncedFunction = useCallback((...args) => {
    // ยกเลิก timer เดิม (ถ้ามี)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // ตั้ง timer ใหม่
    timerRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);

  return debouncedFunction;
};