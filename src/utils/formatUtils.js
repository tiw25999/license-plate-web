/**
 * Utility functions สำหรับจัดรูปแบบข้อมูล
 */

/**
 * ฟังก์ชันสำหรับจัดรูปแบบเลขทะเบียน
 * @param {*} plateNumber เลขทะเบียนที่ต้องการจัดรูปแบบ
 * @returns {string} เลขทะเบียนที่จัดรูปแบบแล้ว
 */
export const formatPlateNumber = (plateNumber) => {
    if (!plateNumber) return '-';
    return plateNumber.toString().trim();
  };
  
  /**
   * ฟังก์ชันสำหรับจัดรูปแบบข้อความวันที่
   * @param {string} timestamp ข้อความวันที่
   * @returns {string} วันที่ในรูปแบบที่อ่านง่าย
   */
  export const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    return timestamp;
  };
  
  /**
   * ฟังก์ชันสำหรับตัดข้อความให้สั้นลง
   * @param {string} text ข้อความที่ต้องการตัด
   * @param {number} maxLength ความยาวสูงสุดที่ต้องการ
   * @returns {string} ข้อความที่ตัดแล้ว
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };