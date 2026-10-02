import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, User, Check, Search } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentAdmin } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (userId === currentAdmin?._id) {
      alert('You cannot change your own role.');
      return;
    }

    try {
      await axiosInstance.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (userId === currentAdmin?._id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await axiosInstance.delete(`/users/${userId}`);
        setUsers(users.filter((u) => u._id !== userId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Users</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage platform customers, administrators, and permissions
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((u) => {
                    const isSelf = u._id === currentAdmin?._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">
                                {u.name} {isSelf && <span className="text-[10px] text-teal-600 font-semibold">(You)</span>}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {u.phone || 'No phone'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 text-slate-600">
                          {u.email}
                        </td>

                        <td className="py-3.5 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-teal-50 text-teal-700 border-teal-200'
                            }`}
                          >
                            {u.role === 'admin' ? (
                              <Shield size={11} className="mr-1" />
                            ) : (
                              <User size={11} className="mr-1" />
                            )}
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-6 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleRole(u._id, u.role)}
                              disabled={isSelf}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Toggle User Role"
                            >
                              Make {u.role === 'admin' ? 'Customer' : 'Admin'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              disabled={isSelf}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
