// src/components/modals/CreateUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FiX, FiUser, FiMail, FiPhone, FiCalendar,
  FiMapPin, FiCreditCard, FiLock, FiUserPlus,
  FiFileText, FiCheck, FiArrowRight, FiArrowLeft,
  FiUpload, FiFile, FiTrash2, FiAlertCircle,
  FiDollarSign, FiHash, FiBook, FiGlobe, FiEye, FiEyeOff
} from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { nomineeApi } from '../../api/nomineeApi';
import { filesAPI } from '../../api/files';
import { documentApi } from '../../api/documentApi';
import { adminApi } from '../../api/adminApi';

const AutocompleteInput = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
  displayKey = 'fullName',
  searchKeys = ['fullName', 'email', 'phone', 'batchId'],
  error
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
 
  const wrapperRef = useRef(null);

  const selectedOption = options?.find(opt => opt?.id === value);

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption[displayKey] || '');
    } else {
      setInputValue('');
    }
  }, [value, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length > 0) {
      const lower = val.toLowerCase();
      const filtered = options.filter(opt =>
        searchKeys.some(key =>
          opt[key] && opt[key].toString().toLowerCase().includes(lower)
        )
      );
      setFilteredOptions(filtered);
      setShowDropdown(true);
    } else {
      setFilteredOptions([]);
      setShowDropdown(false);
      onChange(null);
    }
  };

  const handleSelect = (option) => {
    setInputValue(option[displayKey] || '');
    setShowDropdown(false);
    onChange(option.id);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length > 0) {
              const lower = inputValue.toLowerCase();
              const filtered = options.filter(opt =>
                searchKeys.some(key =>
                  opt[key] && opt[key].toString().toLowerCase().includes(lower)
                )
              );
              setFilteredOptions(filtered);
              setShowDropdown(true);
            } else {
              setFilteredOptions(options);
              setShowDropdown(true);
            }
          }}
          className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
            error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
          }`}
          placeholder={placeholder}
        />
        <FaSearch className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${
          error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'
        } transition-colors duration-200`} />
      </div>
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filteredOptions.map(opt => (
            <div
              key={opt.id}
              className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 transition-all duration-150"
              onClick={() => handleSelect(opt)}
            >
              <div className="font-semibold text-gray-800">{opt.fullName}</div>
              <div className="text-xs text-gray-500 flex gap-3 flex-wrap mt-0.5">
                <span>{opt.email}</span>
                {opt.phone && <span>· {opt.phone}</span>}
                {opt.batchId && <span>· {opt.batchId}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle size={12} />{error}</p>}
    </div>
  );
};

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
  const [isReferred, setIsReferred] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);

  const [userData, setUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    dateOfBirth: '',
    pan: '',
    aadhar: '',
    referrerId: '',
    address: '',
    isSeniorCitizen: false
  });

  const [nomineeData, setNomineeData] = useState({
    fullName: '',
    relation: '',
    phone: '',
    email: '',
    address: '',
    aadhar: '',
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsersDropdown();
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const steps = [
    { id: 1, label: 'Personal', icon: FiUser },
    { id: 2, label: 'Nominee', icon: FiUserPlus },
    { id: 3, label: 'Bank', icon: FiCreditCard },
    { id: 4, label: 'Documents', icon: FiFileText },
  ];
  const totalSteps = steps.length;

  if (!isOpen) return null;

  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        const { fullName, relation, phone, email, aadhar } = nomineeData;
        if (fullName && !relation) errors.nominee_relation = 'Relationship is required when nominee name is provided';
        if (fullName && phone && !PATTERNS.phone.test(phone)) errors.nominee_phone = 'Phone must be 10 digits';
        if (fullName && email && !PATTERNS.email.test(email)) errors.nominee_email = 'Enter a valid email address';
        if (aadhar && !PATTERNS.aadhar.test(aadhar)) errors.nominee_aadhar = 'Aadhar must be 12 digits';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    setLoading(true);

    try {
      const userPayload = {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone || undefined,
        dateOfBirth: userData.dateOfBirth || undefined,
        pan: userData.pan || undefined,
        aadhar: userData.aadhar || undefined,
        address: userData.address || undefined,
        isSeniorCitizen: userData.isSeniorCitizen,
        referrerId: isReferred ? userData.referrerId : null
      };
      const userResponse = await authApi.createUser(userPayload);
      if (!userResponse.success) throw new Error(userResponse.message);
      const userId = userResponse.data.id;
      toast.success('User created successfully!');

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

      onClose();
      setUserData({
        email: '', password: '', fullName: '', phone: '', dateOfBirth: '', pan: '', aadhar: '', address: '', isSeniorCitizen: false, referrerId: null
      });
      setNomineeData({ fullName: '', relation: '', phone: '', email: '', aadhar: '', address: '', documentFile: null, documentPreview: null });
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

  const renderError = (field) => {
    if (stepErrors[field]) {
      return (
        <div className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5">
          <FiAlertCircle size={13} />
          <span>{stepErrors[field]}</span>
        </div>
      );
    }
    return null;
  };

  const renderPersonalDetails = () => (
    <div className="space-y-5">
      {Object.keys(stepErrors).some(k => ['fullName', 'email', 'password', 'phone', 'pan', 'aadhar'].includes(k)) && (
        <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-red-700">
            <p className="font-semibold text-red-800">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
              {Object.entries(stepErrors).filter(([key]) => ['fullName', 'email', 'password', 'phone', 'pan', 'aadhar'].includes(key)).map(([key, msg]) => (
                <li key={key} className="text-red-600">{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
              value={userData.fullName}
              onChange={handleUserChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.fullName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="John Doe"
            />
          </div>
          {renderError('fullName')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleUserChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="john@example.com"
            />
          </div>
          {renderError('email')}
        </div>
     <div>
  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
    Password <span className="text-red-500">*</span>
  </label>

  <div className="relative group">
    <FiLock
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
      size={18}
    />

    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={userData.password}
      onChange={handleUserChange}
      className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
        stepErrors.password
          ? 'border-red-400 focus:border-red-500'
          : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
      }`}
      placeholder="Min 6 characters"
    />

    <button
      type="button"
      onClick={() => setShowPassword(prev => !prev)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <FiEyeOff size={18} />
      ) : (
        <FiEye size={18} />
      )}
    </button>
  </div>

  {renderError('password')}
</div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Phone
          </label>
          <div className="relative group">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="tel"
              name="phone"
              maxLength={10}
              value={userData.phone}
              onChange={handleUserChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="9876543210"
            />
          </div>
          {renderError('phone')}
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
              value={userData.dateOfBirth}
              onChange={handleUserChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
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
              value={userData.pan}
              onChange={handleUserChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm uppercase transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.pan ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="ABCDE1234F"
            />
          </div>
          {renderError('pan')}
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
              value={userData.aadhar}
              onChange={handleUserChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.aadhar ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="123456789012"
            />
          </div>
          {renderError('aadhar')}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            id="isSeniorCitizen"
            name="isSeniorCitizen"
            checked={userData.isSeniorCitizen}
            onChange={handleUserChange}
            className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Senior Citizen</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            id="isreferred"
            name="isreferred"
            checked={isReferred}
            onChange={() => { setIsReferred(!isReferred) }}
            className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Is Referrer</span>
        </label>
      </div>
      {isReferred && (
        <div className="mt-2">
          <AutocompleteInput
            label="Referrer"
            placeholder="Type to search referrer..."
            options={users}
            value={userData.referrerId}
            onChange={(id) => setUserData({ ...userData, referrerId: id })}
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Address
        </label>
        <div className="relative group">
          <FiMapPin className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
          <textarea
            name="address"
            value={userData.address}
            onChange={handleUserChange}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 min-h-[80px] resize-y"
            rows="2"
            placeholder="123 Main St, City, State, Country"
          />
        </div>
      </div>
    </div>
  );

  const renderNomineeDetails = () => (
    <div className="space-y-5">
      {Object.keys(stepErrors).some(k => k.startsWith('nominee_')) && (
        <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-red-700">
            <p className="font-semibold text-red-800">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
              {Object.entries(stepErrors).filter(([key]) => key.startsWith('nominee_')).map(([key, msg]) => (
                <li key={key} className="text-red-600">{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Nominee Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={nomineeData.fullName}
            onChange={handleNomineeChange}
            className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Relationship
          </label>
          <input
            type="text"
            name="relation"
            value={nomineeData.relation}
            onChange={handleNomineeChange}
            className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
              stepErrors.nominee_relation ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
            }`}
            placeholder="Spouse, Son, Daughter"
          />
          {renderError('nominee_relation')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Phone
          </label>
          <div className="relative group">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="tel"
              name="phone"
              maxLength={10}
              value={nomineeData.phone}
              onChange={handleNomineeChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.nominee_phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="9876543210"
            />
          </div>
          {renderError('nominee_phone')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative group">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="email"
              name="email"
              value={nomineeData.email}
              onChange={handleNomineeChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.nominee_email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="jane@example.com"
            />
          </div>
          {renderError('nominee_email')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Nominee Aadhar
          </label>
          <div className="relative group">
            <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="text"
              name="aadhar"
              value={nomineeData.aadhar}
              onChange={handleNomineeChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.nominee_aadhar ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="123456789012"
            />
          </div>
          {renderError('nominee_aadhar')}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Address
        </label>
        <textarea
          name="address"
          value={nomineeData.address}
          onChange={handleNomineeChange}
          className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 min-h-[80px] resize-y"
          rows="2"
          placeholder="Nominee's address"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Nominee Document
        </label>
        {nomineeData.documentFile ? (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border-2 border-gray-200">
            {nomineeData.documentPreview?.startsWith('data:image') || nomineeData.documentPreview?.startsWith('blob:') ? (
              <img src={nomineeData.documentPreview} alt="Nominee doc" className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200" />
            ) : (
              <div className="flex items-center gap-2">
                <FiFile className="text-gray-500 w-5 h-5" />
                <span className="text-sm font-medium text-gray-700 truncate">{nomineeData.documentFile.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={removeNomineeFile}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg ml-auto transition-all duration-200"
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
              className="flex flex-col items-center justify-center gap-2 w-full p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-gradient-to-b hover:from-blue-50 hover:to-transparent transition-all duration-300 group"
            >
              <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                <FiUpload className="text-blue-500 w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Click to upload nominee document</span>
              <span className="text-xs text-gray-400">JPEG, PNG, PDF (Max 10MB)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-5">
      {Object.keys(stepErrors).some(k => k.startsWith('bank_')) && (
        <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-red-700">
            <p className="font-semibold text-red-800">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
              {Object.entries(stepErrors).filter(([key]) => key.startsWith('bank_')).map(([key, msg]) => (
                <li key={key} className="text-red-600">{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Account Holder Name <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="text"
              name="accountHolderName"
              value={bankData.accountHolderName}
              onChange={handleBankChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.bank_accountHolderName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="John Doe"
            />
          </div>
          {renderError('bank_accountHolderName')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Bank Name <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="text"
              name="bankName"
              value={bankData.bankName}
              onChange={handleBankChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.bank_bankName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="State Bank of India"
            />
          </div>
          {renderError('bank_bankName')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Account Number <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="text"
              name="accountNumber"
              value={bankData.accountNumber}
              onChange={handleBankChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.bank_accountNumber ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="123456789012"
            />
          </div>
          {renderError('bank_accountNumber')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            IFSC Code <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" size={18} />
            <input
              type="text"
              name="ifscCode"
              value={bankData.ifscCode}
              onChange={handleBankChange}
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl text-sm uppercase transition-all duration-200 outline-none focus:bg-white ${
                stepErrors.bank_ifscCode ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              placeholder="SBIN0001234"
            />
          </div>
          {renderError('bank_ifscCode')}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Branch
          </label>
          <input
            type="text"
            name="branch"
            value={bankData.branch}
            onChange={handleBankChange}
            className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
            placeholder="Main Branch"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Account Type
          </label>
          <select
            name="accountType"
            value={bankData.accountType}
            onChange={handleBankChange}
            className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10 appearance-none cursor-pointer"
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
          id="bankVerified"
          name="isVerified"
          checked={bankData.isVerified}
          onChange={handleBankChange}
          className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
        />
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Mark as Verified</span>
      </label>
    </div>
  );

  const renderDocuments = () => {
    const docFields = [
      { key: 'pan', label: 'PAN Card' },
      { key: 'aadhar', label: 'Aadhar Card' }
    ];
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl p-4 border border-blue-200/50 shadow-sm">
          <p className="text-sm text-blue-700 flex items-center gap-2 font-medium">
            <FiFileText className="w-5 h-5 text-blue-600" />
            Upload KYC documents (Max 10MB each)
          </p>
        </div>
        {docFields.map(({ key, label }) => (
          <div key={key} className="border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-300 hover:shadow-md">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              {label}
            </label>
            <div>
              {documents[key + 'File'] ? (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border-2 border-gray-200">
                  {documents[key + 'Preview']?.startsWith('data:image') || documents[key + 'Preview']?.startsWith('blob:') ? (
                    <img src={documents[key + 'Preview']} alt={label} className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiFile className="text-gray-500 w-5 h-5" />
                      <span className="text-sm font-medium text-gray-700 truncate">{documents[key + 'File'].name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeDocument(key)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg ml-auto transition-all duration-200"
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
                    className="flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-gradient-to-b hover:from-blue-50 hover:to-transparent transition-all duration-300 group"
                  >
                    <div className="p-2.5 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                      <FiUpload className="text-gray-500 group-hover:text-blue-500 w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Click to upload</span>
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
    <div className="px-8 pt-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {isCompleted ? <FiCheck className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                </div>
                <span className={`text-xs font-semibold mt-2 transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  currentStep > step.id ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FiUserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Create New User</h3>
              <p className="text-xs text-gray-500">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            <FiX className="text-gray-400 hover:text-gray-600 w-5 h-5" />
          </button>
        </div>

        {renderStepIndicator()}

        <div className="p-8">
          {renderStepContent()}
        </div>

        <div className="px-8 py-5 border-t border-gray-200 flex gap-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-b-3xl">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FiArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
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
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
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