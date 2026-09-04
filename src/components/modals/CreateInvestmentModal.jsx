import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const CreateInvestmentModal = ({ isOpen, onClose, onSubmit, plans }) => {
  const [formData, setFormData] = useState({
    userId: '',
    planId: '',
    amount: '',
    investmentDate: '',
    startReturnDate: '',
    endReturnDate: '',
    maturityDate: '',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [errors, setErrors] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      resetForm();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await userApi.getUsers({ limit: 100 });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setFetchingUsers(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      planId: '',
      amount: '',
      investmentDate: '',
      startReturnDate: '',
      endReturnDate: '',
      maturityDate: '',
    });
    setErrors({});
    setSelectedPlan(null);
  };

  // Update selected plan when planId changes
  useEffect(() => {
    const plan = plans.find(p => p.id === formData.planId);
    setSelectedPlan(plan);
  }, [formData.planId, plans]);

  const validateForm = () => {
    const newErrors = {};

    // User validation
    if (!formData.userId) {
      newErrors.userId = 'Please select a user';
    }

    // Plan validation
    if (!formData.planId) {
      newErrors.planId = 'Please select a plan';
    }

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = 'Please enter investment amount';
    } else if (selectedPlan) {
      const amountNum = parseFloat(formData.amount);
      if (amountNum < selectedPlan.minInvestment) {
        newErrors.amount = `Amount must be at least ₹${parseFloat(selectedPlan.minInvestment).toLocaleString()}`;
      } else if (amountNum > selectedPlan.maxInvestment) {
        newErrors.amount = `Amount cannot exceed ₹${parseFloat(selectedPlan.maxInvestment).toLocaleString()}`;
      }
    }

    // Investment Date
    if (!formData.investmentDate) {
      newErrors.investmentDate = 'Please select investment date';
    }

    // Start Return Date
    if (!formData.startReturnDate) {
      newErrors.startReturnDate = 'Please select start return date';
    } else if (formData.investmentDate) {
      const invDate = new Date(formData.investmentDate);
      const startDate = new Date(formData.startReturnDate);
      if (startDate < invDate) {
        newErrors.startReturnDate = 'Start return date cannot be before investment date';
      }
    }

    // End Return Date
    if (!formData.endReturnDate) {
      newErrors.endReturnDate = 'Please select end return date';
    } else if (formData.startReturnDate) {
      const startDate = new Date(formData.startReturnDate);
      const endDate = new Date(formData.endReturnDate);
      if (endDate < startDate) {
        newErrors.endReturnDate = 'End return date cannot be before start return date';
      }
    }

    // Maturity Date (optional)
    if (formData.maturityDate) {
      const endDate = new Date(formData.endReturnDate);
      const maturity = new Date(formData.maturityDate);
      if (maturity < endDate) {
        newErrors.maturityDate = 'Maturity date should be after end return date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        investmentDate: formData.investmentDate,
        startReturnDate: formData.startReturnDate,
        endReturnDate: formData.endReturnDate,
        maturityDate: formData.maturityDate || null,
      });
      resetForm();
    } catch (error) {
      // Error handled in parent
      toast.error(error.response?.data?.message || 'Failed to create investment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-800">Create New Investment</h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* User */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className={`input-field w-full ${errors.userId ? 'border-red-500' : ''}`}
              disabled={fetchingUsers}
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId}</p>}
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className={`input-field w-full ${errors.planId ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select Plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ₹{parseFloat(plan.minInvestment).toLocaleString()} to ₹{parseFloat(plan.maxInvestment).toLocaleString()}
                </option>
              ))}
            </select>
            {errors.planId && <p className="mt-1 text-sm text-red-600">{errors.planId}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="Enter investment amount"
              min="100000"
              step="1000"
              required
            />
            {selectedPlan && (
              <p className="mt-1 text-xs text-gray-500">
                Min: ₹{parseFloat(selectedPlan.minInvestment).toLocaleString()} | Max: ₹{parseFloat(selectedPlan.maxInvestment).toLocaleString()}
              </p>
            )}
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Investment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Investment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.investmentDate}
              onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
              className={`input-field w-full ${errors.investmentDate ? 'border-red-500' : ''}`}
              required
            />
            {errors.investmentDate && <p className="mt-1 text-sm text-red-600">{errors.investmentDate}</p>}
          </div>

          {/* Start Return Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Return Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startReturnDate}
              onChange={(e) => setFormData({ ...formData, startReturnDate: e.target.value })}
              className={`input-field w-full ${errors.startReturnDate ? 'border-red-500' : ''}`}
              required
            />
            {errors.startReturnDate && <p className="mt-1 text-sm text-red-600">{errors.startReturnDate}</p>}
          </div>

          {/* End Return Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Return Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endReturnDate}
              onChange={(e) => setFormData({ ...formData, endReturnDate: e.target.value })}
              className={`input-field w-full ${errors.endReturnDate ? 'border-red-500' : ''}`}
              required
            />
            {errors.endReturnDate && <p className="mt-1 text-sm text-red-600">{errors.endReturnDate}</p>}
          </div>

          {/* Maturity Date (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maturity Date (Optional)
            </label>
            <input
              type="date"
              value={formData.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
              className={`input-field w-full ${errors.maturityDate ? 'border-red-500' : ''}`}
            />
            {errors.maturityDate && <p className="mt-1 text-sm text-red-600">{errors.maturityDate}</p>}
            <p className="mt-1 text-xs text-gray-500">
              If not provided, will be calculated based on plan's maturity period
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Creating...
                </>
              ) : (
                'Create Investment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvestmentModal;