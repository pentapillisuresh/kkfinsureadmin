// src/pages/admin/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { nomineeApi } from '../../api/nomineeApi';
import { authApi } from '../../api/authApi';
import { documentApi } from '../../api/documentApi'; 
import { filesAPI } from '../../api/files';
import {
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin,
  FiCreditCard, FiUserPlus, FiLock, FiEdit, FiToggleRight, FiToggleLeft,
  FiDownload, FiFileText, FiAward, FiPieChart, FiDollarSign, FiClock,
  FiCheckCircle, FiXCircle, FiLink, FiImage, FiFile, FiActivity,
  FiUsers, FiBriefcase, FiStar, FiX, FiUpload, FiTrash2, FiAlertCircle,
  FiBook, FiGlobe, FiHash,
} from 'react-icons/fi';
import { FaSpinner,FaUpload } from 'react-icons/fa';
import { formatDate, getStatusColor, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const VITE_BASE_URL = "http://localhost:3000/";
// const VITE_BASE_URL = "http://service.kkfinsure.org/";

// ============================================================
// Edit Profile Modal (unchanged)
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
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'pan') finalValue = value.toUpperCase();
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
              <p className="text-xs text-gray-500">Update user information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110">
            <FiX className="text-gray-400 hover:text-gray-600 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                  required
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                  required
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Date of Birth
              </label>
              <div className="relative group">
                <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Batch ID
              </label>
              <div className="relative group">
                <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                  placeholder="BATCH-001"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                PAN
              </label>
              <div className="relative group">
                <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm uppercase transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Aadhar
              </label>
              <div className="relative group">
                <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                  placeholder="123456789012"
                  maxLength={12}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Address
            </label>
            <div className="relative group">
              <FiMapPin className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 min-h-[80px] resize-y"
                rows="2"
                placeholder="123 Main St, City, State, Country"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                name="isSeniorCitizen"
                checked={formData.isSeniorCitizen}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Senior Citizen</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Active</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Partner Type
              </label>
              <select
                name="partnerType"
                value={formData.partnerType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 appearance-none cursor-pointer"
              >
                <option value="none">None</option>
                <option value="referral">Referral</option>
                <option value="authorised">Authorised</option>
                <option value="hni">HNI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Commission Rate (%)
              </label>
              <div className="relative group">
                <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
                <input
                  type="number"
                  name="partnerCommissionRate"
                  value={formData.partnerCommissionRate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
              {isLoading ? <FaSpinner className="animate-spin" /> : null}
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Edit Nominee Modal (supports both create and update)
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
    } else {
      // Reset when opening for creation
      setFormData({
        fullName: '',
        relation: '',
        phone: '',
        email: '',
        address: '',
        documentPath: '',
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
    if (formData.documentFile) {
      const uploadRes = await filesAPI.uploadSingle(formData.documentFile);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <FiUserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{nominee ? 'Edit Nominee' : 'Add Nominee'}</h3>
              <p className="text-xs text-gray-500">{nominee ? 'Update nominee information' : 'Add a new nominee'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110">
            <FiX className="text-gray-400 hover:text-gray-600 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name {!nominee && <span className="text-red-500">*</span>}
              </label>
              <div className="relative group">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10"
                  required={!nominee}
                  placeholder="Jane Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Relation {!nominee && <span className="text-red-500">*</span>}
              </label>
              <div className="relative group">
                <FiUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10"
                  required={!nominee}
                  placeholder="Spouse, Son, Daughter"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <div className="relative group">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10"
                  placeholder="jane@example.com"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Address
            </label>
            <div className="relative group">
              <FiMapPin className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" size={18} />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/10 min-h-[80px] resize-y"
                rows="2"
                placeholder="Nominee's address"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Nominee Document
            </label>
            {formData.documentFile || formData.documentPath ? (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border-2 border-gray-200">
                {formData.documentPreview ? (
                  formData.documentPreview.startsWith('data:image') || formData.documentPreview.startsWith('blob:') ? (
                    <img src={formData.documentPreview} alt="Document" className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiFile className="text-gray-500 w-5 h-5" />
                      <span className="text-sm font-medium text-gray-700 truncate">{formData.documentPreview}</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <FiFile className="text-gray-500 w-5 h-5" />
                    <span className="text-sm font-medium text-gray-700 truncate">{formData.documentPath}</span>
                    <span className="text-xs text-gray-400 ml-2">(existing)</span>
                  </div>
                )}
                {formData.documentFile && (
                  <button type="button" onClick={removeFile} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg ml-auto transition-all duration-200">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <input type="file" id="nominee-doc" onChange={handleFileUpload} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" />
                <label htmlFor="nominee-doc" className="flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-gradient-to-b hover:from-orange-50 hover:to-transparent transition-all duration-300 group">
                  <div className="p-2.5 bg-gray-100 rounded-full group-hover:bg-orange-100 transition-colors duration-300">
                    <FiUpload className="text-gray-500 group-hover:text-orange-500 w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Upload new document</span>
                </label>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
              {isLoading ? <FaSpinner className="animate-spin" /> : null}
              {isLoading ? 'Saving...' : nominee ? 'Update Nominee' : 'Add Nominee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Edit Bank Modal (supports both create and update)
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
    } else {
      setFormData({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',
        accountType: 'savings',
        isVerified: false,
      });
    }
  }, [bank]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'ifscCode') finalValue = value.toUpperCase();
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <FiCreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{bank ? 'Edit Bank Details' : 'Add Bank Details'}</h3>
              <p className="text-xs text-gray-500">{bank ? 'Update bank account information' : 'Add new bank details'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110">
            <FiX className="text-gray-400 hover:text-gray-600 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Holder <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10"
                  required
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10"
                  required
                  placeholder="State Bank of India"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10"
                  required
                  placeholder="123456789012"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm uppercase transition-all duration-200 outline-none focus:bg-white focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10"
                  required
                  placeholder="SBIN0001234"
                  maxLength={11}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Branch
              </label>
              <div className="relative group">
                <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10"
                  placeholder="Main Branch"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/10 appearance-none cursor-pointer"
              >
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="salary">Salary</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Mark as Verified</span>
          </label>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
              {isLoading ? <FaSpinner className="animate-spin" /> : null}
              {isLoading ? 'Saving...' : bank ? 'Update Bank' : 'Add Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Edit Documents Modal (PAN & Aadhar) - for replacement
// ============================================================
const EditDocumentsModal = ({ isOpen, onClose, documents, userId, onSubmit, isLoading }) => {
  const [panFile, setPanFile] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);

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
    let panPath = existingPan;
    let aadharPath = existingAadhar;
    if (panFile) {
      const res = await filesAPI.uploadSingle(panFile);
      if (res.data.success) panPath = res.data.data.filePath;
      else toast.warning('PAN upload failed, keeping old');
    }
    if (aadharFile) {
      const res = await filesAPI.uploadSingle(aadharFile);
      if (res.data.success) aadharPath = res.data.data.filePath;
      else toast.warning('Aadhar upload failed, keeping old');
    }
    onSubmit({ panPath, aadharPath });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Edit Documents</h3>
              <p className="text-xs text-gray-500">Update KYC documents (PAN & Aadhar)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110">
            <FiX className="text-gray-400 hover:text-gray-600 w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PAN */}
          <div className="border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-300">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              PAN Card
            </label>
            <div>
              {panFile || existingPan ? (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border-2 border-gray-200">
                  {panPreview ? (
                    panPreview.startsWith('data:image') || panPreview.startsWith('blob:') ? (
                      <img src={panPreview} alt="PAN" className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiFile className="text-gray-500 w-5 h-5" />
                        <span className="text-sm font-medium text-gray-700 truncate">{panPreview}</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiFile className="text-gray-500 w-5 h-5" />
                      <span className="text-sm font-medium text-gray-700 truncate">{existingPan}</span>
                      <span className="text-xs text-gray-400 ml-2">(existing)</span>
                    </div>
                  )}
                  {panFile && (
                    <button type="button" onClick={() => removeFile('pan')} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg ml-auto transition-all duration-200">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input type="file" id="pan-file" onChange={(e) => handleFileChange(e, 'pan')} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" />
                  <label htmlFor="pan-file" className="flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-gradient-to-b hover:from-blue-50 hover:to-transparent transition-all duration-300 group">
                    <div className="p-2.5 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                      <FiUpload className="text-gray-500 group-hover:text-blue-500 w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Upload new PAN</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          {/* Aadhar */}
          <div className="border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-300">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Aadhar Card
            </label>
            <div>
              {aadharFile || existingAadhar ? (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border-2 border-gray-200">
                  {aadharPreview ? (
                    aadharPreview.startsWith('data:image') || aadharPreview.startsWith('blob:') ? (
                      <img src={aadharPreview} alt="Aadhar" className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiFile className="text-gray-500 w-5 h-5" />
                        <span className="text-sm font-medium text-gray-700 truncate">{aadharPreview}</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiFile className="text-gray-500 w-5 h-5" />
                      <span className="text-sm font-medium text-gray-700 truncate">{existingAadhar}</span>
                      <span className="text-xs text-gray-400 ml-2">(existing)</span>
                    </div>
                  )}
                  {aadharFile && (
                    <button type="button" onClick={() => removeFile('aadhar')} className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg ml-auto transition-all duration-200">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input type="file" id="aadhar-file" onChange={(e) => handleFileChange(e, 'aadhar')} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" />
                  <label htmlFor="aadhar-file" className="flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-gradient-to-b hover:from-blue-50 hover:to-transparent transition-all duration-300 group">
                    <div className="p-2.5 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                      <FiUpload className="text-gray-500 group-hover:text-blue-500 w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Upload new Aadhar</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
              {isLoading ? <FaSpinner className="animate-spin" /> : null}
              {isLoading ? 'Updating...' : 'Update Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Add Single Document Modal (PAN or Aadhar)
// ============================================================
const AddDocumentModal = ({ isOpen, onClose, title, onUpload, isLoading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Only images and PDFs allowed');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Max size 10MB');
      return;
    }
    setFile(selectedFile);
    setPreview(selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : selectedFile.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    onUpload(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Upload {title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select {title} (JPEG, PNG, PDF)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
              onChange={handleFileChange}
              className="mt-2 w-full p-2 border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-400 transition-all"
            />
            {preview && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                {preview.startsWith('data:image') || preview.startsWith('blob:') ? (
                  <img src={preview} alt={title} className="h-12 w-12 object-cover rounded-lg" />
                ) : (
                  <FiFile className="text-gray-500 w-5 h-5" />
                )}
                <span className="text-sm text-gray-600 truncate">{file?.name}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {isLoading ? <FaSpinner className="animate-spin" /> : null}
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// Tab Components
// ============================================================

const ProfileTab = ({ user, onEdit }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-semibold text-gray-700 text-lg">Profile Details</h3>
      <button onClick={onEdit} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center gap-2 text-sm">
        <FiEdit className="w-4 h-4" /> Edit
      </button>
    </div>
    <div className="space-y-6">
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

const NomineeTab = ({ nominee, onEdit, onCreate }) => {
  if (!nominee) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiUserPlus className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No nominee added</p>
        <p className="text-sm text-gray-400 mt-1">Add nominee information</p>
        <button
          onClick={onCreate}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/30 flex items-center gap-2 mx-auto"
        >
          <FiUserPlus className="w-4 h-4" /> Add Nominee
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-700 text-lg">Nominee Details</h3>
        <button onClick={onEdit} className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-orange-500/30 flex items-center gap-2 text-sm">
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

const BankTab = ({ bank, onEdit, onCreate }) => {
  if (!bank) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiCreditCard className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No bank details added</p>
        <p className="text-sm text-gray-400 mt-1">Add bank information</p>
        <button
          onClick={onCreate}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center gap-2 mx-auto"
        >
          <FiCreditCard className="w-4 h-4" /> Add Bank Details
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-700 text-lg">Bank Details</h3>
        <button onClick={onEdit} className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center gap-2 text-sm">
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

const DocumentsTab = ({
  documents,
  investments = [],
  companyDocuments = [],
  onEdit,
  onAddPan,
  onAddAadhar,
  onUpdatePan,
  onUpdateAadhar,
  onUpdateInvestmentDoc // (investmentId, docType, file)
}) => {
  const panDoc = documents?.find(d => d.title === 'PAN Card');
  const aadharDoc = documents?.find(d => d.title === 'Aadhar Card');

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
    if (type === 'pan' && panDoc) {
      onUpdatePan(panDoc.id, file);
    } else if (type === 'aadhar' && aadharDoc) {
      onUpdateAadhar(aadharDoc.id, file);
    }
    e.target.value = '';
  };

  const handleInvestmentDocUpload = (investmentId, docType, e) => {
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
    onUpdateInvestmentDoc(investmentId, docType, file);
    e.target.value = '';
  };

  return (
    <div>
      {/* KYC Documents */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-700 text-lg">KYC Documents</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* PAN Card */}
        <div className="border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-300">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-700">PAN Card</p>
            {panDoc ? (
              <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <FiEdit className="w-3.5 h-3.5" /> Update
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                  onChange={(e) => handleFileChange(e, 'pan')}
                />
              </label>
            ) : (
              <button onClick={onAddPan} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <FiUpload className="w-3.5 h-3.5" /> Upload
              </button>
            )}
          </div>
          {panDoc ? (
            <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <FiFileText className="text-green-500" />
              <span className="text-sm text-gray-600 truncate flex-1">{panDoc.filePath}</span>
              <a href={`${VITE_BASE_URL}${panDoc.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm ml-auto hover:underline">View</a>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Not uploaded</p>
          )}
        </div>

        {/* Aadhar Card */}
        <div className="border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-300">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-700">Aadhar Card</p>
            {aadharDoc ? (
              <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <FiEdit className="w-3.5 h-3.5" /> Update
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                  onChange={(e) => handleFileChange(e, 'aadhar')}
                />
              </label>
            ) : (
              <button onClick={onAddAadhar} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <FiUpload className="w-3.5 h-3.5" /> Upload
              </button>
            )}
          </div>
          {aadharDoc ? (
            <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <FiFileText className="text-green-500" />
              <span className="text-sm text-gray-600 truncate flex-1">{aadharDoc.filePath}</span>
              <a href={`${VITE_BASE_URL}${aadharDoc.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm ml-auto hover:underline">View</a>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Not uploaded</p>
          )}
        </div>
      </div>

      {/* Investment Documents */}
      {investments.length > 0 && ( 
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 text-lg mb-4">Investment Documents</h3>
          <div className="space-y-6">
            {investments.map((inv) => (
              <div key={inv.id} className="border-2 border-gray-200 rounded-xl p-5">
                <p className="font-medium text-gray-800 mb-3">
                  Investment #{inv.InvestmentCode || inv.id.slice(0, 8)}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Agreement */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Agreement</label>
                    {inv.agreementDoc ? (
                      <div className="mt-1 flex items-center gap-2">
                        <FiBriefcase className="text-blue-500" />
                        <a href={`${VITE_BASE_URL}${inv.agreementDoc}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate flex-1">View</a>
                        <label className="cursor-pointer text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                          <FaUpload className="w-3 h-3" /> Replace
                          <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                            onChange={(e) => handleInvestmentDocUpload(inv.id, 'agreement', e)}
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
                          onChange={(e) => handleInvestmentDocUpload(inv.id, 'agreement', e)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Certificate */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Certificate</label>
                    {inv.certificateDoc ? (
                      <div className="mt-1 flex items-center gap-2">
                        <FiBriefcase className="text-blue-500" />
                        <a href={`${VITE_BASE_URL}${inv.certificateDoc}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate flex-1">View</a>
                        <label className="cursor-pointer text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                          <FaUpload className="w-3 h-3" /> Replace
                          <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                            onChange={(e) => handleInvestmentDocUpload(inv.id, 'certificate', e)}
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
                          onChange={(e) => handleInvestmentDocUpload(inv.id, 'certificate', e)}
                        />
                      </label>
                    )}
                  </div>

                  {/* Post-Cheque */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Post-Cheque</label>
                    {inv.postChequeDoc ? (
                      <div className="mt-1 flex items-center gap-2">
                        <FiBriefcase className="text-blue-500" />
                        <a href={`${VITE_BASE_URL}${inv.postChequeDoc}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate flex-1">View</a>
                        <label className="cursor-pointer text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                          <FaUpload className="w-3 h-3" /> Replace
                          <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                            onChange={(e) => handleInvestmentDocUpload(inv.id, 'postCheque', e)}
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
                          onChange={(e) => handleInvestmentDocUpload(inv.id, 'postCheque', e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Documents */}
      {companyDocuments.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 text-lg mb-4">Company Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyDocuments.map((doc) => (
              <div key={doc.id} className="border-2 border-gray-200 rounded-xl p-4">
                <p className="font-medium text-gray-800">{doc.title}</p>
                <p className="text-xs text-gray-500 mt-1">{doc.type}</p>
                <div className="mt-2 flex items-center gap-2">
                  <FiFileText className="text-blue-500" />
                  <a href={`${VITE_BASE_URL}${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate flex-1">View</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPieChart className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No investments found</p>
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
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No returns found</p>
        </div>
      )}
    </div>
  );
};

const HistoryTab = ({ user }) => (
  <div className="space-y-4">
    <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/30 rounded-r-lg">
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
  if (!value || value === 'N/A' || value === '' || value === 'Not provided' || value === 'None') {
    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100/70">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-sm text-gray-400">Not provided</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200">
      {Icon && <Icon className="text-gray-400 mt-0.5 w-4 h-4" />}
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
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
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNomineeModal, setShowNomineeModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Add modals state
  const [showAddPanModal, setShowAddPanModal] = useState(false);
  const [showAddAadharModal, setShowAddAadharModal] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    fetchCompanyDocuments();
  }, [id]);

  const fetchCompanyDocuments = async () => {
    try {
      const response = await documentApi.getCompanyDocuments();
      if (response.success) setCompanyDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch company documents');
    }
  };

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
      let response;
      if (nomineeId) {
        response = await nomineeApi.update(nomineeId, formData);
      } else {
        // Create nominee
        const payload = {
          userId: user.id,
          fullName: formData.fullName,
          relation: formData.relation,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          documentPath: formData.documentPath || undefined
        };
        response = await nomineeApi.create(payload);
      }
      if (response.success) {
        toast.success(nomineeId ? 'Nominee updated' : 'Nominee added');
        setShowNomineeModal(false);
        await fetchUserDetails();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBank = async (formData) => {
    setUpdating(true);
    try {
      const response = await authApi.upsertBankDetails({
        userId: user.id,
        ...formData
      });
      if (response.success) {
        toast.success(user.bankDetail ? 'Bank updated' : 'Bank added');
        setShowBankModal(false);
        await fetchUserDetails();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setUpdating(false);
    }
  };

  // --- Documents: bulk update (from modal) ---
  const handleUpdateDocuments = async (paths) => {
    setUpdating(true);
    try {
      const panDoc = user.documents?.find(d => d.title === 'PAN Card');
      const aadharDoc = user.documents?.find(d => d.title === 'Aadhar Card');

      if (paths.panPath && panDoc) {
        await documentApi.update(panDoc.id, { filePath: paths.panPath });
      }
      if (paths.aadharPath && aadharDoc) {
        await documentApi.update(aadharDoc.id, { filePath: paths.aadharPath });
      }

      toast.success('Documents updated successfully');
      setShowDocumentModal(false);
      await fetchUserDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // --- Single document update (inline) ---
  const handleSingleDocumentUpdate = async (docId, file, title) => {
    setUpdating(true);
    try {
      // Upload file
      const uploadRes = await filesAPI.uploadSingle(file);
      if (!uploadRes.data.success) {
        toast.error('File upload failed');
        return;
      }
      const newPath = uploadRes.data.data.filePath;

      // Update document record
      const response = await documentApi.update(docId, { filePath: newPath });
      if (response.success) {
        toast.success(`${title} updated successfully`);
        await fetchUserDetails();
      } else {
        toast.error(response.message || `Failed to update ${title}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${title}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddSingleDocument = async (file, title) => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('type', 'kyc');
      formData.append('title', title);
      const response = await documentApi.upload(formData);
      if (response.success) {
        toast.success(`${title} uploaded successfully`);
        if (title === 'PAN Card') setShowAddPanModal(false);
        else setShowAddAadharModal(false);
        await fetchUserDetails();
      } else {
        toast.error(response.message || `Failed to upload ${title}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to upload ${title}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateInvestmentDoc = async (docType, file) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/users')} className="p-2.5 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all duration-200 hover:scale-105">
            <FiArrowLeft className="text-gray-600 w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">User Profile</span>
            </h1>
            <p className="text-gray-500 flex items-center gap-2 text-sm">
              <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs font-mono">{user.batchId || 'No Batch ID'}</span>
              <span className="text-gray-300">|</span>
              {user.fullName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${user.isActive ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200'}`}>
            {user.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
            {user.isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {/* User Header Card */}
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

      {/* Stats Cards */}
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
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-all ${activeTab === tab.id
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
            <NomineeTab
              nominee={user.nominee}
              onEdit={() => setShowNomineeModal(true)}
              onCreate={() => setShowNomineeModal(true)} // opens same modal with null nominee
            />
          )}
          {activeTab === 'bank' && (
            <BankTab
              bank={user.bankDetail}
              onEdit={() => setShowBankModal(true)}
              onCreate={() => setShowBankModal(true)} // opens same modal with null bank
            />
          )}
          {activeTab === 'documents' && (
            <DocumentsTab
              documents={user.documents}
              investments={user.investments || []}
              companyDocuments={companyDocuments}
              onAddPan={() => setShowAddPanModal(true)}
              onAddAadhar={() => setShowAddAadharModal(true)}
              onUpdatePan={(docId, file) => handleSingleDocumentUpdate(docId, file, 'PAN Card')}
              onUpdateAadhar={(docId, file) => handleSingleDocumentUpdate(docId, file, 'Aadhar Card')}
              onUpdateInvestmentDoc={handleUpdateInvestmentDoc}
            />)}
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
        nominee={user?.nominee || null}
        userId={user.id}
        onSubmit={handleUpdateNominee}
        isLoading={updating}
      />
      <EditBankModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        bank={user?.bankDetail || null}
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
      <AddDocumentModal
        isOpen={showAddPanModal}
        onClose={() => setShowAddPanModal(false)}
        title="PAN Card"
        onUpload={(file) => handleAddSingleDocument(file, 'PAN Card')}
        isLoading={updating}
      />
      <AddDocumentModal
        isOpen={showAddAadharModal}
        onClose={() => setShowAddAadharModal(false)}
        title="Aadhar Card"
        onUpload={(file) => handleAddSingleDocument(file, 'Aadhar Card')}
        isLoading={updating}
      />
    </div>
  );
};

export default UserDetails;