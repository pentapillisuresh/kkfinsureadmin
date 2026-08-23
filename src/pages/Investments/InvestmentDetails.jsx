import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investmentApi } from '../../api/investmentApi';
import { filesAPI } from '../../api/files';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FaArrowLeft, FaTrash, FaCheckCircle,
  FaMoneyBillWave, FaCalendar, FaUser, FaChartLine,
  FaFileAlt, FaUpload, FaEdit
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// const VITE_BASE_URL = "http://localhost:3000/";
const VITE_BASE_URL = "http://service.kkfinsure.org/";

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [newCode, setNewCode] = useState('');

  useEffect(() => {
    fetchInvestmentDetails();
  }, [id]);

  const fetchInvestmentDetails = async () => {
    setLoading(true);
    try {
      const response = await investmentApi.getOne(id);
      if (response.success) {
        setInvestment(response.data);
        setNewCode(response.data.InvestmentCode || '');
      }
    } catch (error) {
      toast.error('Failed to fetch investment details');
      navigate('/investments');
    } finally {
      setLoading(false);
    }
  };

  // ---- Update InvestmentCode ----
  const handleUpdateCode = async () => {
    if (!newCode.trim()) {
      toast.error('Investment Code cannot be empty');
      return;
    }
    try {
      const response = await investmentApi.update(id, { InvestmentCode: newCode.trim() });
      if (response.success) {
        toast.success('Investment Code updated');
        setEditingCode(false);
        fetchInvestmentDetails();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  // ---- Delete Investment ----
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;
    try {
      const response = await investmentApi.delete(id);
      if (response.success) {
        toast.success('Investment deleted successfully');
        navigate('/investments');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete investment');
    }
  };

  // ---- Approve DPC ----
  const handleApproveDPC = async () => {
    try {
      const response = await investmentApi.approveDPC(id);
      if (response.success) {
        toast.success('DPC approved successfully');
        fetchInvestmentDetails();
      }
    } catch (error) {
      toast.error('Failed to approve DPC');
    }
  };

  // ---- Document Upload ----
  const handleDocUpload = async (docType, file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images and PDFs allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Max size 10MB');
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await filesAPI.uploadSingle(file);
      if (!uploadRes.data.success) {
        toast.error('File upload failed');
        return;
      }
      const newPath = uploadRes.data.data.filePath;

      const updateData = {
        agreementDoc: investment.agreementDoc || '',
        certificateDoc: investment.certificateDoc || '',
        postChequeDoc: investment.postChequeDoc || '',
      };
      if (docType === 'agreement') updateData.agreementDoc = newPath;
      else if (docType === 'certificate') updateData.certificateDoc = newPath;
      else if (docType === 'postCheque') updateData.postChequeDoc = newPath;

      const response = await investmentApi.uploadDocs(id, updateData);
      if (response.success) {
        toast.success(`${docType} document updated`);
        fetchInvestmentDetails();
      } else {
        toast.error(response.message || 'Failed to update document');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ---- Helpers ----
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const returns = investment?.returns || [];
  const paidReturns = returns.filter(r => r.paidOn);
  const pendingReturns = returns.filter(r => !r.paidOn);
  const totalPaid = paidReturns.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalPending = pendingReturns.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!investment) {
    return <div className="text-center py-8 text-gray-500">Investment not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/investments')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Investment Details</h2>
        <button
          onClick={handleDelete}
          className="ml-auto btn-danger flex items-center gap-2"
        >
          <FaTrash /> Delete
        </button>
        {!investment.dpcCheck && (
          <button
            onClick={handleApproveDPC}
            className="btn-primary flex items-center gap-2"
          >
            <FaCheckCircle /> Approve DPC
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-1 card">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <FaMoneyBillWave className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold mt-3">
              ₹{parseFloat(investment.amount).toLocaleString()}
            </h3>
            <p className="text-gray-500">Investment Amount</p>
            <div className="mt-3">
              <StatusBadge status={investment.status} />
            </div>
            {investment.dpcCheck && (
              <div className="mt-2">
                <span className="text-green-600 text-sm font-medium">
                  ✓ DPC Approved
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Investment Date</span>
              <span className="font-medium">{formatDate(investment.investmentDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Maturity Date</span>
              <span className="font-medium">{formatDate(investment.maturityDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Days to Maturity</span>
              <span className="font-medium">
                {Math.ceil((new Date(investment.maturityDate) - new Date()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2 card">
          <h4 className="text-lg font-semibold mb-4">Investment Information</h4>

          {/* Editable Investment Code */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-500">Investment Code</p>
              {editingCode ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter investment code"
                  />
                  <button
                    onClick={handleUpdateCode}
                    className="btn-primary text-sm px-4 py-1.5"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingCode(false);
                      setNewCode(investment.InvestmentCode || '');
                    }}
                    className="btn-secondary text-sm px-4 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {investment.InvestmentCode || 'Not set'}
                  </span>
                  <button
                    onClick={() => setEditingCode(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <FaEdit className="inline mr-1" /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Static Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <DetailItem
              icon={FaUser}
              label="User"
              value={investment.user?.fullName || 'N/A'}
            />
            <DetailItem
              icon={FaChartLine}
              label="Plan"
              value={investment.plan?.name || 'N/A'}
            />
            <DetailItem
              icon={FaCalendar}
              label="Investment Date"
              value={formatDate(investment.investmentDate)}
            />
            <DetailItem
              icon={FaCalendar}
              label="Maturity Date"
              value={formatDate(investment.maturityDate)}
            />
          </div>

          {/* Plan Details */}
          {investment.plan && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold mb-2">Plan Details</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Monthly Return</p>
                  <p className="font-medium">{investment.plan.monthlyReturnPercent}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Annual Bonus</p>
                  <p className="font-medium">{investment.plan.annualBonusPercent}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Maturity Period</p>
                  <p className="font-medium">{investment.plan.maturityPeriod} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Plan Type</p>
                  <p className="font-medium uppercase">{investment.plan.planType || 'Falcon'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="mt-4 p-4 border-2 border-gray-200 rounded-xl">
            <h5 className="font-semibold mb-3">Documents</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'agreement', label: 'Agreement', doc: investment.agreementDoc },
                { key: 'certificate', label: 'Certificate', doc: investment.certificateDoc },
                { key: 'postCheque', label: 'Post-Cheque', doc: investment.postChequeDoc },
              ].map(({ key, label, doc }) => (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  {doc ? (
                    <div className="mt-1 flex items-center gap-2">
                      <FaFileAlt className="text-blue-500" />
                      <a
                        href={`${VITE_BASE_URL}${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        View
                      </a>
                      <label className="cursor-pointer text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                        <FaUpload className="w-3 h-3" /> Replace
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                          onChange={(e) => {
                            if (e.target.files[0]) handleDocUpload(key, e.target.files[0]);
                            e.target.value = '';
                          }}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                      <FaUpload className="w-3 h-3" /> Upload
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                        onChange={(e) => {
                          if (e.target.files[0]) handleDocUpload(key, e.target.files[0]);
                          e.target.value = '';
                        }}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Returns Section */}
          {returns.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold">Returns History</h5>
                <div className="flex gap-3 text-sm">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Paid: ₹{totalPaid.toLocaleString()} ({paidReturns.length})
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    Pending: ₹{totalPending.toLocaleString()} ({pendingReturns.length})
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2">Month</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">ROI (%)</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...returns]
                      .sort((a, b) => parseFloat(a.ROI || 0) - parseFloat(b.ROI || 0))
                      .map((ret) => (
                        <tr key={ret.id} className="border-b border-gray-100">
                          <td className="p-2">{formatDate(ret.month)}</td>

                          <td className="p-2 font-medium">
                            ₹{parseFloat(ret.amount || 0).toLocaleString()}
                          </td>

                          <td className="p-2">
                            {ret.ROI != null ? `${parseInt(ret.ROI, 10)}%` : '—'}
                          </td>

                          <td className="p-2 capitalize">
                            {ret.type?.replace('_', ' ') || '—'}
                          </td>

                          <td className="p-2">
                            <StatusBadge status={ret.paidOn ? 'paid' : 'pending'} />
                          </td>
                        </tr>
                      ))}                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <Icon className="text-gray-400 mt-0.5" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

export default InvestmentDetails;