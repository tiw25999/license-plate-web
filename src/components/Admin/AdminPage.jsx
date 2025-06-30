import React, { useEffect, useState } from 'react';
import { plateService } from '../../services/api';
import VerifyPlateManager from './VerifyPlateManager';

const AdminPage = () => {
  const [loading, setLoading] = useState(false);

  const loadPlates = async () => {
    setLoading(true);
    try {
      // เดิม: const data = await plateService.getLatestPlates(200);
      // ลบ: setPlates(data);
      await plateService.getLatestPlates(200); // หรือจะลบทิ้งทั้งบรรทัดก็ได้
    } catch (err) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlates();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🔐 หน้าผู้ดูแลระบบ</h2>

      <h4 className="mb-3">จัดการทะเบียน Verify</h4>

      {loading ? (
        <div className="text-muted">📡 กำลังโหลดข้อมูล...</div>
      ) : (
        <VerifyPlateManager />
      )}
    </div>
  );
};

export default AdminPage;
