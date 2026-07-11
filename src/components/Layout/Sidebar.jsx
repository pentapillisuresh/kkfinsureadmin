import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiPieChart, FiDollarSign, FiGift, FiUserPlus,
  FiBell, FiFileText, FiFolder, FiInfo, FiSettings, FiLogOut,
  FiTrendingUp, FiBarChart2
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const { logout } = useAppContext();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/clients', icon: FiUsers, label: 'Clients' },
    { path: '/investments', icon: FiPieChart, label: 'Investments' },
    { path: '/monthly-roi', icon: FiDollarSign, label: 'Monthly ROI' },
    { path: '/offers', icon: FiGift, label: 'Offers' },
    { path: '/partners', icon: FiUserPlus, label: 'Partners' },
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/reports', icon: FiFileText, label: 'Reports' },
    { path: '/company-documents', icon: FiFolder, label: 'Company Documents' },
    { path: '/company-info', icon: FiInfo, label: 'Company Information' },
    { path: '/fund-settings', icon: FiTrendingUp, label: 'Fund Settings' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">KK Finsure</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;