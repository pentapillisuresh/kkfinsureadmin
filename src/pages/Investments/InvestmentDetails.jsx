import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investmentApi } from '../../api/investmentApi';
import { userApi } from '../../api/userApi';
import { planApi } from '../../api/planApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  FaArrowLeft, FaEdit, FaTrash, FaCheckCircle, 
  FaMoneyBillWave, FaCalendar, FaUser, FaChartLine,
  FaFileAlt, FaDownload
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchInvestmentDetails();
    fetchUsers();
    fetchPlans();
  }, [id]);

  const fetchInvestmentDetails = async () => {
    setLoading(true);
    try {
      const response = await investmentApi.getOne(id);
      if (response.success) {
        setInvestment(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch investment details');
      navigate('/investments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers({ limit: 100 });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await planApi.getAll({ isActive: true });
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await investmentApi.update(id, investment);
      if (response.success) {
        toast.success('Investment updated successfully');
        setEditMode(false);
        fetchInvestmentDetails();
      }
    } catch (error) {
      toast.error('Failed to update investment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this investment?')) return;
    try {
      const response = await investmentApi.delete(id);
      if (response.success) {
        toast.success('Investment deleted successfully');
        navigate('/investments');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete investment');
    }
  };

  const handleApproveDPC = async () => {
    try {
      const response = await investmentApi.approveDPC(id);
      if (response.success) {
        toast.success('DPC approved successfully');
        fetchInvestmentDetails();
      }
    } catch (error) {
      toast.error('Failed to approve DPC');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!investment) {
    return <div className="text-center py-8 text-gray-500">Investment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/investments')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Investment Details</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className="ml-auto btn-secondary flex items-center gap-2"
        >
          <FaEdit /> {editMode ? 'Cancel' : 'Edit'}
        </button>
        <button
          onClick={handleDelete}
          className="btn-danger flex items-center gap-2"
        >
          <FaTrash /> Delete
        </button>
        {!investment.dpcCheck && (
          <button
            onClick={handleApproveDPC}
            className="btn-primary flex items-center gap-2"
          >
            <FaCheckCircle /> Approve DPC
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-1 card">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <FaMoneyBillWave className="text-primary-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold mt-3">
              ₹{parseFloat(investment.amount).toLocaleString()}
            </h3>
            <p className="text-gray-500">Investment Amount</p>
            <div className="mt-3">
              <StatusBadge status={investment.status} />
            </div>
            {investment.dpcCheck && (
              <div className="mt-2">
                <span className="text-green-600 text-sm font-medium">
                  ✓ DPC Approved
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Investment Date</span>
              <span className="font-medium">
                {new Date(investment.investmentDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Maturity Date</span>
              <span className="font-medium">
                {new Date(investment.maturityDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Days to Maturity</span>
              <span className="font-medium">
                {Math.ceil((new Date(investment.maturityDate) - new Date()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2 card">
          <h4 className="text-lg font-semibold mb-4">Investment Information</h4>

          {editMode ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <select
                  value={investment.userId}
                  onChange={(e) => setInvestment({ ...investment, userId: e.target.value })}
                  className="input-field"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <select
                  value={investment.planId}
                  onChange={(e) => setInvestment({ ...investment, planId: e.target.value })}
                  className="input-field"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={investment.amount}
                  onChange={(e) => setInvestment({ ...investment, amount: e.target.value })}
                  className="input-field"
                  min="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={investment.status}
                  onChange={(e) => setInvestment({ ...investment, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="matured">Matured</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem 
                  icon={FaUser} 
                  label="User" 
                  value={investment.user?.fullName || 'N/A'} 
                />
                <DetailItem 
                  icon={FaChartLine} 
                  label="Plan" 
                  value={investment.plan?.name || 'N/A'} 
                />
                <DetailItem 
                  icon={FaCalendar} 
                  label="Investment Date" 
                  value={new Date(investment.investmentDate).toLocaleDateString()} 
                />
                <DetailItem 
                  icon={FaCalendar} 
                  label="Maturity Date" 
                  value={new Date(investment.maturityDate).toLocaleDateString()} 
                />
              </div>

              {investment.plan && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold mb-2">Plan Details</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Monthly Return</p>
                      <p className="font-medium">{investment.plan.monthlyReturnPercent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Bonus</p>
                      <p className="font-medium">{investment.plan.annualBonusPercent}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Maturity Period</p>
                      <p className="font-medium">{investment.plan.maturityPeriod} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Plan Type</p>
                      <p className="font-medium uppercase">{investment.plan.planType || 'Falcon'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Returns Section */}
              {investment.returns && investment.returns.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-semibold mb-2">Returns History</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-2">Month</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investment.returns.map((ret) => (
                          <tr key={ret.id} className="border-b border-gray-100">
                            <td className="p-2">{new Date(ret.month).toLocaleDateString()}</td>
                            <td className="p-2 font-medium">₹{parseFloat(ret.amount).toLocaleString()}</td>
                            <td className="p-2 capitalize">{ret.type.replace('_', ' ')}</td>
                            <td className="p-2">
                              <StatusBadge status={ret.paidOn ? 'paid' : 'pending'} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <Icon className="text-gray-400 mt-0.5" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

export default InvestmentDetails;