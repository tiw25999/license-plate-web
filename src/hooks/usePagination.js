import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook สำหรับจัดการการแบ่งหน้าข้อมูล
 * @param {Array} items รายการข้อมูลทั้งหมด
 * @param {number} initialItemsPerPage จำนวนรายการต่อหน้าเริ่มต้น
 */
export const usePagination = (items = [], initialItemsPerPage = 50) => {
  // State สำหรับการแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [displayItems, setDisplayItems] = useState([]);

  // คำนวณค่าต่างๆ
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // อัพเดตข้อมูลที่แสดงตามหน้าปัจจุบัน
  const updateDisplayItems = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayItems(items.slice(startIndex, endIndex));
  }, [currentPage, itemsPerPage, items]);

  // ไปหน้าถัดไป
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      // เลื่อนขึ้นไปด้านบนของตาราง
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  // ไปหน้าก่อนหน้า
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      
      // เลื่อนขึ้นไปด้านบนของตาราง
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  // ไปยังหน้าที่ระบุ
  const goToPage = useCallback((page) => {
    const pageNum = parseInt(page);
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      
      // เลื่อนขึ้นไปด้านบนของตาราง
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [totalPages]);

  // ปรับจำนวนรายการต่อหน้า
  const changeItemsPerPage = useCallback((newItemsPerPage) => {
    const itemsPerPageNum = parseInt(newItemsPerPage);
    if (!isNaN(itemsPerPageNum) && itemsPerPageNum > 0) {
      setItemsPerPage(itemsPerPageNum);
      
      // ปรับหน้าปัจจุบันถ้าเกินหน้าสุดท้าย
      const newTotalPages = Math.ceil(totalItems / itemsPerPageNum);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    }
  }, [currentPage, totalItems]);

  // อัพเดตข้อมูลที่แสดงเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    updateDisplayItems();
  }, [updateDisplayItems]);

  // เริ่มต้นที่หน้าแรกเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    displayItems,
    totalItems,
    changeItemsPerPage,
    goToNextPage,
    goToPrevPage,
    goToPage
  };
};