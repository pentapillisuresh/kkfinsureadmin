import React, { useState, useEffect } from 'react';
import { offerApi } from '../../api/offerApi';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateOfferModal from '../../components/modals/CreateOfferModal';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editOffer, setEditOffer] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await offerApi.getAll();
      if (response.success) {
        setOffers(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await offerApi.toggleStatus(id);
      if (response.success) {
        toast.success(response.message);
        fetchOffers();
      }
    } catch (error) {
      toast.error('Failed to update offer status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const response = await offerApi.delete(id);
      if (response.success) {
        toast.success('Offer deleted successfully');
        fetchOffers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete offer');
    }
  };

  const handleCreate = async (data) => {
    try {
      const response = await offerApi.create(data);
      if (response.success) {
        toast.success('Offer created successfully');
        setShowCreateModal(false);
        fetchOffers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create offer');
    }
  };

  const handleUpdate = async (data) => {
    try {
      const response = await offerApi.update(editOffer.id, data);
      if (response.success) {
        toast.success('Offer updated successfully');
        setEditOffer(null);
        fetchOffers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update offer');
    }
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(search.toLowerCase()) ||
      offer.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Offers & Rewards</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Create Offer
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search offers..."
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reward Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Reward Value</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No offers found
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{offer.title}</td>
                    <td className="py-3 px-4 text-sm capitalize">{offer.rewardType}</td>
                    <td className="py-3 px-4 text-sm">{offer.rewardValue}</td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={offer.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditOffer(offer)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(offer.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            offer.isActive
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={offer.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {offer.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOfferModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      {editOffer && (
        <CreateOfferModal
          isOpen={!!editOffer}
          onClose={() => setEditOffer(null)}
          onSubmit={handleUpdate}
          initialData={editOffer}
          isEdit
        />
      )}
    </div>
  );
};

export default OffersList;