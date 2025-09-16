import React, { useState, useEffect } from 'react';
// FIX: Replace 'Order' with 'Zlecenie' as 'Order' is not an exported member of types.ts
import { Zlecenie, AppraisalForm } from '../types';

interface OrderFormData {
    locationString: string;
    kwNumber?: string;
    propertyType: string;
    valuationPurpose: string;
    clientPhone: string;
    clientEmail?: string;
    appraisalForm: AppraisalForm;
    proposedPrice: number;
    proposedCompletionDate?: string;
    additionalNotes?: string;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData, id?: string) => void;
  onClose: () => void;
  isLoading: boolean;
  propertyTypes: string[];
  valuationPurposes: string[];
  appraisalForms: string[];
  // FIX: Replace 'Order' with 'Zlecenie'
  initialData?: Zlecenie | null;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="pt-4">
        <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);


const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onClose, isLoading, propertyTypes, valuationPurposes, appraisalForms, initialData }) => {
  const [formData, setFormData] = useState<Partial<OrderFormData>>({});

  const isEditing = !!initialData;

  useEffect(() => {
    let data: Partial<OrderFormData> = {
        propertyType: propertyTypes[0] || '',
        valuationPurpose: valuationPurposes[0] || '',
        appraisalForm: appraisalForms[0] as AppraisalForm,
    };

    if (initialData) {
      data = {
        locationString: initialData.locationString,
        kwNumber: initialData.kwNumber,
        propertyType: initialData.propertyType,
        valuationPurpose: initialData.valuationPurpose,
        clientPhone: initialData.clientDetails?.phone,
        clientEmail: initialData.clientDetails?.email,
        appraisalForm: initialData.clientDetails?.appraisalForm,
        proposedPrice: initialData.proposedPrice,
        proposedCompletionDate: initialData.proposedCompletionDate,
        additionalNotes: initialData.additionalNotes,
      };
    }
    setFormData(data);
  }, [initialData, propertyTypes, valuationPurposes, appraisalForms]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationString || !formData.proposedPrice || !formData.propertyType || !formData.valuationPurpose || !formData.clientPhone) {
        alert("Proszę wypełnić wszystkie wymagane pola.");
        return;
    }
    onSubmit({
      ...formData,
      proposedPrice: Number(formData.proposedPrice),
    } as OrderFormData, initialData?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      
      <FormSection title="Dane Nieruchomości">
        <div>
            <label htmlFor="locationString" className="block text-sm font-medium text-gray-700">Lokalizacja (dokładny adres) *</label>
            <input
            type="text" name="locationString" id="locationString"
            value={formData.locationString || ''} onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="np. ul. Słoneczna 5, Kraków" required
            />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="kwNumber" className="block text-sm font-medium text-gray-700">Numer KW</label>
                <input
                    type="text" name="kwNumber" id="kwNumber"
                    value={formData.kwNumber || ''} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
         </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Rodzaj nieruchomości *</label>
            <select
                id="propertyType" name="propertyType"
                value={formData.propertyType} onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            </div>
            <div>
            <label htmlFor="valuationPurpose" className="block text-sm font-medium text-gray-700">Cel wyceny *</label>
            <select
                id="valuationPurpose" name="valuationPurpose"
                value={formData.valuationPurpose} onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                {valuationPurposes.map(purpose => <option key={purpose} value={purpose}>{purpose}</option>)}
            </select>
            </div>
        </div>
      </FormSection>

      <FormSection title="Dane Klienta">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700">Telefon klienta *</label>
                <input
                    type="tel" name="clientPhone" id="clientPhone"
                    value={formData.clientPhone || ''} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required
                />
            </div>
            <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">Email klienta</label>
                <input
                    type="email" name="clientEmail" id="clientEmail"
                    value={formData.clientEmail || ''} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="appraisalForm" className="block text-sm font-medium text-gray-700">Forma operatu *</label>
                <select
                    id="appraisalForm" name="appraisalForm"
                    value={formData.appraisalForm} onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {appraisalForms.map(form => <option key={form} value={form}>{form}</option>)}
                </select>
            </div>
        </div>
      </FormSection>

      <FormSection title="Warunki Zlecenia">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proposedPrice" className="block text-sm font-medium text-gray-700">Cena dla rzeczoznawcy (PLN) *</label>
              <input
                type="number" id="proposedPrice" name="proposedPrice"
                value={formData.proposedPrice || ''} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="np. 800" required
              />
            </div>
            <div>
              <label htmlFor="proposedCompletionDate" className="block text-sm font-medium text-gray-700">Proponowany termin wykonania</label>
              <input
                type="date" id="proposedCompletionDate" name="proposedCompletionDate"
                value={formData.proposedCompletionDate || ''} onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
       </div>
       <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">Dodatkowe uwagi</label>
        <textarea
          id="additionalNotes" name="additionalNotes"
          rows={3} value={formData.additionalNotes || ''} onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Wpisz tutaj dodatkowe informacje dotyczące zlecenia..."
        />
      </div>
     </FormSection>

      <div className="flex justify-end pt-6 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
          {isLoading ? (isEditing ? 'Zapisywanie...' : 'Dodawanie...') : (isEditing ? 'Zapisz zmiany' : 'Dodaj zlecenie')}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;