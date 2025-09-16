import React, { useState, useEffect } from 'react';
import { Zlecenie, ZlecenieStatus, LeadSource, AppraisalForm, ClientDetails } from '../types';
import { geocodeAndGetVoivodeship } from '../services/geminiService';

interface ZlecenieFormProps {
  onSubmit: (data: Partial<Zlecenie>, id?: string) => void;
  onClose: () => void;
  propertyTypes: string[];
  valuationPurposes: string[];
  appraisalForms: string[];
  initialData?: Zlecenie | null;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-3">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const ZlecenieForm: React.FC<ZlecenieFormProps> = ({ onSubmit, onClose, propertyTypes, valuationPurposes, appraisalForms, initialData }) => {
    
    const getInitialFormData = (): Partial<Zlecenie> => {
        if (initialData) return initialData;
        return {
            status: ZlecenieStatus.LEAD,
            propertyType: propertyTypes[0],
            valuationPurpose: valuationPurposes[0],
            clientDetails: {
                fullName: '',
                appraisalForm: appraisalForms[0] as AppraisalForm,
                phone: '',
            },
            source: LeadSource.TELEFON,
        };
    };

    const [formData, setFormData] = useState<Partial<Zlecenie>>(getInitialFormData());
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!initialData;
    const isLead = formData.status === ZlecenieStatus.LEAD;

    useEffect(() => {
        setFormData(getInitialFormData());
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (['fullName', 'phone', 'email', 'appraisalForm'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                clientDetails: { ...(prev.clientDetails as ClientDetails), [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleConvertToOrder = () => {
        if (!formData.proposedPrice || Number(formData.proposedPrice) <= 0) {
            alert('Cena dla rzeczoznawcy jest wymagana do konwersji na zlecenie.');
            return;
        }
        setFormData(prev => ({...prev, status: ZlecenieStatus.NOWE, publicationDate: new Date().toISOString()}));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (!formData.locationString || !formData.clientDetails?.phone || !formData.clientDetails?.fullName) {
            alert('Lokalizacja, imię, nazwisko oraz telefon klienta są wymagane.');
            setIsLoading(false);
            return;
        }

        // Geocode only if location changed or it's a new entry
        let geocodeResult = { coordinates: formData.coordinates, voivodeship: formData.voivodeship };
        if (!isEditing || formData.locationString !== initialData?.locationString) {
             const result = await geocodeAndGetVoivodeship(formData.locationString);
             if (result) {
                 geocodeResult = { coordinates: result.coordinates, voivodeship: result.voivodeship };
             } else {
                 alert('Nie udało się znaleźć lokalizacji. Sprawdź adres.');
                 setIsLoading(false);
                 return;
             }
        }
        
        const finalData = {
            ...formData,
            clientPrice: formData.clientPrice ? Number(formData.clientPrice) : undefined,
            proposedPrice: formData.proposedPrice ? Number(formData.proposedPrice) : undefined,
            ...geocodeResult
        };

        onSubmit(finalData, initialData?.id);
        setIsLoading(false);
    };
    
    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const selectStyles = "mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <FormSection title="Dane Nieruchomości">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lokalizacja *</label>
                        <input type="text" name="locationString" value={formData.locationString || ''} onChange={handleChange} className={inputStyles} required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Numer KW</label>
                        <input type="text" name="kwNumber" value={formData.kwNumber || ''} onChange={handleChange} className={inputStyles} />
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Imię i nazwisko klienta *</label>
                        <input type="text" name="fullName" value={formData.clientDetails?.fullName || ''} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefon klienta *</label>
                        <input type="tel" name="phone" value={formData.clientDetails?.phone || ''} onChange={handleChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={formData.clientDetails?.email || ''} onChange={handleChange} className={inputStyles} />
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
                        <label className="block text-sm font-medium text-gray-700">Cena dla klienta (PLN)</label>
                        <input type="number" name="clientPrice" value={formData.clientPrice || ''} onChange={handleChange} className={inputStyles}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cena dla rzeczoznawcy (PLN)</label>
                        <input type="number" name="proposedPrice" value={formData.proposedPrice || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Proponowany termin</label>
                        <input type="date" name="proposedCompletionDate" value={formData.proposedCompletionDate || ''} onChange={handleChange} className={inputStyles} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Forma operatu *</label>
                        <select name="appraisalForm" value={formData.clientDetails?.appraisalForm} onChange={handleChange} className={selectStyles} required>
                        {appraisalForms.map(form => <option key={form} value={form}>{form}</option>)}
                        </select>
                    </div>
                </div>
            </FormSection>
            
            <FormSection title="Dodatkowe Informacje">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dodatkowe uwagi</label>
                    <textarea name="additionalNotes" rows={2} maxLength={160} value={formData.additionalNotes || ''} onChange={handleChange} className={inputStyles} />
                </div>
            </FormSection>

            <div className="flex justify-between items-center pt-4 space-x-2 border-t">
                 <div>
                    {isEditing && isLead && (
                        <button
                            type="button"
                            onClick={handleConvertToOrder}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                        >
                            Konwertuj na Zlecenie
                        </button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                      {isLoading ? 'Zapisywanie...' : 'Zapisz'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ZlecenieForm;