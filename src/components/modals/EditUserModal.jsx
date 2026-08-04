// src/components/modals/EditUserModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiX, FiUser, FiPhone, FiCalendar, 
  FiMapPin, FiCreditCard, FiUserPlus,
  FiAward, FiToggleRight, FiToggleLeft
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

const EditUserModal = ({ isOpen, onClose, onSubmit, user, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    pan: '',
    aadhar: '',
    address: '',
    isSeniorCitizen: false,
    partnerType: 'none',
    partnerCommissionRate: 0,
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        pan: user.pan || '',
        aadhar: user.aadhar || '',
        address: user.address || '',
        isSeniorCitizen: user.isSeniorCitizen || false,
        partnerType: user.partnerType || 'none',
        partnerCommissionRate: user.partnerCommissionRate || 0,
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: FiUser },
    { id: 'id', label: 'ID & Address', icon: FiMapPin },
    { id: 'partner', label: 'Partner Settings', icon: FiAward },
    { id: 'status', label: 'Status', icon: FiToggleRight },
  ];

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
            pattern="[0-9]{10}"
          />
        </div>
        <div>
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="editIsSeniorCitizen"
            name="isSeniorCitizen"
            checked={formData.isSeniorCitizen}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="editIsSeniorCitizen" className="text-sm text-gray-700">
            Senior Citizen
          </label>
        </div>
      </div>
    </div>
  );

  const renderIDAndAddress = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">PAN</label>
          <input
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            className="form-input uppercase"
            maxLength="10"
          />
        </div>
        <div>
          <label className="form-label">Aadhar</label>
          <input
            type="text"
            name="aadhar"
            value={formData.aadhar}
            onChange={handleChange}
            className="form-input"
            maxLength="12"
          />
        </div>
      </div>
      <div>
        <label className="form-label">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="form-input"
          rows="2"
        />
      </div>
    </div>
  );

  const renderPartnerSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Partner Type</label>
          <select
            name="partnerType"
            value={formData.partnerType}
            onChange={handleChange}
            className="form-input"
          >
            <option value="none">None</option>
            <option value="referral">Referral Partner</option>
            <option value="authorised">Authorised Partner</option>
            <option value="hni">HNI Partner</option>
          </select>
        </div>
        <div>
          <label className="form-label">Commission Rate (%)</label>
          <input
            type="number"
            name="partnerCommissionRate"
            value={formData.partnerCommissionRate}
            onChange={handleChange}
            className="form-input"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      </div>
      {formData.partnerType !== 'none' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700">
            <FiAward className="inline mr-2" />
            Commission Rate: {formData.partnerCommissionRate || 0}%
          </p>
        </div>
      )}
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            formData.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          {formData.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
          {formData.isActive ? 'Active' : 'Inactive'}
        </button>
        <span className="text-sm text-gray-500">
          {formData.isActive ? 'User can login and access the system' : 'User access is disabled'}
        </span>
      </div>

      {user && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Batch ID:</span> {user.batchId || 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Member Since:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Last Updated:</span> {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'personal': return renderPersonalDetails();
      case 'id': return renderIDAndAddress();
      case 'partner': return renderPartnerSettings();
      case 'status': return renderStatus();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiUserPlus className="text-blue-500" />
            Edit User
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-gray-200 px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {renderTabContent()}
          </div>

          <div className="px-4 py-4 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" /> Updating...
                </span>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;