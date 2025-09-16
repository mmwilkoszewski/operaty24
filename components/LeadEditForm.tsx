import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Replace 'Lead' and 'LeadStatus' with 'Zlecenie' and 'ZlecenieStatus' to align with defined types.
import { Zlecenie, LeadSource, AppraisalForm, ZlecenieStatus } from '../types';
import CommunicationLog from './CommunicationLog';

interface LeadEditFormData {
    locationString: string;
    kwNumber: string;
    propertyType: string;
    valuationPurpose: string;
    // FIX: Add clientFullName to the form data interface.
    clientFullName: string;
    clientPhone: string;
    clientEmail: string;
    appraisalForm: AppraisalForm;
    clientPrice: string;
    appraiserPrice: string;
    proposedCompletionDate: string;
    source: LeadSource;
    additionalNotes: string;
}

interface LeadEditFormProps {
  // FIX: Update onSubmit to use Partial<Zlecenie> for better type safety and flexibility.
  onSubmit: (data: Partial<Zlecenie>) => void;
  onClose: () => void;
  // FIX: Use 'Zlecenie' for initial data.
  initialData: Zlecenie;
  propertyTypes: string[];
  valuationPurposes: string[];
  appraisalForms: string[];
  onAddCommunicationEntry: (content: string) => void;
  // FIX: Use 'Zlecenie' for conversion data.
  onConvert: (leadData: Zlecenie) => Promise<boolean>;
  highlightField?: string | null;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-3">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);


const LeadEditForm: React.FC<LeadEditFormProps> = ({ onSubmit, onClose, initialData, propertyTypes, valuationPurposes, appraisalForms, onAddCommunicationEntry, onConvert, highlightField }) => {
    
    // FIX: Correctly map initialData (Zlecenie) to the form state.
    const [formData, setFormData] = useState<LeadEditFormData>({
        locationString: initialData.locationString,
        kwNumber: initialData.kwNumber || '',
        propertyType: initialData.propertyType,
        valuationPurpose: initialData.valuationPurpose,
        // FIX: Initialize clientFullName from initialData.
        clientFullName: initialData.clientDetails.fullName,
        clientPhone: initialData.clientDetails.phone,
        clientEmail: initialData.clientDetails.email || '',
        appraisalForm: initialData.clientDetails.appraisalForm,
        clientPrice: initialData.clientPrice ? String(initialData.clientPrice) : '',
        appraiserPrice: initialData.proposedPrice ? String(initialData.proposedPrice) : '',
        proposedCompletionDate: initialData.proposedCompletionDate || '',
        source: initialData.source || LeadSource.TELEFON,
        additionalNotes: initialData.additionalNotes || '',
    });
    const [isConverting, setIsConverting] = useState(false);
    const appraiserPriceRef = useRef<HTMLInputElement>(null);

    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const selectStyles = "mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";


    useEffect(() => {
        if (highlightField === 'appraiserPrice' && appraiserPriceRef.current) {
            appraiserPriceRef.current.focus();
            appraiserPriceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightField]);

    const sortedLog = useMemo(() => {
        return [...initialData.communicationLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [initialData.communicationLog]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Add clientFullName to the validation check.
        if (!formData.locationString || !formData.clientFullName || !formData.clientPhone || !formData.clientPrice || !formData.source || !formData.appraisalForm) {
            alert('Proszę wypełnić wszystkie wymagane pola.');
            return;
        }
        // FIX: Construct a Partial<Zlecenie> object with correct property names for submission.
        onSubmit({
            locationString: formData.locationString,
            kwNumber: formData.kwNumber || undefined,
            propertyType: formData.propertyType,
            valuationPurpose: formData.valuationPurpose,
            clientDetails: {
                // FIX: Add fullName to the ClientDetails object.
                fullName: formData.clientFullName,
                phone: formData.clientPhone,
                email: formData.clientEmail || undefined,
                appraisalForm: formData.appraisalForm,
            },
            clientPrice: Number(formData.clientPrice),
            proposedPrice: formData.appraiserPrice ? Number(formData.appraiserPrice) : undefined,
            proposedCompletionDate: formData.proposedCompletionDate || undefined,
            source: formData.source,
            additionalNotes: formData.additionalNotes || undefined,
        });
    };
    
    const handleConvert = async () => {
        setIsConverting(true);
        // FIX: Correctly construct the Zlecenie object for conversion.
        const leadDataForConversion: Zlecenie = {
            ...initialData,
            locationString: formData.locationString,
            kwNumber: formData.kwNumber,
            propertyType: formData.propertyType,
            valuationPurpose: formData.valuationPurpose,
            clientDetails: {
                ...initialData.clientDetails,
                // FIX: Add fullName to the ClientDetails object on conversion.
                fullName: formData.clientFullName,
                phone: formData.clientPhone,
                email: formData.clientEmail,
                appraisalForm: formData.appraisalForm,
            },
            clientPrice: Number(formData.clientPrice),
            proposedPrice: formData.appraiserPrice ? Number(formData.appraiserPrice) : undefined,
            proposedCompletionDate: formData.proposedCompletionDate,
            source: formData.source,
            additionalNotes: formData.additionalNotes,
        };
        const success = await onConvert(leadDataForConversion);
        if (success) {
            onClose();
        }
        setIsConverting(false);
    };

    const appraiserPriceInputClass = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 sm:text-sm ${
        highlightField === 'appraiserPrice'
            ? 'border-red-500 ring-2 ring-red-200 focus:border-red-500 focus:ring-red-300'
            : 'border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
    }`;


    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <FormSection title="Dane Nieruchomości">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lokalizacja *</label>
                        <input type="text" name="locationString" value={formData.locationString} onChange={handleChange} className={inputStyles} required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Numer KW</label>
                        <input type="text" name="kwNumber" value={formData.kwNumber} onChange={handleChange} className={inputStyles} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rodzaj nieruchomości *</label>
                        <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={selectStyles}>
                        {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cel wyceny *</label>
                        <select name="valuationPurpose" value={formData.valuationPurpose} onChange={handleChange} className={selectStyles}>
                        {valuationPurposes.map(purpose => <option key={purpose} value={purpose}>{purpose}</option>)}
                        </select>
                    </div>
                </div>
            </FormSection>

            <FormSection title="Dane Klienta">
                 {/* FIX: Change grid layout to accommodate new field and add input for client's full name. */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Imię i nazwisko klienta *</label>
                        <input type="text" name="clientFullName" value={formData.clientFullName} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefon klienta *</label>
                        <input type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Źródło pozyskania *</label>
                        <select name="source" value={formData.source} onChange={handleChange} className={selectStyles} required>
                        {Object.values(LeadSource).map(source => <option key={source} value={source}>{source}</option>)}
                        </select>
                    </div>
                </div>
            </FormSection>
            
            <FormSection title="Warunki Zlecenia">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cena dla klienta (PLN) *</label>
                        <input type="number" name="clientPrice" value={formData.clientPrice} onChange={handleChange} className={inputStyles} required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cena dla rzeczoznawcy (PLN)</label>
                        <input
                            type="number"
                            name="appraiserPrice"
                            value={formData.appraiserPrice}
                            onChange={handleChange}
                            ref={appraiserPriceRef}
                            className={appraiserPriceInputClass}
                        />
                         {highlightField === 'appraiserPrice' && <p className="text-xs text-red-600 mt-1">To pole jest wymagane do konwersji na zlecenie.</p>}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Proponowany termin</label>
                        <input type="date" name="proposedCompletionDate" value={formData.proposedCompletionDate} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Forma operatu *</label>
                        <select name="appraisalForm" value={formData.appraisalForm} onChange={handleChange} className={selectStyles} required>
                        {appraisalForms.map(form => <option key={form} value={form}>{form}</option>)}
                        </select>
                    </div>
                </div>
            </FormSection>
            
            <FormSection title="Dodatkowe Informacje">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dodatkowe uwagi</label>
                    <textarea name="additionalNotes" rows={2} maxLength={160} value={formData.additionalNotes} onChange={handleChange} className={inputStyles} />
                    <p className="text-xs text-right text-gray-500 mt-1">{formData.additionalNotes.length} / 160</p>
                </div>
            </FormSection>

            <CommunicationLog log={sortedLog} onAddEntry={onAddCommunicationEntry} />

            <div className="flex justify-between items-center pt-4 space-x-2 border-t">
                <div>
                    {/* FIX: Use 'ZlecenieStatus.LEAD' to check the status. */}
                    {initialData.status === ZlecenieStatus.LEAD && (
                        <button
                            type="button"
                            onClick={handleConvert}
                            disabled={isConverting}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center"
                        >
                             {isConverting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isConverting ? 'Konwertowanie...' : 'Konwertuj na Zlecenie'}
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Zapisz zmiany</button>
                </div>
            </div>
        </form>
    );
};

export default LeadEditForm;