import React, { useState, useEffect, useRef } from 'react';
import { referralApi } from '../../api/referralApi';
import { userApi } from '../../api/userApi';
import { offerApi } from '../../api/offerApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaPlus, FaEye, FaTrash, FaTimes, FaUserPlus, FaGift, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';

// ---- Autocomplete Input Component ----
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

  // Find selected option to display its label
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
      // Clear selection if input cleared
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

// ---- Main Component ----
const ReferralsList = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [formData, setFormData] = useState({
    referrerId: '',
    referredUserId: '',
    investmentAmount: '',
    rewardPoints: 0,
    rewardValue: '',
    offerId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchReferrals();
    fetchUsers();
    fetchAllOffers();
  }, [pagination.page, search]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const response = await referralApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined
      });
      if (response.success) {
        setReferrals(response.data.referrals);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchAllOffers = async () => {
    try {
      const response = await offerApi.getAll({ isActive: true, limit: 100 });
      if (response.success) {
        setOffers(response.data.offers || []);
      }
    } catch (error) {
      console.error('Failed to fetch offers');
    }
  };

  // Filter offers when investment amount changes
  useEffect(() => {
    const amount = parseFloat(formData.investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setFilteredOffers([]);
      return;
    }
    const now = new Date();
    const applicable = offers.filter(o => {
      const conditions = o.conditions || {};
      // Check minInvestment
      if (conditions.minInvestment && amount < conditions.minInvestment) return false;
      // Check expiry
      if (conditions.expiryDate && new Date(conditions.expiryDate) < now) return false;
      return true;
    });
    setFilteredOffers(applicable);
  }, [formData.investmentAmount, offers]);

  // Compute rewardValue and rewardPoints when investmentAmount changes
  useEffect(() => {
    const amount = parseFloat(formData.investmentAmount);
    if (!isNaN(amount) && amount > 0) {
      const computed = amount / 100;
      setFormData(prev => ({
        ...prev,
        rewardValue: computed.toFixed(2),
        rewardPoints: Math.round(computed)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        rewardValue: '',
        rewardPoints: 0
      }));
    }
  }, [formData.investmentAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.referrerId) newErrors.referrerId = 'Please select a referrer';
    if (!formData.referredUserId) newErrors.referredUserId = 'Please select a referred user';
    if (formData.referrerId === formData.referredUserId) {
      newErrors.referredUserId = 'Referrer and referred user cannot be the same';
    }
    if (!formData.investmentAmount || parseFloat(formData.investmentAmount) <= 0) {
      newErrors.investmentAmount = 'Please enter a valid investment amount';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const payload = {
        referrerId: formData.referrerId,
        referredUserId: formData.referredUserId,
        investmentAmount: parseFloat(formData.investmentAmount),
        rewardPoints: formData.rewardPoints,
        rewardValue: formData.rewardValue,
        offerId: formData.offerId || null
      };

      const response = await referralApi.create(payload);
      if (response.success) {
        toast.success('Referral created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchReferrals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create referral');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this referral?')) return;
    try {
      const response = await referralApi.delete(id);
      if (response.success) {
        toast.success('Referral deleted successfully');
        fetchReferrals();
      }
    } catch (error) {
      toast.error('Failed to delete referral');
    }
  };

  const resetForm = () => {
    setFormData({
      referrerId: '',
      referredUserId: '',
      investmentAmount: '',
      rewardPoints: 0,
      rewardValue: '',
      offerId: ''
    });
    setFilteredOffers([]);
    setErrors({});
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchReferrals();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Referrals</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Total: {pagination.total} referrals
          </span>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FaUserPlus /> Create Referral
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          placeholder="Search by referrer or referred user..."
          className="flex-1"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Referrer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Referred User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reward</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Offer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No referrals found
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ref.referrer?.fullName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">{ref.referrer?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ref.referredUser?.fullName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">{ref.referredUser?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {ref.investmentAmount ?
                        `₹${parseFloat(ref.investmentAmount).toLocaleString()}` :
                        'N/A'
                      }
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {ref.offer ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs truncate max-w-[100px]">{ref.rewardPoints}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No offer</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {ref.offer ? (
                        <div className="flex items-center gap-1">
                          <FaGift className="text-purple-500 text-xs" />
                          <span className="text-xs truncate max-w-[100px]">{ref.offer.title}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No offer</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedReferral(ref);
                            setShowDetails(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ref.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Create Referral Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Referral
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="text-gray-500 w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <AutocompleteInput
                    label="Referrer"
                    placeholder="Type to search referrer..."
                    options={users}
                    value={formData.referrerId}
                    onChange={(id) => setFormData({ ...formData, referrerId: id })}
                    required
                    error={errors.referrerId}
                  />
                </div>
                <div>
                  <AutocompleteInput
                    label="Referred User"
                    placeholder="Type to search referred user..."
                    options={users}
                    value={formData.referredUserId}
                    onChange={(id) => setFormData({ ...formData, referredUserId: id })}
                    required
                    error={errors.referredUserId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                    className={`input-field w-full ${errors.investmentAmount ? 'border-red-500' : ''}`}
                    placeholder="e.g., 50000"
                    min="0"
                    step="1000"
                    required
                  />
                  {errors.investmentAmount && (
                    <p className="mt-1 text-xs text-red-600">{errors.investmentAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applied Offer (Optional)
                  </label>
                  <select
                    value={formData.offerId}
                    onChange={(e) => setFormData({ ...formData, offerId: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="">No Offer</option>
                    {filteredOffers.map(offer => (
                      <option key={offer.id} value={offer.id}>
                        {offer.title} - {offer.rewardType}
                      </option>
                    ))}
                  </select>
                  {filteredOffers.length === 0 && formData.investmentAmount && (
                    <p className="mt-1 text-xs text-gray-500">No offers match this investment amount</p>
                  )}
                </div>
              </div>

              {/* Computed Reward Fields (read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reward Value (Auto-computed)
                  </label>
                  <input
                    type="text"
                    value={formData.rewardValue || '0'}
                    readOnly
                    className="input-field w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reward Points (Auto-computed)
                  </label>
                  <input
                    type="text"
                    value={formData.rewardPoints || 0}
                    readOnly
                    className="input-field w-full bg-gray-100"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Referral Details Modal - unchanged */}
      {showDetails && selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Referral Details</h3>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedReferral(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes className="text-gray-500 w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Referrer</p>
                  <p className="font-medium text-gray-900">{selectedReferral.referrer?.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedReferral.referrer?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Referred User</p>
                  <p className="font-medium text-gray-900">{selectedReferral.referredUser?.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedReferral.referredUser?.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Investment Amount</p>
                    <p className="font-medium text-gray-900">
                      {selectedReferral.investmentAmount ?
                        `₹${parseFloat(selectedReferral.investmentAmount).toLocaleString()}` :
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reward Points</p>
                    <p className="font-medium text-gray-900">{selectedReferral.rewardPoints || 0}</p>
                  </div>
                </div>
              </div>

              {selectedReferral.offer && (
                <div>
                  <p className="text-sm text-gray-500">Applied Offer</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FaGift className="text-purple-500" />
                    <p className="font-medium">{selectedReferral.offer.title}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {new Date(selectedReferral.createdAt).toLocaleString('en-IN', {
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
      )}
    </div>
  );
};

export default ReferralsList;