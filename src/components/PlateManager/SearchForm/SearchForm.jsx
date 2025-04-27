import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { plateService } from '../../../services/api';
import AdvancedSearch from './AdvancedSearch';
import QuickDateSearch from './QuickDateSearch';
import QuickSearch from './QuickSearch';
import SearchParamsDisplay from './SearchParamsDisplay';

/**
 * Component ฟอร์มค้นหาหลัก
 */
const SearchForm = ({
  searchTerm,
  onSearchTermChange,
  startDate,
  endDate,
  startMonth,
  endMonth,
  startYear,
  endYear,
  startHour,
  endHour,
  province,
  idCamera,
  cameraName,
  searchMode,
  lastSearchParams,
  loading,
  onSearch,
  onReset,
  onLoadLatestPlates,
  onSearchLastNDays,
  onSearchModeChange
}) => {
  // State สำหรับรายการจังหวัดและกล้อง
  const [provinces, setProvinces] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // โหลดรายการจังหวัดและกล้อง
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        
        // ดึงข้อมูลทะเบียนทั้งหมดแล้วสร้างรายการจังหวัดที่ไม่ซ้ำกัน
        try {
          const platesData = await plateService.getLatestPlates(300);
          const uniqueProvinces = [...new Set(
            platesData
              .map(plate => plate.province)
              .filter(province => province) // กรองเฉพาะค่าที่ไม่เป็น null/undefined/empty
          )];
          
          setProvinces(uniqueProvinces);
        } catch (error) {
          console.error('Error loading provinces:', error);
          setProvinces([]);
        }
        
        // โหลดรายการกล้อง
        try {
          const camerasData = await plateService.getCameras();
          setCameras(camerasData);
        } catch (error) {
          console.error('Error loading cameras:', error);
          setCameras([]);
        }
      } catch (error) {
        console.error('Error loading options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    
    fetchOptions();
  }, []);

  return (
    <>
      {/* ปุ่มค้นหาช่วงเวลาล่าสุด */}
      <QuickDateSearch
        onSearchLastNDays={onSearchLastNDays}
        loading={loading}
      />

      {/* ปุ่มสลับระหว่างโหมดค้นหาด่วนและค้นหาขั้นสูง */}
      <div className="search-mode-toggle mb-3">
        <div className="btn-group">
          <button 
            className={`btn ${searchMode === 'quick' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => onSearchModeChange('quick')}
          >
            <i className="bi bi-search"></i> ค้นหาด่วน
          </button>
          <button 
            className={`btn ${searchMode === 'advanced' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => onSearchModeChange('advanced')}
          >
            <i className="bi bi-sliders"></i> ค้นหาขั้นสูง
          </button>
        </div>
      </div>

      {/* แสดงฟอร์มการค้นหาตามโหมดที่เลือก */}
      <form className="mb-4 search-form">
        {searchMode === 'quick' ? (
          <QuickSearch 
            searchTerm={searchTerm}
            onSearchTermChange={onSearchTermChange}
            onLoadLatestPlates={onLoadLatestPlates}
            loading={loading}
          />
        ) : (
          <AdvancedSearch 
            initialSearchTerm={searchTerm}
            initialStartDate={startDate}
            initialEndDate={endDate}
            initialStartMonth={startMonth}
            initialEndMonth={endMonth}
            initialStartYear={startYear}
            initialEndYear={endYear}
            initialStartHour={startHour}
            initialEndHour={endHour}
            initialProvince={province}
            initialIdCamera={idCamera}
            initialCameraName={cameraName}
            provinces={provinces}
            cameras={cameras}
            loadingOptions={loadingOptions}
            onSearch={onSearch}
            onReset={onReset}
            loading={loading}
          />
        )}
      </form>

      {/* แสดงเงื่อนไขการค้นหาล่าสุด */}
      <SearchParamsDisplay 
        params={lastSearchParams} 
        onReset={onReset} 
      />
    </>
  );
};

SearchForm.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  startMonth: PropTypes.string,
  endMonth: PropTypes.string,
  startYear: PropTypes.string,
  endYear: PropTypes.string,
  startHour: PropTypes.string,
  endHour: PropTypes.string,
  province: PropTypes.string,
  idCamera: PropTypes.string,
  cameraName: PropTypes.string,
  searchMode: PropTypes.string.isRequired,
  lastSearchParams: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onLoadLatestPlates: PropTypes.func.isRequired,
  onSearchLastNDays: PropTypes.func.isRequired,
  onSearchModeChange: PropTypes.func.isRequired
};

export default SearchForm;