import React from 'react';

const StatusBadge = ({ status }) => {
  const variants = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    open: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    pending: 'bg-orange-100 text-orange-700',
    paid: 'bg-green-100 text-green-700',
    matured: 'bg-purple-100 text-purple-700',
  };

  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    open: 'Open',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    pending: 'Pending',
    paid: 'Paid',
    matured: 'Matured',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        variants[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;