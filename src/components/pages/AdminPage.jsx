import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import Alert from '../common/Alert';
import Spinner from '../common/Spinner';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { isAdmin } = useAuth();
  
  // useEffect ต้องอยู่ที่ระดับบนสุด ไม่อยู่ภายใต้เงื่อนไข
  useEffect(() => {
    // ย้ายเงื่อนไขเข้ามาในนี้แทน
    if (isAdmin()) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          setError('');
          console.log('Fetching users...');
          const data = await authService.fetchAllUsers();
          console.log('Users loaded:', data);
          setUsers(data);
        } catch (err) {
          console.error('Error fetching users:', err);
          setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ' + (err.message || ''));
        } finally {
          setLoading(false);
        }
      };
      
      fetchUsers();
    }
  }, [isAdmin]);
  
  // ถ้าไม่ใช่ admin ให้ redirect ไปหน้าหลัก
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  // ในฟังก์ชัน handleUpdateRole
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      // เพิ่ม log เพื่อดีบัก
      console.log('Updating role for user:', selectedUser.id, 'to', selectedRole);
      
      // ใช้ fetch API โดยตรงแทนการเรียกผ่าน auth service
      const token = localStorage.getItem('token');
      const response = await fetch('https://license-plate-system-production.up.railway.app/auth/update-role', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          role: selectedRole
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update result:', result);
      
      // อัพเดทข้อมูลในหน้า
      setUsers(users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, role: selectedRole };
        }
        return user;
      }));
      
      setSuccessMessage(`อัพเดทสิทธิ์ผู้ใช้ ${selectedUser.username} เป็น ${selectedRole} เรียบร้อยแล้ว`);
      
      // ปิด modal
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('ไม่สามารถอัพเดทสิทธิ์ผู้ใช้ได้: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">จัดการผู้ใช้</h2>
      
      {error && <Alert type="danger" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}
      
      {loading && !users.length ? (
        <div className="text-center my-5">
          <Spinner size="medium" />
          <p className="mt-2">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ชื่อผู้ใช้</th>
                  <th>อีเมล</th>
                  <th>สิทธิ์</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedRole(user.role);
                        }}
                      >
                        แก้ไขสิทธิ์
                      </button>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-3">ไม่พบข้อมูลผู้ใช้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Modal แก้ไขสิทธิ์ - ส่วนที่แก้ไข */}
          {selectedUser && (
            <>
              <div 
                className="modal fade show" 
                id="editRoleModal" 
                style={{display: 'block'}} 
                tabIndex="-1" 
                aria-modal="true" 
                role="dialog"
                aria-labelledby="edit-role-modal-title"
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="edit-role-modal-title">แก้ไขสิทธิ์ผู้ใช้</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setSelectedUser(null)}
                        aria-label="ปิด"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>กำหนดสิทธิ์ให้กับ: <strong>{selectedUser.username}</strong></p>
                      
                      <div className="mb-3">
                        <label className="form-label">สิทธิ์</label>
                        <select 
                          className="form-select"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setSelectedUser(null)}
                      >
                        ยกเลิก
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleUpdateRole}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            กำลังบันทึก...
                          </>
                        ) : 'บันทึก'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* แยก Backdrop มาอยู่นอก modal */}
              <div className="modal-backdrop fade show"></div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;