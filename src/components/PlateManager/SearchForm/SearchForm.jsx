import PropTypes from 'prop-types';
import React, { useState } from 'react';
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
  lastSearchParams,
  loading,
  onSearch,
  onReset,
  onLoadLatestPlates,
  onSearchLastNDays
}) => {
  // State สำหรับโหมดการค้นหา
  const [searchMode, setSearchMode] = useState('quick'); // 'quick', 'advanced'

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
            onClick={() => setSearchMode('quick')}
          >
            <i className="bi bi-search"></i> ค้นหาด่วน
          </button>
          <button 
            className={`btn ${searchMode === 'advanced' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSearchMode('advanced')}
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
            initialStartDate={lastSearchParams.startDate || ''}
            initialEndDate={lastSearchParams.endDate || ''}
            initialStartMonth={lastSearchParams.startMonth || ''}
            initialEndMonth={lastSearchParams.endMonth || ''}
            initialStartYear={lastSearchParams.startYear || ''}
            initialEndYear={lastSearchParams.endYear || ''}
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
  lastSearchParams: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onLoadLatestPlates: PropTypes.func.isRequired,
  onSearchLastNDays: PropTypes.func.isRequired
};

export default SearchForm;