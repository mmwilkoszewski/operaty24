import React, { useState } from 'react';
import { Zlecenie, AppraiserResponse } from '../types';

interface AppraiserResponseFormProps {
  zlecenie: Zlecenie;
  onSubmit: (response: Omit<AppraiserResponse, 'id' | 'author' | 'authorId'>) => void;
  onClose: () => void;
}

const AppraiserResponseForm: React.FC<AppraiserResponseFormProps> = ({ zlecenie, onSubmit, onClose }) => {
  const [responseType, setResponseType] = useState<'accept' | 'counter'>('accept');
  const [counterPrice, setCounterPrice] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [questions, setQuestions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionDate) {
      alert('Proszę podać termin wykonania.');
      return;
    }
    if (responseType === 'counter' && !counterPrice) {
      alert('Proszę podać proponowaną cenę.');
      return;
    }

    onSubmit({
      status: responseType === 'accept' ? 'accepted' : 'counter-offer',
      proposedPrice: responseType === 'counter' ? Number(counterPrice) : undefined,
      completionDate,
      questions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-gray-700"><span className="font-semibold">Lokalizacja:</span> {zlecenie.locationString}</p>
        <p className="text-gray-700"><span className="font-semibold">Sugerowana cena:</span> {zlecenie.proposedPrice} PLN</p>
      </div>
      
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-900">Twoja odpowiedź</legend>
        <div className="flex items-center">
          <input id="accept" name="response-type" type="radio" value="accept" checked={responseType === 'accept'} onChange={() => setResponseType('accept')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
          <label htmlFor="accept" className="ml-3 block text-sm font-medium text-gray-700">Akceptuję cenę ({zlecenie.proposedPrice} PLN)</label>
        </div>
        <div className="flex items-center">
          <input id="counter" name="response-type" type="radio" value="counter" checked={responseType === 'counter'} onChange={() => setResponseType('counter')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
          <label htmlFor="counter" className="ml-3 block text-sm font-medium text-gray-700">Proponuję swoją cenę</label>
        </div>
      </fieldset>

      {responseType === 'counter' && (
        <div>
          <label htmlFor="counterPrice" className="block text-sm font-medium text-gray-700">Twoja propozycja ceny (PLN) *</label>
          <input
            type="number"
            id="counterPrice"
            value={counterPrice}
            onChange={(e) => setCounterPrice(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">Termin wykonania *</label>
        <input
          type="date"
          id="completionDate"
          value={completionDate}
          onChange={(e) => setCompletionDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="questions" className="block text-sm font-medium text-gray-700">Dodatkowe pytania / uwagi</label>
        <textarea
          id="questions"
          rows={3}
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Wpisz tutaj swoje pytania..."
        />
      </div>
      
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Anuluj</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Wyślij odpowiedź</button>
      </div>
    </form>
  );
};

export default AppraiserResponseForm;