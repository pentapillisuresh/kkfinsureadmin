// AddClient.jsx - Fixed icon imports

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { generateId, generateClientId, generateUsername } from '../../utils/helpers';
import { 
  FiSave, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiMapPin, 
  FiCreditCard,  // Changed from FiBanknote
  FiUserPlus, 
  FiFileText, 
  FiLock 
} from 'react-icons/fi';

const AddClient = () => {
  const navigate = useNavigate();
  const { addClient } = useAppContext();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    gender: 'Male',
    address: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifsc: '',
      branchName: ''
    },
    nominee: {
      name: '',
      relationship: '',
      mobile: ''
    },
    kyc: {
      pan: '',
      aadhaar: '',
      passport: '',
      addressProof: '',
      cancelledCheque: ''
    },
    loginDetails: {
      username: '',
      password: 'Abcd@1234',
      status: 'Active'
    }
  });

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
  };

  const generateUsernameHandler = () => {
    if (formData.fullName) {
      const username = generateUsername(formData.fullName);
      setFormData(prev => ({
        ...prev,
        loginDetails: {
          ...prev.loginDetails,
          username
        }
      }));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      loginDetails: {
        ...prev.loginDetails,
        password
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newClient = {
      id: generateId(),
      clientId: generateClientId(),
      ...formData,
      investments: [],
      roiHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addClient(newClient);
    alert('Client added successfully!');
    navigate('/clients');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: FiUser },
    { id: 'bank', label: 'Bank Details', icon: FiCreditCard },  // Changed from FiBanknote
    { id: 'nominee', label: 'Nominee', icon: FiUserPlus },
    { id: 'kyc', label: 'KYC Documents', icon: FiFileText },
    { id: 'login', label: 'Login Details', icon: FiLock }
  ];

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Mobile Number *</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="form-input"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Address</label>
        <input
          type="text"
          name="address.address"
          value={formData.address.address}
          onChange={handleChange}
          className="form-input"
          placeholder="Street address"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">City</label>
          <input
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">State</label>
          <input
            type="text"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Pincode</label>
          <input
            type="text"
            name="address.pincode"
            value={formData.address.pincode}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Bank Name</label>
          <input
            type="text"
            name="bankDetails.bankName"
            value={formData.bankDetails.bankName}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Account Number</label>
          <input
            type="text"
            name="bankDetails.accountNumber"
            value={formData.bankDetails.accountNumber}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">IFSC Code</label>
          <input
            type="text"
            name="bankDetails.ifsc"
            value={formData.bankDetails.ifsc}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Branch Name</label>
          <input
            type="text"
            name="bankDetails.branchName"
            value={formData.bankDetails.branchName}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderNominee = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Nominee Name</label>
          <input
            type="text"
            name="nominee.name"
            value={formData.nominee.name}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Relationship</label>
          <input
            type="text"
            name="nominee.relationship"
            value={formData.nominee.relationship}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Mobile Number</label>
          <input
            type="tel"
            name="nominee.mobile"
            value={formData.nominee.mobile}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderKYC = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">PAN Card</label>
          <input
            type="file"
            name="kyc.pan"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData(prev => ({
                  ...prev,
                  kyc: { ...prev.kyc, pan: file.name }
                }));
              }
            }}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Aadhaar Card</label>
          <input
            type="file"
            name="kyc.aadhaar"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData(prev => ({
                  ...prev,
                  kyc: { ...prev.kyc, aadhaar: file.name }
                }));
              }
            }}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Passport Photo</label>
          <input
            type="file"
            name="kyc.passport"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData(prev => ({
                  ...prev,
                  kyc: { ...prev.kyc, passport: file.name }
                }));
              }
            }}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Address Proof</label>
          <input
            type="file"
            name="kyc.addressProof"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData(prev => ({
                  ...prev,
                  kyc: { ...prev.kyc, addressProof: file.name }
                }));
              }
            }}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Cancelled Cheque / Passbook</label>
          <input
            type="file"
            name="kyc.cancelledCheque"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData(prev => ({
                  ...prev,
                  kyc: { ...prev.kyc, cancelledCheque: file.name }
                }));
              }
            }}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderLoginDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Username</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="loginDetails.username"
              value={formData.loginDetails.username}
              onChange={handleChange}
              className="form-input flex-1"
            />
            <button
              type="button"
              onClick={generateUsernameHandler}
              className="btn-secondary whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Temporary Password</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="loginDetails.password"
              value={formData.loginDetails.password}
              onChange={handleChange}
              className="form-input flex-1"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="btn-secondary whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select
            name="loginDetails.status"
            value={formData.loginDetails.status}
            onChange={handleChange}
            className="form-input"
          >
            <option value="Active">Login Active</option>
            <option value="Inactive">Login Disabled</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'personal': return renderPersonalDetails();
      case 'bank': return renderBankDetails();
      case 'nominee': return renderNominee();
      case 'kyc': return renderKYC();
      case 'login': return renderLoginDetails();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Client</h1>
          <p className="text-gray-500">Create a new client profile</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderTabContent()}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClient;