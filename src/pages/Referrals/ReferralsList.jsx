import React, { useState, useEffect } from 'react';
import { referralApi } from '../../api/referralApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaEye, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReferralsList = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, [pagination.page, search]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const response = await referralApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Referrals</h2>
        <div className="text-sm text-gray-500">
          Total: {pagination.total} referrals
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search referrals..."
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Referrer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Referred User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reward Points</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reward Type</th>
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
                    <td className="py-3 px-4 text-sm">{ref.referrer?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">{ref.referredUser?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">
                      ₹{parseFloat(ref.investmentAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{ref.rewardPoints || 0}</td>
                    <td className="py-3 px-4 text-sm capitalize">{ref.rewardType}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedReferral(ref);
                            setShowDetails(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(ref.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
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

      {/* Referral Details Modal */}
      {showDetails && selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Referral Details</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedReferral(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Referrer</p>
                <p className="font-medium">{selectedReferral.referrer?.fullName}</p>
                <p className="text-sm text-gray-500">{selectedReferral.referrer?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Referred User</p>
                <p className="font-medium">{selectedReferral.referredUser?.fullName}</p>
                <p className="text-sm text-gray-500">{selectedReferral.referredUser?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Investment Amount</p>
                <p className="font-medium">₹{parseFloat(selectedReferral.investmentAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reward</p>
                <p className="font-medium">
                  {selectedReferral.rewardPoints} points ({selectedReferral.rewardType})
                </p>
              </div>
              {selectedReferral.offer && (
                <div>
                  <p className="text-sm text-gray-500">Applied Offer</p>
                  <p className="font-medium">{selectedReferral.offer.title}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(selectedReferral.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralsList;