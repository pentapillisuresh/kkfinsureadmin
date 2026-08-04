import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaSave } from 'react-icons/fa';

const EditPlanModal = ({ isOpen, onClose, onSubmit, plan, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    planType: 'falcon',
    minInvestment: '',
    maxInvestment: '',
    maturityPeriod: '',
    monthlyReturnPercent: '',
    annualBonusPercent: '2',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  // Populate form when plan data changes
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        planType: plan.planType || 'falcon',
        minInvestment: plan.minInvestment || '',
        maxInvestment: plan.maxInvestment || '',
        maturityPeriod: plan.maturityPeriod || '',
        monthlyReturnPercent: plan.monthlyReturnPercent || '',
        annualBonusPercent: plan.annualBonusPercent || '2',
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      });
    }
  }, [plan]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FaSave className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Edit Plan</h3>
              <p className="text-sm text-gray-500">Update investment plan details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic Information Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter plan name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Type
                </label>
                <select
                  name="planType"
                  value={formData.planType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="falcon">Falcon</option>
                  <option value="ALP">ALP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Investment Range Section */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
              Investment Range
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Investment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minInvestment"
                  value={formData.minInvestment}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="100000"
                  min="100000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Investment <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxInvestment"
                  value={formData.maxInvestment}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="10000000"
                  min="100000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Returns Section */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
              Returns & Maturity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maturity Period (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maturityPeriod"
                  value={formData.maturityPeriod}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="12"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Return % <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="monthlyReturnPercent"
                  value={formData.monthlyReturnPercent}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="2.5"
                  min="2"
                  max="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Bonus %
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="annualBonusPercent"
                  value={formData.annualBonusPercent}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="2"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
              Plan Status
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active Plan
                </label>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || isLoading}
              className="flex-1 btn-secondary py-2.5 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isLoading}
              className="flex-1 btn-primary py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {(loading || isLoading) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal;