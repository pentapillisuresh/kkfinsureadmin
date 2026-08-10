// src/components/modals/CreateUserModal.jsx
import React, { useState } from 'react';
import {
  FiX, FiUser, FiMail, FiPhone, FiCalendar,
  FiMapPin, FiCreditCard, FiLock, FiUserPlus,
  FiFileText, FiCheck, FiArrowRight, FiArrowLeft,
  FiUpload, FiFile, FiTrash2, FiAlertCircle,
  FiDollarSign, FiHash, FiBook, FiGlobe
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { nomineeApi } from '../../api/nomineeApi';
import { filesAPI } from '../../api/files';
import { documentApi } from '../../api/documentApi';

// ---- Validation Patterns ----
const PATTERNS = {
  phone: /^[0-9]{10}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhar: /^[0-9]{12}$/,
  accountNumber: /^[0-9]{9,18}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

const CreateUserModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState({});

  // ---- Form State ----
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
    pan: '',
    aadhar: '',
    address: '',
    isSeniorCitizen: false
  });

  const [nomineeData, setNomineeData] = useState({
    fullName: '',
    relation: '',
    phone: '',
    email: '',
    address: '',
    aadhar:'',
    documentFile: null,
    documentPreview: null
  });

  const [bankData, setBankData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    accountType: 'savings',
    isVerified: false
  });

  const [documents, setDocuments] = useState({
    panFile: null,
    panPreview: null,
    aadharFile: null,
    aadharPreview: null
  });

  // ---- Step Configuration ----
  const steps = [
    { id: 1, label: 'Personal Details', icon: FiUser },
    { id: 2, label: 'Nominee Details', icon: FiUserPlus },
    { id: 3, label: 'Bank Details', icon: FiCreditCard },
    { id: 4, label: 'Documents', icon: FiFileText },
  ];
  const totalSteps = steps.length;

  if (!isOpen) return null;

  // ---- Handlers ----
  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    setStepErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleNomineeChange = (e) => {
    const { name, value } = e.target;
    setNomineeData(prev => ({
      ...prev,
      [name]: value
    }));
    setStepErrors(prev => ({ ...prev, ['nominee_' + name]: null }));
  };

  const handleBankChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBankData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setStepErrors(prev => ({ ...prev, ['bank_' + name]: null }));
  };

  const handleNomineeFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, WEBP images and PDFs are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setNomineeData(prev => ({
      ...prev,
      documentFile: file,
      documentPreview: file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name
    }));
    setStepErrors(prev => ({ ...prev, nominee_document: null }));
  };

  const removeNomineeFile = () => {
    setNomineeData(prev => ({
      ...prev,
      documentFile: null,
      documentPreview: null
    }));
  };

  const handleDocumentUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, WEBP images and PDFs are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name;
    setDocuments(prev => ({
      ...prev,
      [type + 'File']: file,
      [type + 'Preview']: preview
    }));
    setStepErrors(prev => ({ ...prev, ['doc_' + type]: null }));
  };

  const removeDocument = (type) => {
    setDocuments(prev => ({
      ...prev,
      [type + 'File']: null,
      [type + 'Preview']: null
    }));
  };

  // ---- Validation ----
  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1: {
        const { fullName, email, password, phone, pan, aadhar } = userData;
        if (!fullName) errors.fullName = 'Full Name is required';
        if (!email) errors.email = 'Email is required';
        else if (!PATTERNS.email.test(email)) errors.email = 'Enter a valid email address';
        if (!password) errors.password = 'Password is required';
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (phone && !PATTERNS.phone.test(phone)) errors.phone = 'Phone must be 10 digits';
        if (pan && !PATTERNS.pan.test(pan)) errors.pan = 'PAN format: ABCDE1234F';
        if (aadhar && !PATTERNS.aadhar.test(aadhar)) errors.aadhar = 'Aadhar must be 12 digits';
        break;
      }
      case 2: {
        const { fullName, relation, phone, email,aadhar } = nomineeData;
        if (fullName && !relation) errors.nominee_relation = 'Relationship is required when nominee name is provided';
        if (fullName && phone && !PATTERNS.phone.test(phone)) errors.nominee_phone = 'Phone must be 10 digits';
        if (fullName && email && !PATTERNS.email.test(email)) errors.nominee_email = 'Enter a valid email address';
        if (aadhar && !PATTERNS.aadhar.test(aadhar)) errors.aadhar = 'Aadhar must be 12 digits';
        break;
      }
      case 3: {
        const { accountHolderName, bankName, accountNumber, ifscCode } = bankData;
        if (!accountHolderName) errors.bank_accountHolderName = 'Account holder name is required';
        if (!bankName) errors.bank_bankName = 'Bank name is required';
        if (!accountNumber) errors.bank_accountNumber = 'Account number is required';
        else if (!PATTERNS.accountNumber.test(accountNumber)) errors.bank_accountNumber = 'Account number must be 9–18 digits';
        if (!ifscCode) errors.bank_ifscCode = 'IFSC code is required';
        else if (!PATTERNS.ifsc.test(ifscCode)) errors.bank_ifscCode = 'IFSC format: SBIN0001234';
        break;
      }
      case 4: {
        // Documents optional; no validation
        break;
      }
      default:
        break;
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // ---- Submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    setLoading(true);

    try {
      // 1. Create User
      const userPayload = {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone || undefined,
        dateOfBirth: userData.dateOfBirth || undefined,
        pan: userData.pan || undefined,
        aadhar: userData.aadhar || undefined,
        address: userData.address || undefined,
        isSeniorCitizen: userData.isSeniorCitizen
      };
      const userResponse = await authApi.createUser(userPayload);
      if (!userResponse.success) throw new Error(userResponse.message);
      const userId = userResponse.data.id;
      toast.success('User created successfully!');

      // 2. Create Nominee (if nominee name provided)
      if (nomineeData.fullName) {
        let nomineeDocPath = '';
        if (nomineeData.documentFile) {
          const uploadRes = await filesAPI.uploadSingle(nomineeData.documentFile);
          if (uploadRes.data.success) {
            nomineeDocPath = uploadRes.data.data.filePath;
          } else {
            toast.error("Nominee document upload failed, continuing without it");
          }
        }
        const nomineePayload = {
          userId,
          fullName: nomineeData.fullName,
          relation: nomineeData.relation,
          phone: nomineeData.phone || undefined,
          email: nomineeData.email || undefined,
          aadhar: nomineeData.aadhar || undefined,
          address: nomineeData.address || undefined,
          documentPath: nomineeDocPath || undefined
        };
        await nomineeApi.create(nomineePayload);
        toast.success('Nominee added!');
      }

      // 3. Create/Update Bank Details
      if (bankData.accountHolderName) {
        const bankPayload = {
          userId,
          accountHolderName: bankData.accountHolderName,
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          ifscCode: bankData.ifscCode,
          branch: bankData.branch || undefined,
          accountType: bankData.accountType,
          isVerified: bankData.isVerified
        };
        await authApi.upsertBankDetails(bankPayload);
        toast.success('Bank details saved!');
      }

      // 4. Upload KYC Documents (PAN & Aadhar)
      const docTypes = [
        { key: 'pan', title: 'PAN Card' },
        { key: 'aadhar', title: 'Aadhar Card' }
      ];
      for (const doc of docTypes) {
        const file = documents[doc.key + 'File'];
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', userId);
          formData.append('type', 'kyc');
          formData.append('title', doc.title);
          await documentApi.upload(formData);
          toast.success(`${doc.title} uploaded!`);
        }
      }

      // Reset form and close
      onClose();
      // Reset state
      setUserData({
        email: '', password: '', fullName: '', phone: '', dateOfBirth: '', pan: '', aadhar: '', address: '', isSeniorCitizen: false
      });
      setNomineeData({ fullName: '', relation: '', phone: '', email: '' , aadhar:'', address: '', documentFile: null, documentPreview: null });
      setBankData({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', branch: '', accountType: 'savings', isVerified: false });
      setDocuments({ panFile: null, panPreview: null, aadharFile: null, aadharPreview: null });
      setCurrentStep(1);
      setStepErrors({});
      toast.success('User fully created!');
    } catch (error) {
      console.error('Create user error:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // ---- Helper to render error message ----
  const renderError = (field) => {
    if (stepErrors[field]) {
      return (
        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <FiAlertCircle size={12} />
          <span>{stepErrors[field]}</span>
        </div>
      );
    }
    return null;
  };

  // ---- Render Steps ----
  const renderPersonalDetails = () => (
    <div className="space-y-4">
      {/* Error banner at top */}
      {Object.keys(stepErrors).some(k => ['fullName','email','password','phone','pan','aadhar'].includes(k)) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-semibold">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-xs">
              {Object.entries(stepErrors).filter(([key]) => ['fullName','email','password','phone','pan','aadhar'].includes(key)).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="fullName"
              value={userData.fullName}
              onChange={handleUserChange}
              className={`form-input pl-10 ${stepErrors.fullName ? 'border-red-500' : ''}`}
              placeholder="Enter full name"
            />
          </div>
          {renderError('fullName')}
        </div>
        <div>
          <label className="form-label">Email <span className="text-red-500">*</span></label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleUserChange}
              className={`form-input pl-10 ${stepErrors.email ? 'border-red-500' : ''}`}
              placeholder="Enter email"
            />
          </div>
          {renderError('email')}
        </div>
        <div>
          <label className="form-label">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleUserChange}
              className={`form-input pl-10 ${stepErrors.password ? 'border-red-500' : ''}`}
              placeholder="Min 6 characters"
            />
          </div>
          {renderError('password')}
        </div>
        <div>
          <label className="form-label">Phone</label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleUserChange}
              className={`form-input pl-10 ${stepErrors.phone ? 'border-red-500' : ''}`}
              placeholder="10 digit number"
            />
          </div>
          {renderError('phone')}
        </div>
        <div>
          <label className="form-label">Date of Birth</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              name="dateOfBirth"
              value={userData.dateOfBirth}
              onChange={handleUserChange}
              className="form-input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="form-label">PAN</label>
          <div className="relative">
            <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="pan"
              value={userData.pan}
              onChange={handleUserChange}
              className={`form-input pl-10 uppercase ${stepErrors.pan ? 'border-red-500' : ''}`}
              placeholder="ABCDE1234F"
            />
          </div>
          {renderError('pan')}
        </div>
        <div>
          <label className="form-label">Aadhar</label>
          <div className="relative">
            <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="aadhar"
              value={userData.aadhar}
              onChange={handleUserChange}
              className={`form-input pl-10 ${stepErrors.aadhar ? 'border-red-500' : ''}`}
              placeholder="12 digit Aadhar"
            />
          </div>
          {renderError('aadhar')}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isSeniorCitizen"
            name="isSeniorCitizen"
            checked={userData.isSeniorCitizen}
            onChange={handleUserChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="isSeniorCitizen" className="text-sm text-gray-700">Senior Citizen</label>
        </div>
      </div>
      <div>
        <label className="form-label">Address</label>
        <div className="relative">
          <FiMapPin className="absolute left-3 top-3 text-gray-400" size={18} />
          <textarea
            name="address"
            value={userData.address}
            onChange={handleUserChange}
            className="form-input pl-10"
            rows="2"
            placeholder="Full address"
          />
        </div>
      </div>
    </div>
  );

  const renderNomineeDetails = () => (
    <div className="space-y-4">
      {Object.keys(stepErrors).some(k => k.startsWith('nominee_')) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-semibold">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-xs">
              {Object.entries(stepErrors).filter(([key]) => key.startsWith('nominee_')).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Nominee Full Name</label>
          <input
            type="text"
            name="fullName"
            value={nomineeData.fullName}
            onChange={handleNomineeChange}
            className="form-input"
            placeholder="Enter nominee name"
          />
        </div>
        <div>
          <label className="form-label">Relationship</label>
          <input
            type="text"
            name="relation"
            value={nomineeData.relation}
            onChange={handleNomineeChange}
            className={`form-input ${stepErrors.nominee_relation ? 'border-red-500' : ''}`}
            placeholder="e.g., Spouse, Son"
          />
          {renderError('nominee_relation')}
        </div>
        <div>
          <label className="form-label">Phone</label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              name="phone"
              value={nomineeData.phone}
              onChange={handleNomineeChange}
              className={`form-input pl-10 ${stepErrors.nominee_phone ? 'border-red-500' : ''}`}
              placeholder="10 digit number"
            />
          </div>
          {renderError('nominee_phone')}
        </div>
        <div>
          <label className="form-label">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              value={nomineeData.email}
              onChange={handleNomineeChange}
              className={`form-input pl-10 ${stepErrors.nominee_email ? 'border-red-500' : ''}`}
              placeholder="Email address"
            />
          </div>
          {renderError('nominee_email')}
        </div>
        <div>
          <label className="form-label">Nominee Aadhar</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="aadhar"
              value={nomineeData.aadhar}
              onChange={handleNomineeChange}
              className={`form-input pl-10 ${stepErrors.nominee_aadhar ? 'border-red-500' : ''}`}
              placeholder="Email address"
            />
          </div>
          {renderError('nominee_aadhar')}
        </div>
      </div>
      <div>
        <label className="form-label">Address</label>
        <textarea
          name="address"
          value={nomineeData.address}
          onChange={handleNomineeChange}
          className="form-input"
          rows="2"
          placeholder="Nominee address"
        />
      </div>
      <div>
        <label className="form-label">Nominee Document</label>
        {nomineeData.documentFile ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {nomineeData.documentPreview?.startsWith('data:image') || nomineeData.documentPreview?.startsWith('blob:') ? (
              <img src={nomineeData.documentPreview} alt="Nominee doc" className="h-16 w-16 object-cover rounded-lg" />
            ) : (
              <div className="flex items-center gap-2">
                <FiFile className="text-gray-500 w-5 h-5" />
                <span className="text-sm truncate">{nomineeData.documentFile.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={removeNomineeFile}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-auto"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              id="nominee-doc"
              onChange={handleNomineeFileUpload}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
            />
            <label
              htmlFor="nominee-doc"
              className="flex flex-col items-center justify-center gap-1 w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
            >
              <FiUpload className="text-gray-400 w-6 h-6" />
              <span className="text-sm text-gray-500">Click to upload nominee document</span>
              <span className="text-xs text-gray-400">JPEG, PNG, PDF (Max 10MB)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-4">
      {Object.keys(stepErrors).some(k => k.startsWith('bank_')) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-semibold">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-xs">
              {Object.entries(stepErrors).filter(([key]) => key.startsWith('bank_')).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Account Holder Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="accountHolderName"
              value={bankData.accountHolderName}
              onChange={handleBankChange}
              className={`form-input pl-10 ${stepErrors.bank_accountHolderName ? 'border-red-500' : ''}`}
              placeholder="Enter account holder name"
            />
          </div>
          {renderError('bank_accountHolderName')}
        </div>
        <div>
          <label className="form-label">Bank Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <FiBook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="bankName"
              value={bankData.bankName}
              onChange={handleBankChange}
              className={`form-input pl-10 ${stepErrors.bank_bankName ? 'border-red-500' : ''}`}
              placeholder="Enter bank name"
            />
          </div>
          {renderError('bank_bankName')}
        </div>
        <div>
          <label className="form-label">Account Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="accountNumber"
              value={bankData.accountNumber}
              onChange={handleBankChange}
              className={`form-input pl-10 ${stepErrors.bank_accountNumber ? 'border-red-500' : ''}`}
              placeholder="Enter account number (9-18 digits)"
            />
          </div>
          {renderError('bank_accountNumber')}
        </div>
        <div>
          <label className="form-label">IFSC Code <span className="text-red-500">*</span></label>
          <div className="relative">
            <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="ifscCode"
              value={bankData.ifscCode}
              onChange={handleBankChange}
              className={`form-input pl-10 uppercase ${stepErrors.bank_ifscCode ? 'border-red-500' : ''}`}
              placeholder="e.g., SBIN0001234"
            />
          </div>
          {renderError('bank_ifscCode')}
        </div>
        <div>
          <label className="form-label">Branch</label>
          <input
            type="text"
            name="branch"
            value={bankData.branch}
            onChange={handleBankChange}
            className="form-input"
            placeholder="Branch name"
          />
        </div>
        <div>
          <label className="form-label">Account Type</label>
          <select
            name="accountType"
            value={bankData.accountType}
            onChange={handleBankChange}
            className="form-input"
          >
            <option value="savings">Savings</option>
            <option value="current">Current</option>
            <option value="salary">Salary</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bankVerified"
          name="isVerified"
          checked={bankData.isVerified}
          onChange={handleBankChange}
          className="w-4 h-4 text-blue-600 rounded border-gray-300"
        />
        <label htmlFor="bankVerified" className="text-sm text-gray-700">Mark as Verified</label>
      </div>
    </div>
  );

  const renderDocuments = () => {
    const docFields = [
      { key: 'pan', label: 'PAN Card' },
      { key: 'aadhar', label: 'Aadhar Card' }
    ];
    return (
      <div className="space-y-4">
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50">
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <FiFileText className="w-4 h-4" />
            Upload KYC documents (Max 10MB each)
          </p>
        </div>
        {docFields.map(({ key, label }) => (
          <div key={key} className="border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md">
            <label className="form-label text-sm">{label}</label>
            <div className="mt-2">
              {documents[key + 'File'] ? (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  {documents[key + 'Preview']?.startsWith('data:image') || documents[key + 'Preview']?.startsWith('blob:') ? (
                    <img src={documents[key + 'Preview']} alt={label} className="h-16 w-16 object-cover rounded-lg" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiFile className="text-gray-500 w-5 h-5" />
                      <span className="text-sm truncate">{documents[key + 'File'].name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDocument(key)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-auto"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id={`doc-${key}`}
                    onChange={(e) => handleDocumentUpload(e, key)}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
                  />
                  <label
                    htmlFor={`doc-${key}`}
                    className="flex flex-col items-center justify-center gap-1 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                  >
                    <FiUpload className="text-gray-400 w-5 h-5" />
                    <span className="text-xs text-gray-500">Click to upload</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalDetails();
      case 2: return renderNomineeDetails();
      case 3: return renderBankDetails();
      case 4: return renderDocuments();
      default: return null;
    }
  };

  const renderStepIndicator = () => (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200 shadow-lg shadow-blue-500/30'
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {isCompleted ? <FiCheck className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
              <FiUserPlus className="w-4 h-4" />
            </div>
            Create New User
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>

        {renderStepIndicator()}

        <div className="p-6">
          {renderStepContent()}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50/50 rounded-b-2xl">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FiArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={loading}
            >
              Next
              <FiArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" /> Creating...
                </span>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;