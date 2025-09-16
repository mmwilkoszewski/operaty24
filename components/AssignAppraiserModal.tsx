import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { User } from '../types';

interface AssignAppraiserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appraiserId: string) => void;
  appraisers: User[];
  title: string;
}

const AssignAppraiserModal: React.FC<AssignAppraiserModalProps> = ({ isOpen, onClose, onSubmit, appraisers, title }) => {
  const [selectedAppraiserId, setSelectedAppraiserId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedAppraiserId('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppraiserId) {
      onSubmit(selectedAppraiserId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} zIndex={1070}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Aby zmienić status tego zlecenia, musisz najpierw przypisać do niego rzeczoznawcę.
        </p>
        <div>
          <label htmlFor="appraiser" className="block text-sm font-medium text-gray-700">Wybierz rzeczoznawcę</label>
          <select
            id="appraiser"
            value={selectedAppraiserId}
            onChange={(e) => setSelectedAppraiserId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          >
            <option value="">-- Wybierz z listy --</option>
            {appraisers.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-4 space-x-2 border-t mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
          <button type="submit" disabled={!selectedAppraiserId} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
            Przypisz i zmień status
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignAppraiserModal;