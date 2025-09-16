import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { Zlecenie } from '../types';
import { PaperClipIcon } from '../constants';

interface SubmitOperatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (actualCompletionDate: string, file: File) => void;
  zlecenie: Zlecenie | null;
  zIndex?: number;
}

const SubmitOperatModal: React.FC<SubmitOperatModalProps> = ({ isOpen, onClose, onSubmit, zlecenie, zIndex }) => {
  const [actualCompletionDate, setActualCompletionDate] = useState('');
  const [operatFile, setOperatFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualCompletionDate) {
      alert('Proszę podać datę zakończenia.');
      return;
    }
    if (!operatFile) {
      alert('Proszę załączyć plik z operatem.');
      return;
    }
    onSubmit(actualCompletionDate, operatFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOperatFile(e.target.files[0]);
    }
  };

  if (!isOpen || !zlecenie) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Przekaż operat dla #${zlecenie.id}`} zIndex={zIndex}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p>Proszę podać datę ukończenia prac i załączyć gotowy operat szacunkowy. Zlecenie zostanie przekazane do działu rozliczeń.</p>
        
        <div>
          <label htmlFor="actualCompletionDate" className="block text-sm font-medium text-gray-700">Rzeczywista data zakończenia operatu *</label>
          <input
            type="date"
            id="actualCompletionDate"
            value={actualCompletionDate}
            onChange={(e) => setActualCompletionDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Załącznik z operatem *</label>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <PaperClipIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Wybierz plik</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required ref={fileInputRef}/>
                        </label>
                        <p className="pl-1">lub przeciągnij i upuść</p>
                    </div>
                    {operatFile ? (
                        <p className="text-sm font-semibold text-green-600">{operatFile.name}</p>
                    ) : (
                        <p className="text-xs text-gray-500">PDF, DOCX, etc. do 10MB</p>
                    )}
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 space-x-2 border-t mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Przekaż do rozliczenia</button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitOperatModal;