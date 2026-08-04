// src/pages/admin/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, 
  FiMapPin, FiCreditCard, FiUserPlus, FiLock, 
  FiEdit, FiToggleRight, FiToggleLeft, FiDownload,
  FiFileText, FiAward, FiPieChart, FiDollarSign, FiClock,
  FiCheckCircle, FiXCircle, FiLink, FiImage, FiFile,
  FiActivity, FiUsers, FiBriefcase, FiStar
} from 'react-icons/fi';
import { formatDate, getStatusColor, getInitials } from '../../utils/helpers';
import EditUserModal from '../../components/modals/EditUserModal';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUser(id);
      
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        toast.error(response.message || 'User not found');
        navigate('/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch user details');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (formData) => {
    setUpdating(true);
    try {
      const response = await adminApi.updateUser(id, formData);
      if (response.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        await fetchUserDetails();
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await adminApi.toggleUserStatus(id);
      if (response.success) {
        toast.success(response.message || 'User status updated');
        await fetchUserDetails();
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'investments', label: 'Investments', icon: FiPieChart },
    { id: 'returns', label: 'Returns', icon: FiDollarSign },
    { id: 'documents', label: 'Documents', icon: FiFileText },
    { id: 'history', label: 'History', icon: FiClock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 mt-3">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">User not found</div>
        <button onClick={() => navigate('/users')} className="btn-primary mt-4">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <FiArrowLeft className="text-gray-600 w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                User Profile
              </span>
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs font-mono">
                {user.batchId || 'No Batch ID'}
              </span>
              <span className="text-gray-300">|</span>
              {user.fullName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              user.isActive 
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 hover:shadow-md' 
                : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 hover:shadow-md'
            }`}
          >
            {user.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
            {user.isActive ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
          >
            <FiEdit className="w-4 h-4" />
            Edit User
          </button>
        </div>
      </div>

      {/* User Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30">
            {getInitials(user.fullName)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                user.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FiMail className="text-gray-400" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <FiPhone className="text-gray-400" />
                {user.phone || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5">
                <FiCalendar className="text-gray-400" />
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-sm text-gray-500">Batch ID</div>
            <div className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
              {user.batchId || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-600 font-medium">Role</p>
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-blue-700 mt-1 capitalize">{user.role || 'User'}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600 font-medium">Partner Type</p>
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <FiAward className="text-green-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-green-700 mt-1 capitalize">{user.partnerType || 'None'}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-600 font-medium">Senior Citizen</p>
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              {user.isSeniorCitizen ? <FiCheckCircle className="text-purple-600" /> : <FiXCircle className="text-purple-600" />}
            </div>
          </div>
          <p className="text-lg font-bold text-purple-700 mt-1">{user.isSeniorCitizen ? 'Yes' : 'No'}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-xl border border-yellow-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-600 font-medium">Commission Rate</p>
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <FiStar className="text-yellow-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-yellow-700 mt-1">{user.partnerCommissionRate || 0}%</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'investments' && <InvestmentsTab investments={user.investments} />}
          {activeTab === 'returns' && <ReturnsTab returns={user.returns} />}
          {activeTab === 'documents' && <DocumentsTab documents={user.documents} />}
          {activeTab === 'history' && <HistoryTab user={user} />}
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateUser}
        user={user}
        isLoading={updating}
      />
    </div>
  );
};

// ============================================================
// Tab Components
// ============================================================

const ProfileTab = ({ user }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <FiUser className="text-blue-500 w-4 h-4" />
          </div>
          Personal Details
        </h3>
        <div className="space-y-3">
          <DetailItem label="Full Name" value={user.fullName} />
          <DetailItem label="Email" value={user.email} icon={FiMail} />
          <DetailItem label="Phone" value={user.phone || 'N/A'} icon={FiPhone} />
          <DetailItem label="Date of Birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : 'N/A'} icon={FiCalendar} />
          <DetailItem label="Senior Citizen" value={user.isSeniorCitizen ? 'Yes' : 'No'} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500/10 rounded-lg flex items-center justify-center">
            <FiMapPin className="text-green-500 w-4 h-4" />
          </div>
          Address
        </h3>
        <div className="space-y-3">
          <DetailItem label="Address" value={user.address || 'Not provided'} />
        </div>
      </div>
    </div>

    <div className="border-t pt-6">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-purple-500/10 rounded-lg flex items-center justify-center">
          <FiCreditCard className="text-purple-500 w-4 h-4" />
        </div>
        ID Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="PAN" value={user.pan || 'Not provided'} />
        <DetailItem label="Aadhar" value={user.aadhar || 'Not provided'} />
      </div>
    </div>

    {user.nominee && (
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <FiUserPlus className="text-orange-500 w-4 h-4" />
          </div>
          Nominee Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Full Name" value={user.nominee.fullName} />
          <DetailItem label="Relation" value={user.nominee.relation} />
          <DetailItem label="Phone" value={user.nominee.phone || 'N/A'} />
          <DetailItem label="Email" value={user.nominee.email || 'N/A'} />
        </div>
      </div>
    )}

    <div className="border-t pt-6">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-red-500/10 rounded-lg flex items-center justify-center">
          <FiLock className="text-red-500 w-4 h-4" />
        </div>
        Account Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Batch ID" value={user.batchId || 'N/A'} />
        <DetailItem label="Member Since" value={formatDate(user.createdAt)} />
        <DetailItem label="Created By" value={user.creator?.fullName || 'System'} />
        <DetailItem label="Last Updated" value={formatDate(user.updatedAt)} />
      </div>
    </div>
  </div>
);

const InvestmentsTab = ({ investments }) => {
  const totalAmount = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const activeCount = investments?.filter(inv => inv.status === 'active').length || 0;
  const maturedCount = investments?.filter(inv => inv.status === 'matured').length || 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
          <p className="text-sm text-blue-600 font-medium">Total Investments</p>
          <p className="text-2xl font-bold text-blue-700">{investments?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
          <p className="text-sm text-green-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
          <p className="text-sm text-purple-600 font-medium">Matured</p>
          <p className="text-2xl font-bold text-purple-700">{maturedCount}</p>
        </div>
      </div>

      {investments?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 rounded-xl">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investment Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maturity Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map((inv, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{inv.plan?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{parseFloat(inv.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.investmentDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.maturityDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FiPieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No investments found</p>
        </div>
      )}
    </div>
  );
};

const ReturnsTab = ({ returns }) => {
  const totalReturns = returns?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const monthlyTotal = returns?.filter(r => r.type === 'monthly').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const bonusTotal = returns?.filter(r => r.type === 'annual_bonus').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
          <p className="text-sm text-blue-600 font-medium">Total Returns</p>
          <p className="text-2xl font-bold text-blue-700">₹{totalReturns.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
          <p className="text-sm text-green-600 font-medium">Monthly Returns</p>
          <p className="text-2xl font-bold text-green-700">₹{monthlyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
          <p className="text-sm text-purple-600 font-medium">Annual Bonus</p>
          <p className="text-2xl font-bold text-purple-700">₹{bonusTotal.toLocaleString()}</p>
        </div>
      </div>

      {returns?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 rounded-xl">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((ret, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ret.month)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{parseFloat(ret.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">{ret.type?.replace('_', ' ') || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ret.paidOn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {ret.paidOn ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FiDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No returns found</p>
        </div>
      )}
    </div>
  );
};

const DocumentsTab = ({ documents }) => {
  const getFileIcon = (path) => {
    if (!path) return <FiFile className="text-gray-400" />;
    if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return <FiImage className="text-blue-500" />;
    if (path.match(/\.pdf$/i)) return <FiFile className="text-red-500" />;
    return <FiFile className="text-gray-400" />;
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents?.length > 0 ? (
          documents.map((doc, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(doc.filePath)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm truncate max-w-[150px]">
                      {doc.title || doc.type}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{doc.type}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Uploaded
                </span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  <FiEye className="w-3.5 h-3.5" /> View
                </a>
                <a href={doc.filePath} download className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
                  <FiDownload className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryTab = ({ user }) => (
  <div className="space-y-4">
    <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/30 rounded-r-lg">
      <p className="text-sm text-gray-600">Created: <span className="font-medium">{formatDate(user.createdAt)}</span></p>
      <p className="text-sm text-gray-600">Last Updated: <span className="font-medium">{formatDate(user.updatedAt)}</span></p>
    </div>
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
        <FiActivity className="text-blue-500" />
        Activity Log
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">User registered</span>
          <span className="text-gray-400 ml-auto">{formatDate(user.createdAt)}</span>
        </div>
        {user.investments?.map((inv, index) => (
          <div key={index} className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Investment of ₹{parseFloat(inv.amount).toLocaleString()} in {inv.plan?.name || 'N/A'}</span>
            <span className="text-gray-400 ml-auto">{formatDate(inv.investmentDate)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================
// Detail Item Component
// ============================================================
const DetailItem = ({ label, value, icon: Icon }) => {
  if (!value || value === 'N/A' || value === '' || value === 'Not provided') {
    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="flex-1">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm text-gray-400">Not provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
      {Icon && <Icon className="text-gray-400 mt-0.5 w-4 h-4" />}
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default UserDetails;