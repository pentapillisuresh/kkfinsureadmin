import React, { useState, useEffect } from 'react';
import { returnApi } from '../../api/returnApi';
import { commissionApi } from '../../api/commissionApi';
import { userApi } from '../../api/userApi';
import { investmentApi } from '../../api/investmentApi';
import { offerApi } from '../../api/offerApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FaCheckCircle, 
  FaMoneyBillWave, 
  FaTimes, 
  FaWallet, 
  FaHandshake,
  FaCalendarCheck,
  FaFileInvoice,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReturnsAndCommissions = () => {
  const [activeTab, setActiveTab] = useState('returns');
  const [loading, setLoading] = useState(true);
  
  // Returns state
  const [returns, setReturns] = useState([]);
  const [returnPagination, setReturnPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [returnSearch, setReturnSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [editingReturn, setEditingReturn] = useState(null);
  const [returnFormData, setReturnFormData] = useState({
    userId: '',
    investmentId: '',
    offerId: '',
    month: '',
    amount: '',
    type: 'monthly',
    description: '',
    paidOn: ''
  });
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [offers, setOffers] = useState([]);
  
  // Commissions state
  const [commissions, setCommissions] = useState([]);
  const [commissionPagination, setCommissionPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [commissionSearch, setCommissionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [commissionFormData, setCommissionFormData] = useState({
    partnerId: '',
    month: '',
    totalInvestmentBase: '',
    commissionRate: '',
    commissionAmount: '',
    paidOn: '',
    status: 'pending'
  });
  const [partners, setPartners] = useState([]);
  const [showCommissionDetails, setShowCommissionDetails] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchInvestments();
    fetchOffers();
    fetchPartners();
  }, []);

  useEffect(() => {
    if (activeTab === 'returns') {
      fetchReturns();
    } else {
      fetchCommissions();
    }
  }, [activeTab, returnPagination.page, typeFilter, commissionPagination.page, statusFilter]);

  // ==================== FETCH FUNCTIONS ====================
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

  const fetchPartners = async () => {
    try {
      const response = await userApi.getPartners({ limit: 1000 });
      if (response.success) {
        setPartners(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch partners');
    }
  };

  const fetchInvestments = async () => {
    try {
      const response = await investmentApi.getAll({ limit: 1000 });
      if (response.success) {
        setInvestments(response.data.investments);
      }
    } catch (error) {
      console.error('Failed to fetch investments');
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await offerApi.getAll({ limit: 1000 });
      if (response.success) {
        setOffers(response.data.offers);
      }
    } catch (error) {
      console.error('Failed to fetch offers');
    }
  };

  // ==================== RETURNS FUNCTIONS ====================
  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await returnApi.getAll({
        page: returnPagination.page,
        limit: returnPagination.limit,
        type: typeFilter || undefined,
        search: returnSearch || undefined
      });
      if (response.success) {
        setReturns(response.data.returns);
        setReturnPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSearch = () => {
    setReturnPagination({ ...returnPagination, page: 1 });
    fetchReturns();
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!returnFormData.userId) {
      toast.error('Please select a user');
      return;
    }
    if (!returnFormData.investmentId) {
      toast.error('Please select an investment');
      return;
    }
    if (!returnFormData.month) {
      toast.error('Please select month');
      return;
    }
    if (!returnFormData.amount || parseFloat(returnFormData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const payload = {
        userId: returnFormData.userId,
        investmentId: returnFormData.investmentId,
        offerId: returnFormData.offerId || null,
        month: returnFormData.month,
        amount: parseFloat(returnFormData.amount),
        type: returnFormData.type,
        description: returnFormData.description || null,
        paidOn: returnFormData.paidOn || null
      };

      let response;
      if (editingReturn) {
        response = await returnApi.update(editingReturn.id, payload);
        if (response.success) {
          toast.success('Return updated successfully');
        }
      } else {
        response = await returnApi.create(payload);
        if (response.success) {
          toast.success('Return created successfully');
        }
      }

      if (response.success) {
        setShowReturnModal(false);
        resetReturnForm();
        fetchReturns();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save return');
    }
  };

  const handleEditReturn = (returnItem) => {
    setEditingReturn(returnItem);
    setReturnFormData({
      userId: returnItem.userId,
      investmentId: returnItem.investmentId,
      offerId: returnItem.offerId || '',
      month: returnItem.month ? returnItem.month.split('T')[0] : '',
      amount: returnItem.amount,
      type: returnItem.type,
      description: returnItem.description || '',
      paidOn: returnItem.paidOn ? returnItem.paidOn.split('T')[0] : ''
    });
    setShowReturnModal(true);
  };

  const handleDeleteReturn = async (id) => {
    if (!window.confirm('Are you sure you want to delete this return?')) return;
    try {
      const response = await returnApi.delete(id);
      if (response.success) {
        toast.success('Return deleted successfully');
        fetchReturns();
      }
    } catch (error) {
      toast.error('Failed to delete return');
    }
  };

  const handleMarkReturnAsPaid = async (id) => {
    try {
      const response = await returnApi.markAsPaid(id);
      if (response.success) {
        toast.success('Return marked as paid');
        fetchReturns();
      }
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const handleBatchMarkReturnPaid = async () => {
    const ids = returns.filter(r => !r.paidOn).map(r => r.id);
    if (ids.length === 0) {
      toast.error('No pending returns to mark as paid');
      return;
    }
    try {
      const response = await returnApi.batchMarkAsPaid(ids);
      if (response.success) {
        toast.success(`${response.data.updated} returns marked as paid`);
        fetchReturns();
      }
    } catch (error) {
      toast.error('Failed to batch mark as paid');
    }
  };

  const resetReturnForm = () => {
    setReturnFormData({
      userId: '',
      investmentId: '',
      offerId: '',
      month: '',
      amount: '',
      type: 'monthly',
      description: '',
      paidOn: ''
    });
    setEditingReturn(null);
  };

  // ==================== COMMISSIONS FUNCTIONS ====================
  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await commissionApi.getAll({
        page: commissionPagination.page,
        limit: commissionPagination.limit,
        status: statusFilter || undefined,
        search: commissionSearch || undefined
      });
      if (response.success) {
        setCommissions(response.data.commissions);
        setCommissionPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCommissionSearch = () => {
    setCommissionPagination({ ...commissionPagination, page: 1 });
    fetchCommissions();
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!commissionFormData.partnerId) {
      toast.error('Please select a partner');
      return;
    }
    if (!commissionFormData.month) {
      toast.error('Please select month');
      return;
    }
    if (!commissionFormData.totalInvestmentBase || parseFloat(commissionFormData.totalInvestmentBase) <= 0) {
      toast.error('Please enter a valid investment base');
      return;
    }
    if (!commissionFormData.commissionRate || parseFloat(commissionFormData.commissionRate) <= 0) {
      toast.error('Please enter a valid commission rate');
      return;
    }
    if (!commissionFormData.commissionAmount || parseFloat(commissionFormData.commissionAmount) <= 0) {
      toast.error('Please enter a valid commission amount');
      return;
    }

    try {
      const payload = {
        partnerId: commissionFormData.partnerId,
        month: commissionFormData.month,
        totalInvestmentBase: parseFloat(commissionFormData.totalInvestmentBase),
        commissionRate: parseFloat(commissionFormData.commissionRate),
        commissionAmount: parseFloat(commissionFormData.commissionAmount),
        status: commissionFormData.status,
        paidOn: commissionFormData.paidOn || null
      };

      let response;
      if (editingCommission) {
        response = await commissionApi.update(editingCommission.id, payload);
        if (response.success) {
          toast.success('Commission updated successfully');
        }
      } else {
        response = await commissionApi.create(payload);
        if (response.success) {
          toast.success('Commission created successfully');
        }
      }

      if (response.success) {
        setShowCommissionModal(false);
        resetCommissionForm();
        fetchCommissions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save commission');
    }
  };

  const handleEditCommission = (commission) => {
    setEditingCommission(commission);
    setCommissionFormData({
      partnerId: commission.partnerId,
      month: commission.month,
      totalInvestmentBase: commission.totalInvestmentBase,
      commissionRate: commission.commissionRate,
      commissionAmount: commission.commissionAmount,
      status: commission.status,
      paidOn: commission.paidOn ? commission.paidOn.split('T')[0] : ''
    });
    setShowCommissionModal(true);
  };

  const handleDeleteCommission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this commission?')) return;
    try {
      const response = await commissionApi.delete(id);
      if (response.success) {
        toast.success('Commission deleted successfully');
        fetchCommissions();
      }
    } catch (error) {
      toast.error('Failed to delete commission');
    }
  };

  const handleMarkCommissionAsPaid = async (id) => {
    try {
      const response = await commissionApi.markAsPaid(id);
      if (response.success) {
        toast.success('Commission marked as paid');
        fetchCommissions();
      }
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const handleBatchMarkCommissionPaid = async () => {
    const ids = commissions.filter(c => c.status === 'pending').map(c => c.id);
    if (ids.length === 0) {
      toast.error('No pending commissions to mark as paid');
      return;
    }
    try {
      const response = await commissionApi.batchMarkAsPaid(ids);
      if (response.success) {
        toast.success(`${response.data.updated} commissions marked as paid`);
        fetchCommissions();
      }
    } catch (error) {
      toast.error('Failed to batch mark as paid');
    }
  };

  const resetCommissionForm = () => {
    setCommissionFormData({
      partnerId: '',
      month: '',
      totalInvestmentBase: '',
      commissionRate: '',
      commissionAmount: '',
      status: 'pending',
      paidOn: ''
    });
    setEditingCommission(null);
  };

  const handleViewCommissionDetails = (commission) => {
    setSelectedCommission(commission);
    setShowCommissionDetails(true);
  };

  // Auto-calculate commission amount
  useEffect(() => {
    if (commissionFormData.totalInvestmentBase && commissionFormData.commissionRate) {
      const base = parseFloat(commissionFormData.totalInvestmentBase);
      const rate = parseFloat(commissionFormData.commissionRate);
      if (!isNaN(base) && !isNaN(rate) && base > 0 && rate > 0) {
        const amount = (base * rate) / 100;
        setCommissionFormData(prev => ({
          ...prev,
          commissionAmount: amount.toFixed(2)
        }));
      }
    }
  }, [commissionFormData.totalInvestmentBase, commissionFormData.commissionRate]);

  // ==================== RENDER FUNCTIONS ====================
  const renderReturnTypeBadge = (type) => {
    const colors = {
      'monthly': 'bg-blue-100 text-blue-800',
      'annual_bonus': 'bg-green-100 text-green-800',
      'quarterly_senior': 'bg-purple-100 text-purple-800',
      'offer': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const renderCommissionStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // ==================== MODALS ====================
  const renderReturnModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingReturn ? 'Edit Return' : 'Create New Return'}
            </h3>
            <button
              onClick={() => {
                setShowReturnModal(false);
                resetReturnForm();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-500 w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User <span className="text-red-500">*</span>
              </label>
              <select
                value={returnFormData.userId}
                onChange={(e) => setReturnFormData({ ...returnFormData, userId: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment <span className="text-red-500">*</span>
              </label>
              <select
                value={returnFormData.investmentId}
                onChange={(e) => setReturnFormData({ ...returnFormData, investmentId: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">Select Investment</option>
                {investments
                  .filter(inv => !returnFormData.userId || inv.userId === returnFormData.userId)
                  .map(inv => (
                    <option key={inv.id} value={inv.id}>
                      ₹{parseFloat(inv.amount).toLocaleString()} - {inv.type}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={returnFormData.month}
                onChange={(e) => setReturnFormData({ ...returnFormData, month: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={returnFormData.amount}
                onChange={(e) => setReturnFormData({ ...returnFormData, amount: e.target.value })}
                className="input-field w-full"
                placeholder="Enter return amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={returnFormData.type}
                onChange={(e) => setReturnFormData({ ...returnFormData, type: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="annual_bonus">Annual Bonus</option>
                <option value="quarterly_senior">Quarterly Senior</option>
                <option value="offer">Offer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer (Optional)
              </label>
              <select
                value={returnFormData.offerId}
                onChange={(e) => setReturnFormData({ ...returnFormData, offerId: e.target.value })}
                className="input-field w-full"
              >
                <option value="">No Offer</option>
                {offers.map(offer => (
                  <option key={offer.id} value={offer.id}>
                    {offer.title} - {offer.rewardType}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={returnFormData.description}
                onChange={(e) => setReturnFormData({ ...returnFormData, description: e.target.value })}
                className="input-field w-full"
                rows="2"
                placeholder="Add description or notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid On (Optional)
              </label>
              <input
                type="datetime-local"
                value={returnFormData.paidOn}
                onChange={(e) => setReturnFormData({ ...returnFormData, paidOn: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowReturnModal(false);
                resetReturnForm();
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editingReturn ? 'Update Return' : 'Create Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCommissionModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingCommission ? 'Edit Payouts' : 'Create New Payouts'}
            </h3>
            <button
              onClick={() => {
                setShowCommissionModal(false);
                resetCommissionForm();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-500 w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleCommissionSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner <span className="text-red-500">*</span>
              </label>
              <select
                value={commissionFormData.partnerId}
                onChange={(e) => setCommissionFormData({ ...commissionFormData, partnerId: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">Select Partner</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.fullName} ({partner.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={commissionFormData.month}
                onChange={(e) => setCommissionFormData({ ...commissionFormData, month: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Investment Base (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={commissionFormData.totalInvestmentBase}
                onChange={(e) => setCommissionFormData({ ...commissionFormData, totalInvestmentBase: e.target.value })}
                className="input-field w-full"
                placeholder="Sum of active investments"
                min="0"
                step="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={commissionFormData.commissionRate}
                onChange={(e) => setCommissionFormData({ ...commissionFormData, commissionRate: e.target.value })}
                className="input-field w-full"
                placeholder="e.g., 2.5"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={commissionFormData.commissionAmount}
                onChange={(e) => setCommissionFormData({ ...commissionFormData, commissionAmount: e.target.value })}
                className="input-field w-full"
                placeholder="Auto-calculated or manual entry"
                min="0"
                step="0.01"
                required
              />
              {commissionFormData.totalInvestmentBase && commissionFormData.commissionRate && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated: {(parseFloat(commissionFormData.totalInvestmentBase) * parseFloat(commissionFormData.commissionRate) / 100).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={commissionFormData.status}
                onChange={(e) => setCommissionFormData({ ...commissionFormData, status: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid On (Optional)
              </label>
              <input
                type="datetime-local"
                value={commissionFormData.paidOn}
                onChange={(e) => setCommissionFormData({ ...commissionFormData, paidOn: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCommissionModal(false);
                resetCommissionForm();
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editingCommission ? 'Update Payouts' : 'Create Payouts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCommissionDetailsModal = () => {
    if (!selectedCommission) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Commission Details
              </h3>
              <button
                onClick={() => {
                  setShowCommissionDetails(false);
                  setSelectedCommission(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-gray-500 w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Partner</p>
              <p className="font-medium text-gray-900">{selectedCommission.partner?.fullName}</p>
              <p className="text-sm text-gray-500">{selectedCommission.partner?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Month</p>
                <p className="font-medium">
                  {new Date(selectedCommission.month).toLocaleDateString('en-IN', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${renderCommissionStatusBadge(selectedCommission.status)}`}>
                  {selectedCommission.status}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Investment Base</p>
                  <p className="font-medium text-gray-900">
                    ₹{parseFloat(selectedCommission.totalInvestmentBase).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commission Rate</p>
                  <p className="font-medium text-gray-900">{selectedCommission.commissionRate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Commission Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{parseFloat(selectedCommission.commissionAmount).toLocaleString()}
              </p>
            </div>
            {selectedCommission.paidOn && (
              <div>
                <p className="text-sm text-gray-500">Paid On</p>
                <p className="font-medium">
                  {new Date(selectedCommission.paidOn).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==================== TABLE RENDER FUNCTIONS ====================
  const renderReturnTable = () => (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchBar
            value={returnSearch}
            onChange={setReturnSearch}
            onSearch={handleReturnSearch}
            placeholder="Search returns by user..."
            className="flex-1"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setReturnPagination({ ...returnPagination, page: 1 });
            }}
            className="input-field max-w-xs"
          >
            <option value="">All Types</option>
            <option value="monthly">Monthly</option>
            <option value="annual_bonus">Annual Bonus</option>
            <option value="quarterly_senior">Quarterly Senior</option>
            <option value="offer">Offer</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBatchMarkReturnPaid}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FaCheckCircle /> Batch Mark Paid
          </button>
          <button
            onClick={() => {
              resetReturnForm();
              setShowReturnModal(true);
            }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FaPlus /> Add Return
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Month</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
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
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No returns found
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{ret.user?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{ret.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      ₹{parseFloat(ret.investment?.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(ret.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">
                      ₹{parseFloat(ret.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${renderReturnTypeBadge(ret.type)}`}>
                        {ret.type?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ret.paidOn ? 'paid' : 'pending'} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {!ret.paidOn && (
                          <button
                            onClick={() => handleMarkReturnAsPaid(ret.id)}
                            className="btn-primary text-xs py-1 px-2"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleEditReturn(ret)}
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReturn(ret.id)}
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

      {returnPagination.totalPages > 1 && (
        <Pagination
          currentPage={returnPagination.page}
          totalPages={returnPagination.totalPages}
          onPageChange={(page) => setReturnPagination({ ...returnPagination, page })}
        />
      )}
    </>
  );

  const renderCommissionTable = () => (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchBar
            value={commissionSearch}
            onChange={setCommissionSearch}
            onSearch={handleCommissionSearch}
            placeholder="Search commissions by partner..."
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCommissionPagination({ ...commissionPagination, page: 1 });
            }}
            className="input-field max-w-xs"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBatchMarkCommissionPaid}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FaCheckCircle /> Batch Mark Paid
          </button>
          <button
            onClick={() => {
              resetCommissionForm();
              setShowCommissionModal(true);
            }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FaPlus /> Add Payouts
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Partner</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Month</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investment Base</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rate</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Commission</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
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
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No commissions found
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr key={comm.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{comm.partner?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{comm.partner?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(comm.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      ₹{parseFloat(comm.totalInvestmentBase || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {comm.commissionRate}%
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">
                      ₹{parseFloat(comm.commissionAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${renderCommissionStatusBadge(comm.status)}`}>
                        {comm.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCommissionDetails(comm)}
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        {comm.status === 'pending' && (
                          <button
                            onClick={() => handleMarkCommissionAsPaid(comm.id)}
                            className="btn-primary text-xs py-1 px-2"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleEditCommission(comm)}
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCommission(comm.id)}
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

      {commissionPagination.totalPages > 1 && (
        <Pagination
          currentPage={commissionPagination.page}
          totalPages={commissionPagination.totalPages}
          onPageChange={(page) => setCommissionPagination({ ...commissionPagination, page })}
        />
      )}
    </>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('returns')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'returns'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <FaWallet className="w-4 h-4" />
            Returns
            <span className="bg-gray-100 text-gray-600 ml-2 px-2 py-0.5 rounded-full text-xs">
              {returnPagination.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'commissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <FaHandshake className="w-4 h-4" />
            Partner Payouts
            <span className="bg-gray-100 text-gray-600 ml-2 px-2 py-0.5 rounded-full text-xs">
              {commissionPagination.total}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'returns' ? renderReturnTable() : renderCommissionTable()}
      </div>

      {/* Modals */}
      {showReturnModal && renderReturnModal()}
      {showCommissionModal && renderCommissionModal()}
      {showCommissionDetails && renderCommissionDetailsModal()}
    </div>
  );
};

export default ReturnsAndCommissions;