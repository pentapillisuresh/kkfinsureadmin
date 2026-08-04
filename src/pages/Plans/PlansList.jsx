import React, { useState, useEffect } from 'react';
import { planApi } from '../../api/planApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreatePlanModal from '../../components/modals/CreatePlanModal';
import EditPlanModal from '../../components/modals/EditPlanModal';  // ← Fixed import
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await planApi.getAll();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await planApi.toggleStatus(id);
      if (response.success) {
        toast.success(response.message);
        fetchPlans();
      }
    } catch (error) {
      toast.error('Failed to update plan status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const response = await planApi.delete(id);
      if (response.success) {
        toast.success('Plan deleted successfully');
        fetchPlans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleCreate = async (data) => {
    try {
      const response = await planApi.create(data);
      if (response.success) {
        toast.success('Plan created successfully');
        setShowCreateModal(false);
        fetchPlans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    }
  };

  const handleUpdate = async (data) => {
    try {
      const response = await planApi.update(selectedPlan.id, data);
      if (response.success) {
        toast.success('Plan updated successfully');
        setShowEditModal(false);
        setSelectedPlan(null);
        fetchPlans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(search.toLowerCase()) ||
      plan.planType?.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Investment Plans</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Create Plan
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search plans by name or type..."
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Min</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Max</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Monthly %</th>
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
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No plans found
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{plan.name}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="uppercase text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                        {plan.planType || 'Falcon'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">₹{parseFloat(plan.minInvestment).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">₹{parseFloat(plan.maxInvestment).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{plan.monthlyReturnPercent}%</td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={plan.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(plan.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            plan.isActive
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={plan.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {plan.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
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

      {/* Create Plan Modal */}
      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      {/* Edit Plan Modal */}
      <EditPlanModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPlan(null);
        }}
        onSubmit={handleUpdate}
        plan={selectedPlan}
      />
    </div>
  );
};

export default PlansList;