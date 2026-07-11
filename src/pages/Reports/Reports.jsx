import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FiFileText, FiDownload, FiPrinter, FiCalendar, FiFilter } from 'react-icons/fi';

const Reports = () => {
  const { clients, partners, offers } = useAppContext();
  const [reportType, setReportType] = useState('client');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [exportFormat, setExportFormat] = useState('pdf');

  const generateClientReport = () => {
    const reportData = clients.map(client => ({
      'Client ID': client.clientId,
      'Name': client.fullName,
      'Mobile': client.mobile,
      'Email': client.email,
      'Total Investment': formatCurrency(client.investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0),
      'Products': client.investments?.map(inv => inv.product).join(', ') || 'None',
      'Status': client.loginDetails?.status || 'Inactive',
      'Date Joined': formatDate(client.createdAt)
    }));
    return reportData;
  };

  const generateInvestmentReport = () => {
    const reportData = [];
    clients.forEach(client => {
      client.investments?.forEach(inv => {
        reportData.push({
          'Client': client.fullName,
          'Client ID': client.clientId,
          'Product': inv.product,
          'Amount': formatCurrency(inv.amount),
          'ROI': `${inv.roi}%`,
          'Monthly ROI': formatCurrency(inv.monthlyROI),
          'Lock-in': inv.lockIn || 'N/A',
          'Status': inv.status,
          'Date': formatDate(inv.date)
        });
      });
    });
    return reportData;
  };

  const generateROIReport = () => {
    const reportData = [];
    clients.forEach(client => {
      client.roiHistory?.forEach(roi => {
        reportData.push({
          'Client': client.fullName,
          'Client ID': client.clientId,
          'Month': roi.month,
          'Amount': formatCurrency(roi.amount),
          'Status': roi.status,
          'UTR': roi.utr || '-',
          'Payment Date': roi.paymentDate ? formatDate(roi.paymentDate) : '-'
        });
      });
    });
    return reportData;
  };

  const generateProductReport = () => {
    const productStats = {};
    clients.forEach(client => {
      client.investments?.forEach(inv => {
        if (!productStats[inv.product]) {
          productStats[inv.product] = {
            totalAmount: 0,
            count: 0,
            totalROI: 0,
            clients: new Set()
          };
        }
        productStats[inv.product].totalAmount += inv.amount;
        productStats[inv.product].count += 1;
        productStats[inv.product].totalROI += inv.monthlyROI || 0;
        productStats[inv.product].clients.add(client.fullName);
      });
    });

    return Object.entries(productStats).map(([product, stats]) => ({
      'Product': product,
      'Total Investment': formatCurrency(stats.totalAmount),
      'Number of Investments': stats.count,
      'Total Monthly ROI': formatCurrency(stats.totalROI),
      'Unique Clients': stats.clients.size
    }));
  };

  const generatePartnerReport = () => {
    return partners.map(partner => ({
      'Name': partner.name,
      'Type': partner.type,
      'Mobile': partner.mobile,
      'Email': partner.email,
      'Status': partner.status,
      'Investment Volume': formatCurrency(partner.investmentVolume || 0),
      'Commission': formatCurrency(partner.commission || 0),
      'Referrals': partner.referrals || 0,
      'Points Earned': partner.pointsEarned || 0
    }));
  };

  const getReportData = () => {
    switch(reportType) {
      case 'client': return generateClientReport();
      case 'investment': return generateInvestmentReport();
      case 'roi': return generateROIReport();
      case 'product': return generateProductReport();
      case 'partner': return generatePartnerReport();
      default: return [];
    }
  };

  const reportData = getReportData();
  const headers = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      // For PDF export, we'll just show a preview (you can add actual PDF generation later)
      alert('PDF export will be available with a proper PDF library');
    } else if (exportFormat === 'excel') {
      // For Excel export, we'll just show a preview (you can add actual Excel generation later)
      alert('Excel export will be available with a proper Excel library');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-500">Generate and export reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-input"
            >
              <option value="client">Client Report</option>
              <option value="investment">Investment Report</option>
              <option value="roi">Monthly ROI Report</option>
              <option value="product">Product Report</option>
              <option value="partner">Partner Report</option>
            </select>
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="form-input"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="btn-secondary flex items-center gap-2">
            <FiFilter className="w-4 h-4" />
            Apply Filters
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <FiDownload className="w-4 h-4" />
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
          </h3>
          <span className="text-sm text-gray-500">{reportData.length} records</span>
        </div>
        <div className="overflow-x-auto">
          {reportData.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {headers.map((header) => (
                      <td key={header} className="px-6 py-4 text-sm text-gray-700">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available for this report
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;