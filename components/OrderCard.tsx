import React from 'react';
import { Zlecenie, ZlecenieStatus, User, UserRole } from '../types';
import { statusStyles, UserIcon } from '../constants';

interface ZlecenieCardProps {
  zlecenie: Zlecenie;
  onClick: (zlecenie: Zlecenie) => void;
}

const ZlecenieCard: React.FC<ZlecenieCardProps> = ({ zlecenie, onClick }) => {
  const currentStatusStyle = statusStyles[zlecenie.status] || { dot: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-200', bg: 'bg-gray-50' };

  return (
    <div
      onClick={() => onClick(zlecenie)}
      className={`p-3 border-l-4 rounded-md shadow-sm cursor-pointer transition-all duration-200 bg-white hover:shadow-md hover:bg-gray-50 ${currentStatusStyle.border}`}
    >
      <div className="flex items-center justify-between space-x-2 mb-2">
        <p className="text-xs font-semibold text-gray-800 truncate" title={zlecenie.locationString}>
            {zlecenie.locationString}
        </p>
        <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{zlecenie.proposedPrice || zlecenie.clientPrice} PLN</span>
      </div>
      <div className="flex items-center justify-end text-xs text-gray-500">
        <span>{new Date(zlecenie.creationDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ZlecenieCard;