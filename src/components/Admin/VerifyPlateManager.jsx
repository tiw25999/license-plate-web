import React, { useEffect, useState } from 'react';
import { plateService } from '../../services/api';

const VerifyPlateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await plateService.getCandidates();
      setCandidates(data);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (candidateId) => {
    setProcessingId(candidateId);
    try {
      await plateService.verifyPlate(candidateId);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    } catch (err) {
      alert('ไม่สามารถยืนยันได้');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (candidateId) => {
    setProcessingId(candidateId);
    try {
      await plateService.rejectCandidate(candidateId);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    } catch (err) {
      alert('ไม่สามารถลบข้อมูลได้');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  return (
    <div className="card p-3">
      <h5>ทะเบียนรอการ Verify</h5>
      {loading ? (
        <div>กำลังโหลด...</div>
      ) : (
        <table className="table table-bordered mt-3 align-middle">
          <thead className="table-light">
            <tr>
              <th>ภาพ</th>
              <th>ทะเบียน</th>
              <th>จังหวัด</th>
              <th>กล้อง</th>
              <th>ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((p) => (
              <tr key={p.id}>
                <td style={{ width: '120px' }}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt="plate"
                      style={{ width: '100px', height: 'auto', objectFit: 'cover', borderRadius: 4 }}
                    />
                  ) : (
                    <span className="text-muted">ไม่มีรูป</span>
                  )}
                </td>
                <td>{p.plate}</td>
                <td>{p.province || '-'}</td>
                <td>{p.camera_name || '-'}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleVerify(p.id)}
                    disabled={processingId === p.id}
                  >
                    {processingId === p.id ? '⏳' : '✅ ยืนยัน'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(p.id)}
                    disabled={processingId === p.id}
                  >
                    {processingId === p.id ? '⏳' : '❌ ปฏิเสธ'}
                  </button>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">ไม่มีรายการ</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VerifyPlateManager;
