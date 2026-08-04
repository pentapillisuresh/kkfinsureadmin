import React, { useState, useEffect } from 'react';
import { nomineeApi } from '../../api/nomineeApi';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateNomineeModal from '../../components/modals/CreateNomineeModal';
import { FaPlus, FaEdit, FaTrash, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NomineesList = () => {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editNominee, setEditNominee] = useState(null);

  useEffect(() => {
    fetchNominees();
  }, []);

  const fetchNominees = async () => {
    setLoading(true);
    try {
      const response = await nomineeApi.getAll();
      if (response.success) {
        setNominees(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch nominees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this nominee?')) return;
    try {
      const response = await nomineeApi.delete(id);
      if (response.success) {
        toast.success('Nominee deleted successfully');
        fetchNominees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete nominee');
    }
  };

  const handleCreate = async (data) => {
    try {
      const response = await nomineeApi.create(data);
      if (response.success) {
        toast.success('Nominee created successfully');
        setShowCreateModal(false);
        fetchNominees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create nominee');
    }
  };

  const handleUpdate = async (data) => {
    try {
      const response = await nomineeApi.update(editNominee.id, data);
      if (response.success) {
        toast.success('Nominee updated successfully');
        setEditNominee(null);
        fetchNominees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update nominee');
    }
  };

  const filteredNominees = nominees.filter(
    (nominee) =>
      nominee.fullName.toLowerCase().includes(search.toLowerCase()) ||
      nominee.relation.toLowerCase().includes(search.toLowerCase()) ||
      nominee.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Nominees</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Nominee
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search nominees..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredNominees.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No nominees found
          </div>
        ) : (
          filteredNominees.map((nominee) => (
            <div key={nominee.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-primary-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{nominee.fullName}</h4>
                    <p className="text-sm text-gray-500">{nominee.relation}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditNominee(nominee)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(nominee.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                {nominee.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-xs" />
                    <span>{nominee.phone}</span>
                  </div>
                )}
                {nominee.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="text-xs" />
                    <span>{nominee.email}</span>
                  </div>
                )}
                {nominee.address && (
                  <p className="text-gray-500 text-xs mt-1">{nominee.address}</p>
                )}
                {nominee.user && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Linked to: <span className="font-medium">{nominee.user.fullName}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CreateNomineeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      {editNominee && (
        <CreateNomineeModal
          isOpen={!!editNominee}
          onClose={() => setEditNominee(null)}
          onSubmit={handleUpdate}
          initialData={editNominee}
          isEdit
        />
      )}
    </div>
  );
};

export default NomineesList;