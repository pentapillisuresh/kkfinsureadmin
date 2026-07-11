// pages/MonthlyROI/MonthlyROI.jsx - Fix the duplicate key issue

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { FiSearch, FiFilter, FiDownload, FiUpload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const MonthlyROI = () => {
  const { clients, updateROI } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Generate month options for the last 12 months
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthOptions.push({ value, label });
  }

  useEffect(() => {
    if (!selectedMonth) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      setSelectedMonth(currentMonth);
    }
  }, []);

  // Get all ROI records for the selected month
  const roiRecords = [];
  clients.forEach(client => {
    client.roiHistory?.forEach(roi => {
      if (roi.month === selectedMonth) {
        roiRecords.push({
          ...roi,
          clientName: client.fullName,
          clientId: client.clientId,
          clientEmail: client.email,
          clientMobile: client.mobile,
          clientUniqueId: client.id // Changed from clientId to clientUniqueId to avoid duplication
        });
      }
    });
  });

  // If no records exist for the selected month, auto-generate from investments
  useEffect(() => {
    if (selectedMonth && roiRecords.length === 0) {
      clients.forEach(client => {
        const totalMonthlyROI = client.investments?.reduce((sum, inv) => sum + (inv.monthlyROI || 0), 0) || 0;
        if (totalMonthlyROI > 0) {
          const exists = client.roiHistory?.some(r => r.month === selectedMonth);
          if (!exists) {
            updateROI(client.id, selectedMonth, {
              amount: totalMonthlyROI,
              status: 'pending'
            });
          }
        }
      });
    }
  }, [selectedMonth, clients]);

  const filteredRecords = roiRecords.filter(record => {
    const matchesSearch = 
      record.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handleUpdateROI = (clientId, month, status, utr, paymentDate) => {
    updateROI(clientId, month, {
      status,
      utr: utr || '',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0]
    });
  };

  const handleMarkPaid = (record) => {
    const utr = prompt('Enter UTR Number:');
    if (utr !== null) {
      const paymentDate = prompt('Enter Payment Date (YYYY-MM-DD):');
      if (paymentDate !== null) {
        handleUpdateROI(record.clientUniqueId, record.month, 'paid', utr, paymentDate);
      }
    }
  };

  const totalPending = roiRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = roiRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const totalAmount = roiRecords.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Monthly ROI</h1>
        <p className="text-gray-500">Manage and update monthly ROI payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Monthly ROI</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm p-4">
          <p className="text-sm text-green-600">Paid</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm p-4">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm p-4">
          <p className="text-sm text-blue-600">Total Records</p>
          <p className="text-2xl font-bold text-blue-700">{roiRecords.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-input w-48"
          >
            {monthOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.clientName}</div>
                      <div className="text-xs text-gray-500">{record.clientId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(record.month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(record.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.utr || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {record.paymentDate ? formatDate(record.paymentDate) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {record.status === 'pending' && (
                      <button
                        onClick={() => handleMarkPaid(record)}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Mark Paid
                      </button>
                    )}
                    {record.status === 'paid' && (
                      <button
                        onClick={() => handleUpdateROI(record.clientUniqueId, record.month, 'pending', '', '')}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        Revert
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No ROI records found for the selected month
          </div>
        )}

        {filteredRecords.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyROI;