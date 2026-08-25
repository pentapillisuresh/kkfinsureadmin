import React, { useState, useEffect,useRef } from 'react';
import { documentApi } from '../../api/documentApi';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaUpload, FaTrash, FaDownload, FaFileAlt, FaImage, FaFilePdf,FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';

// ---- AutocompleteInput Component ----
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
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
          className={`input-field w-full ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
        />
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map(opt => (
            <div
              key={opt.id}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
              onClick={() => handleSelect(opt)}
            >
              <div className="font-medium text-gray-800">{opt.fullName}</div>
              <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                <span>{opt.email}</span>
                {opt.phone && <span>· {opt.phone}</span>}
                {opt.batchId && <span>· {opt.batchId}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({ title: '', type: 'company',userId:'' });
  const [users, setUsers] = useState([]);


  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, [typeFilter]);

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

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentApi.getAll({ type: typeFilter || undefined });
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadData.title) {
      toast.error('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadData.title);
    formData.append('type', uploadData.type);
    { uploadData.userId && formData.append('userId', uploadData.userId);}

    try {
      const response = await documentApi.upload(formData);
      if (response.success) {
        toast.success('Document uploaded successfully');
        setSelectedFile(null);
        setUploadData({ title: '', type: 'other' });
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const response = await documentApi.delete(id);
      if (response.success) {
        toast.success('Document deleted successfully');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype?.startsWith('image/')) return <FaImage className="text-blue-500" />;
    if (mimetype === 'application/pdf') return <FaFilePdf className="text-red-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const filteredDocs = documents.filter((doc) => {
    const searchTerm = search.toLowerCase();

    return (
      doc.title?.toLowerCase().includes(searchTerm) ||
      doc.type?.toLowerCase().includes(searchTerm) ||
      doc.user?.fullName?.toLowerCase().includes(searchTerm) ||
      doc.user?.email?.toLowerCase().includes(searchTerm) ||
      doc.batchId?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
      </div>

      {/* Upload Form */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={uploadData.type}
                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                className="input-field"
              >
                {/* <option value="kyc">KYC</option>
                <option value="agreement">Agreement</option> */}
                <option value="company">Company</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File *</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                required
              />
            </div>
            {/* <div>
              <AutocompleteInput
                label="User"
                placeholder="Type to search user..."
                options={users}
                value={uploadData.userId}
                onChange={(id) => setReturnFormData({ ...returnFormData, userId: id })}
                required
              />
            </div> */}

          </div>
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <FaUpload /> {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search documents..."
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Types</option>
          {/* <option value="kyc">KYC</option> */}
          {/* <option value="agreement">Agreement</option> */}
          <option value="company">Company</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No documents found
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    {getFileIcon(doc.filePath)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{doc.title}</h4>
                    <p className="text-xs text-gray-500 capitalize">{doc.type}</p>
                  </div>
                </div>
                <StatusBadge status={doc.userId ? 'user' : 'company'} />
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <p>Uploaded by: {doc.uploader?.fullName || 'System'}</p>
                {/* User Information */}
                {doc.user && (
                  <>
                    <p>
                      Full Name: {doc.user?.fullName || 'N/A'}
                    </p>

                    <p>
                      Email: {doc.user?.email || 'N/A'}
                    </p>

                    <p>
                      Batch ID: {doc.user?.batchId || 'N/A'}
                    </p>
                  </>
                )}                <p>{new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={doc.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-1.5"
                >
                  <FaDownload /> View
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="btn-danger flex items-center justify-center gap-2 text-sm py-1.5 px-3"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsList;