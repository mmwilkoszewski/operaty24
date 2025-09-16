import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  orderId: string | null;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ isOpen, onClose, onSubmit, orderId }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason);
    } else {
      alert('Proszę podać powód anulowania zlecenia.');
    }
  };

  if (!orderId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Anulowanie zlecenia #${orderId}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700">
            Powód anulowania *
          </label>
          <textarea
            id="cancellationReason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Np. Klient zrezygnował, brak kontaktu z klientem..."
            required
          />
        </div>
        <div className="flex justify-end pt-4 space-x-2 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Zamknij
          </button>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Potwierdź anulowanie
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CancelOrderModal;
