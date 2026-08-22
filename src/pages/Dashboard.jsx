import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import StatsCard from '../components/common/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FaUsers, FaWallet, FaMoneyBillWave, FaTicketAlt,
  FaChartLine, FaPiggyBank, FaHandshake, FaClock,
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboard();

      if (response.success) {
        const { stats, monthlyActivity, investmentOverview, recentUsers } = response.data;

        // Store all stats
        setStats({
          // Users
          totalUsers: stats.totalUsers,
          newUsersThisMonth: stats.newUsersThisMonth,

          // Investments
          activeInvestments: stats.activeInvestments,
          maturedInvestments: stats.maturedInvestments,
          totalInvestments: stats.totalInvestments,
          totalInvestedAmount: stats.totalInvestedAmount,

          // Returns
          pendingReturnsCurrentMonth: stats.pendingReturnsCurrentMonth,
          paidReturnsCurrentMonth: stats.paidReturnsCurrentMonth,
          overallPendingReturns: stats.overallPendingReturns,
          overallPaidReturns: stats.overallPaidReturns,
          totalReturnsOverall: stats.totalReturnsOverall,

          // Commissions
          totalCommissionPaid: stats.totalCommissionPaid,

          // Tickets
          pendingTickets: stats.pendingTickets,
        });

        // Transform monthlyActivity for bar chart
        const chartData = monthlyActivity.map(item => ({
          month: item.month,
          users: item.newUsers,
          investments: item.newInvestments,
        }));
        setMonthlyData(chartData);

        // Transform investmentOverview for pie chart
        const pieChartData = investmentOverview.map(item => ({
          name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          value: item.count,
        }));
        setPieData(pieChartData);

        setRecentUsers(recentUsers || []);
      } else {
        toast.error(response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
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

  // Stats cards configuration
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      change: `+${stats?.newUsersThisMonth || 0} this month`,
    },
    {
      title: 'Total Investments',
      value: stats?.totalInvestments || 0,
      icon: FaWallet,
      color: 'bg-indigo-500',
      change: `₹${(stats?.totalInvestedAmount || 0).toLocaleString()} invested`,
    },
    {
      title: 'Active Investments',
      value: stats?.activeInvestments || 0,
      icon: FaChartLine,
      color: 'bg-green-500',
      change: `${stats?.maturedInvestments || 0} matured`,
    },
    {
      title: 'Returns (Current Month)',
      value: `₹${(stats?.pendingReturnsCurrentMonth || 0).toLocaleString()}`,
      icon: FaClock,
      color: 'bg-yellow-500',
      change: `Paid: ₹${(stats?.paidReturnsCurrentMonth || 0).toLocaleString()}`,
    },
    {
      title: 'Returns (Overall)',
      value: `₹${(stats?.overallPendingReturns || 0).toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: 'bg-purple-500',
      change: `Paid: ₹${(stats?.overallPaidReturns || 0).toLocaleString()}`,
    },
    {
      title: 'Commission Paid',
      value: `₹${(stats?.totalCommissionPaid || 0).toLocaleString()}`,
      icon: FaHandshake,
      color: 'bg-teal-500',
      change: 'Total commissions disbursed',
    },
    {
      title: 'Pending Tickets',
      value: stats?.pendingTickets || 0,
      icon: FaTicketAlt,
      color: 'bg-red-500',
      change: stats?.pendingTickets > 0 ? 'Need attention' : 'All resolved',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid – 4 columns on large, 2 on medium, 1 on small */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
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
                <Bar dataKey="investments" fill="#10b981" name="New Investments" />
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

      {/* Recent Users Table */}
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
                      {new Date(user.joined).toLocaleDateString()}
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