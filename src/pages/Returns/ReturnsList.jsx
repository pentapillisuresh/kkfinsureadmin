import React, { useState, useEffect } from 'react';
import { returnApi } from '../../api/returnApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaCheckCircle, FaMoneyBillWave, FaCalendar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateData, setGenerateData] = useState({ month: '', year: '' });

  useEffect(() => {
    fetchReturns();
  }, [pagination.page, typeFilter]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await returnApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        type: typeFilter || undefined,
      });
      if (response.success) {
        setReturns(response.data.returns);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
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

  const handleBatchMarkPaid = async () => {
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateData.month || !generateData.year) {
      toast.error('Please select month and year');
      return;
    }
    const monthDate = `${generateData.year}-${String(generateData.month).padStart(2, '0')}-01`;
    try {
      const response = await returnApi.generateMonthly({ month: monthDate });
      if (response.success) {
        toast.success(`${response.data.generated} returns generated`);
        setShowGenerateModal(false);
        setGenerateData({ month: '', year: '' });
        fetchReturns();
      }
    } catch (error) {
      toast.error('Failed to generate returns');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Returns</h2>
        <div className="flex gap-2">
          <button
            onClick={handleBatchMarkPaid}
            className="btn-secondary flex items-center gap-2"
          >
            <FaCheckCircle /> Batch Mark Paid
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaMoneyBillWave /> Generate Returns
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search returns..."
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Types</option>
          <option value="monthly">Monthly</option>
          <option value="annual_bonus">Annual Bonus</option>
          <option value="quarterly_senior">Quarterly Senior</option>
        </select>
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
                    <td className="py-3 px-4 text-sm">{ret.user?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">₹{parseFloat(ret.investment?.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{new Date(ret.month).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-medium">
                      ₹{parseFloat(ret.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">{ret.type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={ret.paidOn ? 'paid' : 'pending'} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {!ret.paidOn && (
                        <button
                          onClick={() => handleMarkAsPaid(ret.id)}
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

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Monthly Returns</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  value={generateData.month}
                  onChange={(e) => setGenerateData({ ...generateData, month: parseInt(e.target.value) })}
                  className="input-field"
                  required
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={generateData.year}
                  onChange={(e) => setGenerateData({ ...generateData, year: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 2026"
                  min="2020"
                  max="2030"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsList;