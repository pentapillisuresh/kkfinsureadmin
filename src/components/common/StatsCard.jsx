import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, change }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
          <Icon />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;