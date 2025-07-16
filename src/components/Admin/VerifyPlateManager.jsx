import React, { useState, useEffect, useContext } from 'react';
import { plateService } from '../../services/api';
import { RefreshContext } from '../../contexts/RefreshContext';

const SUPABASE_URL = "https://vzmnbpsxkqkennmzlxgr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bW5icHN4a3FrZW5ubXpseGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDI5ODEsImV4cCI6MjA1NzkxODk4MX0.aFbAyFNWuNkG9FSoxQ-jh7Amr8oZe7bALvCH8SiwLv8";

export default function VerifyPlateManager() {
  const { bumpRefresh } = useContext(RefreshContext);
  const [candidates, setCandidates] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [candidateRes, imageRes] = await Promise.all([
        plateService.getCandidates(),
        fetch(`${SUPABASE_URL}/storage/v1/object/list/plates`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prefix: "" }),
        }).then(res => res.json())
      ]);

      const candidates = Array.isArray(candidateRes) ? candidateRes : [candidateRes];
      const imageFiles = imageRes.filter(f => f.name.toLowerCase().endsWith('.jpg'));

      // จับคู่ตามลำดับ
      const enriched = candidates.map((item, index) => ({
        ...item,
        image_url: imageFiles[index]
          ? `${SUPABASE_URL}/storage/v1/object/public/plates/${imageFiles[index].name}`
          : null,
      }));

      setCandidates(enriched);
    } catch (err) {
      console.error("Load error", err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async (id) => {
    setProcessingId(id);
    try {
      await plateService.verifyPlate(id);
      bumpRefresh();
      await loadData();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถยืนยันได้");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await plateService.rejectCandidate(id);
      bumpRefresh();
      await loadData();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถปฏิเสธได้");
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
                ? <img src={p.image_url} alt="plate" style={{ width: 100, objectFit: 'cover', borderRadius: 4 }} />
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
