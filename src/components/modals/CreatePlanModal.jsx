import React, { useState } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const CreatePlanModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    planType: 'falcon',
    minInvestment: '',
    maxInvestment: '',
    maturityPeriod: '',
    monthlyReturnPercent: '',
    annualBonusPercent: '2',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        planType: 'falcon',
        minInvestment: '',
        maxInvestment: '',
        maturityPeriod: '',
        monthlyReturnPercent: '',
        annualBonusPercent: '2',
      });
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Create Investment Plan</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plan Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Plan Type</label>
            <select
              value={formData.planType}
              onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
              className="input-field"
            >
              <option value="falcon">Falcon</option>
              <option value="ALP">ALP</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Investment *</label>
              <input
                type="number"
                value={formData.minInvestment}
                onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
                className="input-field"
                min="100000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Investment *</label>
              <input
                type="number"
                value={formData.maxInvestment}
                onChange={(e) => setFormData({ ...formData, maxInvestment: e.target.value })}
                className="input-field"
                min="100000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Maturity (Months) *</label>
              <input
                type="number"
                value={formData.maturityPeriod}
                onChange={(e) => setFormData({ ...formData, maturityPeriod: e.target.value })}
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Return % *</label>
              <input
                type="number"
                step="0.1"
                value={formData.monthlyReturnPercent}
                onChange={(e) => setFormData({ ...formData, monthlyReturnPercent: e.target.value })}
                className="input-field"
                min="2"
                max="4"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Annual Bonus %</label>
            <input
              type="number"
              step="0.1"
              value={formData.annualBonusPercent}
              onChange={(e) => setFormData({ ...formData, annualBonusPercent: e.target.value })}
              className="input-field"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
              {loading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;