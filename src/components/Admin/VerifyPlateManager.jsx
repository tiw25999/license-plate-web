import React, { useState, useEffect, useContext } from 'react';
import { plateService } from '../../services/api';
import { RefreshContext } from '../../contexts/RefreshContext';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const API_URL = process.env.REACT_APP_API_URL;

export default function VerifyPlateManager() {
  const { bumpRefresh } = useContext(RefreshContext);
  const [candidatesBase, setCandidatesBase] = useState([]);
  const [allImageFiles, setAllImageFiles] = useState([]);
  const [displayedImages, setDisplayedImages] = useState([]);
  const [displayedCandidates, setDisplayedCandidates] = useState([]);
  const [imagePage, setImagePage] = useState(0);
  const [dataPage, setDataPage] = useState(0);
  const [hoveredImageId, setHoveredImageId] = useState(null);
  const [processingImageIdx, setProcessingImageIdx] = useState(null);
  const [editing, setEditing] = useState({ id: null, field: null });
  const [editValue, setEditValue] = useState('');
  const pageSize = 30;
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      init();
    }, 60000 + Math.random() * 60000);
    return () => clearInterval(interval);
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      const res = await plateService.getCandidates();
      setCandidatesBase(Array.isArray(res) ? res : [res]);

      const imageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/plates`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: '' }),
      }).then(r => r.json());

      setAllImageFiles(imageRes.filter(f => f.name.toLowerCase().endsWith('.jpg')).reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadImages() {
      let imgs = allImageFiles.slice(imagePage * pageSize, imagePage * pageSize + pageSize);
      if (imgs.length < 25) {
        const need = pageSize - imgs.length;
        const res = await fetch(`${API_URL}/plates/db_images?limit=${need}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          imgs = imgs.concat(await res.json());
        }
      }
      setDisplayedImages(imgs.filter(img => img.name || img.url));
    }
    if (!loading) loadImages();
  }, [allImageFiles, imagePage, loading]);

  useEffect(() => {
    const start = dataPage * pageSize;
    setDisplayedCandidates(candidatesBase.slice(start, start + pageSize));
  }, [candidatesBase, dataPage]);

  const handleImageDelete = async idx => {
    const img = displayedImages[idx];
    if (!img?.name) return;
    setProcessingImageIdx(idx);
    try {
      const res = await fetch(`${API_URL}/plates/delete_image/${img.name}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error(await res.text());
      bumpRefresh();
      setAllImageFiles(prev => prev.filter(f => f.name !== img.name));
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบรูปภาพได้');
    } finally {
      setProcessingImageIdx(null);
    }
  };

  // ✅ ถ้ายังมีการแก้ไขค้างอยู่ของแถวนี้ ให้ commit (PATCH) ก่อนดำเนินการต่อ
  const commitIfEditingFor = async (rowId) => {
    if (editing.id === rowId && editing.field) {
      try {
        await handleUpdateField(editing.id, editing.field, editValue);
      } finally {
        setEditing({ id: null, field: null });
      }
    }
  };

  const handleVerify = async idx => {
    const cand = displayedCandidates[idx];
    setProcessingId(idx);
    try {
      // บังคับเซฟค่าที่แก้บนหน้า verify ก่อน
      await commitIfEditingFor(cand.id);

      await plateService.verifyPlate(cand.id);
      bumpRefresh();
      const updated = await plateService.getCandidates();
      setCandidatesBase(Array.isArray(updated) ? updated : [updated]);
    } catch {
      alert('ไม่สามารถยืนยันข้อมูลได้');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async idx => {
    const cand = displayedCandidates[idx];
    setProcessingId(idx);
    try {
      // เผื่อผู้ใช้แก้ค้าง – บันทึกก่อน
      await commitIfEditingFor(cand.id);

      await plateService.rejectCandidate(cand.id);
      bumpRefresh();
      const updated = await plateService.getCandidates();
      setCandidatesBase(Array.isArray(updated) ? updated : [updated]);
    } catch {
      alert('ไม่สามารถปฏิเสธข้อมูลได้');
    } finally {
      setProcessingId(null);
    }
  };

  // PATCH เฉพาะตาราง candidate เท่านั้น (แก้เฉพาะหน้า verify)
  const handleUpdateField = async (id, field, value) => {
    try {
      const res = await fetch(`${API_URL}/plates/candidates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        // backend map: 'plate_number' -> 'plate'
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error('ไม่สามารถอัปเดตได้');

      bumpRefresh();
      setCandidatesBase(prev =>
        prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
      );
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const startEditing = (id, field, value) => {
    setEditing({ id, field });
    setEditValue(value || '');
  };

  const stopEditing = async () => {
    const { id, field } = editing;
    if (!id || !field) return;
    await handleUpdateField(id, field, editValue);
    setEditing({ id: null, field: null });
  };

  if (loading) return <div>กำลังโหลด…</div>;

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', height: '600px' }}>
      {/* ตารางภาพ */}
      <div style={{ width: 180, display: 'flex', flexDirection: 'column', marginRight: 16, border: '1px solid #dee2e6', borderRadius: 4, height: '100%' }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table className="table table-bordered align-middle mb-0" style={{ borderSpacing: 0 }}>
            <thead className="table-light">
              <tr><th className="text-center">ภาพ</th></tr>
            </thead>
            <tbody>
              {displayedImages.map((img, idx) => (
                <tr
                  key={idx}
                  className="align-middle"
                  onMouseEnter={() => setHoveredImageId(idx)}
                  onMouseLeave={() => setHoveredImageId(null)}
                >
                  <td className="p-1" style={{ position: 'relative' }}>
                    <img
                      src={img.url || `${SUPABASE_URL}/storage/v1/object/public/plates/${img.name}`}
                      alt="plate"
                      style={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 4,
                        opacity: processingImageIdx === idx ? 0.5 : 1,
                      }}
                    />
                    {hoveredImageId === idx && processingImageIdx !== idx && (
                      <div
                        onClick={() => handleImageDelete(idx)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                          color: '#fff',
                          cursor: 'pointer',
                          borderRadius: 4,
                        }}
                      >✕</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-center mt-2">
          <button className="btn btn-sm me-2" onClick={() => setImagePage(ip => Math.max(ip - 1, 0))} disabled={imagePage === 0}>◀</button>
          <button className="btn btn-sm" onClick={() => setImagePage(ip => ip + 1)} disabled={(imagePage + 1) * pageSize >= allImageFiles.length}>▶</button>
        </div>
      </div>

      {/* ตารางข้อมูล */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ทะเบียน</th>
                <th>จังหวัด</th>
                <th>กล้อง</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {displayedCandidates.map((p, idx) => (
                <tr key={p.id}>
                  <td>
                    {editing.id === p.id && editing.field === 'plate_number' ? (
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={stopEditing}
                        onKeyDown={e => e.key === 'Enter' && stopEditing()}
                        autoFocus
                      />
                    ) : (
                      <>
                        {p.plate_number}{' '}
                        <button onClick={() => startEditing(p.id, 'plate_number', p.plate_number)} className="btn btn-sm btn-link p-0 text-decoration-none">⚙️</button>
                      </>
                    )}
                  </td>
                  <td>
                    {editing.id === p.id && editing.field === 'province' ? (
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={stopEditing}
                        onKeyDown={e => e.key === 'Enter' && stopEditing()}
                        autoFocus
                      />
                    ) : (
                      <>
                        {p.province || '-'}{' '}
                        <button onClick={() => startEditing(p.id, 'province', p.province)} className="btn btn-sm btn-link p-0 text-decoration-none">⚙️</button>
                      </>
                    )}
                  </td>
                  <td>
                    {editing.id === p.id && editing.field === 'camera_name' ? (
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={stopEditing}
                        onKeyDown={e => e.key === 'Enter' && stopEditing()}
                        autoFocus
                      />
                    ) : (
                      <>
                        {p.camera_name || '-'}{' '}
                        <button onClick={() => startEditing(p.id, 'camera_name', p.camera_name)} className="btn btn-sm btn-link p-0 text-decoration-none">⚙️</button>
                      </>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleVerify(idx)}
                      disabled={processingId === idx}
                    >
                      {processingId === idx ? '⏳' : '✅ ยืนยัน'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(idx)}
                      disabled={processingId === idx}
                    >
                      {processingId === idx ? '⏳' : '❌ ปฏิเสธ'}
                    </button>
                  </td>
                </tr>
              ))}
              {displayedCandidates.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted">ไม่มีรายการ</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-center mt-2">
          <button className="btn btn-sm me-2" onClick={() => setDataPage(dp => Math.max(dp - 1, 0))} disabled={dataPage === 0}>◀</button>
          <button className="btn btn-sm" onClick={() => setDataPage(dp => dp + 1)} disabled={(dataPage + 1) * pageSize >= candidatesBase.length}>▶</button>
        </div>
      </div>
    </div>
  );
}
