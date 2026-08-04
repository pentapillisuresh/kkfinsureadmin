import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { investmentApi } from '../../api/investmentApi';
import { planApi } from '../../api/planApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateInvestmentModal from '../../components/modals/CreateInvestmentModal';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const InvestmentsList = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchInvestments();
    fetchPlans();
  }, [pagination.page, search, statusFilter]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const response = await investmentApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setInvestments(response.data.investments);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch investments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await planApi.getAll({ isActive: true });
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;
    try {
      const response = await investmentApi.delete(id);
      if (response.success) {
        toast.success('Investment deleted successfully');
        fetchInvestments();
      }
    } catch (error) {
      toast.error('Failed to delete investment');
    }
  };

  const handleApproveDPC = async (id) => {
    try {
      const response = await investmentApi.approveDPC(id);
      if (response.success) {
        toast.success('DPC approved successfully');
        fetchInvestments();
      }
    } catch (error) {
      toast.error('Failed to approve DPC');
    }
  };

  const handleCreate = async (data) => {
    try {
      const response = await investmentApi.create(data);
      if (response.success) {
        toast.success('Investment created successfully');
        setShowCreateModal(false);
        fetchInvestments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create investment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Investments</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Investment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search investments..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="matured">Matured</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">DPC</th>
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
              ) : investments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No investments found
                  </td>
                </tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{inv.user?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">{inv.plan?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm font-medium">
                      ₹{parseFloat(inv.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {inv.dpcCheck ? (
                        <span className="text-green-600">✓ Approved</span>
                      ) : (
                        <button
                          onClick={() => handleApproveDPC(inv.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <FaCheckCircle className="inline mr-1" /> Approve
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/investments/${inv.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => handleDelete(inv.id)}
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

      <CreateInvestmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        plans={plans}
      />
    </div>
  );
};

export default InvestmentsList;