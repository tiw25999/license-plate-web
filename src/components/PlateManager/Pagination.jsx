import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

/**
 * Component สำหรับแสดงการแบ่งหน้า
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  itemsPerPage,
  goToNextPage,
  goToPrevPage,
  goToPage
}) => {
  // สร้างปุ่มสำหรับการแบ่งหน้า
  const renderPaginationButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = 5; // จำนวนปุ่มสูงสุดที่แสดง
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // ปรับ startPage ถ้า endPage ถึงจำนวนหน้าสูงสุดแล้ว
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // ปุ่มหน้าแรก
    if (currentPage > 2) {
      buttons.push(
        <button 
          key="first" 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(1)}
        >
          1
        </button>
      );
      
      // แสดงจุดไข่ปลาถ้าหน้าแรกไม่ติดกับช่วงปุ่มที่แสดง
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }
    
    // ปุ่มหน้าในช่วง
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }
    
    // ปุ่มหน้าสุดท้าย
    if (currentPage < totalPages - 1) {
      // แสดงจุดไข่ปลาถ้าหน้าสุดท้ายไม่ติดกับช่วงปุ่มที่แสดง
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      
      buttons.push(
        <button 
          key="last" 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  }, [currentPage, totalPages, goToPage]);

  return (
    <div className="pagination-container mt-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center">
        <div className="pagination-info mb-2">
          <span>หน้า {currentPage} จาก {totalPages} | </span>
          <span>รายการ {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} จากทั้งหมด {totalRecords} รายการ</span>
        </div>
        <div className="pagination-controls mb-2">
          <button 
            className="btn btn-sm btn-outline-primary me-1" 
            onClick={goToPrevPage} 
            disabled={currentPage === 1}
          >
            &larr;
          </button>
          
          {renderPaginationButtons}
          
          <button 
            className="btn btn-sm btn-outline-primary ms-1" 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  goToNextPage: PropTypes.func.isRequired,
  goToPrevPage: PropTypes.func.isRequired,
  goToPage: PropTypes.func.isRequired
};

export default Pagination;