// FIX: Replaced placeholder content with a full, functional App component.
import React, { useState, useMemo, useEffect } from 'react';
import {
  User, Zlecenie, Filters, Settings, AuditLogEntry, Notification as NotificationType,
  UserRole, ZlecenieStatus, LeadSource, AppraisalForm, WorkInProgressSubStatus, SettlementChecklist, ClientDetails, SortOption
} from './types';
import { MOCK_USERS, MOCK_ZLECENIA, PROPERTY_TYPES, VALUATION_PURPOSES, ZLECENIE_STATUSES, APPRAISAL_FORMS, VOIVODESHIP_DATA, DocumentMagnifyingGlassIcon, ClipboardDocumentListIcon, BellIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon, ArchiveBoxIcon, PlusCircleIcon } from './constants';
import Login from './components/Login';
import FilterControls from './components/FilterControls';
import ZlecenieDetails from './components/OrderDetails';
import OrderMap from './components/OrderMap';
import Modal from './components/Modal';
import ZlecenieForm from './components/LeadForm';
import AppraiserResponseForm from './components/SubcontractorResponseForm';
import SettingsPanel from './components/SettingsPanel';
import SubcontractorSettingsPanel from './components/SubcontractorSettingsPanel';
import { NotificationProvider, useNotification } from './components/NotificationProvider';
import { geocodeAndGetVoivodeship } from './services/geminiService';
import SubmitOperatModal from './components/SubmitOperatModal';
import AssignAppraiserModal from './components/AssignAppraiserModal';
import NotificationsPanel from './components/NotificationsPanel';
import CancelOrderModal from './components/CancelOrderModal';
import KanbanBoard from './components/LeadsDashboard';
import ZlecenieCard from './components/OrderCard';

const AppContent: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [zlecenia, setZlecenia] = useState<Zlecenie[]>(MOCK_ZLECENIA);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    
    const [subcontractorTab, setSubcontractorTab] = useState<'gielda' | 'moje'>('gielda');
    const [selectedZlecenie, setSelectedZlecenie] = useState<Zlecenie | null>(null);

    const [isZlecenieFormOpen, setIsZlecenieFormOpen] = useState(false);
    const [isZlecenieDetailsOpen, setIsZlecenieDetailsOpen] = useState(false);
    
    const [isAppraiserResponseFormOpen, setIsAppraiserResponseFormOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSubmitOperatModalOpen, setIsSubmitOperatModalOpen] = useState(false);
    const [isAssignAppraiserModalOpen, setIsAssignAppraiserModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    
    const [zlecenieToCancel, setZlecenieToCancel] = useState<Zlecenie | null>(null);
    const [zlecenieToUpdateStatus, setZlecenieToUpdateStatus] = useState<{zlecenieId: string, newStatus: ZlecenieStatus} | null>(null);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    
    const { addNotification } = useNotification();

    const [filters, setFilters] = useState<Filters>({
      propertyType: [],
      valuationPurpose: [],
      location: '',
      voivodeship: 'all',
      status: [],
      sortBy: 'default',
      quickSearch: '',
      assignedAppraiserId: 'all'
    });

    const addAuditLog = (action: string, details: string) => {
        const newEntry: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: currentUser!.id,
            userEmail: currentUser!.email,
            action,
            details,
        };
        setAuditLog(prev => [newEntry, ...prev]);
    }

    const handleLogin = (email: string, password: string) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            setLoginError(null);
        } else {
            setLoginError('Nieprawidłowy email lub hasło.');
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleFilterChange = (name: keyof Filters, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const isInternalUser = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.PRACOWNIK;
    
    const filteredZlecenia = useMemo(() => {
        let filtered = [...zlecenia];
        const isAppraiser = currentUser?.role === UserRole.RZECZOZNAWCA;

        if (isAppraiser) {
            if (subcontractorTab === 'gielda') {
                filtered = filtered.filter(o => o.status === ZlecenieStatus.NOWE);
                 if (currentUser.assignedVoivodeships && currentUser.assignedVoivodeships.length > 0) {
                     filtered = filtered.filter(o => o.voivodeship && currentUser.assignedVoivodeships?.includes(o.voivodeship));
                 }
            } else {
                filtered = filtered.filter(o => o.assignedAppraiserId === currentUser?.id);
            }
        }
        
        // Common filters for appraiser
        if (filters.propertyType.length > 0) {
            filtered = filtered.filter(o => filters.propertyType.includes(o.propertyType));
        }
        if (filters.valuationPurpose.length > 0) {
            filtered = filtered.filter(o => filters.valuationPurpose.includes(o.valuationPurpose));
        }
        if (filters.status.length > 0) {
            filtered = filtered.filter(o => filters.status.includes(o.status));
        }

        return filtered.sort((a, b) => {
            const dateA = new Date(a.publicationDate || a.creationDate).getTime();
            const dateB = new Date(b.publicationDate || b.creationDate).getTime();
            switch (filters.sortBy) {
                case 'date_asc': return dateA - dateB;
                case 'date_desc': return dateB - dateA;
                case 'price_asc': return (a.proposedPrice || 0) - (b.proposedPrice || 0);
                case 'price_desc': return (b.proposedPrice || 0) - (a.proposedPrice || 0);
                default: return dateB - dateA;
            }
        });
    }, [zlecenia, filters, currentUser, subcontractorTab]);

    useEffect(() => {
        if (filteredZlecenia.length > 0 && !filteredZlecenia.find(o => o.id === selectedZlecenie?.id)) {
          setSelectedZlecenie(null);
        } else if (filteredZlecenia.length === 0) {
            setSelectedZlecenie(null);
        }
    }, [filteredZlecenia, selectedZlecenie?.id]);
    
    const handleAddOrUpdateZlecenie = (data: Partial<Zlecenie>, id?: string) => {
        if (id) { // Update
            const updatedZlecenie = { ...zlecenia.find(o => o.id === id)!, ...data };
            setZlecenia(zlecenia.map(o => o.id === id ? updatedZlecenie : o));
            addNotification(`Zlecenie #${id} zaktualizowane.`, 'success');
            addAuditLog('Zaktualizowano zlecenie', `Zlecenie #${id}`);
            setSelectedZlecenie(updatedZlecenie);
        } else { // Add new Lead
            const newLead: Zlecenie = {
                id: `L${Date.now()}`,
                creationDate: new Date().toISOString(),
                status: ZlecenieStatus.LEAD,
                communicationLog: [{ id: `log-${Date.now()}`, date: new Date().toISOString(), author: 'System', content: 'Lead utworzony.' }],
                attachments: [],
                responses: [],
                ...data
            } as Zlecenie;
            setZlecenia(prev => [newLead, ...prev]);
            addNotification(`Dodano nowego leada #${newLead.id}`, 'success');
            addAuditLog('Utworzono leada', `Lead #${newLead.id}`);
        }
        setIsZlecenieFormOpen(false);
    };
    
    const handleAddUser = (user: User) => {
        if(users.find(u => u.id === user.id)) { // Update
            setUsers(users.map(u => u.id === user.id ? {...u, ...user} : u));
            addNotification(`Zaktualizowano użytkownika ${user.email}`, 'success');
            addAuditLog('Zaktualizowano użytkownika', `Użytkownik ${user.email}`);
        } else { // Add
             const newUser = {...user, id: `user-${Date.now()}`};
             setUsers(prev => [...prev, newUser]);
             addNotification(`Dodano użytkownika ${newUser.email}`, 'success');
             addAuditLog('Dodano użytkownika', `Użytkownik ${newUser.email}`);
        }
    }
    
    const handleUpdateUser = (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
        addNotification('Twoje ustawienia zostały zapisane.', 'success');
    };
    
    const handleAddAppraiserResponse = (response: any) => {
      const newResponse = { ...response, id: `resp-${Date.now()}`, authorId: currentUser!.id, author: currentUser!.email };
      const updatedZlecenie = {
        ...selectedZlecenie!,
        status: ZlecenieStatus.ZAREZERWOWANE,
        responses: [...selectedZlecenie!.responses, newResponse],
        communicationLog: [...selectedZlecenie!.communicationLog, {id: `log-${Date.now()}`, date: new Date().toISOString(), author: 'System', content: `Rzeczoznawca ${currentUser!.email} odpowiedział na zlecenie.`}]
      };
      setZlecenia(zlecenia.map(o => o.id === selectedZlecenie!.id ? updatedZlecenie : o));
      setSelectedZlecenie(updatedZlecenie);
      addNotification('Twoja odpowiedź została wysłana.', 'success');
      setIsAppraiserResponseFormOpen(false);
    };

    const handleUpdateStatus = (zlecenieId: string, newStatus: ZlecenieStatus) => {
        const zlecenie = zlecenia.find(o => o.id === zlecenieId)!;
        const oldStatus = zlecenie.status;

        if (newStatus === oldStatus) return;

        if (newStatus === ZlecenieStatus.ANULOWANE) {
            setZlecenieToCancel(zlecenie);
            setIsCancelModalOpen(true);
            return;
        }
        if ((newStatus === ZlecenieStatus.W_TRAKCIE || newStatus === ZlecenieStatus.DO_ROZLICZENIA) && !zlecenie.assignedAppraiserId) {
            setZlecenieToUpdateStatus({zlecenieId, newStatus});
            setIsAssignAppraiserModalOpen(true);
            return;
        }
        
        const statusChangeLog = { id: `log-${Date.now()}`, date: new Date().toISOString(), author: 'System', content: `Zmieniono status z '${oldStatus}' na '${newStatus}'.` };
        let updatedZlecenie = { ...zlecenie, status: newStatus, communicationLog: [...zlecenie.communicationLog, statusChangeLog] };
        
        if (newStatus === ZlecenieStatus.DO_ROZLICZENIA && !updatedZlecenie.settlementChecklist) {
            updatedZlecenie.settlementChecklist = { operatPobrany: !!zlecenie.attachments.find(file => file.id.startsWith('file-operat-')), fakturaWystawiona: false, fakturaOplacona: false, operatPrzekazany: false, rozliczonoZRzeczoznawca: false };
        }
        setZlecenia(zlecenia.map(o => o.id === zlecenieId ? updatedZlecenie : o));
        if (selectedZlecenie?.id === zlecenieId) setSelectedZlecenie(updatedZlecenie);
        addNotification(`Status zlecenia #${zlecenieId} zmieniono na: ${newStatus}`, 'info');
        addAuditLog('Zmiana statusu zlecenia', `Zlecenie #${zlecenieId}: ${oldStatus} -> ${newStatus}`);
    };
    
    const handleConfirmCancelZlecenie = (reason: string) => {
        if (!zlecenieToCancel) return;
        const oldStatus = zlecenieToCancel.status;
        const statusChangeLog = { id: `log-${Date.now()}`, date: new Date().toISOString(), author: 'System', content: `Zmieniono status z '${oldStatus}' na 'Anulowane'.` };
        const reasonLog = { id: `log-${Date.now()}-reason`, date: new Date().toISOString(), author: 'System', content: `Powód anulowania: ${reason}` };
        
        const updatedZlecenie = { ...zlecenieToCancel, status: ZlecenieStatus.ANULOWANE, communicationLog: [ ...zlecenieToCancel.communicationLog, statusChangeLog, reasonLog ] };
        
        setZlecenia(zlecenia.map(o => o.id === zlecenieToCancel.id ? updatedZlecenie : o));
        if (selectedZlecenie?.id === zlecenieToCancel.id) setSelectedZlecenie(updatedZlecenie);
        addNotification(`Zlecenie #${zlecenieToCancel.id} zostało anulowane.`, 'info');
        addAuditLog('Anulowano zlecenie', `Zlecenie #${zlecenieToCancel.id}`);
        setIsCancelModalOpen(false);
        setZlecenieToCancel(null);
    };

    const handleAssignAndChangeStatus = (appraiserId: string) => {
        const {zlecenieId, newStatus} = zlecenieToUpdateStatus!;
        const zlecenie = zlecenia.find(o => o.id === zlecenieId)!;
        const oldStatus = zlecenie.status;

        const assignmentLog = {id: `log-${Date.now()}-assign`, date: new Date().toISOString(), author: 'System', content: `Przypisano rzeczoznawcę: ${users.find(u=>u.id === appraiserId)?.email}.`};
        const statusChangeLog = {id: `log-${Date.now()}-status`, date: new Date().toISOString(), author: 'System', content: `Zmieniono status z '${oldStatus}' na '${newStatus}'.`};
        
        let updatedZlecenie = { ...zlecenie, status: newStatus, assignedAppraiserId: appraiserId, communicationLog: [...zlecenie.communicationLog, assignmentLog, statusChangeLog] };
        if (newStatus === ZlecenieStatus.DO_ROZLICZENIA && !updatedZlecenie.settlementChecklist) {
            updatedZlecenie.settlementChecklist = { operatPobrany: !!zlecenie.attachments.find(file => file.id.startsWith('file-operat-')), fakturaWystawiona: false, fakturaOplacona: false, operatPrzekazany: false, rozliczonoZRzeczoznawca: false };
        }
        setZlecenia(zlecenia.map(o => o.id === zlecenieId ? updatedZlecenie : o));
        if (selectedZlecenie?.id === zlecenieId) setSelectedZlecenie(updatedZlecenie);
        addNotification(`Status zlecenia #${zlecenieId} zmieniono na: ${newStatus}`, 'info');
        addAuditLog('Przypisano rzeczoznawcę i zmieniono status', `Zlecenie #${zlecenieId} -> ${newStatus}`);
        setIsAssignAppraiserModalOpen(false);
        setZlecenieToUpdateStatus(null);
    }
    
    const handleAddCommunicationEntry = (content: string) => {
        const newEntry = {id: `log-${Date.now()}`, date: new Date().toISOString(), author: currentUser!.email, content};
        const updatedZlecenie = {...selectedZlecenie!, communicationLog: [...selectedZlecenie!.communicationLog, newEntry]};
        setZlecenia(zlecenia.map(z => z.id === selectedZlecenie!.id ? updatedZlecenie : z));
        setSelectedZlecenie(updatedZlecenie);
    };
    
    const handleAttachFile = (zlecenieId: string, file: File) => {
        const newAttachment = { id: `file-${Date.now()}`, name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file), uploadedAt: new Date().toISOString() };
        const updatedZlecenie = {...zlecenia.find(o => o.id === zlecenieId)!, attachments: [...zlecenia.find(o => o.id === zlecenieId)!.attachments, newAttachment]};
        setZlecenia(zlecenia.map(o => o.id === zlecenieId ? updatedZlecenie : o));
        if (selectedZlecenie?.id === zlecenieId) setSelectedZlecenie(updatedZlecenie);
        addNotification(`Dołączono plik: ${file.name}`, 'success');
    };

    const handleSubmitOperat = (actualCompletionDate: string, file: File) => {
        const zlecenie = selectedZlecenie!;
        const oldStatus = zlecenie.status;
        const newStatus = ZlecenieStatus.DO_ROZLICZENIA;
        
        const operatAttachment = { id: `file-operat-${Date.now()}`, name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file), uploadedAt: new Date().toISOString() };
        
        const operatLog = {id: `log-${Date.now()}-operat`, date: new Date().toISOString(), author: 'System', content: `Rzeczoznawca przekazał operat.`};
        const statusLog = {id: `log-${Date.now()}-status`, date: new Date().toISOString(), author: 'System', content: `Zmieniono status z '${oldStatus}' na '${newStatus}'.`};
        
        const updatedZlecenie = { ...zlecenie, status: newStatus, actualCompletionDate, attachments: [...zlecenie.attachments, operatAttachment], settlementChecklist: { operatPobrany: true, fakturaWystawiona: false, fakturaOplacona: false, operatPrzekazany: false, rozliczonoZRzeczoznawca: false }, communicationLog: [...zlecenie.communicationLog, operatLog, statusLog] };
        
        setZlecenia(zlecenia.map(o => o.id === zlecenie.id ? updatedZlecenie : o));
        setSelectedZlecenie(updatedZlecenie);
        addNotification('Operat został przekazany do rozliczenia', 'success');
        setIsSubmitOperatModalOpen(false);
    }
    
    const handleUpdateSettlementChecklist = (zlecenieId: string, checklistItem: keyof SettlementChecklist, value: boolean) => {
        setZlecenia(prev => prev.map(o => {
            if (o.id === zlecenieId && o.settlementChecklist) {
                const updatedChecklist = { ...o.settlementChecklist, [checklistItem]: value };
                const updatedZlecenie = { ...o, settlementChecklist: updatedChecklist };
                if (selectedZlecenie?.id === zlecenieId) setSelectedZlecenie(updatedZlecenie);
                return updatedZlecenie;
            }
            return o;
        }));
        addNotification(`Checklista dla zlecenia #${zlecenieId} została zaktualizowana.`, 'info');
    };

    const handleFinalizeZlecenie = (zlecenieId: string) => {
        const zlecenie = zlecenia.find(o => o.id === zlecenieId)!;
        const oldStatus = zlecenie.status;
        
        const finalizationLog = {id: `log-${Date.now()}-finalize`, date: new Date().toISOString(), author: 'System', content: `Zlecenie zostało zakończone i zarchiwizowane.`};
        const statusLog = {id: `log-${Date.now()}-status`, date: new Date().toISOString(), author: 'System', content: `Zmieniono status z '${oldStatus}' na '${ZlecenieStatus.ZAKONCZONE}'.`};

        const updatedZlecenie = { ...zlecenie, status: ZlecenieStatus.ZAKONCZONE, communicationLog: [...zlecenie.communicationLog, statusLog, finalizationLog] };
        
        setZlecenia(zlecenia.map(o => o.id === zlecenieId ? updatedZlecenie : o));
        setSelectedZlecenie(null);
        setIsZlecenieDetailsOpen(false);
        addNotification(`Zlecenie #${zlecenieId} zostało zakończone.`, 'success');
        addAuditLog('Zakończono zlecenie', `Zlecenie #${zlecenieId}`);
    };


    if (!currentUser) {
        return <Login onLogin={handleLogin} error={loginError} />;
    }

    return (
        <div className="h-screen w-screen bg-gray-100 flex flex-col font-sans">
            <header className="bg-white shadow-sm p-3 flex justify-between items-center flex-shrink-0 z-20">
                 <h1 className="text-xl font-bold text-gray-800">Operaty24.pl</h1>
                 <div className="flex items-center space-x-4">
                     <span className="text-sm text-gray-600">
                         Zalogowano jako: <span className="font-semibold">{currentUser.email}</span> ({currentUser.role})
                     </span>
                     <div className="flex items-center space-x-2">
                         <button onClick={() => setIsNotificationsOpen(p => !p)} className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800">
                            <BellIcon className="w-6 h-6" />
                            {notifications.some(n => !n.isRead) && <span className="absolute top-2 right-2 block w-2 h-2 bg-indigo-500 rounded-full"></span>}
                         </button>
                          <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Cog6ToothIcon className="w-6 h-6"/></button>
                         <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"><ArrowRightStartOnRectangleIcon className="w-6 h-6"/></button>
                     </div>
                 </div>
            </header>
            
            <main className="flex-grow p-4 overflow-hidden relative">
                {isInternalUser ? (
                    <>
                        <KanbanBoard 
                            zlecenia={zlecenia.filter(z => z.status !== ZlecenieStatus.ZAKONCZONE && z.status !== ZlecenieStatus.ANULOWANE)}
                            onCardClick={(zlecenie) => { setSelectedZlecenie(zlecenie); setIsZlecenieDetailsOpen(true); }}
                            onAddLeadClick={() => { setSelectedZlecenie(null); setIsZlecenieFormOpen(true); }}
                        />
                        <button
                            onClick={() => { setSelectedZlecenie(null); setIsZlecenieFormOpen(true); }}
                            className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105"
                            aria-label="Dodaj nowego leada"
                        >
                            <PlusCircleIcon className="w-8 h-8" />
                        </button>
                    </>
                ) : ( // Rzeczoznawca View
                    <div className="h-full flex flex-col">
                        <div className="flex-shrink-0 mb-4">
                            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg max-w-xs">
                                <button onClick={() => setSubcontractorTab('gielda')} className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${subcontractorTab === 'gielda' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}>Giełda Zleceń</button>
                                <button onClick={() => setSubcontractorTab('moje')} className={`w-full text-center px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${subcontractorTab === 'moje' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}>Moje Zlecenia</button>
                            </div>
                        </div>
                        <div className="flex-grow grid grid-cols-12 gap-4 overflow-hidden">
                           <div className="col-span-4 flex flex-col">
                                <FilterControls filters={filters} onFilterChange={handleFilterChange} propertyTypes={PROPERTY_TYPES} valuationPurposes={VALUATION_PURPOSES} statuses={ZLECENIE_STATUSES} currentUser={currentUser} users={users} />
                                <div className="flex-grow overflow-y-auto pr-2 mt-4 space-y-3">
                                    {filteredZlecenia.map(z => 
                                        <ZlecenieCard key={z.id} zlecenie={z} onClick={setSelectedZlecenie} />
                                    )}
                                </div>
                           </div>
                           <div className="col-span-5 bg-white rounded-lg shadow-sm overflow-hidden">
                               {selectedZlecenie ? (
                                    <ZlecenieDetails 
                                        zlecenie={selectedZlecenie} 
                                        currentUser={currentUser} 
                                        users={users} 
                                        onEdit={()=>{}} 
                                        onUpdateStatus={()=>{}} 
                                        onAddCommunicationEntry={handleAddCommunicationEntry} 
                                        onAttachFile={handleAttachFile} 
                                        onDeleteFile={()=>{}} 
                                        onSubmitOperat={() => setIsSubmitOperatModalOpen(true)} 
                                        onUpdateSubStatus={(id, status) => setZlecenia(zlecenia.map(o => o.id === id ? {...o, subStatus: status} : o))} 
                                        onUpdateSettlementChecklist={handleUpdateSettlementChecklist} 
                                        onFinalize={handleFinalizeZlecenie} 
                                        activeSubcontractorTab={subcontractorTab} 
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                                        <DocumentMagnifyingGlassIcon className="w-16 h-16 text-gray-300" />
                                        <h3 className="mt-4 text-lg font-medium">Wybierz zlecenie</h3>
                                        <p className="mt-1 text-sm">Zaznacz zlecenie z listy, aby zobaczyć jego szczegóły.</p>
                                    </div>
                                )}
                           </div>
                           <div className="col-span-3">
                               <OrderMap zlecenia={filteredZlecenia} selectedZlecenie={selectedZlecenie} currentUser={currentUser} />
                           </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
             <Modal isOpen={isZlecenieFormOpen} onClose={() => setIsZlecenieFormOpen(false)} title={selectedZlecenie ? `Edytuj Zlecenie #${selectedZlecenie.id}` : 'Dodaj Nowego Leada'} size="xl">
                <ZlecenieForm
                    onSubmit={handleAddOrUpdateZlecenie}
                    onClose={() => setIsZlecenieFormOpen(false)}
                    propertyTypes={PROPERTY_TYPES}
                    valuationPurposes={VALUATION_PURPOSES}
                    appraisalForms={APPRAISAL_FORMS}
                    initialData={selectedZlecenie}
                />
            </Modal>
            
            <Modal isOpen={isZlecenieDetailsOpen} onClose={() => setIsZlecenieDetailsOpen(false)} title="Szczegóły zlecenia" size="2xl">
              {selectedZlecenie && <ZlecenieDetails
                zlecenie={selectedZlecenie}
                currentUser={currentUser}
                users={users}
                onEdit={(z) => {setIsZlecenieDetailsOpen(false); setSelectedZlecenie(z); setIsZlecenieFormOpen(true);}}
                onUpdateStatus={handleUpdateStatus}
                onAddCommunicationEntry={handleAddCommunicationEntry}
                onAttachFile={handleAttachFile}
                onDeleteFile={()=>{}}
                onSubmitOperat={()=>{}}
                onUpdateSubStatus={(id, status) => setZlecenia(zlecenia.map(o => o.id === id ? {...o, subStatus: status} : o))}
                onUpdateSettlementChecklist={handleUpdateSettlementChecklist}
                onFinalize={handleFinalizeZlecenie}
              />}
            </Modal>
           
            {selectedZlecenie && (
                <Modal isOpen={isAppraiserResponseFormOpen} onClose={() => setIsAppraiserResponseFormOpen(false)} title="Odpowiedz na zlecenie">
                    <AppraiserResponseForm zlecenie={selectedZlecenie} onSubmit={handleAddAppraiserResponse} onClose={() => setIsAppraiserResponseFormOpen(false)} />
                </Modal>
            )}

            {isSettingsOpen && (
                <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Ustawienia" size="2xl">
                    {isInternalUser ? (
                        <SettingsPanel settings={{notificationEmail: '', propertyTypes: PROPERTY_TYPES, valuationPurposes: VALUATION_PURPOSES, orderStatusColors: {}, notificationTemplates: {orderAccepted: '', orderCancelled: '', orderUpdated: ''}}} onSettingsUpdate={() => {}} users={users} onUsersUpdate={setUsers} onClose={() => setIsSettingsOpen(false)} currentUser={currentUser} auditLog={auditLog} onUserAdd={handleAddUser} />
                    ) : (
                        <SubcontractorSettingsPanel user={currentUser} onUserUpdate={handleUpdateUser} onClose={() => setIsSettingsOpen(false)} />
                    )}
                </Modal>
            )}
             
            {isNotificationsOpen && (
                <NotificationsPanel 
                    notifications={notifications} 
                    onClose={() => setIsNotificationsOpen(false)} 
                    onMarkAsRead={(id) => setNotifications(notifications.map(n => n.id === id ? {...n, isRead: true} : n))}
                    onMarkAllAsRead={() => setNotifications(notifications.map(n => ({...n, isRead: true})))}
                    onNavigate={({view, itemId}) => { setSelectedZlecenie(zlecenia.find(o => o.id === itemId) || null); setIsZlecenieDetailsOpen(true); setIsNotificationsOpen(false)}}
                />
            )}

            <SubmitOperatModal 
                isOpen={isSubmitOperatModalOpen}
                onClose={() => setIsSubmitOperatModalOpen(false)}
                onSubmit={handleSubmitOperat}
                zlecenie={selectedZlecenie}
            />

            <AssignAppraiserModal 
                isOpen={isAssignAppraiserModalOpen}
                onClose={() => setIsAssignAppraiserModalOpen(false)}
                onSubmit={handleAssignAndChangeStatus}
                appraisers={users.filter(u => u.role === UserRole.RZECZOZNAWCA)}
                title="Przypisz rzeczoznawcę"
            />
            
            <CancelOrderModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onSubmit={handleConfirmCancelZlecenie}
                orderId={zlecenieToCancel?.id || null}
            />
        </div>
    );
};

const App: React.FC = () => (
    <NotificationProvider>
        <AppContent />
    </NotificationProvider>
);

export default App;