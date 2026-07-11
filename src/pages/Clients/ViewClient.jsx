import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  FiUser, FiPieChart, FiDollarSign, FiFileText, FiClock,
  FiMail, FiPhone, FiMapPin, FiCreditCard, FiUserPlus, // Changed FiBanknote to FiCreditCard
  FiLock, FiEye, FiEyeOff, FiKey, FiDownload
} from 'react-icons/fi';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';

const ViewClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [client, setClient] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const found = clients.find(c => c.id === id);
    if (found) {
      setClient(found);
    } else {
      navigate('/clients');
    }
  }, [id, clients, navigate]);

  if (!client) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'investments', label: 'Investments', icon: FiPieChart },
    { id: 'roi', label: 'Monthly ROI', icon: FiDollarSign },
    { id: 'documents', label: 'Documents', icon: FiFileText },
    { id: 'history', label: 'History', icon: FiClock }
  ];

  const totalInvestment = client.investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const totalMonthlyROI = client.investments?.reduce((sum, inv) => sum + (inv.monthlyROI || 0), 0) || 0;

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Personal Details</h3>
          <div className="space-y-3">
            <div><span className="text-sm text-gray-500">Full Name:</span> <span className="font-medium">{client.fullName}</span></div>
            <div><span className="text-sm text-gray-500">Mobile:</span> <span className="font-medium">{client.mobile}</span></div>
            <div><span className="text-sm text-gray-500">Email:</span> <span className="font-medium">{client.email}</span></div>
            <div><span className="text-sm text-gray-500">DOB:</span> <span className="font-medium">{formatDate(client.dob)}</span></div>
            <div><span className="text-sm text-gray-500">Gender:</span> <span className="font-medium">{client.gender}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Address</h3>
          <div className="space-y-3">
            <div><span className="text-sm text-gray-500">Address:</span> <span className="font-medium">{client.address?.address}</span></div>
            <div><span className="text-sm text-gray-500">City:</span> <span className="font-medium">{client.address?.city}</span></div>
            <div><span className="text-sm text-gray-500">State:</span> <span className="font-medium">{client.address?.state}</span></div>
            <div><span className="text-sm text-gray-500">Pincode:</span> <span className="font-medium">{client.address?.pincode}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Bank Details</h3>
          <div className="space-y-3">
            <div><span className="text-sm text-gray-500">Bank Name:</span> <span className="font-medium">{client.bankDetails?.bankName}</span></div>
            <div><span className="text-sm text-gray-500">Account Number:</span> <span className="font-medium">{client.bankDetails?.accountNumber}</span></div>
            <div><span className="text-sm text-gray-500">IFSC:</span> <span className="font-medium">{client.bankDetails?.ifsc}</span></div>
            <div><span className="text-sm text-gray-500">Branch:</span> <span className="font-medium">{client.bankDetails?.branchName}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Nominee</h3>
          <div className="space-y-3">
            <div><span className="text-sm text-gray-500">Name:</span> <span className="font-medium">{client.nominee?.name}</span></div>
            <div><span className="text-sm text-gray-500">Relationship:</span> <span className="font-medium">{client.nominee?.relationship}</span></div>
            <div><span className="text-sm text-gray-500">Mobile:</span> <span className="font-medium">{client.nominee?.mobile}</span></div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <h3 className="font-semibold text-gray-700">Login Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-500">Username:</span>
              <span className="font-medium block">{client.loginDetails?.username}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Password:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{showPassword ? client.loginDetails?.password : '********'}</span>
                <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.loginDetails?.status)}`}>
                {client.loginDetails?.status}
              </span>
            </div>
          </div>
          <button className="btn-secondary text-sm flex items-center gap-2">
            <FiKey className="w-4 h-4" />
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderInvestments = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total Investment</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalInvestment)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Monthly ROI</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalMonthlyROI)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Active Investments</p>
          <p className="text-2xl font-bold text-purple-700">
            {client.investments?.filter(inv => inv.status === 'active').length || 0}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly ROI</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lock-in</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {client.investments?.map((inv, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm">{inv.product}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(inv.amount)}</td>
                <td className="px-4 py-3 text-sm">{inv.roi}%</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(inv.monthlyROI)}</td>
                <td className="px-4 py-3 text-sm">{inv.lockIn || 'N/A'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderROI = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Total Monthly ROI</p>
          <p className="text-2xl font-bold text-yellow-700">{formatCurrency(totalMonthlyROI)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Paid</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(client.roiHistory?.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0) || 0)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">Pending</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(client.roiHistory?.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0) || 0)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTR Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {client.roiHistory?.map((roi, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm">{roi.month}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(roi.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(roi.status)}`}>
                    {roi.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{roi.utr || '-'}</td>
                <td className="px-4 py-3 text-sm">{roi.paymentDate ? formatDate(roi.paymentDate) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {client.kyc && Object.entries(client.kyc).map(([key, value]) => (
        <div key={key} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {value ? 'Uploaded' : 'Not Uploaded'}
            </span>
          </div>
          {value && (
            <div className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
              <button className="text-green-600 hover:text-green-700 text-sm">Download</button>
              <button className="text-yellow-600 hover:text-yellow-700 text-sm">Replace</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="border-l-4 border-blue-500 pl-4">
        <p className="text-sm text-gray-500">Created: {formatDate(client.createdAt)}</p>
        <p className="text-sm text-gray-500">Last Updated: {formatDate(client.updatedAt)}</p>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Activity Log</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">• Client registered</span>
            <span className="text-gray-400">{formatDate(client.createdAt)}</span>
          </div>
          {client.investments?.map((inv, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">• Investment of {formatCurrency(inv.amount)} in {inv.product}</span>
              <span className="text-gray-400">{formatDate(inv.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Client Profile</h1>
          <p className="text-gray-500">{client.clientId} - {client.fullName}</p>
        </div>
        <button onClick={() => navigate('/clients')} className="btn-secondary">
          Back to Clients
        </button>
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

        <div className="p-6">
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'investments' && renderInvestments()}
          {activeTab === 'roi' && renderROI()}
          {activeTab === 'documents' && renderDocuments()}
          {activeTab === 'history' && renderHistory()}
        </div>
      </div>
    </div>
  );
};

export default ViewClient;