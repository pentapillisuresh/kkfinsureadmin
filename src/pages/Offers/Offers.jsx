import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateId, formatDate, getStatusColor } from '../../utils/helpers';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Offers = () => {
  const { offers, addOffer, updateOffer, deleteOffer } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    type: 'cashback',
    banner: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingOffer) {
      updateOffer(editingOffer.id, { ...formData, id: editingOffer.id });
    } else {
      addOffer({ ...formData, id: generateId() });
    }
    setShowModal(false);
    setEditingOffer(null);
    setFormData({
      type: 'cashback',
      banner: '',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'active'
    });
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData(offer);
    setShowModal(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete offer: ${title}?`)) {
      deleteOffer(id);
    }
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const offer = offers.find(o => o.id === id);
    if (offer) {
      updateOffer(id, { ...offer, status: newStatus });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = offers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(offers.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Offers</h1>
          <p className="text-gray-500">Create and manage promotional offers</p>
        </div>
        <button
          onClick={() => {
            setEditingOffer(null);
            setFormData({
              type: 'cashback',
              banner: '',
              title: '',
              description: '',
              startDate: '',
              endDate: '',
              status: 'active'
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((offer) => (
          <div key={offer.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {offer.banner ? (
                <img src={offer.banner} alt={offer.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Banner
                </div>
              )}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                {offer.status}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 uppercase">{offer.type}</span>
                <button onClick={() => toggleStatus(offer.id, offer.status)} className="text-gray-400 hover:text-gray-600">
                  {offer.status === 'active' ? <FiToggleRight className="w-6 h-6 text-green-500" /> : <FiToggleLeft className="w-6 h-6 text-gray-400" />}
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{offer.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(offer.startDate)} - {formatDate(offer.endDate)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id, offer.title)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {offers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No offers created yet
        </div>
      )}

      {offers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, offers.length)} of {offers.length} offers
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Offer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input"
                  >
                    <option value="cashback">Cashback</option>
                    <option value="gift-voucher">Gift Voucher</option>
                    <option value="referral-bonus">Referral Bonus</option>
                    <option value="festival-offer">Festival Offer</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.banner}
                    onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                    className="form-input"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingOffer(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingOffer ? 'Update' : 'Create'}
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

export default Offers;