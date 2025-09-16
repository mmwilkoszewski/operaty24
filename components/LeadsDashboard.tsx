import React from 'react';
import { Zlecenie, ZlecenieStatus } from '../types';
import KanbanColumn from './OrderList';

interface KanbanBoardProps {
    zlecenia: Zlecenie[];
    onCardClick: (zlecenie: Zlecenie) => void;
    onAddLeadClick: () => void;
}

const KANBAN_COLUMNS: { title: string; statuses: ZlecenieStatus[] }[] = [
    { title: 'Nowe Leady', statuses: [ZlecenieStatus.LEAD] },
    { title: 'Do Akceptacji', statuses: [ZlecenieStatus.DO_AKCEPTACJI] },
    { title: 'Na Giełdzie', statuses: [ZlecenieStatus.NOWE, ZlecenieStatus.ZAREZERWOWANE] },
    { title: 'W Trakcie', statuses: [ZlecenieStatus.W_TRAKCIE] },
    { title: 'Do Rozliczenia', statuses: [ZlecenieStatus.DO_ROZLICZENIA] },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ zlecenia, onCardClick, onAddLeadClick }) => {
    const getColumnZlecenia = (statuses: ZlecenieStatus[]): Zlecenie[] => {
        return zlecenia
            .filter(z => statuses.includes(z.status))
            .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    };

    return (
        <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-sm">
            <div className="flex-grow flex p-4 space-x-4 overflow-x-auto">
                {KANBAN_COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.title}
                        title={col.title}
                        zlecenia={getColumnZlecenia(col.statuses)}
                        onCardClick={onCardClick}
                        status={col.statuses[0]} // Pass first status to identify column type
                        onAddClick={col.statuses.includes(ZlecenieStatus.LEAD) ? onAddLeadClick : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;