import React, { useState, useEffect } from 'react';
import { pointsApi } from '../../api/pointsApi';
import { userApi } from '../../api/userApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaPlus, FaTrash, FaCoins } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PointsList = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({
    userId: '',
    points: '',
    source: 'other',
    description: '',
  });

  useEffect(() => {
    fetchPoints();
    fetchUsers();
  }, [pagination.page]);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const response = await pointsApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (response.success) {
        setPoints(response.data.pointEntries);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch points');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers({ limit: 100 });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this point entry?')) return;
    try {
      const response = await pointsApi.delete(id);
      if (response.success) {
        toast.success('Point entry deleted');
        fetchPoints();
      }
    } catch (error) {
      toast.error('Failed to delete point entry');
    }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    if (!addData.userId || !addData.points) {
      toast.error('Please select user and enter points');
      return;
    }
    try {
      const response = await pointsApi.addPoints({
        userId: addData.userId,
        points: parseInt(addData.points),
        source: addData.source,
        description: addData.description || `${addData.source} points addition`,
      });
      if (response.success) {
        toast.success('Points added successfully');
        setShowAddModal(false);
        setAddData({ userId: '', points: '', source: 'other', description: '' });
        fetchPoints();
      }
    } catch (error) {
      toast.error('Failed to add points');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Points</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Points
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search points..."
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Points</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Source</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : points.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No point entries found
                  </td>
                </tr>
              ) : (
                points.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{entry.user?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm font-bold text-primary-600">
                      +{entry.points}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">{entry.source}</td>
                    <td className="py-3 px-4 text-sm">{entry.description || '-'}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
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

      {/* Add Points Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Points to User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddPoints} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User *</label>
                <select
                  value={addData.userId}
                  onChange={(e) => setAddData({ ...addData, userId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Points *</label>
                <input
                  type="number"
                  value={addData.points}
                  onChange={(e) => setAddData({ ...addData, points: e.target.value })}
                  className="input-field"
                  placeholder="Enter points"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <select
                  value={addData.source}
                  onChange={(e) => setAddData({ ...addData, source: e.target.value })}
                  className="input-field"
                >
                  <option value="login">Login</option>
                  <option value="referral">Referral</option>
                  <option value="offer">Offer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={addData.description}
                  onChange={(e) => setAddData({ ...addData, description: e.target.value })}
                  className="input-field"
                  placeholder="Reason for points"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  <FaCoins className="inline mr-2" /> Add Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsList;