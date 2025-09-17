

import { GoogleGenAI, Type } from "@google/genai";
import { GeocodeResult } from '../types';

// FIX: Use process.env.NEXT_PUBLIC_API_KEY to align with Vercel's client-side environment variable convention.
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const schema = {
  type: Type.OBJECT,
  properties: {
    lat: { type: Type.NUMBER, description: "Szerokość geograficzna" },
    lng: { type: Type.NUMBER, description: "Długość geograficzna" },
    voivodeship: { type: Type.STRING, description: "Województwo w mianowniku, małymi literami, np. 'mazowieckie'" },
  },
  required: ["lat", "lng", "voivodeship"],
};

export const geocodeAndGetVoivodeship = async (locationString: string): Promise<GeocodeResult | null> => {
  if (!apiKey || !ai) {
    console.error("API key for Gemini is not set.");
    // Fallback for development without API key
    return { coordinates: { lat: 52.2297, lng: 21.0122 }, voivodeship: 'mazowieckie' };
  }

  const prompt = `Zwróć współrzędne geograficzne i województwo dla następującego adresu w Polsce: "${locationString}". Województwo podaj w mianowniku, małymi literami i z polskimi znakami diakrytycznymi, np. 'mazowieckie', 'małopolskie'. Odpowiedz TYLKO w formacie JSON, używając schematu, który został podany. Jeśli nie możesz znaleźć lokalizacji, zwróć JSON z wartościami null.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    if (result && typeof result.lat === 'number' && typeof result.lng === 'number' && typeof result.voivodeship === 'string') {
      return {
          coordinates: { lat: result.lat, lng: result.lng },
          voivodeship: result.voivodeship.toLowerCase(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
};

// FIX: Add missing verifyLandRegistry function.
export const verifyLandRegistry = async (kwNumber: string): Promise<string | null> => {
  if (!apiKey || !ai) {
    console.error("API key for Gemini is not set.");
    // Fallback for development without API key
    return `To jest przykładowa weryfikacja dla numeru KW: **${kwNumber}**.
    
### Dział I: Oznaczenie nieruchomości
- **Położenie:** ul. Przykładowa 1, 00-001 Warszawa, mazowieckie
- **Powierzchnia:** 0.0543 ha

### Dział II: Własność
- **Właściciel:** Jan Kowalski

### Dział III: Prawa, roszczenia i ograniczenia
- Brak wpisów.

### Dział IV: Hipoteka
- **Hipoteka umowna kaucyjna:** 250,000.00 PLN na rzecz Banku X.

*Uwaga: To są dane demonstracyjne. Dla rzeczywistej weryfikacji wymagany jest klucz API.*`;
  }

  const prompt = `Jako asystent do weryfikacji numerów Ksiąg Wieczystych (KW) w Polsce, użyj narzędzia Google Search, aby znaleźć i podsumować publicznie dostępne informacje dla numeru KW: "${kwNumber}". Twoja odpowiedź powinna być zwięzłym raportem w języku polskim, sformatowanym przy użyciu Markdown. Skup się na kluczowych informacjach z działów I, II, III i IV. Jeśli numer jest nieprawidłowy lub nie można znaleźć danych, poinformuj o tym.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return response.text;
  } catch (error) {
    console.error(`Error verifying land registry for ${kwNumber}:`, error);
    return "Wystąpił błąd podczas weryfikacji numeru księgi wieczystej. Prosimy spróbować ponownie później.";
  }
};
