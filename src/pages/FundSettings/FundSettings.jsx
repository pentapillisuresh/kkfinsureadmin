import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiSave, FiRefreshCw, FiDollarSign, FiPercent, FiClock } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';

const FundSettings = () => {
  const { fundSettings, updateFundSettings } = useAppContext();
  const [editingFund, setEditingFund] = useState(null);
  const [formData, setFormData] = useState(fundSettings);

  const handleChange = (fund, field, value) => {
    setFormData({
      ...formData,
      [fund]: {
        ...formData[fund],
        [field]: value
      }
    });
  };

  const handleSave = (fund) => {
    updateFundSettings(fund, formData[fund]);
    setEditingFund(null);
    alert(`${fund.replace(/([A-Z])/g, ' $1').trim()} settings updated successfully!`);
  };

  const fundConfigs = [
    {
      key: 'falconHedge',
      label: 'Falcon Hedge Fund',
      icon: <FiDollarSign className="w-5 h-5" />,
      fields: [
        { key: 'minInvestment', label: 'Minimum Investment', type: 'number', suffix: '' },
        { key: 'maxInvestment', label: 'Maximum Investment', type: 'number', suffix: '' },
        { key: 'defaultROI', label: 'Default ROI', type: 'number', suffix: '%' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
      ]
    },
    {
      key: 'aif',
      label: 'Alternative Investment Fund (AIF)',
      icon: <FiClock className="w-5 h-5" />,
      fields: [
        { key: 'lockInPeriod', label: 'Lock-in Period', type: 'number', suffix: ' months' },
        { key: 'roi', label: 'ROI', type: 'number', suffix: '%' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
      ]
    },
    {
      key: 'pms',
      label: 'PMS',
      icon: <FiPercent className="w-5 h-5" />,
      fields: [
        { key: 'performanceFee', label: 'Performance Fee', type: 'number', suffix: '%' },
        { key: 'defaultROI', label: 'Default ROI', type: 'number', suffix: '%' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
      ]
    },
    {
      key: 'sif',
      label: 'SIF',
      icon: <FiDollarSign className="w-5 h-5" />,
      fields: [
        { key: 'minInvestment', label: 'Minimum Investment', type: 'number', suffix: '' },
        { key: 'roi', label: 'ROI', type: 'number', suffix: '%' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Fund Settings</h1>
        <p className="text-gray-500">Configure fund parameters and rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fundConfigs.map((fund) => {
          const fundData = formData[fund.key];
          const isEditing = editingFund === fund.key;

          return (
            <div key={fund.key} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {fund.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800">{fund.label}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  fundData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {fundData.status}
                </span>
              </div>

              <div className="space-y-3">
                {fund.fields.map((field) => (
                  <div key={field.key}>
                    <label className="form-label">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={fundData[field.key]}
                        onChange={(e) => handleChange(fund.key, field.key, e.target.value)}
                        className="form-input"
                        disabled={!isEditing}
                      >
                        {field.options.map(option => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          value={fundData[field.key] || 0}
                          onChange={(e) => handleChange(fund.key, field.key, parseFloat(e.target.value) || 0)}
                          className="form-input"
                          disabled={!isEditing}
                          step="0.01"
                        />
                        {field.suffix && (
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {field.suffix}
                          </span>
                        )}
                      </div>
                    )}
                    {isEditing && field.key === 'maxInvestment' && fund.key === 'falconHedge' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current max: {formatCurrency(fundData.maxInvestment)}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-4">
                  {!isEditing ? (
                    <button
                      onClick={() => setEditingFund(fund.key)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingFund(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(fund.key)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <FiSave className="w-4 h-4" />
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FundSettings;