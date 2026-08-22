import React, { useState, useEffect, useRef, useCallback } from 'react';
import { returnApi } from '../../api/returnApi';
import { commissionApi } from '../../api/commissionApi';
import { userApi } from '../../api/userApi';
import { investmentApi } from '../../api/investmentApi';
import { offerApi } from '../../api/offerApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaCheckCircle, FaMoneyBillWave, FaTimes, FaWallet, FaHandshake, FaCalendarCheck, FaFileInvoice, FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import { debounce } from 'lodash';

// ---- Debounce helper (or use lodash) ----
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// ---- AutocompleteInput Component ----
const AutocompleteInput = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
  displayKey = 'fullName',
  searchKeys = ['fullName', 'email', 'phone', 'batchId'],
  error
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options?.find(opt => opt?.id === value);

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption[displayKey] || '');
    } else {
      setInputValue('');
    }
  }, [value, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length > 0) {
      const lower = val.toLowerCase();
      const filtered = options.filter(opt =>
        searchKeys.some(key =>
          opt[key] && opt[key].toString().toLowerCase().includes(lower)
        )
      );
      setFilteredOptions(filtered);
      setShowDropdown(true);
    } else {
      setFilteredOptions([]);
      setShowDropdown(false);
      onChange(null);
    }
  };

  const handleSelect = (option) => {
    setInputValue(option[displayKey] || '');
    setShowDropdown(false);
    onChange(option.id);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length > 0) {
              const lower = inputValue.toLowerCase();
              const filtered = options.filter(opt =>
                searchKeys.some(key =>
                  opt[key] && opt[key].toString().toLowerCase().includes(lower)
                )
              );
              setFilteredOptions(filtered);
              setShowDropdown(true);
            } else {
              setFilteredOptions(options);
              setShowDropdown(true);
            }
          }}
          className={`input-field w-full ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
        />
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map(opt => (
            <div
              key={opt.id}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
              onClick={() => handleSelect(opt)}
            >
              <div className="font-medium text-gray-800">{opt.fullName}</div>
              <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                <span>{opt.email}</span>
                {opt.phone && <span>· {opt.phone}</span>}
                {opt.batchId && <span>· {opt.batchId}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================
const ReturnsAndCommissions = () => {
  // --- Tab State ---
  const TAB_ALL_RETURNS = 'all-returns';
  const TAB_PENDING_RETURNS = 'pending-returns';
  const TAB_ALL_COMMISSIONS = 'all-commissions';
  const TAB_PENDING_COMMISSIONS = 'pending-commissions';

  const [activeTab, setActiveTab] = useState(TAB_ALL_RETURNS);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // ---- Shared state for users, investments, offers, partners ----
  const [users, setUsers] = useState([]);
  const [allInvestments, setAllInvestments] = useState([]);
  const [offers, setOffers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);

  // ---- Returns state ----
  const [returns, setReturns] = useState([]);
  const [returnPagination, setReturnPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [allReturnsCount, setAllReturnsCount] = useState(0);
  const [pendingReturnsCount, setPendingReturnsCount] = useState(0);
  const [returnSearch, setReturnSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const debouncedReturnSearch = useDebounce(returnSearch, 400);

  // ---- Commissions state ----
  const [commissions, setCommissions] = useState([]);
  const [commissionPagination, setCommissionPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [commissionSearch, setCommissionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedCommissionSearch = useDebounce(commissionSearch, 400);

  // ---- Modals ----
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
    paidOn: '',
    status: 'pending',
    roi: ''
  });
  const [userError, setUserError] = useState('');
  const [investmentError, setInvestmentError] = useState('');

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
  const [partnerError, setPartnerError] = useState('');
  const [showCommissionDetails, setShowCommissionDetails] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);

  // ---- Determine if we are in a pending tab ----
  const isPendingReturnsTab = activeTab === TAB_PENDING_RETURNS;
  const isPendingCommissionsTab = activeTab === TAB_PENDING_COMMISSIONS;

  // ---- Fetch initial data ----
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [usersRes, investmentsRes, offersRes, partnersRes] = await Promise.all([
          adminApi.getUsersDropdown(),
          investmentApi.getAll({ limit: 1000 }),
          offerApi.getAll(),
          adminApi.getUsersDropdown(),
        ]);
        if (usersRes.success) setUsers(usersRes.data.users || []);
        if (investmentsRes.success) setAllInvestments(investmentsRes.data.investments || []);
        if (offersRes.success) setOffers(offersRes.data || []);
        if (partnersRes.success) {
          const all = partnersRes.data.users || [];
          setPartners(all.filter(u => u.partnerType !== 'none'));
        }
      } catch (error) {
        console.error('Initial data fetch error:', error);
      }
    };
    fetchInitial();
  }, []);

  // ---- Fetch returns when tab, page, search, or type changes ----
  useEffect(() => {
    if (activeTab === TAB_ALL_RETURNS || activeTab === TAB_PENDING_RETURNS) {
      fetchReturns();
    }
  }, [activeTab, returnPagination.page, debouncedReturnSearch, typeFilter]);

  // ---- Fetch commissions when tab, page, search, or status changes ----
  useEffect(() => {
    if (activeTab === TAB_ALL_COMMISSIONS || activeTab === TAB_PENDING_COMMISSIONS) {
      fetchCommissions();
    }
  }, [activeTab, commissionPagination.page, debouncedCommissionSearch, statusFilter]);

  // ---- Filter investments when user changes ----
  useEffect(() => {
    if (returnFormData.userId) {
      const filtered = allInvestments.filter(inv => inv.userId === returnFormData.userId);
      setFilteredInvestments(filtered);
      if (!filtered.find(inv => inv.id === returnFormData.investmentId)) {
        setReturnFormData(prev => ({ ...prev, investmentId: '' }));
      }
    } else {
      setFilteredInvestments([]);
      setReturnFormData(prev => ({ ...prev, investmentId: '' }));
    }
  }, [returnFormData.userId, allInvestments]);

  // ==================== FETCH FUNCTIONS ====================
  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsersDropdown();
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await adminApi.getUsersDropdown();
      if (response.success) {
        const all = response.data.users || [];
        const partnersList = all.filter(user => user.partnerType !== 'none');
        setPartners(partnersList);
      }
    } catch (error) {
      console.error('Failed to fetch partners');
    }
  };

  const fetchAllInvestments = async () => {
    try {
      const response = await investmentApi.getAll({ limit: 1000 });
      if (response.success) {
        setAllInvestments(response.data.investments || []);
      }
    } catch (error) {
      console.error('Failed to fetch investments');
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await offerApi.getAll();
      if (response.success) {
        setOffers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch offers');
    }
  };

  // ---- Fetch all returns data to calculate counts ----
  const fetchAllReturnsData = async () => {
    try {
      // Fetch all returns with a large limit to get all data
      const response = await returnApi.getAll({
        limit: returnPagination.limit,
        offset: returnPagination.page
      });

      if (response.success) {
        const allReturns = response.data.returns || [];

        // Calculate counts from the data
        setAllReturnsCount(allReturns.length);

        // Count pending returns (where paidOn is null or empty)
        const pendingCount = allReturns.filter(ret => !ret.paidOn).length;
        setPendingReturnsCount(pendingCount);

        // Set the returns for the current tab
        if (isPendingReturnsTab) {
          const pendingReturns = allReturns.filter(ret => !ret.paidOn);
          setReturns(pendingReturns);
          setReturnPagination({
            total: pendingReturns.length,
            page: 1,
            limit: 20,
            totalPages: Math.ceil(pendingReturns.length / 20)
          });
        } else {
          setReturns(allReturns);
          setReturnPagination({
            total: allReturns.length,
            page: 1,
            limit: 20,
            totalPages: Math.ceil(allReturns.length / 20)
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch returns data:', error);
      toast.error('Failed to fetch returns data');
    }
  };

  // ---- Returns fetch with pagination ----
  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const page = returnPagination.page;
      const limit = returnPagination.limit;
      const offset = (page - 1) * limit;

      const params = {
        offset,
        limit,
        type: typeFilter || undefined,
        search: debouncedReturnSearch || undefined,
      };

      // If pending tab, we use the status filter on backend (assuming backend supports status)
      if (isPendingReturnsTab) {
        params.status = 'pending'; // if backend supports filtering by status
        if (isPendingReturnsTab) {
          // filteredReturns = allReturns.filter(ret => !ret.paidOn);
          // totalCount = filteredReturns.length;
        }
      }

      const response = await returnApi.getAll(params);
      if (response.success) {
        const { total, limit: resLimit, page: resPage } = response.data.pagination;
        setReturns(response.data.returns || []);
        setReturnPagination({
          total,
          page: resPage || page,
          limit: resLimit,
          totalPages: Math.ceil(total / resLimit),
        });
      } else {
        toast.error(response.message || 'Failed to fetch returns');
      }
    } catch (error) {
      console.error('fetchReturns error:', error);
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  }, [returnPagination.page, returnPagination.limit, typeFilter, debouncedReturnSearch, isPendingReturnsTab]);


  // ---- Commissions fetch with filters ----
  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const page = commissionPagination.page;
      const limit = commissionPagination.limit;
      const offset = (page - 1) * limit;

      const params = {
        offset,
        limit,
        search: commissionSearch || undefined,
        status: statusFilter || undefined,
      };

      if (isPendingCommissionsTab) {
        params.status = 'pending';
      }

      const response = await commissionApi.getAll(params);
      if (response.success) {
        const { total, limit: resLimit, page: resPage } = response.data.pagination;
        const totalPages = Math.ceil(total / resLimit);
        setCommissions(response.data.commissions || []);
        setCommissionPagination({
          total,
          page: resPage || page,
          limit: resLimit,
          totalPages,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch referral payouts');
    } finally {
      setLoading(false);
    }
  }, [commissionPagination.page, commissionPagination.limit, statusFilter, debouncedCommissionSearch, isPendingCommissionsTab]);

  // ---- Search handlers ----
  const handleReturnSearch = () => {
    setReturnPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCommissionSearch = () => {
    setCommissionPagination(prev => ({ ...prev, page: 1 }));
  };

  // ==================== RETURN CRUD ====================
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setUserError('');
    setInvestmentError('');

    if (!returnFormData.userId) {
      setUserError('Please select a user');
      return;
    }
    if (!returnFormData.investmentId) {
      setInvestmentError('Please select an investment');
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
        paidOn: returnFormData.paidOn || null,
      };

      // ✅ Include ROI only if provided
      if (returnFormData.roi !== '') {
        payload.ROI = parseFloat(returnFormData.roi);
      }
      if (editingReturn) {
        payload.status = returnFormData.status || 'pending';
      }
      let response;
      if (editingReturn) {
        response = await returnApi.update(editingReturn.id, payload);
        if (response.success) toast.success('Return updated successfully');
      } else {
        response = await returnApi.createReturns(payload);
        if (response.success) toast.success('Return created successfully');
      }

      if (response.success) {
        setShowReturnModal(false);
        resetReturnForm();
        setReturnPagination(prev => ({ ...prev, page: 1 }));
        // Refresh counts and data
        await fetchAllReturnsData();
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
      paidOn: returnItem.paidOn ? returnItem.paidOn.split('T')[0] : '',
      status: returnItem.status || 'pending',
      roi: returnItem.ROI || ''
    });
    setShowReturnModal(true);
  };

  const handleDeleteReturn = async (id) => {
    if (!window.confirm('Are you sure you want to delete this return?')) return;
    try {
      const response = await returnApi.delete(id);
      if (response.success) {
        toast.success('Return deleted successfully');
        setReturnPagination(prev => ({ ...prev, page: 1 }));
        await fetchAllReturnsData();
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
        await fetchAllReturnsData();
        fetchReturns();
      }
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const handleBatchMarkReturnPaid = async () => {
    const pendingReturns = returns.filter(r => !r.paidOn);
    if (pendingReturns.length === 0) {
      toast.error('No pending returns to mark as paid');
      return;
    }
    const ids = pendingReturns.map(r => r.id);
    try {
      const response = await returnApi.batchMarkAsPaid(ids);
      if (response.success) {
        toast.success(`${response.data.updated} returns marked as paid`);
        await fetchAllReturnsData();
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
      paidOn: '',
      status: 'pending',
      roi: '',
    });
    setFilteredInvestments([]);
    setEditingReturn(null);
    setUserError('');
    setInvestmentError('');
  };

  // ==================== COMMISSION CRUD ====================
  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    setPartnerError('');

    if (!commissionFormData.partnerId) {
      setPartnerError('Please select a partner');
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
      toast.error('Please enter a valid referral payout rate');
      return;
    }
    if (!commissionFormData.commissionAmount || parseFloat(commissionFormData.commissionAmount) <= 0) {
      toast.error('Please enter a valid referral payout amount');
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
        if (response.success) toast.success('Commission updated successfully');
      } else {
        response = await commissionApi.createCommissions(payload);
        if (response.success) toast.success('Commission created successfully');
      }

      if (response.success) {
        setShowCommissionModal(false);
        resetCommissionForm();
        setCommissionPagination(prev => ({ ...prev, page: 1 }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save referral payout');
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
    if (!window.confirm('Are you sure you want to delete this referral payout?')) return;
    try {
      const response = await commissionApi.delete(id);
      if (response.success) {
        toast.success('Commission deleted successfully');
        setCommissionPagination(prev => ({ ...prev, page: 1 }));
      }
    } catch (error) {
      toast.error('Failed to delete referral payout');
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
    const pendingCommissions = commissions.filter(c => c.status === 'pending');
    if (pendingCommissions.length === 0) {
      toast.error('No pending referral payouts to mark as paid');
      return;
    }
    const ids = pendingCommissions.map(c => c.id);
    try {
      const response = await commissionApi.batchMarkAsPaid(ids);
      if (response.success) {
        toast.success(`${response.data.updated} referral payouts marked as paid`);
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
    setPartnerError('');
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

  // ==================== RENDER HELPERS ====================
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
              <AutocompleteInput
                label="User"
                placeholder="Type to search user..."
                options={users}
                value={returnFormData.userId}
                onChange={(id) => setReturnFormData({ ...returnFormData, userId: id })}
                required
                error={userError}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment <span className="text-red-500">*</span>
              </label>
              <select
                value={returnFormData.investmentId}
                onChange={(e) => setReturnFormData({ ...returnFormData, investmentId: e.target.value })}
                className={`input-field w-full ${investmentError ? 'border-red-500' : ''}`}
                required
                disabled={!returnFormData.userId || !!editingReturn} // ✅ disabled when editing
              >
                <option value="">Select Investment</option>
                {filteredInvestments.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    ₹{parseFloat(inv.amount).toLocaleString()} - {inv.plan?.name || 'N/A'} (ID: {inv.id})
                  </option>
                ))}
              </select>
              {investmentError && <p className="mt-1 text-xs text-red-600">{investmentError}</p>}
              {returnFormData.userId && filteredInvestments.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">No investments found for this user</p>
              )}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ROI (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={returnFormData.roi}
                onChange={(e) => setReturnFormData({ ...returnFormData, roi: e.target.value })}
                className="input-field w-full"
                placeholder="e.g., 2.5"
                min="0"
                step="0.01"
                required={!!editingReturn} // optional: make required only when editing
              />
            </div>
            {/* Status dropdown – only when editing */}
            {editingReturn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={returnFormData.status}
                  onChange={(e) => setReturnFormData({ ...returnFormData, status: e.target.value })}
                  className="input-field w-full"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}

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
        </form>      </div>
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
              <AutocompleteInput
                label="Partner"
                placeholder="Type to search partner..."
                options={partners}
                value={commissionFormData.partnerId}
                onChange={(id) => setCommissionFormData({ ...commissionFormData, partnerId: id })}
                required
                error={partnerError}
              />
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
                  {new Date(selectedCommission.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
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
            placeholder="Search returns by user or investment ID..."
            className="flex-1"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setReturnPagination(prev => ({ ...prev, page: 1 }));
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
        {isPendingReturnsTab && (
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
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investment ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investment Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Month</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ROI</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    {isPendingReturnsTab ? 'No pending returns found' : 'No returns found'}
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{ret.user?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{ret.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{ret.user?.batchId || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">#{ret.investmentId || 'N/A'}</div>
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
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${renderReturnTypeBadge(ret.type)}`}>
                        {ret.ROI != null ? `${parseFloat(ret.ROI)}%` : '-'}
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
          onPageChange={(page) => setReturnPagination(prev => ({ ...prev, page }))}
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
            placeholder="Search referral payouts by partner..."
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCommissionPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-field max-w-xs"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        {isPendingCommissionsTab && (
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
        )}
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
                    {isPendingCommissionsTab ? 'No pending payouts found' : 'No payouts found'}
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
          onPageChange={(page) => setCommissionPagination(prev => ({ ...prev, page }))}
        />
      )}
    </>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab(TAB_ALL_RETURNS)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === TAB_ALL_RETURNS
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <FaWallet className="w-4 h-4" />
            All Returns
            <span className="bg-gray-100 text-gray-600 ml-2 px-2 py-0.5 rounded-full text-xs">
              {allReturnsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab(TAB_PENDING_RETURNS)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === TAB_PENDING_RETURNS
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <FaCalendarCheck className="w-4 h-4" />
            Pending Returns
            <span className="bg-gray-100 text-gray-600 ml-2 px-2 py-0.5 rounded-full text-xs">
            {returnPagination.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab(TAB_ALL_COMMISSIONS)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === TAB_ALL_COMMISSIONS
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <FaHandshake className="w-4 h-4" />
            All Partner Payouts
            <span className="bg-gray-100 text-gray-600 ml-2 px-2 py-0.5 rounded-full text-xs">
              {commissionPagination.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab(TAB_PENDING_COMMISSIONS)}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === TAB_PENDING_COMMISSIONS
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <FaMoneyBillWave className="w-4 h-4" />
            Pending Partner Payouts
            <span className="bg-gray-100 text-gray-600 ml-2 px-2 py-0.5 rounded-full text-xs">
              {commissionPagination.total}
            </span>
          </button>
        </nav>
      </div>

      <div>
        {(activeTab === TAB_ALL_RETURNS || activeTab === TAB_PENDING_RETURNS)
          ? renderReturnTable()
          : renderCommissionTable()}
      </div>

      {showReturnModal && renderReturnModal()}
      {showCommissionModal && renderCommissionModal()}
      {showCommissionDetails && renderCommissionDetailsModal()}
    </div>
  );
};

export default ReturnsAndCommissions;