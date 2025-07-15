import React, { useState, useEffect, useContext } from 'react';
import { plateService } from '../../services/api';
import { RefreshContext } from '../../contexts/RefreshContext';

export default function VerifyPlateManager() {
  const { bumpRefresh } = useContext(RefreshContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setLoading(true);
    try {
      const data = await plateService.getCandidates();
      setCandidates(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async (id) => {
    setProcessingId(id);
    try {
      await plateService.verifyPlate(id);
      bumpRefresh();    // ← แจ้งให้ PlateManager รีโหลด
      await loadCandidates();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถยืนยันได้');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await plateService.rejectCandidate(id);
      bumpRefresh();    // ← แจ้งให้ PlateManager รีโหลด
      await loadCandidates();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถปฏิเสธได้');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div>กำลังโหลด…</div>;

  return (
    <table className="table table-bordered mt-3 align-middle">
      <thead className="table-light">
        <tr>
          <th>ภาพ</th><th>ทะเบียน</th><th>จังหวัด</th><th>กล้อง</th><th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map(p => (
          <tr key={p.id}>
            <td style={{ width: 120 }}>
              {p.image_url
                ? <img src={p.image_url} alt="plate" style={{ width: 100, objectFit: 'cover', borderRadius: 4 }}/>
                : <span className="text-muted">ไม่มีรูป</span>}
            </td>
            <td>{p.plate_number}</td>
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
  );
}
