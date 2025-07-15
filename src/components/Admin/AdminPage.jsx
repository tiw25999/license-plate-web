import React from 'react';
import VerifyPlateManager from './VerifyPlateManager';

export default function AdminPage() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">🔐 หน้าผู้ดูแลระบบ</h2>
      <h4 className="mb-3">จัดการทะเบียนรอ Verify</h4>
      <VerifyPlateManager />
    </div>
  );
}
