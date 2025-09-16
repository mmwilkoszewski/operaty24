import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface UserSettingsPanelProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  onClose: () => void;
}

const UserSettingsPanel: React.FC<UserSettingsPanelProps> = ({ user, onUserUpdate, onClose }) => {
  const [localUser, setLocalUser] = useState<User>(user);

  const handleFieldChange = (field: keyof User, value: any) => {
    setLocalUser(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (category: 'newOrders' | 'statusChanges', type: 'email' | 'sms') => {
    const currentPrefs = localUser.notificationPreferences?.[category] || [];
    const newPrefs = currentPrefs.includes(type)
      ? currentPrefs.filter(item => item !== type)
      : [...currentPrefs, type];
    
    setLocalUser(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [category]: newPrefs,
      }
    }));
  };

  const handleSave = () => {
    onUserUpdate(localUser);
    onClose();
  };
  
  const NotificationCheckbox: React.FC<{
      category: 'newOrders' | 'statusChanges';
      type: 'email' | 'sms';
      label: string;
  }> = ({ category, type, label }) => (
      <label className="flex items-center space-x-3">
          <input
              type="checkbox"
              checked={localUser.notificationPreferences?.[category]?.includes(type) || false}
              onChange={() => handleNotificationChange(category, type)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-gray-700">{label}</span>
      </label>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dane kontaktowe</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adres email</label>
              <input
                type="email"
                id="email"
                value={localUser.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="mt-1 block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Numer telefonu</label>
              <input
                type="tel"
                id="phone"
                value={localUser.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="mt-1 block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        {user.role === UserRole.RZECZOZNAWCA && (
            <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Powiadomienia</h3>
            <div className="space-y-4">
                <div>
                    <p className="font-medium text-gray-800">Nowe zlecenia na giełdzie</p>
                    <div className="flex space-x-6 mt-2">
                        <NotificationCheckbox category="newOrders" type="email" label="Email" />
                        <NotificationCheckbox category="newOrders" type="sms" label="SMS" />
                    </div>
                </div>
                <div>
                    <p className="font-medium text-gray-800">Zmiany statusów moich zleceń</p>
                    <div className="flex space-x-6 mt-2">
                        <NotificationCheckbox category="statusChanges" type="email" label="Email" />
                        <NotificationCheckbox category="statusChanges" type="sms" label="SMS" />
                    </div>
                </div>
            </div>
            </div>
        )}
      </div>
      <div className="w-full pt-6 mt-6 border-t flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
        <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Zapisz zmiany</button>
      </div>
    </div>
  );
};

export default UserSettingsPanel;