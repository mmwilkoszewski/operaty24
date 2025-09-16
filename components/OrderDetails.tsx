import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Zlecenie, ZlecenieStatus, User, UserRole, WorkInProgressSubStatus, SettlementChecklist } from '../types';
import { 
    MapPinIcon, 
    PencilIcon,
    CheckCircleIcon,
    PaperClipIcon,
    TrashIcon,
    ClockIcon
} from '../constants';
import CommunicationLog from './CommunicationLog';
import { ZLECENIE_STATUSES, statusStyles, WORK_IN_PROGRESS_SUBSTATUSES } from '../constants';
import Modal from './Modal';

interface ZlecenieDetailsProps {
  zlecenie: Zlecenie;
  currentUser: User | null;
  users: User[];
  onEdit: (zlecenie: Zlecenie) => void;
  onSubmitOperat: (zlecenie: Zlecenie) => void;
  onAddCommunicationEntry: (content: string) => void;
  onAttachFile: (zlecenieId: string, file: File) => void;
  onDeleteFile: (zlecenieId: string, fileId: string) => void;
  onUpdateStatus: (zlecenieId: string, newStatus: ZlecenieStatus) => void;
  onUpdateSubStatus: (zlecenieId: string, subStatus: WorkInProgressSubStatus) => void;
  onUpdateSettlementChecklist: (zlecenieId: string, checklistItem: keyof SettlementChecklist, value: boolean) => void;
  onFinalize: (zlecenieId: string) => void;
  activeSubcontractorTab?: 'gielda' | 'moje';
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`pt-4 mt-4 border-t ${className}`}>
        <h4 className="text-base font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="bg-gray-50/75 border border-gray-200 rounded-lg p-3">
            {children}
        </div>
    </div>
);

const DetailItem: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        {value !== undefined && <p className="text-base font-semibold text-gray-900 min-h-[24px]">{value || 'Brak'}</p>}
        {children}
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</p>
    </div>
);


const ZlecenieDetails: React.FC<ZlecenieDetailsProps> = ({ zlecenie, currentUser, users, onEdit, onSubmitOperat, onAddCommunicationEntry, onAttachFile, onDeleteFile, onUpdateStatus, onUpdateSubStatus, onUpdateSettlementChecklist, onFinalize, activeSubcontractorTab }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [editedZlecenie, setEditedZlecenie] = useState<Zlecenie>(zlecenie);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setEditedZlecenie(zlecenie);
    setIsDirty(false);
  }, [zlecenie]);
  
  const assignedUser = editedZlecenie.assignedAppraiserId 
    ? users.find(u => u.id === editedZlecenie.assignedAppraiserId) 
    : null;

  const isInternalUser = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.PRACOWNIK;
  const isAppraiser = currentUser?.role === UserRole.RZECZOZNAWCA;
  const isAssignedAppraiser = editedZlecenie.assignedAppraiserId === currentUser?.id;
  const showFullDetails = isInternalUser || (isAssignedAppraiser && editedZlecenie.status !== ZlecenieStatus.NOWE);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        onAttachFile(editedZlecenie.id, e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleCancel = () => {
    setEditedZlecenie(zlecenie);
    setIsDirty(false);
  };
  
  const handleSave = () => {
    if (!isDirty) return;

    if (zlecenie.status !== editedZlecenie.status) {
        onUpdateStatus(zlecenie.id, editedZlecenie.status);
    }
    if (zlecenie.subStatus !== editedZlecenie.subStatus && editedZlecenie.subStatus) {
        onUpdateSubStatus(zlecenie.id, editedZlecenie.subStatus);
    }
    
    const originalChecklist = zlecenie.settlementChecklist;
    const editedChecklist = editedZlecenie.settlementChecklist;
    if (editedChecklist && JSON.stringify(originalChecklist) !== JSON.stringify(editedChecklist)) {
        (Object.keys(editedChecklist) as Array<keyof SettlementChecklist>).forEach(key => {
            if (!originalChecklist || originalChecklist[key] !== editedChecklist[key]) {
                onUpdateSettlementChecklist(zlecenie.id, key, editedChecklist[key]);
            }
        });
    }
    
    setIsDirty(false);
  };

  const isChecklistComplete = useMemo(() => {
    if (!editedZlecenie.settlementChecklist) return false;
    return Object.values(editedZlecenie.settlementChecklist).every(Boolean);
  }, [editedZlecenie.settlementChecklist]);

  const currentStatusStyle = statusStyles[editedZlecenie.status] || { dot: 'bg-gray-500', text: 'text-gray-700' };
  const operatFile = editedZlecenie.attachments.find(file => file.id.startsWith('file-operat-'));


  return (
    <div className="h-full flex flex-col">
        <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-3">
                <div className="pb-4 border-b">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center space-x-1">
                                <MapPinIcon className="w-6 h-6 text-indigo-600 flex-shrink-0"/>
                                <h2 className="text-xl font-bold text-gray-900 break-words">
                                    {showFullDetails ? editedZlecenie.locationString : `Zlecenie w: ${editedZlecenie.locationString.split(',').pop()?.trim() || editedZlecenie.locationString}`}
                                </h2>
                            </div>
                            <div className="mt-1 pl-7 flex items-center gap-x-4 text-sm text-gray-500">
                                <span>ID: #{editedZlecenie.id}</span>
                                <span>Dodano: {new Date(editedZlecenie.creationDate).toLocaleDateString('pl-PL')}</span>
                                {editedZlecenie.clientPrice && editedZlecenie.proposedPrice && (
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-lg text-green-700">
                                            {(editedZlecenie.clientPrice - editedZlecenie.proposedPrice).toFixed(2)} PLN
                                        </span>
                                        <span className="text-xs text-green-600 uppercase tracking-wider">Marża</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4 space-y-2 text-right">
                            {isAppraiser && isAssignedAppraiser && editedZlecenie.status === ZlecenieStatus.W_TRAKCIE && (
                                <button
                                    onClick={() => onSubmitOperat(editedZlecenie)}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span>Zakończ i przekaż operat</span>
                                </button>
                            )}
                            <div className="flex items-center justify-end space-x-2">
                                <div className={`w-3 h-3 rounded-full ${currentStatusStyle.dot}`}></div>
                                {isInternalUser ? (
                                    <select
                                        value={editedZlecenie.status}
                                        onChange={(e) => { setIsDirty(true); setEditedZlecenie(prev => ({ ...prev, status: e.target.value as ZlecenieStatus })); }}
                                        className={`block w-full max-w-xs pl-3 pr-10 py-1.5 text-sm font-semibold bg-white text-gray-900 border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md`}
                                    >
                                        {ZLECENIE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                ) : (
                                    <span className={`text-sm font-semibold uppercase ${currentStatusStyle.text}`}>{editedZlecenie.status}</span>
                                )}
                                <button onClick={() => setIsHistoryModalOpen(true)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800" title="Pokaż historię"><ClockIcon className="w-4 h-4" /></button>
                                {isInternalUser && (
                                    <button onClick={() => onEdit(editedZlecenie)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800" title="Edytuj zlecenie"><PencilIcon className="w-4 h-4" /></button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {assignedUser && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-indigo-800 mb-2">Przypisany Rzeczoznawca</h4>
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-indigo-100">
                                    <svg className="h-full w-full text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{`${assignedUser.firstName} ${assignedUser.lastName}`}</p>
                                <p className="text-sm text-gray-500">{assignedUser.email}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {editedZlecenie.status === ZlecenieStatus.W_TRAKCIE && editedZlecenie.subStatus && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-sm font-semibold text-purple-800">
                            Postęp prac: <span className="font-bold">{editedZlecenie.subStatus}</span>
                        </div>
                        {isAssignedAppraiser && (
                            <div className="mt-2 pt-2 border-t border-purple-200/50 flex items-center gap-2">
                                <label className="text-xs font-medium text-purple-700">Zmień postęp:</label>
                                <select
                                    value={editedZlecenie.subStatus}
                                    onChange={(e) => { setIsDirty(true); setEditedZlecenie(prev => ({...prev, subStatus: e.target.value as WorkInProgressSubStatus})); }}
                                    className="block w-full max-w-xs pl-2 pr-8 py-1 text-xs border-purple-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
                                >
                                    {WORK_IN_PROGRESS_SUBSTATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {editedZlecenie.status === ZlecenieStatus.DO_ROZLICZENIA && isInternalUser && editedZlecenie.settlementChecklist && (
                    <DetailSection title="Checklista zamknięcia zlecenia">
                        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg space-y-3">
                            {Object.entries(editedZlecenie.settlementChecklist).map(([key, value]) => {
                                const labels: Record<string, string> = {
                                    operatPobrany: 'Pobrano operat',
                                    fakturaWystawiona: 'Wystawiono fakturę dla klienta',
                                    fakturaOplacona: 'Faktura opłacona przez klienta',
                                    operatPrzekazany: 'Przekazano operat klientowi',
                                    rozliczonoZRzeczoznawca: 'Rozliczono z rzeczoznawcą'
                                };
                                return (
                                    <label key={key} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => {
                                                setIsDirty(true);
                                                setEditedZlecenie(prev => {
                                                    const updatedChecklist = { ...prev.settlementChecklist, [key]: e.target.checked };
                                                    return { ...prev, settlementChecklist: updatedChecklist as SettlementChecklist };
                                                });
                                            }}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className={`text-sm ${value ? 'text-gray-800 line-through' : 'text-gray-800'}`}>
                                            {labels[key]}
                                            {key === 'operatPobrany' && operatFile && (
                                                <a href={operatFile.url} download={operatFile.name} className="ml-2 text-indigo-600 hover:underline text-xs">(pobierz)</a>
                                            )}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => onFinalize(editedZlecenie.id)}
                                disabled={!isChecklistComplete}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm font-medium"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>Zakończ i zarchiwizuj</span>
                            </button>
                        </div>
                    </DetailSection>
                )}
                
                {showFullDetails ? (
                    <>
                    <DetailSection title="Dane Nieruchomości">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                            <DetailItem label="Rodzaj" value={editedZlecenie.propertyType} />
                            <DetailItem label="Cel" value={editedZlecenie.valuationPurpose} />
                            <DetailItem label="Numer KW" value={editedZlecenie.kwNumber} />
                            <DetailItem label="Województwo" value={editedZlecenie.voivodeship} />
                        </div>
                    </DetailSection>
                    
                    {editedZlecenie.clientDetails && (
                        <DetailSection title="Dane Klienta">
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
                                <DetailItem label="Imię i Nazwisko" value={editedZlecenie.clientDetails.fullName} />
                                <DetailItem label="Telefon" value={editedZlecenie.clientDetails.phone} />
                                <DetailItem label="Email" value={editedZlecenie.clientDetails.email} />
                            </div>
                        </DetailSection>
                    )}

                    <DetailSection title="Warunki zlecenia">
                         <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            <DetailItem label="Cena dla klienta" value={editedZlecenie.clientPrice ? `${editedZlecenie.clientPrice} PLN` : 'Brak danych'} />
                            <DetailItem label="Cena dla rzeczoznawcy" value={`${editedZlecenie.proposedPrice} PLN`} />
                            <DetailItem label="Proponowany termin" value={editedZlecenie.proposedCompletionDate ? new Date(editedZlecenie.proposedCompletionDate).toLocaleDateString('pl-PL') : 'Brak'} />
                            <DetailItem label="Data zakończenia" value={editedZlecenie.actualCompletionDate ? new Date(editedZlecenie.actualCompletionDate).toLocaleDateString('pl-PL') : 'Brak'} />
                            <DetailItem label="Forma operatu" value={editedZlecenie.clientDetails.appraisalForm} />
                        </div>
                    </DetailSection>

                    {editedZlecenie.additionalNotes && (
                        <DetailSection title="Dodatkowe uwagi">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border">{editedZlecenie.additionalNotes}</p>
                        </DetailSection>
                    )}
                    
                    <DetailSection title="Załączniki">
                        <div className="space-y-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-xs font-medium"
                            >
                                + Dodaj plik
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="space-y-2 pt-2">
                                {editedZlecenie.attachments.length > 0 ? editedZlecenie.attachments.map(file => (
                                    <div key={file.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md border">
                                        <div>
                                            <a href={file.url} download={file.name} className="font-medium text-indigo-600 hover:underline">{file.name}</a>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024).toFixed(1)} KB - {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onDeleteFile(editedZlecenie.id, file.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                            title="Usuń plik"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) : <p className="text-sm text-gray-500 text-center py-2">Brak załączników.</p>}
                            </div>
                        </div>
                    </DetailSection>
                    </>
                ) : (
                    <div className="mt-4 pt-4 border-t text-center bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800">Szczegóły zlecenia są ukryte</h4>
                        <p className="text-sm text-gray-600 mt-1">Pełne dane, w tym dokładny adres i uwagi, będą widoczne po zaakceptowaniu zlecenia i zmianie jego statusu na "W trakcie".</p>
                    </div>
                )}
            </div>
        </div>
        
        {isInternalUser && isDirty && (
            <div className="flex-shrink-0 p-4 border-t bg-gray-50 flex justify-end space-x-3">
                <button type="button" onClick={handleCancel} className="px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-md hover:bg-gray-100 font-medium">Anuluj</button>
                <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">Zapisz zmiany</button>
            </div>
        )}

        <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Historia zlecenia #${editedZlecenie.id}`} size="lg">
            <CommunicationLog log={editedZlecenie.communicationLog} />
        </Modal>
    </div>
  );
};

export default ZlecenieDetails;