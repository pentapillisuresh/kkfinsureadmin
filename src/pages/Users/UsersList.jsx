// src/pages/admin/UsersList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { 
  FiPlus, FiSearch, FiFilter, FiDownload, FiEye, 
  FiEdit, FiTrash2, FiToggleLeft, FiToggleRight,
  FiChevronLeft, FiChevronRight, FiUser, FiUsers,
  FiMail, FiPhone, FiAward, FiCheckCircle, FiXCircle,
  FiGrid, FiList
} from 'react-icons/fi';
import { formatDate, getStatusColor, getInitials } from '../../utils/helpers';
import CreateUserModal from '../../components/modals/CreateUserModal';
import EditUserModal from '../../components/modals/EditUserModal';
import toast from 'react-hot-toast';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPartnerType, setFilterPartnerType] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, filterStatus, filterPartnerType]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filterRole !== 'all') params.role = filterRole;
      if (filterPartnerType !== 'all') params.partnerType = filterPartnerType;
      if (filterStatus !== 'all') params.isActive = filterStatus === 'active';

      const response = await adminApi.getUsers(params);
      
      if (response.success) {
        setUsers(response.data.users || []);
        setPagination(response.data.pagination || { total: 0, totalPages: 0 });
      } else {
        toast.error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adminApi.toggleUserStatus(id);
      if (response.success) {
        toast.success(response.message || 'User status updated');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await authApi.createUser(userData);
      if (response.success) {
        toast.success('User created successfully');
        setShowCreateModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (userData) => {
    try {
      const response = await adminApi.updateUser(selectedUser.id, userData);
      if (response.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete user: ${name}? This action cannot be undone.`)) {
      toast.error('Delete functionality coming soon');
    }
  };

  const totalPages = pagination.totalPages || Math.ceil(pagination.total / itemsPerPage);

  // Stats
  const totalUsers = pagination.total || 0;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const partnerUsers = users.filter(u => u.partnerType !== 'none').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiUsers className="text-blue-600" />
            Users
          </h1>
          <p className="text-gray-500">Manage all system users and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
        >
          <FiPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-600 font-medium">Total Users</p>
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FiUsers className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600 font-medium">Active Users</p>
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">{activeUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-600 font-medium">Admins</p>
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <FiAward className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-1">{adminUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-xl border border-yellow-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-600 font-medium">Partners</p>
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <FiAward className="text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{partnerUsers}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or batch ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input py-2.5 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterPartnerType}
              onChange={(e) => {
                setFilterPartnerType(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input py-2.5 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="all">All Partners</option>
              <option value="referral">Referral</option>
              <option value="authorised">Authorised</option>
              <option value="hni">HNI</option>
              <option value="none">None</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input py-2.5 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Table View"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table/Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="text-gray-500 mt-3">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FiUsers className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No users found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.batchId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-700">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-700">{user.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700' 
                            : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.partnerType === 'none' ? 'bg-gray-100 text-gray-600' :
                          user.partnerType === 'referral' ? 'bg-green-100 text-green-700' :
                          user.partnerType === 'authorised' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {user.partnerType || 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700' 
                            : 'bg-gradient-to-r from-red-100 to-red-200 text-red-700'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/users/${user.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all group-hover:scale-105"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all group-hover:scale-105"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2 rounded-lg transition-all group-hover:scale-105 ${
                              user.isActive
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.fullName)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all group-hover:scale-105"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all hover:scale-[1.02]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                        {getInitials(user.fullName)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.batchId || 'N/A'}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMail className="text-gray-400 text-xs" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPhone className="text-gray-400 text-xs" />
                      <span>{user.phone || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        user.partnerType === 'none' ? 'bg-gray-100 text-gray-600' :
                        user.partnerType === 'referral' ? 'bg-green-100 text-green-700' :
                        user.partnerType === 'authorised' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {user.partnerType || 'None'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={`/users/${user.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          user.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <FiToggleRight className="w-3.5 h-3.5" /> : <FiToggleLeft className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-3">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersList;