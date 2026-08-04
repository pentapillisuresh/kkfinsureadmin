import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const CreateOfferModal = ({ isOpen, onClose, onSubmit, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardType: 'points',
    rewardValue: '',
    conditions: {},
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        rewardType: initialData.rewardType || 'points',
        rewardValue: initialData.rewardValue || '',
        conditions: initialData.conditions || {},
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      if (!isEdit) {
        setFormData({
          title: '',
          description: '',
          rewardType: 'points',
          rewardValue: '',
          conditions: {},
          isActive: true,
        });
      }
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
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Edit Offer' : 'Create New Offer'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reward Type *</label>
            <select
              value={formData.rewardType}
              onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
              className="input-field"
              required
            >
              <option value="points">Points</option>
              <option value="voucher">Voucher</option>
              <option value="cashback">Cashback</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reward Value *</label>
            <input
              type="text"
              value={formData.rewardValue}
              onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
              className="input-field"
              placeholder="e.g., 100, 500, Amazon voucher"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Investment (Optional)</label>
            <input
              type="number"
              value={formData.conditions?.minInvestment || ''}
              onChange={(e) => setFormData({
                ...formData,
                conditions: { ...formData.conditions, minInvestment: parseFloat(e.target.value) || undefined }
              })}
              className="input-field"
              placeholder="Minimum investment amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
            <input
              type="date"
              value={formData.conditions?.expiryDate || ''}
              onChange={(e) => setFormData({
                ...formData,
                conditions: { ...formData.conditions, expiryDate: e.target.value || undefined }
              })}
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEdit ? 'Update Offer' : 'Create Offer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferModal;