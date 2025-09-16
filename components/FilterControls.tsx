import React, { useState } from 'react';
import { Filters, SortOption, ZlecenieStatus, User, UserRole } from '../types';
import { VOIVODESHIP_DATA } from '../constants';

interface FilterControlsProps {
  filters: Filters;
  onFilterChange: (name: keyof Filters, value: any) => void;
  propertyTypes: string[];
  valuationPurposes: string[];
  statuses: ZlecenieStatus[];
  currentUser: User | null;
  users: User[];
}

const ToggleButtonGroup: React.FC<{
    label: string;
    options: string[];
    selectedValue: string[];
    onChange: (value: string) => void;
}> = ({ label, options, selectedValue, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onChange('all')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    selectedValue.length === 0 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
                Wszystkie
            </button>
            {options.map(option => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        selectedValue.includes(option) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const SortButton: React.FC<{
    label: string;
    valueAsc: SortOption;
    valueDesc: SortOption;
    currentValue: SortOption;
    onChange: (value: SortOption) => void;
}> = ({ label, valueAsc, valueDesc, currentValue, onChange }) => (
    <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex">
            <button onClick={() => onChange(valueAsc)} className={`p-1 rounded-l-md ${currentValue === valueAsc ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
            <button onClick={() => onChange(valueDesc)} className={`p-1 rounded-r-md ${currentValue === valueDesc ? 'bg-indigo-600 text-white' : 'border-l-0 bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
        </div>
    </div>
);

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, propertyTypes, valuationPurposes, statuses, currentUser, users }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMultiSelectChange = (name: keyof Filters, value: string) => {
    if (value === 'all') {
      onFilterChange(name, []);
      return;
    }
    const currentValues = (filters[name] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(name, newValues);
  };
  
  if (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.PRACOWNIK) {
    const appraisers = users.filter(u => u.role === UserRole.RZECZOZNAWCA);
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 animate-fade-in">
            <div className={`flex justify-between items-center gap-4 ${isExpanded ? 'mb-4' : ''}`}>
                <div className="flex-grow min-w-0">
                    <input
                      type="text"
                      value={filters.quickSearch}
                      onChange={(e) => onFilterChange('quickSearch', e.target.value)}
                      placeholder="Szukaj po ID, adresie..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 flex-shrink-0"
                    aria-expanded={isExpanded}
                >
                    <span>{isExpanded ? 'Zwiń' : 'Filtry'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            {isExpanded && (
                <div className="pt-4 border-t space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Row 1 */}
                        <div>
                            <label htmlFor="assignedAppraiserId" className="block text-sm font-medium text-gray-700">Rzeczoznawca</label>
                            <select
                                id="assignedAppraiserId"
                                name="assignedAppraiserId"
                                value={filters.assignedAppraiserId}
                                onChange={(e) => onFilterChange('assignedAppraiserId', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Wszyscy</option>
                                {appraisers.map(user => (
                                    <option key={user.id} value={user.id}>{user.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="voivodeship" className="block text-sm font-medium text-gray-700">Województwo</label>
                            <select
                                id="voivodeship"
                                name="voivodeship"
                                value={filters.voivodeship}
                                onChange={(e) => onFilterChange('voivodeship', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Wszystkie</option>
                                {Object.keys(VOIVODESHIP_DATA).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                            </select>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Rodzaj nieruchomości</label>
                            <select
                                id="propertyType"
                                name="propertyType"
                                value={filters.propertyType[0] || 'all'}
                                onChange={(e) => onFilterChange('propertyType', e.target.value === 'all' ? [] : [e.target.value])}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Wszystkie</option>
                                {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="valuationPurpose" className="block text-sm font-medium text-gray-700">Cel wyceny</label>
                            <select
                                id="valuationPurpose"
                                name="valuationPurpose"
                                value={filters.valuationPurpose[0] || 'all'}
                                onChange={(e) => onFilterChange('valuationPurpose', e.target.value === 'all' ? [] : [e.target.value])}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Wszystkie</option>
                                {valuationPurposes.map(purpose => <option key={purpose} value={purpose}>{purpose}</option>)}
                            </select>
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status zlecenia</label>
                            <select
                                id="status"
                                name="status"
                                value={filters.status[0] || 'all'}
                                onChange={(e) => onFilterChange('status', e.target.value === 'all' ? [] : [e.target.value as ZlecenieStatus])}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="all">Wszystkie</option>
                                {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sortuj według</label>
                            <select
                                id="sortBy"
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={(e) => onFilterChange('sortBy', e.target.value as SortOption)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="default">Domyślne (Status, Data)</option>
                                <option value="date_desc">Data dodania: najnowsze</option>
                                <option value="date_asc">Data dodania: najstarsze</option>
                                <option value="price_desc">Cena: od najwyższej</option>
                                <option value="price_asc">Cena: od najniższej</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // RZECZOZNAWCA VIEW
  const FilterHeader = () => (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-800">Filtrowanie i sortowanie</h3>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
        aria-expanded={isExpanded}
      >
        <span>{isExpanded ? 'Zwiń' : 'Rozwiń'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 animate-fade-in">
        <FilterHeader />
        {isExpanded && (
            <div className="pt-4 border-t mt-4 space-y-4">
                <ToggleButtonGroup
                    label="Rodzaj nieruchomości"
                    options={propertyTypes}
                    selectedValue={filters.propertyType}
                    onChange={(value) => handleMultiSelectChange('propertyType', value)}
                />
                <ToggleButtonGroup
                    label="Cel wyceny"
                    options={valuationPurposes}
                    selectedValue={filters.valuationPurpose}
                    onChange={(value) => handleMultiSelectChange('valuationPurpose', value)}
                />
                <ToggleButtonGroup
                    label="Status"
                    options={statuses.filter(s => s !== ZlecenieStatus.ZAKONCZONE)} // Appraisers usually don't filter by completed
                    selectedValue={filters.status}
                    onChange={(value) => handleMultiSelectChange('status', value)}
                />
                <div className="border-t pt-4 flex items-center justify-end space-x-4">
                    <SortButton 
                        label="Data"
                        valueAsc="date_asc"
                        valueDesc="date_desc"
                        currentValue={filters.sortBy}
                        onChange={(value) => onFilterChange('sortBy', value)}
                    />
                     <SortButton 
                        label="Cena"
                        valueAsc="price_asc"
                        valueDesc="price_desc"
                        currentValue={filters.sortBy}
                        onChange={(value) => onFilterChange('sortBy', value)}
                    />
                </div>
            </div>
        )}
    </div>
  );
};

export default FilterControls;