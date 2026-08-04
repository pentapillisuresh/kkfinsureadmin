import React, { useState, useEffect } from 'react';
import { balanceSheetApi } from '../../api/balanceSheetApi';
import { userApi } from '../../api/userApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaDownload, FaFileInvoice, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BalanceSheetsList = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [generateData, setGenerateData] = useState({
    userId: '',
    periodStart: '',
    periodEnd: '',
  });

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
      const response = await userApi.getUsers({ limit: 100 });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateData.userId || !generateData.periodStart || !generateData.periodEnd) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const response = await balanceSheetApi.generate(generateData);
      if (response.success) {
        toast.success('Balance sheet generated successfully');
        setShowGenerateModal(false);
        setGenerateData({ userId: '', periodStart: '', periodEnd: '' });
        fetchSheets();
      }
    } catch (error) {
      toast.error('Failed to generate balance sheet');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Balance Sheets</h2>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaFileInvoice /> Generate
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search balance sheets..."
      />

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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : sheets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No balance sheets found
                  </td>
                </tr>
              ) : (
                sheets.map((sheet) => (
                  <tr key={sheet.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{sheet.user?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(sheet.periodStart).toLocaleDateString()} - {new Date(sheet.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">₹{parseFloat(sheet.totalInvestments).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">₹{parseFloat(sheet.totalReturns).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm font-medium text-primary-600">
                      ₹{parseFloat(sheet.netWorth).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(sheet.generatedAt).toLocaleString()}
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
              <h3 className="text-lg font-semibold">Generate Balance Sheet</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User *</label>
                <select
                  value={generateData.userId}
                  onChange={(e) => setGenerateData({ ...generateData, userId: e.target.value })}
                  className="input-field"
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
                <label className="block text-sm font-medium text-gray-700">Period Start *</label>
                <input
                  type="date"
                  value={generateData.periodStart}
                  onChange={(e) => setGenerateData({ ...generateData, periodStart: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Period End *</label>
                <input
                  type="date"
                  value={generateData.periodEnd}
                  onChange={(e) => setGenerateData({ ...generateData, periodEnd: e.target.value })}
                  className="input-field"
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

export default BalanceSheetsList;