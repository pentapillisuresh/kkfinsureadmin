import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateId, formatDate } from '../../utils/helpers';
import { FiSend, FiMail, FiBell, FiMessageSquare, FiUsers, FiUser } from 'react-icons/fi';

const Notifications = () => {
  const { notifications, addNotification, clients } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'push',
    recipientType: 'all',
    selectedUsers: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotification = {
      id: generateId(),
      ...formData,
      date: new Date().toISOString(),
      status: 'sent'
    };
    addNotification(newNotification);
    setShowModal(false);
    setFormData({
      title: '',
      message: '',
      type: 'push',
      recipientType: 'all',
      selectedUsers: []
    });
    alert('Notification sent successfully!');
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'push': return <FiBell className="w-4 h-4" />;
      case 'email': return <FiMail className="w-4 h-4" />;
      case 'sms': return <FiMessageSquare className="w-4 h-4" />;
      default: return <FiBell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500">Send and manage notifications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiSend className="w-5 h-5" />
          Send Notification
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  notification.type === 'push' ? 'bg-blue-100 text-blue-600' :
                  notification.type === 'email' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      {notification.recipientType === 'all' ? 'All Users' : 
                       notification.recipientType === 'multiple' ? `${notification.selectedUsers?.length || 0} Users` :
                       'Single User'}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      notification.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No notifications sent yet
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Send Notification</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                    rows="4"
                    placeholder="Type your message here..."
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Notification Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input"
                  >
                    <option value="push">Push Notification</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Recipient</label>
                  <select
                    value={formData.recipientType}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ 
                        ...formData, 
                        recipientType: value,
                        selectedUsers: value === 'all' ? [] : formData.selectedUsers
                      });
                    }}
                    className="form-input"
                  >
                    <option value="all">All Users</option>
                    <option value="multiple">Multiple Users</option>
                    <option value="single">Single User</option>
                  </select>
                </div>
                {formData.recipientType !== 'all' && (
                  <div>
                    <label className="form-label">Select Users</label>
                    <select
                      multiple
                      value={formData.selectedUsers}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData({ ...formData, selectedUsers: options });
                      }}
                      className="form-input"
                      size="4"
                    >
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.clientId} - {client.fullName}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl to select multiple users</p>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        title: '',
                        message: '',
                        type: 'push',
                        recipientType: 'all',
                        selectedUsers: []
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <FiSend className="w-4 h-4" />
                    Send
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

export default Notifications;