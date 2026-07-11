import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { generateId, calculateMonthlyROI, formatCurrency } from '../../utils/helpers';
import { FiSave, FiX } from 'react-icons/fi';

const AddInvestment = () => {
  const navigate = useNavigate();
  const { clients, addInvestment, fundSettings } = useAppContext();
  const [selectedClient, setSelectedClient] = useState('');
  const [formData, setFormData] = useState({
    product: 'Falcon Hedge Fund',
    amount: '',
    roi: '',
    lockIn: '12 months',
    status: 'active',
    date: new Date().toISOString().split('T')[0],
    // PMS specific fields
    dematDetails: {
      dpId: '',
      clientId: '',
      depository: 'NSDL',
      brokerName: '',
      dematNumber: ''
    },
    // AIF/SIF specific fields
    documents: []
  });
  const [error, setError] = useState('');
  const [clientInvestments, setClientInvestments] = useState([]);

  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      if (client) {
        setClientInvestments(client.investments || []);
        // Check if client has reached maximum limit for Falcon Hedge Fund
        if (formData.product === 'Falcon Hedge Fund') {
          const falconInvestments = client.investments?.filter(inv => inv.product === 'Falcon Hedge Fund') || [];
          const totalFalconInvestment = falconInvestments.reduce((sum, inv) => sum + inv.amount, 0);
          const maxLimit = fundSettings.falconHedge.maxInvestment;
          if (totalFalconInvestment >= maxLimit) {
            setError(`Maximum limit of ${formatCurrency(maxLimit)} reached for Falcon Hedge Fund`);
          } else {
            setError('');
          }
        }
      }
    }
  }, [selectedClient, formData.product, clients, fundSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Auto-calculate ROI if product is Falcon Hedge Fund
    if (name === 'amount' && formData.product === 'Falcon Hedge Fund') {
      const roi = fundSettings.falconHedge.defaultROI || 4;
      setFormData(prev => ({
        ...prev,
        roi: roi
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedClient) {
      alert('Please select a client');
      return;
    }

    const amount = parseFloat(formData.amount);
    const roi = parseFloat(formData.roi);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid investment amount');
      return;
    }

    if (isNaN(roi) || roi <= 0) {
      alert('Please enter a valid ROI');
      return;
    }

    // Check minimum investment
    if (formData.product === 'Falcon Hedge Fund') {
      const minInvestment = fundSettings.falconHedge.minInvestment;
      if (amount < minInvestment) {
        alert(`Minimum investment for Falcon Hedge Fund is ${formatCurrency(minInvestment)}`);
        return;
      }
    }

    // Check maximum limit for Falcon Hedge Fund
    if (formData.product === 'Falcon Hedge Fund') {
      const client = clients.find(c => c.id === selectedClient);
      const falconInvestments = client?.investments?.filter(inv => inv.product === 'Falcon Hedge Fund') || [];
      const totalFalconInvestment = falconInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      const maxLimit = fundSettings.falconHedge.maxInvestment;
      if (totalFalconInvestment + amount > maxLimit) {
        alert(`This investment would exceed the maximum limit of ${formatCurrency(maxLimit)} for Falcon Hedge Fund`);
        return;
      }
    }

    const monthlyROI = calculateMonthlyROI(amount, roi);
    const newInvestment = {
      id: generateId(),
      ...formData,
      amount: amount,
      roi: roi,
      monthlyROI: monthlyROI,
      date: formData.date || new Date().toISOString().split('T')[0]
    };

    addInvestment(selectedClient, newInvestment);
    alert('Investment added successfully!');
    navigate('/investments');
  };

  const getProductFields = () => {
    switch(formData.product) {
      case 'PMS':
        return (
          <div className="space-y-4 border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-700">Demat Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">DP ID</label>
                <input
                  type="text"
                  name="dematDetails.dpId"
                  value={formData.dematDetails.dpId}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Client ID</label>
                <input
                  type="text"
                  name="dematDetails.clientId"
                  value={formData.dematDetails.clientId}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Depository</label>
                <select
                  name="dematDetails.depository"
                  value={formData.dematDetails.depository}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="NSDL">NSDL</option>
                  <option value="CDSL">CDSL</option>
                </select>
              </div>
              <div>
                <label className="form-label">Broker Name</label>
                <input
                  type="text"
                  name="dematDetails.brokerName"
                  value={formData.dematDetails.brokerName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Demat Number</label>
                <input
                  type="text"
                  name="dematDetails.dematNumber"
                  value={formData.dematDetails.dematNumber}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Investment</h1>
          <p className="text-gray-500">Add a new investment for a client</p>
        </div>
        <button onClick={() => navigate('/investments')} className="btn-secondary">
          Back to Investments
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Select Client *</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.clientId} - {client.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Product *</label>
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Falcon Hedge Fund">Falcon Hedge Fund</option>
                <option value="Alternative Investment Fund">Alternative Investment Fund</option>
                <option value="PMS">PMS</option>
                <option value="SIF">SIF</option>
              </select>
            </div>

            <div>
              <label className="form-label">Investment Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter amount"
                required
              />
              {formData.product === 'Falcon Hedge Fund' && (
                <p className="text-xs text-gray-500 mt-1">
                  Min: {formatCurrency(fundSettings.falconHedge.minInvestment)} | 
                  Max: {formatCurrency(fundSettings.falconHedge.maxInvestment)}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">ROI (%) *</label>
              <input
                type="number"
                name="roi"
                value={formData.roi}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter ROI percentage"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="form-label">Lock-in Period</label>
              <select
                name="lockIn"
                value={formData.lockIn}
                onChange={handleChange}
                className="form-input"
              >
                <option value="12 months">12 months</option>
                <option value="24 months">24 months</option>
                <option value="36 months">36 months</option>
                <option value="48 months">48 months</option>
                <option value="60 months">60 months</option>
                <option value="No lock-in">No lock-in</option>
              </select>
            </div>

            <div>
              <label className="form-label">Investment Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {formData.product === 'Falcon Hedge Fund' && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {getProductFields()}

          {formData.amount && formData.roi && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Monthly ROI: <span className="font-bold">{formatCurrency(calculateMonthlyROI(parseFloat(formData.amount), parseFloat(formData.roi)))}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/investments')}
              className="btn-secondary flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={!!error}
            >
              <FiSave className="w-4 h-4" />
              Add Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvestment;