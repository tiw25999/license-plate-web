/**
 * ฟังก์ชันสำหรับจัดรูปแบบวันที่เป็น DD/MM/YYYY
 * @param {Date} date วันที่ที่ต้องการจัดรูปแบบ
 * @returns {string} วันที่ในรูปแบบ DD/MM/YYYY
 */
export const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  /**
   * ตรวจสอบความถูกต้องของวันที่ในรูปแบบ DD/MM/YYYY
   * @param {string} dateString วันที่ในรูปแบบ DD/MM/YYYY
   * @returns {boolean} true ถ้าวันที่ถูกต้อง, false ถ้าไม่ถูกต้อง
   */
  export const isValidDateFormat = (dateString) => {
    if (!dateString) return false;
    
    // ตรวจสอบรูปแบบ DD/MM/YYYY
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (!regex.test(dateString)) return false;
    
    // แยกวัน เดือน ปี
    const [day, month, year] = dateString.split('/').map(Number);
    
    // สร้างวัตถุวันที่เพื่อตรวจสอบความถูกต้อง
    const date = new Date(year, month - 1, day);
    
    // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };
  
  /**
   * ฟังก์ชันสำหรับตรวจสอบความครบถ้วนของข้อมูลช่วงวันที่
   * @param {string} startDate วันที่เริ่มต้น
   * @param {string} endDate วันที่สิ้นสุด
   * @returns {boolean} true ถ้าข้อมูลครบถ้วน, false ถ้าไม่ครบถ้วน
   */
  export const isDateRangeComplete = (startDate, endDate) => {
    return Boolean(startDate && endDate);
  };
  
  /**
   * ฟังก์ชันสำหรับตรวจสอบความครบถ้วนของข้อมูลช่วงเดือน/ปี
   * @param {string} startMonth เดือนเริ่มต้น
   * @param {string} endMonth เดือนสิ้นสุด
   * @param {string} startYear ปีเริ่มต้น
   * @param {string} endYear ปีสิ้นสุด
   * @returns {boolean} true ถ้าข้อมูลครบถ้วน, false ถ้าไม่ครบถ้วน
   */
  export const isMonthRangeComplete = (startMonth, endMonth, startYear, endYear) => {
    return Boolean(startMonth && endMonth && startYear && endYear);
  };
  
  /**
   * ฟังก์ชันสำหรับตรวจสอบความครบถ้วนของข้อมูลช่วงปี
   * @param {string} startYear ปีเริ่มต้น
   * @param {string} endYear ปีสิ้นสุด
   * @returns {boolean} true ถ้าข้อมูลครบถ้วน, false ถ้าไม่ครบถ้วน
   */
  export const isYearRangeComplete = (startYear, endYear) => {
    return Boolean(startYear && endYear);
  };
  
  /**
   * แปลงวันที่จากรูปแบบข้อความเป็น Date object
   * @param {string} dateString วันที่ในรูปแบบ DD/MM/YYYY
   * @returns {Date|null} Date object หรือ null ถ้าไม่สามารถแปลงได้
   */
  export const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    try {
      const [day, month, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error('Error parsing date string:', error);
      return null;
    }
  };