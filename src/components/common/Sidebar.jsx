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
    { path: '/commissions', icon: FaCoins, label: 'Commissions' },
    { path: '/balance-sheets', icon: FaFileInvoice, label: 'Balance Sheets' },
    { path: '/points', icon: FaCoins, label: 'Points' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-primary-800 text-white transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-center h-16 border-b border-primary-700">
        <span className={`font-bold text-xl ${!isOpen && 'hidden'}`}>KKFINSURE</span>
        <span className={`font-bold text-2xl ${isOpen && 'hidden'}`}>K</span>
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