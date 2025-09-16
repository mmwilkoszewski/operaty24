import React from 'react';
import { Zlecenie } from '../types';
import ZlecenieCard from './OrderCard';
import { PlusCircleIcon } from '../constants';

interface KanbanColumnProps {
  title: string;
  zlecenia: Zlecenie[];
  onCardClick: (zlecenie: Zlecenie) => void;
  status: string;
  onAddClick?: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, zlecenia, onCardClick, status, onAddClick }) => {
  return (
    <div className="flex-shrink-0 w-72 bg-gray-50 rounded-lg shadow-inner flex flex-col h-full">
        <div className="p-3 border-b bg-white rounded-t-lg sticky top-0 z-10 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">{title}</h3>
            <span className="px-2 py-0.5 text-xs font-bold text-gray-500 bg-gray-200 rounded-full">{zlecenia.length}</span>
        </div>
      <div className="p-2 space-y-3 overflow-y-auto h-full">
        {status === 'LEAD' && (
             <button
                onClick={onAddClick}
                className="w-full flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 transition-colors"
             >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Dodaj Leada</span>
            </button>
        )}
        {zlecenia.map(zlecenie => (
          <ZlecenieCard
            key={zlecenie.id}
            zlecenie={zlecenie}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;