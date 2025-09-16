import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import Modal from './Modal';
import { VOIVODESHIP_DATA } from '../constants';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  initialUser: User | null;
  currentUser: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, initialUser, currentUser }) => {
  const getInitialFormData = (): Partial<User> => ({
    email: '',
    password: '',
    role: currentUser?.role === UserRole.PRACOWNIK ? UserRole.RZECZOZNAWCA : UserRole.RZECZOZNAWCA,
    assignedVoivodeships: [],
    phone: '',
    firstName: '',
    lastName: '',
    city: '',
  });
  
  const [formData, setFormData] = useState<Partial<User>>(getInitialFormData());

  const isEditing = !!initialUser;
  const isEmployee = currentUser?.role === UserRole.PRACOWNIK;

  useEffect(() => {
    if (isOpen) {
        if (initialUser) {
          setFormData({
            ...initialUser,
            password: '', // Don't pre-fill password for security
          });
        } else {
          // Reset for new user
          setFormData(getInitialFormData());
        }
    }
  }, [initialUser, isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleVoivodeshipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.options)
        .filter(option => option.selected)
        .map(option => option.value);
    setFormData(prev => ({ ...prev, assignedVoivodeships: selectedOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || (!isEditing && !formData.password) || !formData.email || !formData.phone) {
      alert('Proszę wypełnić wszystkie wymagane pola (Imię, Nazwisko, Hasło, Email, Telefon).');
      return;
    }
    onSave(formData as User);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edytuj użytkownika' : 'Dodaj nowego użytkownika'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- DANE OSOBOWE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Imię *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nazwisko *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
        </div>
        
        {/* --- DANE LOGOWANIA --- */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            {isEditing ? 'Nowe hasło (pozostaw puste, aby nie zmieniać)' : 'Hasło *'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required={!isEditing}
          />
        </div>

        {/* --- DANE KONTAKTOWE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adres email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon *</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
             <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Miasto</label>
                <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
        </div>
        
        {/* --- ROLA I UPRAWNIENIA --- */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rola *</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isEmployee}
            className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${isEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            {!isEmployee && <option value={UserRole.ADMIN}>Admin</option>}
            {!isEmployee && <option value={UserRole.PRACOWNIK}>Pracownik</option>}
            <option value={UserRole.RZECZOZNAWCA}>Rzeczoznawca</option>
          </select>
          {isEmployee && <p className="text-xs text-gray-500 mt-1">Jako pracownik możesz dodawać tylko rzeczoznawców.</p>}
        </div>

        {formData.role === UserRole.RZECZOZNAWCA && (
          <div>
            <label htmlFor="assignedVoivodeships" className="block text-sm font-medium text-gray-700">Przypisane województwa</label>
            <p className="text-xs text-gray-500 mb-1">Przytrzymaj Ctrl (lub Cmd) aby zaznaczyć wiele.</p>
            <select
              multiple
              id="assignedVoivodeships"
              name="assignedVoivodeships"
              value={formData.assignedVoivodeships || []}
              onChange={handleVoivodeshipChange}
              className="block w-full h-32 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {Object.keys(VOIVODESHIP_DATA).map(voivodeship => (
                <option key={voivodeship} value={voivodeship}>
                  {voivodeship.charAt(0).toUpperCase() + voivodeship.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end pt-4 space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            {isEditing ? 'Zapisz zmiany' : 'Dodaj użytkownika'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;