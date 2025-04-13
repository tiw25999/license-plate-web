import PropTypes from 'prop-types';
import React from 'react';

/**
 * Component สำหรับแสดงสถานะการเชื่อมต่อกับ API
 */
const ApiStatus = ({ status }) => {
  // ตรวจสอบว่ามีการระบุสถานะหรือไม่
  if (!status) return null;
  
  // กำหนดข้อความและคลาสตามสถานะ
  let statusText = '';
  let statusClass = '';
  
  switch (status) {
    case 'online':
      statusText = '✅ เชื่อมต่อกับ API สำเร็จ';
      statusClass = 'api-status-online';
      break;
    case 'offline':
      statusText = '❌ ไม่สามารถเชื่อมต่อกับ API ได้';
      statusClass = 'api-status-offline';
      break;
    case 'issue':
      statusText = '⚠️ API อาจมีปัญหาบางส่วน';
      statusClass = 'api-status-issue';
      break;
    default:
      statusText = `สถานะ API: ${status}`;
      statusClass = '';
  }
  
  return (
    <div className={`api-status ${statusClass} mb-2`}>
      <small>{statusText}</small>
    </div>
  );
};

ApiStatus.propTypes = {
  status: PropTypes.oneOf(['online', 'offline', 'issue', null])
};

export default ApiStatus;