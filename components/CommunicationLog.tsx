import React, { useState } from 'react';
import { CommunicationEntry } from '../types';

interface CommunicationLogProps {
  log: CommunicationEntry[];
  onAddEntry?: (content: string) => void;
}

const CommunicationLog: React.FC<CommunicationLogProps> = ({ log, onAddEntry }) => {
  const [newEntry, setNewEntry] = useState('');
  const sortedLog = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddEntry = () => {
    if (newEntry.trim() && onAddEntry) {
      onAddEntry(newEntry.trim());
      setNewEntry('');
    }
  };

  return (
    <div className="pt-4 animate-fade-in">
        {onAddEntry && (
          <div className="mb-3">
            <label htmlFor="communication-entry" className="block text-sm font-medium text-gray-700">Dodaj wpis do historii</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <textarea
                    id="communication-entry"
                    rows={2}
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    className="flex-1 block w-full min-w-0 rounded-none rounded-l-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Wpisz treść notatki..."
                />
                <button
                    type="button"
                    onClick={handleAddEntry}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-r-md"
                >
                    Dodaj
                </button>
            </div>
          </div>
        )}
        <div className="space-y-3 max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-md border">
        {sortedLog.length > 0 ? (
            sortedLog.map(entry => (
            <div key={entry.id} className="text-sm pb-2 mb-2 border-b last:border-b-0">
                <p className="font-semibold text-gray-700">
                {entry.author}
                <span className="ml-2 font-normal text-gray-500 text-xs">
                    {new Date(entry.date).toLocaleString('pl-PL')}
                </span>
                </p>
                <p className="text-gray-600 whitespace-pre-wrap">{entry.content}</p>
            </div>
            ))
        ) : (
            <p className="text-sm text-gray-500 text-center py-2">Brak wpisów w historii.</p>
        )}
        </div>
    </div>
  );
};

export default CommunicationLog;
