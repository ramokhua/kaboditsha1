import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SystemSettings = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'KaboDitsha',
    contactEmail: 'support@kaboditsha.gov.bw',
    maintenanceMode: false,
    maxFileSize: 5,
    sessionTimeout: 60,
    allowNewRegistrations: true,
    maxApplicationsPerUser: 3,
    emailNotificationsEnabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In production, fetch from backend
      // For now, use localStorage
      const saved = localStorage.getItem('systemSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now (backend integration later)
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      addNotification('success', 'Settings saved successfully');
    } catch (error) {
      addNotification('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading settings..." />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#2C1810] mb-6">System Settings</h2>

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="input-label">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="input-label">Support Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="input-label">Maximum File Size (MB)</label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
            className="input-field"
            min="1"
            max="20"
          />
        </div>

        <div>
          <label className="input-label">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            className="input-field"
            min="15"
            max="480"
          />
        </div>

        <div>
          <label className="input-label">Max Applications per User</label>
          <input
            type="number"
            value={settings.maxApplicationsPerUser}
            onChange={(e) => setSettings({ ...settings, maxApplicationsPerUser: parseInt(e.target.value) })}
            className="input-field"
            min="1"
            max="5"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            className="w-5 h-5 text-[#2C1810]"
          />
          <label htmlFor="maintenanceMode" className="text-[#1A1A1A]">
            Maintenance Mode
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="allowNewRegistrations"
            checked={settings.allowNewRegistrations}
            onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
            className="w-5 h-5 text-[#2C1810]"
          />
          <label htmlFor="allowNewRegistrations" className="text-[#1A1A1A]">
            Allow New Registrations
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.emailNotificationsEnabled}
            onChange={(e) => setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })}
            className="w-5 h-5 text-[#2C1810]"
          />
          <label htmlFor="emailNotifications" className="text-[#1A1A1A]">
            Enable Email Notifications
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;