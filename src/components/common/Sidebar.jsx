import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaWallet,
  FaChartLine,
  FaGift,
  FaShareAlt,
  FaTicketAlt,
  FaFileAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaCoins,
  FaFileInvoice,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/users', icon: FaUsers, label: 'Users' },
    { path: '/investments', icon: FaWallet, label: 'Investments' },
    { path: '/plans', icon: FaChartLine, label: 'Plans' },
    { path: '/offers', icon: FaGift, label: 'Offers' },
    { path: '/referrals', icon: FaShareAlt, label: 'Referrals' },
    { path: '/tickets', icon: FaTicketAlt, label: 'Tickets' },
    { path: '/documents', icon: FaFileAlt, label: 'Documents' },
    { path: '/nominees', icon: FaUserTie, label: 'Nominees' },
    { path: '/returns', icon: FaMoneyBillWave, label: 'Returns' },
    { path: '/balance-sheets', icon: FaFileInvoice, label: 'Balance Sheets' },
    { path: '/points', icon: FaCoins, label: 'Points' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-primary-800 text-white transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center justify-center h-24 border-b border-primary-700">
        <img 
          src="/images/logo3.jpeg" 
          alt="KKFINSURE Logo" 
          className={`h-12 w-auto object-contain ${!isOpen && 'hidden'}`}
        />
        <img 
          src="/images/logo3.jpeg" 
          alt="KKFINSURE Logo" 
          className={`h-8 w-auto object-contain ${isOpen && 'hidden'}`}
        />
        {isOpen && (
          <div className="flex flex-col items-center mt-1">
            <span className="text-[10px] text-white font-medium tracking-wide">
              Asset - Wealth Management
            </span>
            <span className="text-[9px] text-primary-300 tracking-wider">
              Wealth | Trust | Growth
            </span>
          </div>
        )}
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              } ${!isOpen && 'justify-center'}`
            }
          >
            <item.icon className={`text-xl ${isOpen ? 'mr-3' : ''}`} />
            {isOpen && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;