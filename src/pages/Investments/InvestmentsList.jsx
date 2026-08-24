import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { investmentApi } from '../../api/investmentApi';
import { planApi } from '../../api/planApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateInvestmentModal from '../../components/modals/CreateInvestmentModal';
import {
  FaPlus,
  FaEye,
  FaTrash,
  FaCheckCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const InvestmentsList = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Added separate state for actual search term

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [plans, setPlans] = useState([]);

  // Fetch investments whenever page, search, or status changes
  useEffect(() => {
    fetchInvestments();
  }, [pagination.page, searchTerm, statusFilter]); // Changed from search to searchTerm

  // Fetch plans only once
  useEffect(() => {
    fetchPlans();
  }, []);

  // Fetch investments
  const fetchInvestments = async () => {
    setLoading(true);

    try {
      const response = await investmentApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm.trim() || undefined, // Using searchTerm
        status: statusFilter || undefined,
      });

      console.log('API Response:', response); // Debug log

      if (response.success) {
        setInvestments(response.data.investments || []);

        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || prev.page,
          limit: response.data.pagination?.limit || prev.limit,
          totalPages: response.data.pagination?.totalPages || 0,
        }));
      } else {
        // Handle case where response.success is false
        setInvestments([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          totalPages: 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      toast.error('Failed to fetch investments');
      setInvestments([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
        totalPages: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch active plans
  const fetchPlans = async () => {
    try {
      const response = await planApi.getAll({
        isActive: true,
      });

      console.log('Plans Response:', response); // Debug log

      if (response.success) {
        setPlans(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  // Search handler - with debounce to avoid too many API calls
  const handleSearch = (value) => {
    setSearch(value);

    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set a timeout to delay the search (500ms debounce)
    window.searchTimeout = setTimeout(() => {
      setSearchTerm(value); // Update the actual search term
      setPagination((prev) => ({
        ...prev,
        page: 1, // Reset to first page on search
      }));
    }, 500);
  };

  // Status filter handler
  const handleStatusChange = (value) => {
    setStatusFilter(value);

    // Reset pagination to page 1
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // Page change handler
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  // Delete investment
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this investment?'
      )
    ) {
      return;
    }

    try {
      const response = await investmentApi.delete(id);

      if (response.success) {
        toast.success('Investment deleted successfully');

        // If current page becomes empty after delete,
        // move to previous page
        if (
          investments.length === 1 &&
          pagination.page > 1
        ) {
          setPagination((prev) => ({
            ...prev,
            page: prev.page - 1,
          }));
        } else {
          fetchInvestments();
        }
      }
    } catch (error) {
      console.error('Failed to delete investment:', error);
      toast.error('Failed to delete investment');
    }
  };

  // Approve DPC
  const handleApproveDPC = async (id) => {
    try {
      const response = await investmentApi.approveDPC(id);

      if (response.success) {
        toast.success('DPC approved successfully');
        fetchInvestments();
      }
    } catch (error) {
      console.error('Failed to approve DPC:', error);
      toast.error('Failed to approve DPC');
    }
  };

  // Create investment
  const handleCreate = async (data) => {
    try {
      const response = await investmentApi.create(data);

      if (response.success) {
        toast.success('Investment created successfully');

        setShowCreateModal(false);

        // Go to first page after creating
        setPagination((prev) => ({
          ...prev,
          page: 1,
        }));

        fetchInvestments();
      }
    } catch (error) {
      console.error('Failed to create investment:', error);

      toast.error(
        error.response?.data?.message ||
        'Failed to create investment'
      );
    }
  };

  // Calculate showing range for pagination info
  const startItem = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = pagination.total > 0 ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Investments
        </h2>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <FaPlus />
          Add Investment
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Search */}
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by user name, email, or phone..."
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) =>
            handleStatusChange(e.target.value)
          }
          className="input-field sm:max-w-xs"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="matured">Matured</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Results Information */}
      {!loading && pagination.total > 0 && (
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {pagination.total} investments
          {searchTerm && ` (filtered by search: "${searchTerm}")`}
          {statusFilter && ` (filtered by status: ${statusFilter})`}
        </div>
      )}

      {!loading && pagination.total === 0 && (searchTerm || statusFilter) && (
        <div className="text-sm text-gray-600">
          No results found for search: "{searchTerm}" {statusFilter && `with status: ${statusFilter}`}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* Table Header */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                  User
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                  Plan
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                  Amount
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                  Status
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                  DPC
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
                  Actions
                </th>

              </tr>
            </thead>

            {/* Table Body */}
            <tbody>

              {/* Loading */}
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10"
                  >
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : investments.length === 0 ? (

                /* Empty */
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    {searchTerm || statusFilter
                      ? 'No investments found matching your search/filter.'
                      : 'No investments found.'}
                  </td>
                </tr>

              ) : (

                /* Investments */
                investments.map((inv) => (
                  <tr
                    key={inv.id || inv._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >

                    {/* User */}
                    <td className="py-3 px-4 text-sm">
                      {inv.user?.fullName || inv.user?.name || 'N/A'}
                      {inv.user?.email && (
                        <div className="text-xs text-gray-500">
                          {inv.user.email}
                        </div>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4 text-sm">
                      {inv.plan?.name || 'N/A'}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-sm font-medium">
                      ₹
                      {parseFloat(
                        inv.amount || 0
                      ).toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge
                        status={inv.status}
                      />
                    </td>

                    {/* DPC */}
                    <td className="py-3 px-4 text-sm">

                      {inv.dpcCheck ? (

                        <span className="text-green-600 font-medium">
                          ✓ Approved
                        </span>

                      ) : (

                        <button
                          onClick={() =>
                            handleApproveDPC(inv.id || inv._id)
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <FaCheckCircle className="inline mr-1" />
                          Approve
                        </button>

                      )}

                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-sm">

                      <div className="flex items-center gap-2">

                        {/* View */}
                        <Link
                          to={`/investments/${inv.id || inv._id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FaEye />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            handleDelete(inv.id || inv._id)
                          }
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

      {/* Pagination - Always show when there are items */}
      {pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {pagination.total} investments
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modals */}
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