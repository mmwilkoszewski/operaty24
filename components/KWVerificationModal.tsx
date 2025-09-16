import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { verifyLandRegistry } from '../services/geminiService';

interface KWVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kwNumber: string;
}

const KWVerificationModal: React.FC<KWVerificationModalProps> = ({ isOpen, onClose, kwNumber }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const getVerification = async () => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
          const response = await verifyLandRegistry(kwNumber);
          setResult(response);
        } catch (err) {
          setError('Nie udało się pobrać danych. Spróbuj ponownie.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      getVerification();
    }
  }, [isOpen, kwNumber]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Weryfikacja KW: ${kwNumber}`}>
        <div>
            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="ml-4 text-gray-600">Pobieranie danych z AI...</p>
                </div>
            )}
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            {result && (
                <div className="prose prose-sm max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />
            )}
            <div className="flex justify-end pt-4 mt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                    Zamknij
                </button>
            </div>
        </div>
    </Modal>
  );
};

export default KWVerificationModal;