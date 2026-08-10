import React, { useState, useEffect } from 'react';
import { balanceSheetApi } from '../../api/balanceSheetApi';
import { userApi } from '../../api/userApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FaDownload, 
  FaFileInvoice, 
  FaUser, 
  FaTimes, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChartLine
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const BalanceSheetsList = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    periodStart: '',
    periodEnd: '',
    totalInvestments: '',
    totalReturns: '',
    netWorth: '',
    generatedAt: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSheets();
    fetchUsers();
  }, [pagination.page]);

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const response = await balanceSheetApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined
      });
      if (response.success) {
        setSheets(response.data.balanceSheets);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch balance sheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll({ limit: 1000 });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchSheets();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.userId) {
      toast.error('Please select a user');
      return;
    }
    if (!formData.periodStart) {
      toast.error('Please select period start date');
      return;
    }
    if (!formData.periodEnd) {
      toast.error('Please select period end date');
      return;
    }
    if (new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      toast.error('Period start cannot be after period end');
      return;
    }

    try {
      const payload = {
        userId: formData.userId,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        totalInvestments: parseFloat(formData.totalInvestments) || 0,
        totalReturns: parseFloat(formData.totalReturns) || 0,
        netWorth: parseFloat(formData.netWorth) || 0,
        generatedAt: formData.generatedAt || new Date().toISOString()
      };

      let response;
      if (editingId) {
        response = await balanceSheetApi.update(editingId, payload);
        if (response.success) {
          toast.success('Balance sheet updated successfully');
        }
      } else {
        response = await balanceSheetApi.create(payload);
        if (response.success) {
          toast.success('Balance sheet created successfully');
        }
      }

      if (response.success) {
        setShowModal(false);
        resetForm();
        fetchSheets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save balance sheet');
    }
  };

  const handleEdit = (sheet) => {
    setEditingId(sheet.id);
    setFormData({
      userId: sheet.userId,
      periodStart: sheet.periodStart ? sheet.periodStart.split('T')[0] : '',
      periodEnd: sheet.periodEnd ? sheet.periodEnd.split('T')[0] : '',
      totalInvestments: sheet.totalInvestments,
      totalReturns: sheet.totalReturns,
      netWorth: sheet.netWorth,
      generatedAt: sheet.generatedAt ? sheet.generatedAt.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this balance sheet?')) return;
    try {
      const response = await balanceSheetApi.delete(id);
      if (response.success) {
        toast.success('Balance sheet deleted successfully');
        fetchSheets();
      }
    } catch (error) {
      toast.error('Failed to delete balance sheet');
    }
  };

  const handleViewDetails = (sheet) => {
    setSelectedSheet(sheet);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      periodStart: '',
      periodEnd: '',
      totalInvestments: '',
      totalReturns: '',
      netWorth: '',
      generatedAt: ''
    });
    setEditingId(null);
  };

  // Auto-calculate net worth
  useEffect(() => {
    if (formData.totalInvestments && formData.totalReturns) {
      const investments = parseFloat(formData.totalInvestments) || 0;
      const returns = parseFloat(formData.totalReturns) || 0;
      const netWorth = investments + returns;
      setFormData(prev => ({
        ...prev,
        netWorth: netWorth.toFixed(2)
      }));
    }
  }, [formData.totalInvestments, formData.totalReturns]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Render Create/Edit Modal
  const renderModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Balance Sheet' : 'Create Balance Sheet'}
            </h3>
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-500 w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generated At
              </label>
              <input
                type="datetime-local"
                value={formData.generatedAt}
                onChange={(e) => setFormData({ ...formData, generatedAt: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period Start <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period End <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Investments (₹)
              </label>
              <input
                type="number"
                value={formData.totalInvestments}
                onChange={(e) => setFormData({ ...formData, totalInvestments: e.target.value })}
                className="input-field w-full"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Returns (₹)
              </label>
              <input
                type="number"
                value={formData.totalReturns}
                onChange={(e) => setFormData({ ...formData, totalReturns: e.target.value })}
                className="input-field w-full"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Net Worth (₹) <span className="text-blue-500">(Auto-calculated)</span>
              </label>
              <input
                type="number"
                value={formData.netWorth}
                className="input-field w-full bg-gray-50"
                placeholder="Auto-calculated from investments + returns"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Net Worth = Total Investments + Total Returns
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editingId ? 'Update Balance Sheet' : 'Create Balance Sheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render Details Modal
  const renderDetailsModal = () => {
    if (!selectedSheet) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Balance Sheet Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSheet(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-gray-500 w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUser className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium text-gray-900">{selectedSheet.user?.fullName}</p>
                <p className="text-sm text-gray-500">{selectedSheet.user?.email}</p>
              </div>
            </div>

            {/* Period */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Period Start</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedSheet.periodStart).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period End</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedSheet.periodEnd).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-blue-600" />
                  <p className="text-sm text-gray-600">Total Investments</p>
                </div>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {formatCurrency(selectedSheet.totalInvestments)}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-green-600" />
                  <p className="text-sm text-gray-600">Total Returns</p>
                </div>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(selectedSheet.totalReturns)}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <FaFileInvoice className="text-purple-600" />
                  <p className="text-sm text-gray-600">Net Worth</p>
                </div>
                <p className="text-xl font-bold text-purple-600 mt-1">
                  {formatCurrency(selectedSheet.netWorth)}
                </p>
              </div>
            </div>

            {/* Generated Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Generated At</p>
              <p className="font-medium text-gray-900">
                {new Date(selectedSheet.generatedAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Balance Sheets</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Create Balance Sheet
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          placeholder="Search by user name or email..."
          className="flex-1"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Period</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investments</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Returns</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Net Worth</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Generated</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : sheets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No balance sheets found
                  </td>
                </tr>
              ) : (
                sheets.map((sheet) => (
                  <tr key={sheet.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{sheet.user?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{sheet.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span>
                          {new Date(sheet.periodStart).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short' 
                          })} - {new Date(sheet.periodEnd).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-blue-600 font-medium">
                      {formatCurrency(sheet.totalInvestments)}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-600 font-medium">
                      {formatCurrency(sheet.totalReturns)}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-purple-600">
                      {formatCurrency(sheet.netWorth)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(sheet.generatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(sheet)}
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(sheet)}
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sheet.id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      )}

      {/* Modals */}
      {showModal && renderModal()}
      {showDetailsModal && renderDetailsModal()}
    </div>
  );
};

export default BalanceSheetsList;