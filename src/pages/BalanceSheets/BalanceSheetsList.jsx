import React, { useState, useEffect, useRef } from 'react';
import { balanceSheetApi } from '../../api/balanceSheetApi';
import { adminApi } from '../../api/adminApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaSearch, FaFileInvoice, FaUser, FaTimes, FaPlus, FaEye, FaCalendarAlt, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

// ---- AutocompleteInput (unchanged) ----
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

// ---- Main Component ----
const BalanceSheetsList = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [selectedSheetData, setSelectedSheetData] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    periodStart: '',
    periodEnd: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSheets();
    fetchUsers();
  }, [pagination.page]);

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const response = await balanceSheetApi.getAllBalanceSheet({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined
      });
      if (response.success) {
        setSheets(response.data.balanceSheets);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch balance sheets:', error);
      toast.error('Failed to fetch balance sheets');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchSheets();
  };

  const handleGenerate = async (e) => {

    e.preventDefault();
    const newErrors = {};
    if (!formData.userId) newErrors.userId = 'Please select a user';
    if (!formData.periodStart) newErrors.periodStart = 'Please select period start';
    if (!formData.periodEnd) newErrors.periodEnd = 'Please select period end';
    if (formData.periodStart && formData.periodEnd && new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      newErrors.periodEnd = 'Period end must be after period start';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const payload = {
        userId: formData.userId,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd
      };
      const response = await adminApi.generateBalanceSheet(payload);
      if (response.success) {
        toast.success('Balance sheet generated successfully');
        setShowGenerateModal(false);
        resetForm();
        fetchSheets(); // refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate balance sheet');
    }
  };

  const handleViewDetails = (sheet) => {
    setSelectedSheet(sheet);
    // Optionally fetch full data (transactions) if the API provides it
    // For now we just show summary from the sheet record.
    setSelectedSheetData(sheet);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({ userId: '', periodStart: '', periodEnd: '' });
    setErrors({});
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // ---- Render Generate Modal ----
  const renderGenerateModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Generate Balance Sheet
            </h3>
            <button
              onClick={() => {
                setShowGenerateModal(false);
                resetForm();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-500 w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div>
            <AutocompleteInput
              label="User"
              placeholder="Type to search user..."
              options={users}
              value={formData.userId}
              onChange={(id) => setFormData({ ...formData, userId: id })}
              required
              error={errors.userId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Start <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              className={`input-field w-full ${errors.periodStart ? 'border-red-500' : ''}`}
              required
            />
            {errors.periodStart && <p className="mt-1 text-xs text-red-600">{errors.periodStart}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period End <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              className={`input-field w-full ${errors.periodEnd ? 'border-red-500' : ''}`}
              required
            />
            {errors.periodEnd && <p className="mt-1 text-xs text-red-600">{errors.periodEnd}</p>}
          </div>

          <div className="border-t border-gray-200 pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowGenerateModal(false);
                resetForm();
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ---- Render Details Modal ----
  const renderDetailsModal = () => {
    if (!selectedSheet) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Balance Sheet Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSheet(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-gray-500 w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUser className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium text-gray-900">{selectedSheet.user?.fullName || 'N/A'}</p>
                <p className="text-sm text-gray-500">{selectedSheet.user?.email}</p>
              </div>
            </div>

            {/* Period */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Period Start</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedSheet.periodStart).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period End</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedSheet.periodEnd).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-blue-600" />
                  <p className="text-sm text-gray-600">Total Investments</p>
                </div>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {formatCurrency(selectedSheet.totalInvestments)}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-green-600" />
                  <p className="text-sm text-gray-600">Total Returns</p>
                </div>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(selectedSheet.totalReturns)}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <FaFileInvoice className="text-purple-600" />
                  <p className="text-sm text-gray-600">Net Worth</p>
                </div>
                <p className="text-xl font-bold text-purple-600 mt-1">
                  {formatCurrency(selectedSheet.netWorth)}
                </p>
              </div>
            </div>

            {/* Generated At */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Generated At</p>
              <p className="font-medium text-gray-900">
                {new Date(selectedSheet.generatedAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Optional: transactions if available */}
            {selectedSheetData?.transactions && selectedSheetData.transactions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Transaction Statement</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSheetData.transactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-gray-600">{tx.formattedDate}</td>
                          <td className="px-3 py-2">{tx.description}</td>
                          <td className={`px-3 py-2 text-right font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(tx.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Balance Sheets</h2>
        <button
          onClick={() => {
            resetForm();
            setShowGenerateModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Generate Balance Sheet
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          placeholder="Search by user name or email..."
          className="flex-1"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Period</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Investments</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Returns</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Net Worth</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Generated</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : sheets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No balance sheets found
                  </td>
                </tr>
              ) : (
                sheets.map((sheet) => (
                  <tr key={sheet.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{sheet.user?.fullName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{sheet.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span>
                          {new Date(sheet.periodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(sheet.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-blue-600 font-medium">
                      {formatCurrency(sheet.totalInvestments)}
                    </td>
                    <td className="py-3 px-4 text-sm text-green-600 font-medium">
                      {formatCurrency(sheet.totalReturns)}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-purple-600">
                      {formatCurrency(sheet.netWorth)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(sheet.generatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(sheet)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      )}

      {showGenerateModal && renderGenerateModal()}
      {showDetailsModal && renderDetailsModal()}
    </div>
  );
};

export default BalanceSheetsList;