import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateId, formatCurrency, getStatusColor } from '../../utils/helpers';
import { 
  FiPlus, FiSearch, FiEdit, FiTrash2, FiUserCheck, 
  FiUserX, FiCheck, FiX, FiChevronLeft, FiChevronRight,
  FiTrendingUp, FiUsers, FiStar
} from 'react-icons/fi';

const Partners = () => {
  const { partners, addPartner, updatePartner, deletePartner } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    type: 'referral',
    name: '',
    mobile: '',
    email: '',
    pan: '',
    aadhaar: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifsc: ''
    },
    referrals: 0,
    loginCount: 0,
    pointsEarned: 0,
    monthlyEarnings: 0,
    investmentVolume: 0,
    commission: 0,
    status: 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPartner) {
      updatePartner(editingPartner.id, { ...formData, id: editingPartner.id });
    } else {
      addPartner({ ...formData, id: generateId() });
    }
    setShowModal(false);
    setEditingPartner(null);
    setFormData({
      type: 'referral',
      name: '',
      mobile: '',
      email: '',
      pan: '',
      aadhaar: '',
      bankDetails: {
        bankName: '',
        accountNumber: '',
        ifsc: ''
      },
      referrals: 0,
      loginCount: 0,
      pointsEarned: 0,
      monthlyEarnings: 0,
      investmentVolume: 0,
      commission: 0,
      status: 'active'
    });
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData(partner);
    setShowModal(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete partner: ${name}?`)) {
      deletePartner(id);
    }
  };

  const handleApprove = (id) => {
    const partner = partners.find(p => p.id === id);
    if (partner) {
      updatePartner(id, { ...partner, status: 'approved' });
    }
  };

  const handleReject = (id) => {
    const partner = partners.find(p => p.id === id);
    if (partner) {
      updatePartner(id, { ...partner, status: 'rejected' });
    }
  };

  const handleSuspend = (id) => {
    const partner = partners.find(p => p.id === id);
    if (partner) {
      updatePartner(id, { ...partner, status: 'suspended' });
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.mobile.includes(searchTerm);
    const matchesType = filterType === 'all' || partner.type === filterType;
    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  const getStats = () => {
    const totalReferral = partners.filter(p => p.type === 'referral').length;
    const totalAuthorized = partners.filter(p => p.type === 'authorized').length;
    const totalHNI = partners.filter(p => p.type === 'hni').length;
    const totalCommission = partners.reduce((sum, p) => sum + (p.commission || 0), 0);
    return { totalReferral, totalAuthorized, totalHNI, totalCommission };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Partners</h1>
          <p className="text-gray-500">Manage all partner relationships</p>
        </div>
        <button
          onClick={() => {
            setEditingPartner(null);
            setFormData({
              type: 'referral',
              name: '',
              mobile: '',
              email: '',
              pan: '',
              aadhaar: '',
              bankDetails: {
                bankName: '',
                accountNumber: '',
                ifsc: ''
              },
              referrals: 0,
              loginCount: 0,
              pointsEarned: 0,
              monthlyEarnings: 0,
              investmentVolume: 0,
              commission: 0,
              status: 'active'
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Referral Partners</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalReferral}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiUserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Authorized Partners</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalAuthorized}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiStar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">HNI Partners</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalHNI}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiTrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Commission</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalCommission)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input w-48"
          >
            <option value="all">All Types</option>
            <option value="referral">Referral</option>
            <option value="authorized">Authorized</option>
            <option value="hni">HNI</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      partner.type === 'referral' ? 'bg-blue-100 text-blue-800' :
                      partner.type === 'authorized' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {partner.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{partner.mobile}</div>
                    <div className="text-xs text-gray-500">{partner.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {partner.type === 'referral' && (
                      <div>
                        <div className="text-sm">Referrals: {partner.referrals}</div>
                        <div className="text-xs text-gray-500">Points: {partner.pointsEarned}</div>
                      </div>
                    )}
                    {partner.type === 'authorized' && (
                      <div>
                        <div className="text-sm">{formatCurrency(partner.investmentVolume)}</div>
                        <div className="text-xs text-gray-500">Commission: {formatCurrency(partner.commission)}</div>
                      </div>
                    )}
                    {partner.type === 'hni' && (
                      <div>
                        <div className="text-sm">{formatCurrency(partner.investmentVolume)}</div>
                        <div className="text-xs text-gray-500">Monthly: {formatCurrency(partner.monthlyEarnings)}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {partner.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(partner.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve">
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(partner.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {partner.status === 'approved' && (
                        <button onClick={() => handleSuspend(partner.id)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded" title="Suspend">
                          <FiUserX className="w-4 h-4" />
                        </button>
                      )}
                      {partner.status === 'suspended' && (
                        <button onClick={() => handleApprove(partner.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Activate">
                          <FiUserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleEdit(partner)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(partner.id, partner.name)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No partners found
          </div>
        )}

        {filteredPartners.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPartners.length)} of {filteredPartners.length} partners
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingPartner ? 'Edit Partner' : 'Add New Partner'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Partner Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input"
                  >
                    <option value="referral">Referral Partner</option>
                    <option value="authorized">Authorized Partner</option>
                    <option value="hni">HNI Partner</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Mobile</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">PAN</label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Aadhaar</label>
                    <input
                      type="text"
                      value={formData.aadhaar}
                      onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Bank Details</label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                    })}
                    className="form-input"
                    placeholder="Bank Name"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="text"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                      })}
                      className="form-input"
                      placeholder="Account Number"
                    />
                    <input
                      type="text"
                      value={formData.bankDetails.ifsc}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, ifsc: e.target.value }
                      })}
                      className="form-input"
                      placeholder="IFSC Code"
                    />
                  </div>
                </div>
                {formData.type !== 'referral' && (
                  <div>
                    <label className="form-label">Investment Volume</label>
                    <input
                      type="number"
                      value={formData.investmentVolume}
                      onChange={(e) => setFormData({ ...formData, investmentVolume: parseFloat(e.target.value) || 0 })}
                      className="form-input"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPartner(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingPartner ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;