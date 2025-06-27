import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import editIcon from '../../assets/edit_icon.svg';
import deleteIcon from '../../assets/delete_icon.svg';
import peopleIcon from '../../assets/people_icon.svg';
import ConfirmationModal from '../../components/ConfirmationModal';
import { AdminContext } from '../../context/AdminContext';

const API_BASE = 'https://authappapi.runasp.net/api';

const UsersList = () => {
  const { users, getAllUsers, updateUser, deleteUser, notifyUser } = useContext(AdminContext);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await getAllUsers();
      setLoading(false);
    };
    fetch();
  }, [getAllUsers]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    await deleteUser(selectedUser.id);
    setShowDeleteModal(false);
  };

  const handleNotify = async () => {
    if (!selectedUser) return;
    await notifyUser(selectedUser.id, notifyMessage);
    setShowNotifyModal(false);
    setNotifyMessage('');
  };

  const handleEdit = async () => {
    if (!editUser) return;
    await updateUser(editUser.id, editForm);
    setEditUser(null);
    setEditForm({});
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <img src={peopleIcon} alt="Users" className="w-6 h-6" /> Users Management
      </h2>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{user.firstName} {user.lastName}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.role}</td>
              <td className="py-2 px-4 border-b flex gap-2">
                <button onClick={() => { setEditUser(user); setEditForm(user); }} title="Edit">
                  <img src={editIcon} alt="Edit" className="w-5 h-5" />
                </button>
                <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} title="Delete">
                  <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
                </button>
                <button onClick={() => { setSelectedUser(user); setShowNotifyModal(true); }} title="Notify" className="text-blue-600 underline text-xs">Notify</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-2">Edit User</h3>
            <input className="border p-2 w-full mb-2" placeholder="First Name" value={editForm.firstName || ''} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
            <input className="border p-2 w-full mb-2" placeholder="Last Name" value={editForm.lastName || ''} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
            <input className="border p-2 w-full mb-2" placeholder="Email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <input className="border p-2 w-full mb-2" placeholder="Address" value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
            <input className="border p-2 w-full mb-2" placeholder="Date of Birth" type="date" value={editForm.dateOfBirth ? editForm.dateOfBirth.substring(0,10) : ''} onChange={e => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleEdit}>Save</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete user '${selectedUser?.firstName} ${selectedUser?.lastName}'?`}
      />

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-2">Send Notification</h3>
            <textarea className="border p-2 w-full mb-2" placeholder="Message" value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} />
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleNotify}>Send</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowNotifyModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList; 