import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiSave, FiLock, FiBell, FiUsers, FiGlobe, FiShield } from 'react-icons/fi';

const Settings = () => {
  const { company, updateCompanyInfo } = useAppContext();
  const [activeTab, setActiveTab] = useState('general');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    referralPoints: 100,
    referralReward: 50,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'referral', label: 'Referral', icon: FiUsers },
    { id: 'notification', label: 'Notification', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield }
  ];

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedCompany = {
      ...company,
      companyName: formData.get('companyName'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };
    updateCompanyInfo(updatedCompany);
    alert('General settings updated successfully!');
  };

  const handleReferralSubmit = (e) => {
    e.preventDefault();
    alert('Referral settings updated successfully!');
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    alert('Notification settings updated successfully!');
  };

  const renderGeneral = () => (
    <form onSubmit={handleGeneralSubmit} className="space-y-4">
      <div>
        <label className="form-label">Company Name</label>
        <input
          type="text"
          name="companyName"
          defaultValue={company.companyName}
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={company.email}
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Phone</label>
        <input
          type="tel"
          name="phone"
          defaultValue={company.phone}
          className="form-input"
        />
      </div>
      <button type="submit" className="btn-primary flex items-center gap-2">
        <FiSave className="w-4 h-4" />
        Save Changes
      </button>
    </form>
  );

  const renderReferral = () => (
    <form onSubmit={handleReferralSubmit} className="space-y-4">
      <div>
        <label className="form-label">Points per Referral</label>
        <input
          type="number"
          value={settings.referralPoints}
          onChange={(e) => setSettings({ ...settings, referralPoints: parseInt(e.target.value) })}
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Reward per Referral (₹)</label>
        <input
          type="number"
          value={settings.referralReward}
          onChange={(e) => setSettings({ ...settings, referralReward: parseInt(e.target.value) })}
          className="form-input"
        />
      </div>
      <button type="submit" className="btn-primary flex items-center gap-2">
        <FiSave className="w-4 h-4" />
        Save Changes
      </button>
    </form>
  );

  const renderNotification = () => (
    <form onSubmit={handleNotificationSubmit} className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span>Email Notifications</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span>SMS Notifications</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span>Push Notifications</span>
        </label>
      </div>
      <button type="submit" className="btn-primary flex items-center gap-2">
        <FiSave className="w-4 h-4" />
        Save Changes
      </button>
    </form>
  );

  const renderSecurity = () => (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      <div>
        <label className="form-label">Current Password</label>
        <input
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
          className="form-input"
          required
        />
      </div>
      <div>
        <label className="form-label">New Password</label>
        <input
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          className="form-input"
          required
        />
      </div>
      <div>
        <label className="form-label">Confirm New Password</label>
        <input
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          className="form-input"
          required
        />
      </div>
      <button type="submit" className="btn-primary flex items-center gap-2">
        <FiLock className="w-4 h-4" />
        Change Password
      </button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500">Configure system settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'referral' && renderReferral()}
          {activeTab === 'notification' && renderNotification()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>
    </div>
  );
};

export default Settings;