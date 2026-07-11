import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  FiUsers, FiUserCheck, FiUserX, FiDollarSign, 
  FiTrendingUp, FiTrendingDown, FiClock, FiCalendar,
  FiBarChart2, FiPieChart, FiActivity
} from 'react-icons/fi';
import { formatCurrency } from '../utils/helpers';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const Dashboard = () => {
  const { getDashboardStats, clients } = useAppContext();
  const stats = getDashboardStats();

  const [investmentData, setInvestmentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Generate investment growth data
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const value = 500000 + Math.random() * 1500000;
      data.push({ month, value: Math.round(value) });
    }
    setInvestmentData(data);

    // Monthly investment data
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      monthly.push({
        month,
        investments: Math.round(200000 + Math.random() * 800000),
        withdrawals: Math.round(50000 + Math.random() * 300000)
      });
    }
    setMonthlyData(monthly);

    // Product-wise investment
    setProductData([
      { name: 'Falcon Hedge', value: stats.falconInvestment || 0 },
      { name: 'AIF', value: stats.aifInvestment || 0 },
      { name: 'PMS', value: stats.pmsInvestment || 0 },
      { name: 'SIF', value: stats.sifInvestment || 0 }
    ]);

    // ROI Performance
    const roi = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      roi.push({
        month,
        roi: 2 + Math.random() * 6,
        target: 4 + Math.random() * 2
      });
    }
    setRoiData(roi);

    // Recent Activities
    const activities = [];
    clients.forEach(client => {
      if (client.createdAt) {
        activities.push({
          type: 'New Client Added',
          description: `${client.fullName} registered`,
          date: client.createdAt,
          icon: FiUsers
        });
      }
      client.investments?.forEach(inv => {
        activities.push({
          type: 'Investment Added',
          description: `${client.fullName} invested ${formatCurrency(inv.amount)} in ${inv.product}`,
          date: inv.date,
          icon: FiDollarSign
        });
      });
    });
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentActivities(activities.slice(0, 10));
  }, [clients]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Complete business statistics at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={FiUsers}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Clients"
          value={stats.activeClients}
          icon={FiUserCheck}
          color="bg-green-500"
          subtitle={`${stats.inactiveClients} inactive`}
        />
        <StatCard
          title="Total Investment (AUM)"
          value={formatCurrency(stats.totalInvestment)}
          icon={FiDollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Monthly ROI Payable"
          value={formatCurrency(stats.totalMonthlyROI)}
          icon={FiTrendingUp}
          color="bg-indigo-500"
          subtitle={`Paid: ${formatCurrency(stats.monthlyROIPaid)} | Pending: ${formatCurrency(stats.monthlyROIPending)}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Falcon Hedge Fund"
          value={formatCurrency(stats.falconInvestment)}
          icon={FiPieChart}
          color="bg-emerald-500"
        />
        <StatCard
          title="AIF Investment"
          value={formatCurrency(stats.aifInvestment)}
          icon={FiPieChart}
          color="bg-pink-500"
        />
        <StatCard
          title="PMS Investment"
          value={formatCurrency(stats.pmsInvestment)}
          icon={FiBarChart2}
          color="bg-orange-500"
        />
        <StatCard
          title="SIF Investment"
          value={formatCurrency(stats.sifInvestment)}
          icon={FiBarChart2}
          color="bg-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Maturity"
          value={stats.upcomingMaturity}
          icon={FiCalendar}
          color="bg-red-500"
        />
        <StatCard
          title="Total Active Investments"
          value={stats.totalActiveInvestments}
          icon={FiTrendingUp}
          color="bg-cyan-500"
        />
        <StatCard
          title="Pending Monthly ROI"
          value={formatCurrency(stats.monthlyROIPending)}
          icon={FiClock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Monthly ROI Paid"
          value={formatCurrency(stats.monthlyROIPaid)}
          icon={FiTrendingDown}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Investment Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={investmentData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Investment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="investments" fill="#3B82F6" name="Investments" />
              <Bar dataKey="withdrawals" fill="#EF4444" name="Withdrawals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Product-wise Investment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ROI Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={roiData}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="roi" stroke="#3B82F6" name="Actual ROI" />
              <Line type="monotone" dataKey="target" stroke="#EF4444" name="Target ROI" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="p-2 bg-blue-50 rounded-lg">
                <activity.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.type}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(activity.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;