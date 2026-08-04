import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import StatsCard from '../components/common/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FaUsers,
  FaWallet,
  FaMoneyBillWave,
  FaTicketAlt,
  FaUserPlus,
  FaChartLine,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getUsers({ page: 1, limit: 5 }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (usersRes.success) {
        setRecentUsers(usersRes.data.users || []);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      change: `+${stats?.newUsersThisMonth || 0} this month`,
    },
    {
      title: 'Active Investments',
      value: stats?.activeInvestments || 0,
      icon: FaWallet,
      color: 'bg-green-500',
      change: `₹${(stats?.totalInvestmentAmount || 0).toLocaleString()}`,
    },
    {
      title: 'Total Returns',
      value: `₹${(stats?.returnsThisMonth || 0).toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: 'bg-purple-500',
      change: 'This month',
    },
    {
      title: 'Pending Tickets',
      value: stats?.pendingTickets || 0,
      icon: FaTicketAlt,
      color: 'bg-orange-500',
      change: 'Need attention',
    },
  ];

  // Sample chart data - in production, fetch from API
  const monthlyData = [
    { month: 'Jan', users: 30, investments: 45 },
    { month: 'Feb', users: 45, investments: 52 },
    { month: 'Mar', users: 52, investments: 60 },
    { month: 'Apr', users: 58, investments: 68 },
    { month: 'May', users: 70, investments: 75 },
    { month: 'Jun', users: 82, investments: 90 },
  ];

  const pieData = [
    { name: 'Active', value: stats?.activeInvestments || 0 },
    { name: 'Matured', value: stats?.totalUsers || 0 },
  ];

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold mb-4">Monthly Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#3b82f6" name="New Users" />
                <Bar dataKey="investments" fill="#10b981" name="Investments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Investment Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{user.fullName}</td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-sm">{user.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;