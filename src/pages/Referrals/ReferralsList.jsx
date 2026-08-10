import React, { useState, useEffect } from 'react';
import { referralApi } from '../../api/referralApi';
import { userApi } from '../../api/userApi';
import { offerApi } from '../../api/offerApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaPlus, FaEye, FaTrash, FaTimes, FaUserPlus, FaGift } from 'react-icons/fa';
import toast from 'react-hot-toast';

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
  const [formData, setFormData] = useState({
    referrerId: '',
    referredUserId: '',
    investmentAmount: '',
    rewardPoints: 0,
    rewardType: 'points',
    rewardValue: '',
    offerId: ''
  });

  useEffect(() => {
    fetchReferrals();
    fetchUsers();
    fetchActiveOffers();
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
      const response = await userApi.getAll({ limit: 100 });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchActiveOffers = async () => {
    try {
      const response = await offerApi.getAll({ isActive: true, limit: 100 });
      if (response.success) {
        setOffers(response.data.offers);
      }
    } catch (error) {
      console.error('Failed to fetch offers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.referrerId || !formData.referredUserId) {
      toast.error('Please select both referrer and referred user');
      return;
    }
    if (formData.referrerId === formData.referredUserId) {
      toast.error('Referrer and referred user cannot be the same');
      return;
    }
    if (!formData.rewardType) {
      toast.error('Please select reward type');
      return;
    }
    if (!formData.rewardValue) {
      toast.error('Please enter reward value');
      return;
    }

    try {
      const payload = {
        referrerId: formData.referrerId,
        referredUserId: formData.referredUserId,
        investmentAmount: parseFloat(formData.investmentAmount) || 0,
        rewardPoints: parseInt(formData.rewardPoints) || 0,
        rewardType: formData.rewardType,
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
      rewardType: 'points',
      rewardValue: '',
      offerId: ''
    });
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchReferrals();
  };

  const getRewardTypeColor = (type) => {
    const colors = {
      'voucher': 'bg-purple-100 text-purple-800',
      'points': 'bg-blue-100 text-blue-800',
      'cashback': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRewardTypeColor(ref.rewardType)}`}>
                          {ref.rewardType}
                        </span>
                        <span className="text-sm font-medium">
                          {ref.rewardType === 'points' && `${ref.rewardPoints} pts`}
                          {ref.rewardType === 'voucher' && ref.rewardValue}
                          {ref.rewardType === 'cashback' && `₹${ref.rewardValue}`}
                        </span>
                      </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referrer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.referrerId}
                    onChange={(e) => setFormData({ ...formData, referrerId: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select Referrer</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referred User <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.referredUserId}
                    onChange={(e) => setFormData({ ...formData, referredUserId: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select Referred User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., 50000"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Points
                  </label>
                  <input
                    type="number"
                    value={formData.rewardPoints}
                    onChange={(e) => setFormData({ ...formData, rewardPoints: parseInt(e.target.value) || 0 })}
                    className="input-field w-full"
                    placeholder="e.g., 100"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.rewardType}
                    onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
                    className="input-field w-full"
                    required
                  >
                    <option value="points">Points</option>
                    <option value="voucher">Voucher</option>
                    <option value="cashback">Cashback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reward Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.rewardValue}
                    onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                    className="input-field w-full"
                    placeholder={formData.rewardType === 'cashback' ? '500' : 
                               formData.rewardType === 'voucher' ? 'Amazon voucher' : 
                               'e.g., 100'}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applied Offer (Optional)
                  </label>
                  <select
                    value={formData.offerId}
                    onChange={(e) => setFormData({ ...formData, offerId: e.target.value })}
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

      {/* Referral Details Modal */}
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

              <div>
                <p className="text-sm text-gray-500">Reward</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRewardTypeColor(selectedReferral.rewardType)}`}>
                    {selectedReferral.rewardType}
                  </span>
                  <span className="font-medium">
                    {selectedReferral.rewardType === 'cashback' && '₹'}
                    {selectedReferral.rewardValue}
                  </span>
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