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
  
  // State สำหรับการเพิ่มผู้ใช้
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('member');
  
  // State สำหรับการลบผู้ใช้
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { isAdmin } = useAuth();
  
  // ฟังก์ชันสำหรับโหลดข้อมูลผู้ใช้
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
  
  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);
  
  // ถ้าไม่ใช่ admin ให้ redirect ไปหน้าหลัก
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
// ฟังก์ชันสำหรับอัพเดตสิทธิ์ผู้ใช้
const handleUpdateRole = async () => {
  if (!selectedUser) return;
  
  try {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    console.log('Updating role for user:', selectedUser.id, 'to', selectedRole);
    
    const result = await authService.updateUserRole(selectedUser.id, selectedRole);
    
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
  
// ฟังก์ชันสำหรับเพิ่มผู้ใช้ - แก้ไขแล้ว
const handleAddUser = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    // ตรวจสอบข้อมูล
    if (!newUsername || !newPassword) {
      throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
    }
    
    if (newPassword.length < 6) {
      throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    }
    
    // ใช้ authService.createUser แทน
    const result = await authService.createUser(
      newUsername, 
      newPassword, 
      newEmail && newEmail.trim() !== '' ? newEmail.trim() : null, 
      newRole
    );
    
    // รีเซ็ตข้อมูลฟอร์ม
    setNewUsername('');
    setNewPassword('');
    setNewEmail('');
    setNewRole('member');
    
    // ปิด modal
    setShowAddUserModal(false);
    
    // แสดงข้อความสำเร็จ
    setSuccessMessage(`เพิ่มผู้ใช้ ${result.username || 'ใหม่'} เรียบร้อยแล้ว`);
    
    // โหลดข้อมูลผู้ใช้ใหม่
    await fetchUsers();
    
  } catch (err) {
    console.error('Error adding user:', err);
    setError('ไม่สามารถเพิ่มผู้ใช้ได้: ' + (err.message || ''));
  } finally {
    setLoading(false);
  }
};

// ฟังก์ชันสำหรับลบผู้ใช้
const handleDeleteUser = async () => {
  if (!userToDelete) return;
  
  try {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    // เรียกใช้ authService.deleteUser
    await authService.deleteUser(userToDelete.id);
    
    // ลบผู้ใช้ออกจาก state
    setUsers(users.filter(user => user.id !== userToDelete.id));
    
    // แสดงข้อความสำเร็จ
    setSuccessMessage(`ลบผู้ใช้ ${userToDelete.username} เรียบร้อยแล้ว`);
    
    // ปิด modal
    setShowDeleteModal(false);
    setUserToDelete(null);
    
  } catch (err) {
    console.error('Error deleting user:', err);
    setError('ไม่สามารถลบผู้ใช้ได้: ' + (err.message || ''));
  } finally {
    setLoading(false);
  }
};

return (
  <div className="container mt-4">
    <h2 className="mb-4">จัดการผู้ใช้</h2>
    
    {error && <Alert type="danger" message={error} />}
    {successMessage && <Alert type="success" message={successMessage} />}
    
    {/* ปุ่มเพิ่มผู้ใช้ */}
    <div className="mb-3">
      <button 
        className="btn btn-success" 
        onClick={() => setShowAddUserModal(true)}
      >
        <i className="bi bi-person-plus-fill"></i> เพิ่มผู้ใช้
      </button>
    </div>
    
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
                    <div className="btn-group">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedRole(user.role);
                        }}
                      >
                        แก้ไขสิทธิ์
                      </button>
                      <button 
                        className="btn btn-sm btn-danger ms-1"
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                      >
                        ลบ
                      </button>
                    </div>
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
        
        {/* Modal แก้ไขสิทธิ์ */}
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
            <div className="modal-backdrop fade show"></div>
          </>
        )}
        
        {/* Modal เพิ่มผู้ใช้ */}
        {showAddUserModal && (
          <>
            <div 
              className="modal fade show" 
              style={{display: 'block'}} 
              tabIndex="-1" 
              aria-modal="true" 
              role="dialog"
              aria-labelledby="add-user-modal-title"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="add-user-modal-title">เพิ่มผู้ใช้ใหม่</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowAddUserModal(false)}
                      aria-label="ปิด"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleAddUser}>
                      <div className="mb-3">
                        <label htmlFor="newUsername" className="form-label">ชื่อผู้ใช้</label>
                        <input
                          type="text"
                          className="form-control"
                          id="newUsername"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">รหัสผ่าน</label>
                        <input
                          type="password"
                          className="form-control"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <div className="form-text">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="newEmail" className="form-label">อีเมล (ไม่บังคับ)</label>
                        <input
                          type="email"
                          className="form-control"
                          id="newEmail"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="newRole" className="form-label">สิทธิ์</label>
                        <select 
                          className="form-select"
                          id="newRole"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
                      <div className="modal-footer px-0 pb-0">
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowAddUserModal(false)}
                        >
                          ยกเลิก
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-success"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              กำลังบันทึก...
                            </>
                          ) : 'เพิ่มผู้ใช้'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
        
        {/* Modal ยืนยันการลบผู้ใช้ */}
        {showDeleteModal && userToDelete && (
          <>
            <div 
              className="modal fade show" 
              style={{display: 'block'}} 
              tabIndex="-1" 
              aria-modal="true" 
              role="dialog"
              aria-labelledby="delete-user-modal-title"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="delete-user-modal-title">ยืนยันการลบผู้ใช้</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                      }}
                      aria-label="ปิด"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>คุณแน่ใจหรือไม่ที่ต้องการลบผู้ใช้ <strong>{userToDelete.username}</strong>?</p>
                    <p className="text-danger">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={handleDeleteUser}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          กำลังลบ...
                        </>
                      ) : 'ลบผู้ใช้'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </>
    )}
  </div>
);
};

export default AdminPage;