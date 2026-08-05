// src/components/modals/EditUserModal.jsx
import React, { useState, useEffect } from 'react';
import {
  FiX, FiUser, FiMail, FiPhone, FiCalendar,
  FiMapPin, FiCreditCard, FiLock, FiUserPlus,
  FiFileText, FiCheck, FiArrowRight, FiArrowLeft,
  FiUpload, FiImage, FiFile, FiTrash2, FiAward, FiToggleRight, FiToggleLeft
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi'; // adjust path
import { nomineeApi } from '../../api/nomineeApi'; // adjust path
import { filesAPI } from '../../api/files'; // adjust path
import { documentApi } from '../../api/documentApi'; // adjust path

const EditUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  nominee,
  bank,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ---- Initialise form state with existing data ----
  const [userData, setUserData] = useState({
    email: '',
    password: '', // not editable – we won't include password field
    fullName: '',
    phone: '',
    dateOfBirth: '',
    pan: '',
    aadhar: '',
    address: '',
    isSeniorCitizen: false,
    isActive: true,
    partnerType: 'none',
    partnerCommissionRate: 0,
  });

  const [nomineeData, setNomineeData] = useState({
    fullName: '',
    relation: '',
    phone: '',
    email: '',
    address: '',
    documentPath: '',      // existing path
    documentFile: null,   // new file (if user uploads)
    documentPreview: null,
  });

  const [bankData, setBankData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    accountType: 'savings',
    isVerified: false,
  });

  const [documents, setDocuments] = useState({
    panPath: '',
    aadharPath: '',
    panFile: null,
    panPreview: null,
    aadharFile: null,
    aadharPreview: null,
  });

  // ---- Load data when props change ----
  useEffect(() => {
    if (user) {
      setUserData({
        email: user.email || '',
        password: '', // not editable
        fullName: user.fullName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        pan: user.pan || '',
        aadhar: user.aadhar || '',
        address: user.address || '',
        isSeniorCitizen: user.isSeniorCitizen || false,
        isActive: user.isActive !== undefined ? user.isActive : true,
        partnerType: user.partnerType || 'none',
        partnerCommissionRate: user.partnerCommissionRate || 0,
      });
    }
    if (nominee) {
      setNomineeData({
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
    if (bank) {
      setBankData({
        accountHolderName: bank.accountHolderName || '',
        bankName: bank.bankName || '',
        accountNumber: bank.accountNumber || '',
        ifscCode: bank.ifscCode || '',
        branch: bank.branch || '',
        accountType: bank.accountType || 'savings',
        isVerified: bank.isVerified || false,
      });
    }
    // Document paths would be passed from parent (or extracted from user/nominee)
    // We'll assume they come as props or we can extract from user? Better to pass them.
  }, [user, nominee, bank]);

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
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNomineeChange = (e) => {
    const { name, value } = e.target;
    setNomineeData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBankData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      documentPreview: file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name,
    }));
  };

  const removeNomineeFile = () => {
    setNomineeData(prev => ({
      ...prev,
      documentFile: null,
      documentPreview: null,
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
      [type + 'Preview']: preview,
    }));
  };

  const removeDocument = (type) => {
    setDocuments(prev => ({
      ...prev,
      [type + 'File']: null,
      [type + 'Preview']: null,
    }));
  };

  // ---- Validation ----
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!userData.fullName || !userData.email) {
          toast.error('Full Name and Email are required');
          return false;
        }
        return true;
      case 2:
        // Nominee is optional, but if filled, require name & relation
        if (nomineeData.fullName && !nomineeData.relation) {
          toast.error('Please fill Nominee Name and Relationship');
          return false;
        }
        return true;
      case 3:
        if (!bankData.accountHolderName || !bankData.bankName || !bankData.accountNumber || !bankData.ifscCode) {
          toast.error('Please fill all required fields in Bank Details');
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
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
      // 1. Upload nominee document if a new file is selected
      let newNomineeDocPath = nomineeData.documentPath; // keep old by default
      if (nomineeData.documentFile) {
        const formData = new FormData();
        formData.append('file', nomineeData.documentFile, nomineeData.documentFile.name);
        const uploadRes = await filesAPI.uploadSingle(formData);
        if (uploadRes.success) {
          newNomineeDocPath = uploadRes.data.filePath;
        } else {
          toast.warning('Nominee document upload failed, keeping old one');
        }
      }

      // 2. Upload PAN & Aadhar if new files are selected
      let newPanPath = documents.panPath;
      let newAadharPath = documents.aadharPath;
      if (documents.panFile) {
        const formData = new FormData();
        formData.append('file', documents.panFile, documents.panFile.name);
        const uploadRes = await filesAPI.uploadSingle(formData);
        if (uploadRes.success) newPanPath = uploadRes.data.filePath;
        else toast.warning('PAN upload failed, keeping old one');
      }
      if (documents.aadharFile) {
        const formData = new FormData();
        formData.append('file', documents.aadharFile, documents.aadharFile.name);
        const uploadRes = await filesAPI.uploadSingle(formData);
        if (uploadRes.success) newAadharPath = uploadRes.data.filePath;
        else toast.warning('Aadhar upload failed, keeping old one');
      }

      // 3. Prepare final payload for parent
      const updatedData = {
        user: {
          fullName: userData.fullName,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          pan: userData.pan,
          aadhar: userData.aadhar,
          address: userData.address,
          isSeniorCitizen: userData.isSeniorCitizen,
          partnerType: userData.partnerType,
          partnerCommissionRate: userData.partnerCommissionRate,
          isActive: userData.isActive,
        },
        nominee: {
          fullName: nomineeData.fullName,
          relation: nomineeData.relation,
          phone: nomineeData.phone,
          email: nomineeData.email,
          address: nomineeData.address,
          documentPath: newNomineeDocPath,
        },
        bank: {
          accountHolderName: bankData.accountHolderName,
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          ifscCode: bankData.ifscCode,
          branch: bankData.branch,
          accountType: bankData.accountType,
          isVerified: bankData.isVerified,
        },
        documents: {
          panPath: newPanPath,
          aadharPath: newAadharPath,
        },
      };

      await onSubmit(updatedData);
      onClose();
    } catch (error) {
      console.error('Edit user error:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // ---- Render Step Content ----
  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="fullName"
            value={userData.fullName}
            onChange={handleUserChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            name="email"
            value={userData.email}
            disabled
            className="form-input bg-gray-100"
          />
          <span className="text-xs text-gray-400">Email cannot be changed</span>
        </div>
        <div>
          <label className="form-label">Phone <span className="text-red-500">*</span></label>
          <input
            type="tel"
            name="phone"
            value={userData.phone}
            onChange={handleUserChange}
            className="form-input"
            pattern="[0-9]{10}"
            required
          />
        </div>
        <div>
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={userData.dateOfBirth}
            onChange={handleUserChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">PAN</label>
          <input
            type="text"
            name="pan"
            value={userData.pan}
            onChange={handleUserChange}
            className="form-input uppercase"
            maxLength="10"
          />
        </div>
        <div>
          <label className="form-label">Aadhar</label>
          <input
            type="text"
            name="aadhar"
            value={userData.aadhar}
            onChange={handleUserChange}
            className="form-input"
            maxLength="12"
          />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="editIsSeniorCitizen"
            name="isSeniorCitizen"
            checked={userData.isSeniorCitizen}
            onChange={handleUserChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="editIsSeniorCitizen" className="text-sm text-gray-700">Senior Citizen</label>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="editIsActive"
            name="isActive"
            checked={userData.isActive}
            onChange={handleUserChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="editIsActive" className="text-sm text-gray-700">Active</label>
        </div>
      </div>
      <div>
        <label className="form-label">Address</label>
        <textarea
          name="address"
          value={userData.address}
          onChange={handleUserChange}
          className="form-input"
          rows="2"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Partner Type</label>
          <select
            name="partnerType"
            value={userData.partnerType}
            onChange={handleUserChange}
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
            value={userData.partnerCommissionRate}
            onChange={handleUserChange}
            className="form-input"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      </div>
    </div>
  );

  const renderNomineeDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Nominee Full Name</label>
          <input
            type="text"
            name="fullName"
            value={nomineeData.fullName}
            onChange={handleNomineeChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Relationship</label>
          <input
            type="text"
            name="relation"
            value={nomineeData.relation}
            onChange={handleNomineeChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={nomineeData.phone}
            onChange={handleNomineeChange}
            className="form-input"
            pattern="[0-9]{10}"
          />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={nomineeData.email}
            onChange={handleNomineeChange}
            className="form-input"
          />
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
        />
      </div>
      <div>
        <label className="form-label">Nominee Document</label>
        {nomineeData.documentFile || nomineeData.documentPath ? (
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
            {nomineeData.documentPreview ? (
              nomineeData.documentPreview.startsWith('data:image') || nomineeData.documentPreview.startsWith('blob:') ? (
                <img src={nomineeData.documentPreview} alt="Nominee doc" className="h-16 w-16 object-cover rounded-lg" />
              ) : (
                <div className="flex items-center gap-2">
                  <FiFile className="text-gray-500 w-5 h-5" />
                  <span className="text-sm truncate">{nomineeData.documentFile?.name || nomineeData.documentPath}</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2">
                <FiFile className="text-gray-500 w-5 h-5" />
                <span className="text-sm truncate">{nomineeData.documentPath}</span>
                <span className="text-xs text-gray-400 ml-2">(existing)</span>
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
              id="edit-nominee-doc"
              onChange={handleNomineeFileUpload}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
            />
            <label
              htmlFor="edit-nominee-doc"
              className="flex flex-col items-center justify-center gap-1 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
            >
              <FiUpload className="text-gray-400 w-5 h-5" />
              <span className="text-xs text-gray-500">Click to upload new document</span>
            </label>
          </div>
        )}
        {nomineeData.documentPath && !nomineeData.documentFile && (
          <p className="text-xs text-gray-400 mt-1">Current file: {nomineeData.documentPath}</p>
        )}
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Account Holder Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="accountHolderName"
            value={bankData.accountHolderName}
            onChange={handleBankChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Bank Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="bankName"
            value={bankData.bankName}
            onChange={handleBankChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">Account Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="accountNumber"
            value={bankData.accountNumber}
            onChange={handleBankChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="form-label">IFSC Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="ifscCode"
            value={bankData.ifscCode}
            onChange={handleBankChange}
            className="form-input uppercase"
            required
          />
        </div>
        <div>
          <label className="form-label">Branch</label>
          <input
            type="text"
            name="branch"
            value={bankData.branch}
            onChange={handleBankChange}
            className="form-input"
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
          id="editBankVerified"
          name="isVerified"
          checked={bankData.isVerified}
          onChange={handleBankChange}
          className="w-4 h-4 text-blue-600 rounded border-gray-300"
        />
        <label htmlFor="editBankVerified" className="text-sm text-gray-700">Mark as Verified</label>
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
            Upload new KYC documents to replace existing ones
          </p>
        </div>
        {docFields.map(({ key, label }) => {
          const existingPath = documents[key + 'Path'];
          const file = documents[key + 'File'];
          const preview = documents[key + 'Preview'];
          return (
            <div key={key} className="border border-gray-200 rounded-xl p-4">
              <label className="form-label text-sm">{label}</label>
              <div className="mt-2">
                {(file || existingPath) ? (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    {preview && (preview.startsWith('data:image') || preview.startsWith('blob:')) ? (
                      <img src={preview} alt={label} className="h-16 w-16 object-cover rounded-lg" />
                    ) : preview ? (
                      <div className="flex items-center gap-2">
                        <FiFile className="text-gray-500 w-5 h-5" />
                        <span className="text-sm truncate">{file?.name || 'File'}</span>
                      </div>
                    ) : existingPath ? (
                      <div className="flex items-center gap-2">
                        <FiFile className="text-gray-500 w-5 h-5" />
                        <span className="text-sm truncate">{existingPath}</span>
                        <span className="text-xs text-gray-400 ml-2">(existing)</span>
                      </div>
                    ) : null}
                    {file && (
                      <button
                        type="button"
                        onClick={() => removeDocument(key)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-auto"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                    {!file && existingPath && (
                      <button
                        type="button"
                        onClick={() => {
                          setDocuments(prev => ({
                            ...prev,
                            [key + 'File']: null,
                            [key + 'Preview']: null,
                            [key + 'Path']: '', // optional: allow removal? we'll keep it simple
                          }));
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-auto"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id={`edit-doc-${key}`}
                      onChange={(e) => handleDocumentUpload(e, key)}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
                    />
                    <label
                      htmlFor={`edit-doc-${key}`}
                      className="flex flex-col items-center justify-center gap-1 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                    >
                      <FiUpload className="text-gray-400 w-5 h-5" />
                      <span className="text-xs text-gray-500">Click to upload</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200 shadow-lg shadow-blue-500/30'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <FiCheck className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
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
              <FiUser className="w-4 h-4" />
            </div>
            Edit User
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading || loading}
          >
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderStepContent()}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50/50 rounded-b-2xl">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
                disabled={isLoading || loading}
              >
                <FiArrowLeft className="w-4 h-4" />
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={isLoading || loading}
              >
                Cancel
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={isLoading || loading}
              >
                Next
                <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isLoading || loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" /> Updating...
                  </span>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Update User
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;