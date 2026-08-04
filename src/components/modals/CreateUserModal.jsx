// src/components/modals/CreateUserModal.jsx
import React, { useState } from 'react';
import { 
  FiX, FiUser, FiMail, FiPhone, FiCalendar, 
  FiMapPin, FiCreditCard, FiLock, FiUserPlus,
  FiFileText, FiAward, FiCheck, FiArrowRight, FiArrowLeft,
  FiUpload, FiImage, FiFile, FiTrash2
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CreateUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documentPreviews, setDocumentPreviews] = useState({
    pan: null,
    aadhaar: null,
    passport: null,
    addressProof: null,
    cancelledCheque: null,
    agreement: null
  });

  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    address: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    isSeniorCitizen: false,
    
    // Bank Details
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branch: '',
      accountType: 'savings',
      isVerified: false
    },
    
    // Nominee Details
    nominee: {
      fullName: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      documentPath: ''
    },
    
    // Documents
    documents: {
      pan: null,
      aadhaar: null,
      passport: null,
      addressProof: null,
      cancelledCheque: null,
      agreement: null
    },
    
    // Partner Settings
    partnerType: 'none',
    partnerCommissionRate: 0
  });

  if (!isOpen) return null;

  const steps = [
    { id: 1, label: 'Personal Details', icon: FiUser },
    { id: 2, label: 'Bank Details', icon: FiCreditCard },
    { id: 3, label: 'Nominee Details', icon: FiUserPlus },
    { id: 4, label: 'Documents', icon: FiFileText },
  ];

  const totalSteps = steps.length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleBankChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleNomineeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nominee: {
        ...prev.nominee,
        [name]: value
      }
    }));
  };

  const handleDocumentUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, GIF, WEBP images and PDFs are allowed');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [type]: file
        }
      }));

      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreviews(prev => ({
            ...prev,
            [type]: reader.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreviews(prev => ({
          ...prev,
          [type]: file.name
        }));
      }
    }
  };

  const removeDocument = (type) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: null
      }
    }));
    setDocumentPreviews(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.password) {
          toast.error('Please fill all required fields in Personal Details');
          return false;
        }
        return true;
      case 2:
        if (!formData.bankDetails.accountHolderName || 
            !formData.bankDetails.bankName || 
            !formData.bankDetails.accountNumber || 
            !formData.bankDetails.ifscCode) {
          toast.error('Please fill all required fields in Bank Details');
          return false;
        }
        return true;
      case 3:
        if (!formData.nominee.fullName || !formData.nominee.relationship) {
          toast.error('Please fill all required fields in Nominee Details');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      // Prepare data for API
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        isSeniorCitizen: formData.isSeniorCitizen,
        bankDetails: formData.bankDetails,
        nominee: formData.nominee,
        partnerType: formData.partnerType,
        partnerCommissionRate: formData.partnerCommissionRate,
        // Documents would be uploaded separately
        documents: Object.keys(formData.documents).reduce((acc, key) => {
          if (formData.documents[key]) {
            acc[key] = formData.documents[key].name;
          }
          return acc;
        }, {})
      };

      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        gender: 'Male',
        address: { address: '', city: '', state: '', pincode: '' },
        isSeniorCitizen: false,
        bankDetails: {
          accountHolderName: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          branch: '',
          accountType: 'savings',
          isVerified: false
        },
        nominee: {
          fullName: '',
          relationship: '',
          phone: '',
          email: '',
          address: '',
          documentPath: ''
        },
        documents: {
          pan: null,
          aadhaar: null,
          passport: null,
          addressProof: null,
          cancelledCheque: null,
          agreement: null
        },
        partnerType: 'none',
        partnerCommissionRate: 0
      });
      setDocumentPreviews({
        pan: null,
        aadhaar: null,
        passport: null,
        addressProof: null,
        cancelledCheque: null,
        agreement: null
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
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

  // Step 1: Personal Details
  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label className="form-label">Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="form-label">Password <span className="text-red-500">*</span></label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
            minLength={6}
            placeholder="Minimum 6 characters"
          />
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
            pattern="[0-9]{10}"
            placeholder="10 digit mobile number"
          />
        </div>
        <div>
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
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
          name="address"
          value={formData.address.address}
          onChange={handleAddressChange}
          className="form-input"
          placeholder="Street address"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">City</label>
          <input
            type="text"
            name="city"
            value={formData.address.city}
            onChange={handleAddressChange}
            className="form-input"
            placeholder="City"
          />
        </div>
        <div>
          <label className="form-label">State</label>
          <input
            type="text"
            name="state"
            value={formData.address.state}
            onChange={handleAddressChange}
            className="form-input"
            placeholder="State"
          />
        </div>
        <div>
          <label className="form-label">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.address.pincode}
            onChange={handleAddressChange}
            className="form-input"
            placeholder="Pincode"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isSeniorCitizen"
          name="isSeniorCitizen"
          checked={formData.isSeniorCitizen}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="isSeniorCitizen" className="text-sm text-gray-700">
          Senior Citizen
        </label>
      </div>
    </div>
  );

  // Step 2: Bank Details
  const renderBankDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Account Holder Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.bankDetails.accountHolderName}
            onChange={handleBankChange}
            className="form-input"
            required
            placeholder="Enter account holder name"
          />
        </div>
        <div>
          <label className="form-label">Bank Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="bankName"
            value={formData.bankDetails.bankName}
            onChange={handleBankChange}
            className="form-input"
            required
            placeholder="Enter bank name"
          />
        </div>
        <div>
          <label className="form-label">Account Number <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="accountNumber"
            value={formData.bankDetails.accountNumber}
            onChange={handleBankChange}
            className="form-input"
            required
            placeholder="Enter account number"
            pattern="[0-9]{9,18}"
          />
        </div>
        <div>
          <label className="form-label">IFSC Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="ifscCode"
            value={formData.bankDetails.ifscCode}
            onChange={handleBankChange}
            className="form-input uppercase"
            required
            placeholder="e.g., SBIN0001234"
            pattern="[A-Z]{4}0[A-Z0-9]{6}"
          />
        </div>
        <div>
          <label className="form-label">Branch Name</label>
          <input
            type="text"
            name="branch"
            value={formData.bankDetails.branch}
            onChange={handleBankChange}
            className="form-input"
            placeholder="Enter branch name"
          />
        </div>
        <div>
          <label className="form-label">Account Type</label>
          <select
            name="accountType"
            value={formData.bankDetails.accountType}
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
          checked={formData.bankDetails.isVerified}
          onChange={handleBankChange}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="bankVerified" className="text-sm text-gray-700">
          Mark as Verified
        </label>
      </div>
    </div>
  );

  // Step 3: Nominee Details
  const renderNomineeDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Nominee Full Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="fullName"
            value={formData.nominee.fullName}
            onChange={handleNomineeChange}
            className="form-input"
            required
            placeholder="Enter nominee name"
          />
        </div>
        <div>
          <label className="form-label">Relationship <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="relationship"
            value={formData.nominee.relationship}
            onChange={handleNomineeChange}
            className="form-input"
            required
            placeholder="e.g., Spouse, Son, Daughter, Parent"
          />
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.nominee.phone}
            onChange={handleNomineeChange}
            className="form-input"
            placeholder="10 digit mobile number"
            pattern="[0-9]{10}"
          />
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.nominee.email}
            onChange={handleNomineeChange}
            className="form-input"
            placeholder="Enter email address"
          />
        </div>
      </div>
      <div>
        <label className="form-label">Address</label>
        <textarea
          name="address"
          value={formData.nominee.address}
          onChange={handleNomineeChange}
          className="form-input"
          rows="2"
          placeholder="Enter nominee address"
        />
      </div>
      <div>
        <label className="form-label">Document Path</label>
        <input
          type="text"
          name="documentPath"
          value={formData.nominee.documentPath}
          onChange={handleNomineeChange}
          className="form-input"
          placeholder="Path to nominee identity document"
        />
      </div>
    </div>
  );

  // Step 4: Documents
  const renderDocuments = () => {
    const documentFields = [
      { key: 'pan', label: 'PAN Card' },
      { key: 'aadhaar', label: 'Aadhaar Card' },
      { key: 'passport', label: 'Passport Photo' },
      { key: 'addressProof', label: 'Address Proof' },
      { key: 'cancelledCheque', label: 'Cancelled Cheque / Passbook' },
      { key: 'agreement', label: 'Agreement Document' }
    ];

    return (
      <div className="space-y-4">
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50 mb-4">
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <FiFileText className="w-4 h-4" />
            Upload KYC and supporting documents (Max 10MB each)
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentFields.map(({ key, label }) => (
            <div key={key} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
              <label className="form-label text-sm">{label}</label>
              <div className="mt-2">
                {formData.documents[key] ? (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      {documentPreviews[key]?.startsWith('data:image') ? (
                        <img 
                          src={documentPreviews[key]} 
                          alt={label} 
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      ) : documentPreviews[key] ? (
                        <div className="flex items-center gap-2">
                          {formData.documents[key].type?.startsWith('image/') ? (
                            <FiImage className="text-blue-500 w-5 h-5" />
                          ) : (
                            <FiFile className="text-gray-500 w-5 h-5" />
                          )}
                          <span className="text-sm truncate max-w-[120px]">{formData.documents[key].name}</span>
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(key)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${key}`}
                      onChange={(e) => handleDocumentUpload(e, key)}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
                    />
                    <label
                      htmlFor={`file-${key}`}
                      className="flex flex-col items-center justify-center gap-1 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                    >
                      <FiUpload className="text-gray-400 w-5 h-5" />
                      <span className="text-xs text-gray-500">Click to upload</span>
                      <span className="text-[10px] text-gray-400">JPEG, PNG, PDF (Max 10MB)</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch(currentStep) {
      case 1: return renderPersonalDetails();
      case 2: return renderBankDetails();
      case 3: return renderNomineeDetails();
      case 4: return renderDocuments();
      default: return null;
    }
  };

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

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderTabContent()}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50/50 rounded-b-2xl">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                Next
                <FiArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
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
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;