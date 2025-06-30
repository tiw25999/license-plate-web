import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ExportButton = ({ data }) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'plates');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer]), 'plates_export.xlsx');
  };

  return (
    <button className="btn btn-success" onClick={exportToExcel}>
      📤 Export Excel
    </button>
  );
};

export default ExportButton;
