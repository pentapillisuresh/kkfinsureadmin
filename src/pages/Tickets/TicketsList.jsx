import React, { useState, useEffect } from 'react';
import { ticketApi } from '../../api/ticketApi';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaEye, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, search, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await ticketApi.updateStatus(id, status);
      if (response.success) {
        toast.success(`Ticket ${status}`);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleAddResolution = async (id) => {
    if (!resolution.trim()) {
      toast.error('Please enter a resolution');
      return;
    }
    try {
      const response = await ticketApi.addResolution(id, resolution);
      if (response.success) {
        toast.success('Resolution added successfully');
        setResolution('');
        setShowDetails(false);
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to add resolution');
    }
  };

  const viewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setResolution(ticket.resolution || '');
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
        <div className="text-sm text-gray-500">
          Total: {pagination.total} tickets
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tickets..."
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Subject</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Created</th>
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
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{ticket.user?.fullName || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm font-medium">{ticket.subject}</td>
                    <td className="py-3 px-4 text-sm">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewDetails(ticket)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {ticket.status === 'open' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'in-progress')}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Start Progress"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        {ticket.status === 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Close"
                          >
                            <FaTimesCircle />
                          </button>
                        )}
                      </div>
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

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Ticket Details</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedTicket(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{selectedTicket.user?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={selectedTicket.status} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium">{selectedTicket.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedTicket.description}</p>
              </div>

              {selectedTicket.resolution && (
                <div>
                  <p className="text-sm text-gray-500">Resolution</p>
                  <p className="bg-green-50 p-3 rounded-lg text-green-700">
                    {selectedTicket.resolution}
                  </p>
                </div>
              )}

              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Add Resolution</label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Enter resolution details..."
                  />
                  <button
                    onClick={() => handleAddResolution(selectedTicket.id)}
                    className="mt-2 btn-primary"
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsList;