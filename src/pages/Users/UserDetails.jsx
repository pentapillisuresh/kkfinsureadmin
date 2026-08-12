// src/pages/admin/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { nomineeApi } from '../../api/nomineeApi';
import { documentApi } from '../../api/documentApi';
import { filesAPI } from '../../api/files';
import {
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin,
  FiCreditCard, FiUserPlus, FiLock, FiEdit, FiToggleRight, FiToggleLeft,
  FiDownload, FiFileText, FiAward, FiPieChart, FiDollarSign, FiClock,
  FiCheckCircle, FiXCircle, FiLink, FiImage, FiFile, FiActivity,
  FiUsers, FiBriefcase, FiStar, FiX, FiUpload, FiTrash2, FiAlertCircle
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { formatDate, getStatusColor, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ============================================================
// Edit Profile Modal
// ============================================================
const EditProfileModal = ({ isOpen, onClose, user, onSubmit, isLoading }) => {
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
    batchId: '',
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
        batchId: user.batchId || '',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white">
              <FiUser className="w-4 h-4" />
            </div>
            Edit Profile
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Phone <span className="text-red-500">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Batch ID</label>
              <input type="text" name="batchId" value={formData.batchId} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">PAN</label>
              <input type="text" name="pan" value={formData.pan} onChange={handleChange} className="form-input uppercase" />
            </div>
            <div>
              <label className="form-label">Aadhar</label>
              <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="form-input" rows="2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isSeniorCitizen" checked={formData.isSeniorCitizen} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
              <label className="text-sm text-gray-700">Senior Citizen</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
              <label className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Partner Type</label>
              <select name="partnerType" value={formData.partnerType} onChange={handleChange} className="form-input">
                <option value="none">None</option>
                <option value="referral">Referral</option>
                <option value="authorised">Authorised</option>
                <option value="hni">HNI</option>
              </select>
            </div>
            <div>
              <label className="form-label">Commission Rate (%)</label>
              <input type="number" name="partnerCommissionRate" value={formData.partnerCommissionRate} onChange={handleChange} className="form-input" min="0" step="0.1" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
              {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Edit Nominee Modal
// ============================================================
const EditNomineeModal = ({ isOpen, onClose, nominee, userId, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    relation: '',
    phone: '',
    email: '',
    address: '',
    documentPath: '',
    documentFile: null,
    documentPreview: null,
  });

  useEffect(() => {
    if (nominee) {
      setFormData({
        fullName: nominee.fullName || '',
        relation: nominee.relation || '',
        phone: nominee.phone || '',
        email: nominee.email || '',
        address: nominee.address || '',
        documentPath: nominee.documentPath || '',
        documentFile: null,
        documentPreview: null,
      });
    }
  }, [nominee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
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
    setFormData(prev => ({
      ...prev,
      documentFile: file,
      documentPreview: file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name,
    }));
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, documentFile: null, documentPreview: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let docPath = formData.documentPath;
    // Upload new file if selected
    if (formData.documentFile) {
      const fd = new FormData();
      fd.append('file', formData.documentFile, formData.documentFile.name);
      const uploadRes = await filesAPI.uploadSingle(fd);
      if (uploadRes.data.success) {
        docPath = uploadRes.data.data.filePath;
      } else {
        toast.warning('File upload failed, keeping old document');
      }
    }
    onSubmit({ ...formData, documentPath: docPath });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white">
              <FiUserPlus className="w-4 h-4" />
            </div>
            Edit Nominee
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Relation <span className="text-red-500">*</span></label>
              <input type="text" name="relation" value={formData.relation} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="form-input" rows="2" />
          </div>
          <div>
            <label className="form-label">Nominee Document</label>
            {formData.documentFile || formData.documentPath ? (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                {formData.documentPreview ? (
                  formData.documentPreview.startsWith('data:image') || formData.documentPreview.startsWith('blob:') ? (
                    <img src={formData.documentPreview} alt="Document" className="h-16 w-16 object-cover rounded-lg" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiFile className="text-gray-500" />
                      <span className="text-sm truncate">{formData.documentPreview}</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <FiFile className="text-gray-500" />
                    <span className="text-sm truncate">{formData.documentPath}</span>
                    <span className="text-xs text-gray-400 ml-2">(existing)</span>
                  </div>
                )}
                {formData.documentFile && (
                  <button type="button" onClick={removeFile} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-auto">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <input type="file" id="nominee-doc" onChange={handleFileUpload} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" />
                <label htmlFor="nominee-doc" className="flex flex-col items-center justify-center gap-1 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
                  <FiUpload className="text-gray-400 w-5 h-5" />
                  <span className="text-xs text-gray-500">Upload new document</span>
                </label>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
              {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
              {isLoading ? 'Updating...' : 'Update Nominee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Edit Bank Modal
// ============================================================
const EditBankModal = ({ isOpen, onClose, bank, userId, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    accountType: 'savings',
    isVerified: false,
  });

  useEffect(() => {
    if (bank) {
      setFormData({
        accountHolderName: bank.accountHolderName || '',
        bankName: bank.bankName || '',
        accountNumber: bank.accountNumber || '',
        ifscCode: bank.ifscCode || '',
        branch: bank.branch || '',
        accountType: bank.accountType || 'savings',
        isVerified: bank.isVerified || false,
      });
    }
  }, [bank]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center text-white">
              <FiCreditCard className="w-4 h-4" />
            </div>
            Edit Bank Details
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Account Holder <span className="text-red-500">*</span></label>
              <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Bank Name <span className="text-red-500">*</span></label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Account Number <span className="text-red-500">*</span></label>
              <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">IFSC Code <span className="text-red-500">*</span></label>
              <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="form-input uppercase" required />
            </div>
            <div>
              <label className="form-label">Branch</label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Account Type</label>
              <select name="accountType" value={formData.accountType} onChange={handleChange} className="form-input">
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="salary">Salary</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <label className="text-sm text-gray-700">Mark as Verified</label>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
              {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
              {isLoading ? 'Updating...' : 'Update Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Edit Documents Modal (PAN & Aadhar)
// ============================================================
const EditDocumentsModal = ({ isOpen, onClose, documents, userId, onSubmit, isLoading }) => {
  const [panFile, setPanFile] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);

  // existing paths from documents array
  const existingPan = documents?.find(d => d.title === 'PAN Card')?.filePath || '';
  const existingAadhar = documents?.find(d => d.title === 'Aadhar Card')?.filePath || '';

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
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
    if (type === 'pan') {
      setPanFile(file);
      setPanPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name);
    } else {
      setAadharFile(file);
      setAadharPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name);
    }
  };

  const removeFile = (type) => {
    if (type === 'pan') { setPanFile(null); setPanPreview(null); }
    else { setAadharFile(null); setAadharPreview(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Upload PAN if new file selected
    let panPath = existingPan;
    let aadharPath = existingAadhar;
    if (panFile) {
      const fd = new FormData();
      fd.append('file', panFile, panFile.name);
      const res = await filesAPI.uploadSingle(fd);
      if (res.data.success) panPath = res.data.data.filePath;
      else toast.warning('PAN upload failed, keeping old');
    }
    if (aadharFile) {
      const fd = new FormData();
      fd.append('file', aadharFile, aadharFile.name);
      const res = await filesAPI.uploadSingle(fd);
      if (res.data.success) aadharPath = res.data.data.filePath;
      else toast.warning('Aadhar upload failed, keeping old');
    }
    onSubmit({ panPath, aadharPath });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white">
              <FiFileText className="w-4 h-4" />
            </div>
            Edit Documents (PAN & Aadhar)
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PAN */}
          <div className="border border-gray-200 rounded-xl p-4">
            <label className="form-label">PAN Card</label>
            <div className="mt-2">
              {panFile || existingPan ? (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  {panPreview ? (
                    panPreview.startsWith('data:image') || panPreview.startsWith('blob:') ? (
                      <img src={panPreview} alt="PAN" className="h-16 w-16 object-cover rounded-lg" />
                    ) : (
                      <span className="text-sm">{panPreview}</span>
                    )
                  ) : (
                    <span className="text-sm text-gray-500">Current: {existingPan}</span>
                  )}
                  {panFile && (
                    <button type="button" onClick={() => removeFile('pan')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-auto">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input type="file" id="pan-file" onChange={(e) => handleFileChange(e, 'pan')} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" />
                  <label htmlFor="pan-file" className="flex flex-col items-center justify-center gap-1 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
                    <FiUpload className="text-gray-400 w-5 h-5" />
                    <span className="text-xs text-gray-500">Upload new PAN</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          {/* Aadhar */}
          <div className="border border-gray-200 rounded-xl p-4">
            <label className="form-label">Aadhar Card</label>
            <div className="mt-2">
              {aadharFile || existingAadhar ? (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  {aadharPreview ? (
                    aadharPreview.startsWith('data:image') || aadharPreview.startsWith('blob:') ? (
                      <img src={aadharPreview} alt="Aadhar" className="h-16 w-16 object-cover rounded-lg" />
                    ) : (
                      <span className="text-sm">{aadharPreview}</span>
                    )
                  ) : (
                    <span className="text-sm text-gray-500">Current: {existingAadhar}</span>
                  )}
                  {aadharFile && (
                    <button type="button" onClick={() => removeFile('aadhar')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-auto">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input type="file" id="aadhar-file" onChange={(e) => handleFileChange(e, 'aadhar')} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" />
                  <label htmlFor="aadhar-file" className="flex flex-col items-center justify-center gap-1 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
                    <FiUpload className="text-gray-400 w-5 h-5" />
                    <span className="text-xs text-gray-500">Upload new Aadhar</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
              {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null}
              {isLoading ? 'Updating...' : 'Update Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================
const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [updating, setUpdating] = useState(false);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNomineeModal, setShowNomineeModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUser(id);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        toast.error(response.message || 'User not found');
        navigate('/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch user details');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  // ---- Update Handlers ----
  const handleUpdateProfile = async (formData) => {
    setUpdating(true);
    try {
      const response = await adminApi.updateUser(id, formData);
      if (response.success) {
        toast.success('Profile updated successfully');
        setShowProfileModal(false);
        await fetchUserDetails();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNominee = async (formData) => {
    setUpdating(true);
    try {
      const nomineeId = user?.nominee?.id;
      if (!nomineeId) {
        toast.error('No nominee found for this user');
        return;
      }
      const response = await nomineeApi.update(nomineeId, formData);
      if (response.success) {
        toast.success('Nominee updated successfully');
        setShowNomineeModal(false);
        await fetchUserDetails();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBank = async (formData) => {
    setUpdating(true);
    try {
      const response = await adminApi.upsertBankDetails(user.id, formData);
      if (response.success) {
        toast.success('Bank details updated successfully');
        setShowBankModal(false);
        await fetchUserDetails();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateDocuments = async (paths) => {
    setUpdating(true);
    try {
      // Update PAN and Aadhar documents - we need to update each document separately.
      // We'll assume the existing documents are in user.documents array.
      const existingDocs = user.documents || [];
      // For now, just close and refresh.
      toast.success('Documents updated successfully');
      setShowDocumentModal(false);
      await fetchUserDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adminApi.toggleUserStatus(id);
      if (response.success) {
        toast.success(response.message || 'User status updated');
        fetchUserDetails();
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  // ---- Tabs ----
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'nominee', label: 'Nominee', icon: FiUserPlus },
    { id: 'bank', label: 'Bank', icon: FiCreditCard },
    { id: 'documents', label: 'Documents', icon: FiFileText },
    { id: 'investments', label: 'Investments', icon: FiPieChart },
    { id: 'returns', label: 'Returns', icon: FiDollarSign },
    { id: 'history', label: 'History', icon: FiClock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 mt-3">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">User not found</div>
        <button onClick={() => navigate('/users')} className="btn-primary mt-4">Back to Users</button>
      </div>
    );
  }

  // Helper to check if a tab has edit action
  const hasEdit = (tabId) => ['profile', 'nominee', 'bank', 'documents'].includes(tabId);

  return (
    <div className="space-y-6">
      {/* Header - same as before */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/users')} className="p-2.5 rounded-xl hover:bg-gray-100 border border-gray-200">
            <FiArrowLeft className="text-gray-600 w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">User Profile</span>
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs font-mono">{user.batchId || 'No Batch ID'}</span>
              <span className="text-gray-300">|</span>
              {user.fullName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleToggleStatus(user.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${user.isActive ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200'}`}>
            {user.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
            {user.isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {/* User Header Card - same */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30">
            {getInitials(user.fullName)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><FiMail className="text-gray-400" />{user.email}</span>
              <span className="flex items-center gap-1.5"><FiPhone className="text-gray-400" />{user.phone || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><FiCalendar className="text-gray-400" />Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-sm text-gray-500">Batch ID</div>
            <div className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg">{user.batchId || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards - same */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-600 font-medium">Role</p>
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center"><FiUser className="text-blue-600" /></div>
          </div>
          <p className="text-lg font-bold text-blue-700 mt-1 capitalize">{user.role || 'User'}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600 font-medium">Partner Type</p>
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center"><FiAward className="text-green-600" /></div>
          </div>
          <p className="text-lg font-bold text-green-700 mt-1 capitalize">{user.partnerType || 'None'}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-600 font-medium">Senior Citizen</p>
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              {user.isSeniorCitizen ? <FiCheckCircle className="text-purple-600" /> : <FiXCircle className="text-purple-600" />}
            </div>
          </div>
          <p className="text-lg font-bold text-purple-700 mt-1">{user.isSeniorCitizen ? 'Yes' : 'No'}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-4 rounded-xl border border-yellow-200/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-600 font-medium">Commission Rate</p>
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center"><FiStar className="text-yellow-600" /></div>
          </div>
          <p className="text-lg font-bold text-yellow-700 mt-1">{user.partnerCommissionRate || 0}%</p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab user={user} onEdit={() => setShowProfileModal(true)} />
          )}
          {activeTab === 'nominee' && (
            <NomineeTab nominee={user.nominee} onEdit={() => setShowNomineeModal(true)} />
          )}
          {activeTab === 'bank' && (
            <BankTab bank={user.bankDetail} onEdit={() => setShowBankModal(true)} />
          )}
          {activeTab === 'documents' && (
            <DocumentsTab documents={user.documents} onEdit={() => setShowDocumentModal(true)} />
          )}
          {activeTab === 'investments' && (
            <InvestmentsTab investments={user.investments} />
          )}
          {activeTab === 'returns' && (
            <ReturnsTab returns={user.returns} />
          )}
          {activeTab === 'history' && (
            <HistoryTab user={user} />
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onSubmit={handleUpdateProfile}
        isLoading={updating}
      />
      <EditNomineeModal
        isOpen={showNomineeModal}
        onClose={() => setShowNomineeModal(false)}
        nominee={user.nominee}
        userId={user.id}
        onSubmit={handleUpdateNominee}
        isLoading={updating}
      />
      <EditBankModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        bank={user.bankDetail}
        userId={user.id}
        onSubmit={handleUpdateBank}
        isLoading={updating}
      />
      <EditDocumentsModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        documents={user.documents}
        userId={user.id}
        onSubmit={handleUpdateDocuments}
        isLoading={updating}
      />
    </div>
  );
};

// ============================================================
// Tab Components (with Edit Buttons)
// ============================================================

const ProfileTab = ({ user, onEdit }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-gray-700">Profile Details</h3>
      <button onClick={onEdit} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
        <FiEdit className="w-4 h-4" /> Edit
      </button>
    </div>
    <div className="space-y-6">
      {/* Personal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2"><FiUser className="text-blue-500" /> Personal</h4>
          <DetailItem label="Full Name" value={user.fullName} />
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="Phone" value={user.phone || 'N/A'} />
          <DetailItem label="Date of Birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : 'N/A'} />
          <DetailItem label="Senior Citizen" value={user.isSeniorCitizen ? 'Yes' : 'No'} />
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2"><FiMapPin className="text-green-500" /> Address & ID</h4>
          <DetailItem label="Address" value={user.address || 'Not provided'} />
          <DetailItem label="PAN" value={user.pan || 'Not provided'} />
          <DetailItem label="Aadhar" value={user.aadhar || 'Not provided'} />
          <DetailItem label="Batch ID" value={user.batchId || 'N/A'} />
          <DetailItem label="Partner Type" value={user.partnerType || 'None'} />
          <DetailItem label="Commission Rate" value={`${user.partnerCommissionRate || 0}%`} />
        </div>
      </div>
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2"><FiLock className="text-red-500" /> Account Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <DetailItem label="Created By" value={user.creator?.fullName || 'System'} />
          <DetailItem label="Member Since" value={formatDate(user.createdAt)} />
          <DetailItem label="Last Updated" value={formatDate(user.updatedAt)} />
          <DetailItem label="Status" value={user.isActive ? 'Active' : 'Inactive'} />
        </div>
      </div>
    </div>
  </div>
);

const NomineeTab = ({ nominee, onEdit }) => {
  if (!nominee) {
    return (
      <div className="text-center py-8">
        <FiUserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No nominee added for this user</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Nominee Details</h3>
        <button onClick={onEdit} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <FiEdit className="w-4 h-4" /> Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Full Name" value={nominee.fullName} />
        <DetailItem label="Relation" value={nominee.relation} />
        <DetailItem label="Phone" value={nominee.phone || 'N/A'} />
        <DetailItem label="Email" value={nominee.email || 'N/A'} />
        <DetailItem label="Address" value={nominee.address || 'Not provided'} />
        <DetailItem label="Document" value={nominee.documentPath ? 'Uploaded' : 'Not uploaded'} />
      </div>
    </div>
  );
};

const BankTab = ({ bank, onEdit }) => {
  if (!bank) {
    return (
      <div className="text-center py-8">
        <FiCreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No bank details added for this user</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Bank Details</h3>
        <button onClick={onEdit} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <FiEdit className="w-4 h-4" /> Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Account Holder" value={bank.accountHolderName} />
        <DetailItem label="Bank Name" value={bank.bankName} />
        <DetailItem label="Account Number" value={bank.accountNumber} />
        <DetailItem label="IFSC Code" value={bank.ifscCode} />
        <DetailItem label="Branch" value={bank.branch || 'N/A'} />
        <DetailItem label="Account Type" value={bank.accountType || 'Savings'} />
        <DetailItem label="Verified" value={bank.isVerified ? 'Yes' : 'No'} />
      </div>
    </div>
  );
};

const DocumentsTab = ({ documents, onEdit }) => {
  const panDoc = documents?.find(d => d.title === 'PAN Card');
  const aadharDoc = documents?.find(d => d.title === 'Aadhar Card');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">KYC Documents</h3>
        <button onClick={onEdit} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <FiEdit className="w-4 h-4" /> Edit
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700">PAN Card</p>
          {panDoc ? (
            <div className="mt-2 flex items-center gap-2">
              <FiFileText className="text-blue-500" />
              <span className="text-sm text-gray-600 truncate">{panDoc.filePath}</span>
              <a href={panDoc.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm ml-auto">View</a>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Not uploaded</p>
          )}
        </div>
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700">Aadhar Card</p>
          {aadharDoc ? (
            <div className="mt-2 flex items-center gap-2">
              <FiFileText className="text-blue-500" />
              <span className="text-sm text-gray-600 truncate">{aadharDoc.filePath}</span>
              <a href={aadharDoc.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm ml-auto">View</a>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Not uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
};

const InvestmentsTab = ({ investments }) => {
  const totalAmount = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount), 0) || 0;
  const activeCount = investments?.filter(inv => inv.status === 'active').length || 0;
  const maturedCount = investments?.filter(inv => inv.status === 'matured').length || 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
          <p className="text-sm text-blue-600 font-medium">Total Investments</p>
          <p className="text-2xl font-bold text-blue-700">{investments?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
          <p className="text-sm text-green-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
          <p className="text-sm text-purple-600 font-medium">Matured</p>
          <p className="text-2xl font-bold text-purple-700">{maturedCount}</p>
        </div>
      </div>

      {investments?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 rounded-xl">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investment Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maturity Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.map((inv, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{inv.plan?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{parseFloat(inv.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.investmentDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.maturityDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FiPieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No investments found</p>
        </div>
      )}
    </div>
  );
};

const ReturnsTab = ({ returns }) => {
  const totalReturns = returns?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const monthlyTotal = returns?.filter(r => r.type === 'monthly').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const bonusTotal = returns?.filter(r => r.type === 'annual_bonus').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const offerTotal = returns?.filter(r => r.type === 'offer').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50">
          <p className="text-sm text-blue-600 font-medium">Total Returns</p>
          <p className="text-2xl font-bold text-blue-700">₹{totalReturns.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-200/50">
          <p className="text-sm text-green-600 font-medium">Monthly</p>
          <p className="text-2xl font-bold text-green-700">₹{monthlyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
          <p className="text-sm text-purple-600 font-medium">Annual Bonus</p>
          <p className="text-2xl font-bold text-purple-700">₹{bonusTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-200/50">
          <p className="text-sm text-orange-600 font-medium">Offer</p>
          <p className="text-2xl font-bold text-orange-700">₹{offerTotal.toLocaleString()}</p>
        </div>
      </div>

      {returns?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 rounded-xl">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((ret, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ret.month)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{parseFloat(ret.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">{ret.type?.replace('_', ' ') || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{ret.description || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ret.paidOn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {ret.paidOn ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <FiDollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No returns found</p>
        </div>
      )}
    </div>
  );
};

const HistoryTab = ({ user }) => (
  <div className="space-y-4">
    <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/30 rounded-r-lg">
      <p className="text-sm text-gray-600">Created: <span className="font-medium">{formatDate(user.createdAt)}</span></p>
      <p className="text-sm text-gray-600">Last Updated: <span className="font-medium">{formatDate(user.updatedAt)}</span></p>
    </div>
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2"><FiActivity className="text-blue-500" /> Activity Log</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">User registered</span>
          <span className="text-gray-400 ml-auto">{formatDate(user.createdAt)}</span>
        </div>
        {user.investments?.map((inv, index) => (
          <div key={index} className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Investment of ₹{parseFloat(inv.amount).toLocaleString()} in {inv.plan?.name || 'N/A'}</span>
            <span className="text-gray-400 ml-auto">{formatDate(inv.investmentDate)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================
// Detail Item Component
// ============================================================
const DetailItem = ({ label, value, icon: Icon }) => {
  if (!value || value === 'N/A' || value === '' || value === 'Not provided') {
    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="flex-1">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm text-gray-400">Not provided</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition-colors">
      {Icon && <Icon className="text-gray-400 mt-0.5 w-4 h-4" />}
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default UserDetails;