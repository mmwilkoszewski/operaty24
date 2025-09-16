// FIX: Replaced placeholder content with a full implementation of the SettingsPanel component.
// This component provides a tabbed interface for administrators to manage users,
// application settings, and view the audit log. It resolves the module import error in App.tsx.

import React, { useState, useMemo } from 'react';
import { Settings, User, UserRole, AuditLogEntry } from '../types';
import UserFormModal from './UserFormModal';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsUpdate: (updatedSettings: Settings) => void;
  users: User[];
  onUsersUpdate: React.Dispatch<React.SetStateAction<User[]>>;
  onClose: () => void;
  currentUser: User | null;
  auditLog: AuditLogEntry[];
  onUserAdd: (user: User) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsUpdate,
  users,
  onUsersUpdate,
  onClose,
  currentUser,
  auditLog,
  onUserAdd
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const handleSettingsChange = (field: keyof Settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTemplateChange = (templateName: keyof Settings['notificationTemplates'], value: string) => {
      setLocalSettings(prev => ({
          ...prev,
          notificationTemplates: {
              ...prev.notificationTemplates,
              [templateName]: value
          }
      }));
  }

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    onClose();
  };

  const openUserModal = (user: User | null = null) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };
  
  const handleSaveUser = (user: User) => {
      onUserAdd(user);
      setIsUserModalOpen(false);
      setSelectedUser(null);
  }

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
        if (currentUser?.id === userId) {
            alert("Nie możesz usunąć samego siebie.");
            return;
        }
      onUsersUpdate(prev => prev.filter(u => u.id !== userId));
    }
  };

  const filteredUsers = useMemo(() => {
    let usersToShow = users;
    // Pracownik should not see Admins
    if (currentUser?.role === UserRole.PRACOWNIK) {
      usersToShow = users.filter(user => user.role !== UserRole.ADMIN);
    }
    
    // Apply search term
    return usersToShow.filter(user =>
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm, currentUser]);
  
  const TabButton: React.FC<{ tabName: string; label: string }> = ({ tabName, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tabName
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full" style={{ minHeight: '60vh' }}>
      <div className="flex-shrink-0 border-b flex items-center justify-between pb-3 mb-4">
        <div className="flex items-center space-x-2">
            <TabButton tabName="users" label="Zarządzanie użytkownikami" />
            {currentUser?.role === UserRole.ADMIN && (
              <>
                <TabButton tabName="general" label="Ustawienia ogólne" />
                <TabButton tabName="audit" label="Dziennik zdarzeń" />
              </>
            )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-4">
        {activeTab === 'general' && currentUser?.role === UserRole.ADMIN && (
          <div className="space-y-6 animate-fade-in">
             <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Powiadomienia</h3>
                 <div>
                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700">Główny email do powiadomień</label>
                    <input
                        type="email"
                        id="notificationEmail"
                        value={localSettings.notificationEmail}
                        onChange={(e) => handleSettingsChange('notificationEmail', e.target.value)}
                        className="mt-1 block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Szablony powiadomień</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="orderAccepted" className="block text-sm font-medium text-gray-700">Zlecenie zaakceptowane</label>
                        <textarea id="orderAccepted" rows={3} value={localSettings.notificationTemplates.orderAccepted} onChange={(e) => handleTemplateChange('orderAccepted', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                        <p className="text-xs text-gray-500 mt-1">Dostępne zmienne: {`{{orderId}}`}</p>
                    </div>
                     <div>
                        <label htmlFor="orderCancelled" className="block text-sm font-medium text-gray-700">Zlecenie anulowane</label>
                        <textarea id="orderCancelled" rows={3} value={localSettings.notificationTemplates.orderCancelled} onChange={(e) => handleTemplateChange('orderCancelled', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                         <p className="text-xs text-gray-500 mt-1">Dostępne zmienne: {`{{orderId}}`}</p>
                    </div>
                     <div>
                        <label htmlFor="orderUpdated" className="block text-sm font-medium text-gray-700">Zlecenie zaktualizowane</label>
                        <textarea id="orderUpdated" rows={3} value={localSettings.notificationTemplates.orderUpdated} onChange={(e) => handleTemplateChange('orderUpdated', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                         <p className="text-xs text-gray-500 mt-1">Dostępne zmienne: {`{{orderId}}`}</p>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Typy danych</h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="propertyTypes" className="block text-sm font-medium text-gray-700">Rodzaje nieruchomości (oddzielone przecinkami)</label>
                        <input type="text" id="propertyTypes" value={localSettings.propertyTypes.join(', ')} onChange={(e) => handleSettingsChange('propertyTypes', e.target.value.split(',').map(s => s.trim()))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="valuationPurposes" className="block text-sm font-medium text-gray-700">Cele wyceny (oddzielone przecinkami)</label>
                        <input type="text" id="valuationPurposes" value={localSettings.valuationPurposes.join(', ')} onChange={(e) => handleSettingsChange('valuationPurposes', e.target.value.split(',').map(s => s.trim()))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Szukaj po emailu lub nazwisku..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="block w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                onClick={() => openUserModal()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                Dodaj użytkownika
              </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imię i Nazwisko</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rola</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    { (currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.PRACOWNIK && user.role === UserRole.RZECZOZNAWCA)) && (
                                        <button onClick={() => openUserModal(user)} className="text-indigo-600 hover:text-indigo-900">Edytuj</button>
                                    )}
                                    { currentUser?.role === UserRole.ADMIN && (
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Usuń</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'audit' && currentUser?.role === UserRole.ADMIN && (
            <div className="animate-fade-in">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Dziennik zdarzeń (ostatnie 50)</h3>
                <div className="overflow-y-auto border rounded-md bg-white">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Czas</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Użytkownik</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Akcja</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Szczegóły</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {auditLog.slice(0, 50).map(entry => (
                                <tr key={entry.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString('pl-PL')}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-700">{entry.userEmail}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-800">{entry.action}</td>
                                    <td className="px-4 py-2 text-xs text-gray-600">{entry.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {auditLog.length === 0 && <p className="p-4 text-center text-sm text-gray-500">Brak zdarzeń do wyświetlenia.</p>}
                </div>
            </div>
        )}
      </div>

      <div className="w-full pt-6 mt-6 border-t flex-shrink-0 flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
        {currentUser?.role === UserRole.ADMIN && (
            <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Zapisz i zamknij</button>
        )}
      </div>
      
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        initialUser={selectedUser}
        currentUser={currentUser}
      />
    </div>
  );
};

export default SettingsPanel;