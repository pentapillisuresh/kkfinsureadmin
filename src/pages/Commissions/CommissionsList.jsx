import React, { useState, useEffect } from 'react';
import { commissionApi } from '../../api/partnerApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaCoins, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CommissionsList = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCommissions();
  }, [pagination.page, statusFilter]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await commissionApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setCommissions(response.data.commissions);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
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

  const handleBatchMarkPaid = async () => {
    const pendingIds = commissions.filter(c => c.status === 'pending').map(c => c.id);
    if (pendingIds.length === 0) {
      toast.error('No pending commissions to mark as paid');
      return;
    }
    try {
      const response = await commissionApi.batchMarkAsPaid({ ids: pendingIds });
      if (response.success) {
        toast.success(`${response.data.updated} commissions marked as paid`);
        fetchCommissions();
      }
    } catch (error) {
      toast.error('Failed to batch mark as paid');
    }
  };

  const handleProcessMonthly = async () => {
    try {
      const response = await commissionApi.processMonthly();
      if (response.success) {
        toast.success('Monthly commissions processed successfully');
        fetchCommissions();
      }
    } catch (error) {
      toast.error('Failed to process commissions');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Partner Commissions</h2>
        <div className="flex gap-2">
          <button
            onClick={handleProcessMonthly}
            className="btn-primary flex items-center gap-2"
          >
            <FaCoins /> Process Monthly
          </button>
          <button
            onClick={handleBatchMarkPaid}
            className="btn-secondary flex items-center gap-2"
          >
            <FaCheckCircle /> Batch Mark Paid
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search commissions..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
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
                    <td className="py-3 px-4 text-sm">{comm.partner?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">{new Date(comm.month).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm">
                      ₹{parseFloat(comm.totalInvestmentBase).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">{comm.commissionRate}%</td>
                    <td className="py-3 px-4 text-sm font-medium">
                      ₹{parseFloat(comm.commissionAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={comm.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {comm.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(comm.id)}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          Mark Paid
                        </button>
                      )}
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
    </div>
  );
};

export default CommissionsList;