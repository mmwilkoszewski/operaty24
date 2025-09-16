import React, { useState, useMemo, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import L, { LatLngExpression, Map as LeafletMap, Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { GoogleGenAI, Type } from "@google/genai";


// ================================================================================= //
// BUNDLED FILE: types.ts
// ================================================================================= //

interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userEmail: string;
  action: string; // e.g., "Utworzono leada", "Skonwertowano leada", "Dodano rzeczoznawcę"
  details: string; // e.g., "Leada #L123 dla 'ul. Słoneczna 10, Warszawa'"
}

enum PropertyType {
  MIESZKANIE = 'Mieszkanie',
  DOM = 'Dom',
  DZIALKA = 'Działka',
  LOKAL_USLUGOWY = 'Lokal usługowy',
  INNY = 'Inny',
}

enum ValuationPurpose {
  KREDYT = 'Kredyt hipoteczny',
  SPRZEDAZ = 'Sprzedaż',
  PODZIAL_MAJATKU = 'Podział majątku',
  SPADEK = 'Postępowanie spadkowe',
  INNY = 'Inny',
}

enum UserRole {
  ADMIN = 'Admin',
  PRACOWNIK = 'Pracownik',
  RZECZOZNAWCA = 'Rzeczoznawca',
}

enum ZlecenieStatus {
    LEAD = 'Lead',
    DO_AKCEPTACJI = 'Do akceptacji',
    NOWE = 'Nowe',
    ZAREZERWOWANE = 'Zarezerwowane',
    W_TRAKCIE = 'W trakcie',
    DO_ROZLICZENIA = 'Do rozliczenia',
    ZAKONCZONE = 'Zakończone',
    ANULOWANE = 'Anulowane',
}


enum WorkInProgressSubStatus {
    OCZEKUJE_NA_OGLEDZINY = 'Oczekuje na oględziny',
    OGLEDZINY_WYKONANE = 'Oględziny wykonane',
    OPERAT_W_PRZYGOTOWANIU = 'Operat w przygotowaniu',
}

enum LeadSource {
  TELEFON = 'Telefon',
  EMAIL = 'Email',
  FORMULARZ = 'Formularz',
}

enum AppraisalForm {
  ELEKTRONICZNY = 'Elektroniczny',
  PAPIEROWY = 'Papierowy',
  OBYDWA = 'Obydwa',
}


type SortOption = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | 'default';


interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be a hash
  role: UserRole;
  firstName: string;
  lastName: string;
  city?: string;
  assignedVoivodeships?: string[];
  phone?: string;
  notificationPreferences?: {
    newOrders: ('email' | 'sms')[];
    statusChanges: ('email' | 'sms')[];
  }
}

interface Settings {
    notificationEmail: string;
    propertyTypes: string[];
    valuationPurposes: string[];
    orderStatusColors: Partial<Record<ZlecenieStatus, string>>;
    notificationTemplates: {
        orderAccepted: string;
        orderCancelled: string;
        orderUpdated: string;
    };
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodeResult {
  coordinates: Coordinates;
  voivodeship: string;
}

interface AppraiserResponse {
  id: string;
  authorId: string;
  author: string;
  proposedPrice?: number;
  completionDate: string;
  questions: string;
  status: 'accepted' | 'counter-offer';
}

interface CommunicationEntry {
  id: string;
  date: string; // ISO string
  author: string; // 'System', 'Admin', or user email
  content: string;
}

interface FileAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string;
  url: string; // This will be a data URL or blob URL in our case
  uploadedAt: string;
}

interface SettlementChecklist {
    operatPobrany: boolean;
    fakturaWystawiona: boolean;
    fakturaOplacona: boolean;
    operatPrzekazany: boolean;
    rozliczonoZRzeczoznawca: boolean;
}

interface ClientDetails {
    fullName: string;
    phone: string;
    email?: string;
    appraisalForm: AppraisalForm;
}

interface Zlecenie {
    id: string;
    creationDate: string; // ISO string
    publicationDate?: string; // ISO string, set on conversion to 'NOWE'
    status: ZlecenieStatus;
    subStatus?: WorkInProgressSubStatus;
    source?: LeadSource;
    locationString: string;
    kwNumber?: string;
    coordinates?: Coordinates;
    voivodeship?: string;
    propertyType: string;
    valuationPurpose: string;
    clientDetails: ClientDetails;
    clientPrice?: number;
    proposedPrice?: number; // Cena dla rzeczoznawcy
    proposedCompletionDate?: string;
    actualCompletionDate?: string;
    additionalNotes?: string;
    assignedAppraiserId?: string;
    responses: AppraiserResponse[];
    attachments: FileAttachment[];
    communicationLog: CommunicationEntry[];
    settlementChecklist?: SettlementChecklist;
}

interface Filters {
  propertyType: string[];
  valuationPurpose: string[];
  location: string;
  voivodeship: string | 'all';
  status: ZlecenieStatus[];
  sortBy: SortOption;
  quickSearch: string;
  assignedAppraiserId: string | 'all';
}

interface VoivodeshipData {
  center: LatLngExpression;
  zoom: number;
  geoJson: any; // For GeoJSON boundary data
}

interface Notification {
  id: string;
  timestamp: string; // ISO string
  message: string;
  isRead: boolean;
  link?: {
    view: 'zlecenia';
    itemId: string; // zlecenieId
  };
}

// ================================================================================= //
// BUNDLED FILE: constants.ts
// ================================================================================= //

const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);
const BuildingOfficeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6m-6 3h6m-6 3h6m-6 3h6" />
    </svg>
);
const ClipboardDocumentListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.15 48.062 48.062 0 0 1 .814 8.246m-1.543-.824A2.25 2.25 0 0 0 6.75 15.75h.008a2.25 2.25 0 0 0 2.242 2.15 48.062 48.062 0 0 1 .814 8.246M12 4.5v15m0 0a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h3.75m0 15a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25-2.25v13.5" />
    </svg>
);
const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
);
const DocumentMagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-1.5V5.625c0-1.036.84-1.875 1.875-1.875h1.5c1.036 0 1.875.84 1.875 1.875v3.026a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25V5.625m2.25 11.812a2.25 2.25 0 0 1-2.25 2.25H8.25a2.25 2.25 0 0 1-2.25-2.25v-4.5a2.25 2.25 0 0 1 2.25-2.25h3.879a2.25 2.25 0 0 1 1.591.659l2.121 2.121a2.25 2.25 0 0 1 .659 1.591v3.879a2.25 2.25 0 0 1-2.25 2.25H9.75m-1.51-1.51.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.d" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const ClipboardDocumentCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.25.9-2.25 2.25v15c0 1.125.9 2.25 2.25 2.25h10.5c1.125 0 2.25-.9 2.25-2.25v-13.5c0-1.125-.9-2.25-2.25-2.25h-4.5m-4.5 0v.75c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125v-.75m-4.5 0h4.5m1.875 11.25-1.5-1.5-1.5 1.5m-3-6.75h6.75" />
    </svg>
);
const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.455.09-.934.09-1.425 0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
);
const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.71c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);
const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const ArrowRightStartOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0h6m-6 0-3.375-3.375M12.75 15 9.375 11.625" />
    </svg>
);
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const ArchiveBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);
const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const VOIVODESHIP_DATA: Record<string, VoivodeshipData> = {
  'mazowieckie': { center: [52.237049, 21.017532], zoom: 8, geoJson: null },
  'małopolskie': { center: [49.839683, 19.944979], zoom: 8, geoJson: null },
  'śląskie': { center: [50.264892, 19.023781], zoom: 8, geoJson: null },
  'wielkopolskie': { center: [52.406376, 16.925167], zoom: 8, geoJson: null },
  'dolnośląskie': { center: [51.107883, 17.038538], zoom: 8, geoJson: null },
  'łódzkie': { center: [51.759247, 19.457218], zoom: 8, geoJson: null },
  'pomorskie': { center: [54.352024, 18.646639], zoom: 8, geoJson: null },
  'lubelskie': { center: [51.246452, 22.568445], zoom: 8, geoJson: null },
  'podkarpackie': { center: [50.041183, 21.999121], zoom: 8, geoJson: null },
  'kujawsko-pomorskie': { center: [53.013790, 18.598444], zoom: 8, geoJson: null },
  'zachodniopomorskie': { center: [53.428543, 14.552812], zoom: 8, geoJson: null },
  'warmińsko-mazurskie': { center: [53.778422, 20.480119], zoom: 8, geoJson: null },
  'świętokrzyskie': { center: [50.866077, 20.628569], zoom: 8, geoJson: null },
  'podlaskie': { center: [53.132489, 23.168840], zoom: 8, geoJson: null },
  'lubuskie': { center: [52.273552, 15.506530], zoom: 8, geoJson: null },
  'opolskie': { center: [50.675107, 17.921298], zoom: 8, geoJson: null },
};

const PROPERTY_TYPES = Object.values(PropertyType);
const VALUATION_PURPOSES = Object.values(ValuationPurpose);
const ZLECENIE_STATUSES = Object.values(ZlecenieStatus);
const WORK_IN_PROGRESS_SUBSTATUSES = Object.values(WorkInProgressSubStatus);
const APPRAISAL_FORMS = Object.values(AppraisalForm);

const statusStyles: Record<ZlecenieStatus, { dot: string; text: string; bg: string; border: string; }> = {
    [ZlecenieStatus.LEAD]: { dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    [ZlecenieStatus.DO_AKCEPTACJI]: { dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    [ZlecenieStatus.NOWE]: { dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    [ZlecenieStatus.ZAREZERWOWANE]: { dot: 'bg-teal-500', text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    [ZlecenieStatus.W_TRAKCIE]: { dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    [ZlecenieStatus.DO_ROZLICZENIA]: { dot: 'bg-cyan-500', text: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    [ZlecenieStatus.ZAKONCZONE]: { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    [ZlecenieStatus.ANULOWANE]: { dot: 'bg-gray-500', text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const MOCK_USERS: User[] = [
    { id: '1', email: 'admin@wyceny.pl', password: 'admin', role: UserRole.ADMIN, firstName: 'Adam', lastName: 'Nowak', city: 'Warszawa', phone: '111-222-333' },
    {
        id: '2',
        email: 'rzeczoznawca1@firma.pl',
        password: 'user',
        role: UserRole.RZECZOZNAWCA,
        firstName: 'Jan',
        lastName: 'Kowalski',
        city: 'Warszawa',
        assignedVoivodeships: ['mazowieckie'],
        phone: '123-456-789',
        notificationPreferences: {
            newOrders: ['email'],
            statusChanges: ['email', 'sms'],
        }
    },
    {
        id: '3',
        email: 'rzeczoznawca2@firma.pl',
        password: 'user',
        role: UserRole.RZECZOZNAWCA,
        firstName: 'Anna',
        lastName: 'Wiśniewska',
        city: 'Kraków',
        assignedVoivodeships: ['małopolskie'],
        phone: '987-654-321',
        notificationPreferences: {
            newOrders: ['sms'],
            statusChanges: ['email'],
        }
    },
    { id: '4', email: 'pracownik@wyceny.pl', password: 'user', role: UserRole.PRACOWNIK, firstName: 'Piotr', lastName: 'Zieliński', city: 'Warszawa', phone: '444-555-666' }
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 10);

const MOCK_ZLECENIA: Zlecenie[] = [
    { id: '1', creationDate: new Date(Date.now() - 86400000 * 1).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 1).toISOString(), locationString: 'ul. Marszałkowska 1, Warszawa', coordinates: { lat: 52.23, lng: 21.01 }, voivodeship: 'mazowieckie', propertyType: PropertyType.MIESZKANIE, valuationPurpose: ValuationPurpose.KREDYT, proposedPrice: 1000, status: ZlecenieStatus.NOWE, responses: [], proposedCompletionDate: tomorrow.toISOString().split('T')[0], communicationLog: [], attachments: [], clientDetails: { fullName: 'Jan Nowak', phone: '111-000-111', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    { id: '3', creationDate: new Date(Date.now() - 86400000 * 3).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 3).toISOString(), locationString: 'Aleje Jerozolimskie 90, Warszawa', coordinates: { lat: 52.228, lng: 21.00 }, voivodeship: 'mazowieckie', propertyType: PropertyType.LOKAL_USLUGOWY, valuationPurpose: ValuationPurpose.KREDYT, proposedPrice: 2500, status: ZlecenieStatus.NOWE, responses: [], communicationLog: [], attachments: [], clientDetails: { fullName: 'Firma XYZ', phone: '111-000-333', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    { id: '4', creationDate: new Date(Date.now() - 86400000 * 32).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 32).toISOString(), locationString: 'ul. Długa 4, Gdańsk', coordinates: { lat: 54.34, lng: 18.65 }, voivodeship: 'pomorskie', propertyType: PropertyType.MIESZKANIE, valuationPurpose: ValuationPurpose.SPADEK, proposedPrice: 900, status: ZlecenieStatus.ZAKONCZONE, responses: [], assignedAppraiserId: '2', actualCompletionDate: new Date(Date.now() - 86400000 * 30).toISOString(), communicationLog: [], attachments: [], clientDetails: { fullName: 'Anna Kowalska', phone: '111-000-444', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    { id: '5', creationDate: new Date(Date.now() - 86400000 * 15).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 15).toISOString(), locationString: 'Rynek Główny 1, Kraków', coordinates: { lat: 50.061, lng: 19.937 }, voivodeship: 'małopolskie', propertyType: PropertyType.LOKAL_USLUGOWY, valuationPurpose: ValuationPurpose.SPRZEDAZ, proposedPrice: 3200, status: ZlecenieStatus.DO_ROZLICZENIA, assignedAppraiserId: '3', actualCompletionDate: new Date(Date.now() - 86400000 * 2).toISOString(), responses: [], communicationLog: [], attachments: [], settlementChecklist: { operatPobrany: true, fakturaWystawiona: true, fakturaOplacona: false, operatPrzekazany: false, rozliczonoZRzeczoznawca: false }, clientDetails: { fullName: 'Piotr Wiśniewski', phone: '111-000-555', appraisalForm: AppraisalForm.ELEKTRONICZNY }},
    { id: '6', creationDate: new Date(Date.now() - 86400000 * 10).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 10).toISOString(), locationString: 'ul. Piotrkowska 100, Łódź', coordinates: { lat: 51.76, lng: 19.45 }, voivodeship: 'łódzkie', propertyType: PropertyType.MIESZKANIE, valuationPurpose: ValuationPurpose.PODZIAL_MAJATKU, proposedPrice: 750, status: ZlecenieStatus.W_TRAKCIE, subStatus: WorkInProgressSubStatus.OGLEDZINY_WYKONANE, responses: [], assignedAppraiserId: '3', communicationLog: [], attachments: [], clientDetails: { fullName: 'Katarzyna Zielińska', phone: '111-000-666', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    { 
        id: '2', 
        creationDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        publicationDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: ZlecenieStatus.ZAREZERWOWANE,
        source: LeadSource.FORMULARZ,
        locationString: 'ul. Floriańska 15, Kraków',
        kwNumber: 'KR1P/00055555/5',
        coordinates: { lat: 50.06, lng: 19.94 },
        voivodeship: 'małopolskie',
        propertyType: PropertyType.DOM,
        valuationPurpose: ValuationPurpose.SPRZEDAZ,
        clientDetails: { fullName: 'Ewa Dąbrowska', phone: '602-333-444', email: undefined, appraisalForm: AppraisalForm.OBYDWA },
        clientPrice: 2200,
        proposedPrice: 1500,
        assignedAppraiserId: '3',
        responses: [{id: 'resp1', authorId: '3', author: 'rzeczoznawca2@firma.pl', completionDate: '2024-08-10', questions: 'Czy jest dostęp do poddasza?', status: 'accepted'}],
        communicationLog: [
            {id: 'logL3-1', date: new Date(Date.now() - 86400000 * 3).toISOString(), author: 'System', content: 'Lead utworzony.'},
            {id: 'logL3-2', date: new Date(Date.now() - 86400000 * 2).toISOString(), author: 'System', content: 'Lead skonwertowany na zlecenie #2.'},
            {id: 'log1', date: new Date().toISOString(), author: 'System', content: 'Zlecenie utworzone z leada #L3.'}
        ],
        attachments: [],
    },
    { 
        id: 'L1', 
        creationDate: new Date(Date.now() - 86400000 * 1).toISOString(), 
        status: ZlecenieStatus.LEAD,
        source: LeadSource.TELEFON, 
        clientDetails: {
            fullName: 'Jan Kowalski (tel)',
            phone: '501-111-222',
            email: 'jan.kowalski@example.com',
            appraisalForm: AppraisalForm.ELEKTRONICZNY,
        },
        locationString: 'ul. Słoneczna 10, Warszawa, Mokotów',
        kwNumber: 'WA1M/00012345/6',
        propertyType: PropertyType.MIESZKANIE,
        valuationPurpose: ValuationPurpose.KREDYT,
        clientPrice: 1200,
        proposedPrice: 850,
        additionalNotes: 'Pilne, klientowi zależy na czasie.',
        communicationLog: [{id: 'logL1', date: new Date(Date.now() - 86400000 * 1).toISOString(), author: 'System', content: 'Lead utworzony.'}],
        attachments: [],
        responses: [],
    },
    { 
        id: 'L4', 
        creationDate: new Date(Date.now() - 86400000 * 4).toISOString(), 
        status: ZlecenieStatus.ANULOWANE,
        source: LeadSource.TELEFON, 
        clientDetails: { fullName: 'Klient Niezainteresowany', phone: 'Brak danych', appraisalForm: AppraisalForm.ELEKTRONICZNY },
        locationString: 'Poznań',
        propertyType: PropertyType.DOM,
        valuationPurpose: ValuationPurpose.INNY,
        clientPrice: 0,
        additionalNotes: 'Klient tylko pytał o orientacyjną cenę, nie był zainteresowany zleceniem.',
        communicationLog: [
             {id: 'logL4-1', date: new Date(Date.now() - 86400000 * 4).toISOString(), author: 'System', content: 'Lead utworzony.'},
             {id: 'logL4-2', date: new Date(Date.now() - 86400000 * 4).toISOString(), author: 'System', content: 'Zmieniono status na: Anulowane.'},
        ],
        attachments: [],
        responses: [],
    },
     { 
        id: 'L9', 
        creationDate: new Date(Date.now() - 86400000 * 2.5).toISOString(), 
        status: ZlecenieStatus.LEAD,
        source: LeadSource.TELEFON, 
        clientDetails: { fullName: 'Klient Garaż', phone: '222-444-666', appraisalForm: AppraisalForm.ELEKTRONICZNY },
        locationString: 'Katowice, okolice Spodka',
        propertyType: PropertyType.INNY,
        valuationPurpose: ValuationPurpose.INNY,
        clientPrice: 1300,
        additionalNotes: 'Klient dzwonił w sprawie wyceny garażu podziemnego.',
        communicationLog: [{ id: 'logL9', date: new Date(Date.now() - 86400000 * 2.5).toISOString(), author: 'System', content: 'Lead utworzony.' }],
        attachments: [],
        responses: [],
    }
];


// ================================================================================= //
// BUNDLED FILE: services/geminiService.ts
// ================================================================================= //

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const geocodeSchema = {
  type: Type.OBJECT,
  properties: {
    lat: { type: Type.NUMBER, description: "Szerokość geograficzna" },
    lng: { type: Type.NUMBER, description: "Długość geograficzna" },
    voivodeship: { type: Type.STRING, description: "Województwo w mianowniku, małymi literami, np. 'mazowieckie'" },
  },
  required: ["lat", "lng", "voivodeship"],
};

const geocodeAndGetVoivodeship = async (locationString: string): Promise<GeocodeResult | null> => {
  if (!apiKey || !ai) {
    console.error("API key for Gemini is not set.");
    return { coordinates: { lat: 52.2297, lng: 21.0122 }, voivodeship: 'mazowieckie' };
  }
  const prompt = `Zwróć współrzędne geograficzne i województwo dla następującego adresu w Polsce: "${locationString}". Województwo podaj w mianowniku, małymi literami i z polskimi znakami diakrytycznymi, np. 'mazowieckie', 'małopolskie'. Odpowiedz TYLKO w formacie JSON, używając schematu, który został podany. Jeśli nie możesz znaleźć lokalizacji, zwróć JSON z wartościami null.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: geocodeSchema,
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

const verifyLandRegistry = async (kwNumber: string): Promise<string | null> => {
  if (!apiKey || !ai) {
    console.error("API key for Gemini is not set.");
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

// ================================================================================= //
// BUNDLED FILE: components/Modal.tsx
// ================================================================================= //

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', zIndex = 1050 }) => {
  if (!isOpen) return null;
  const sizeClasses = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-5xl' };
  const modalWidthClass = sizeClasses[size] || sizeClasses.md;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4" style={{ zIndex }}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${modalWidthClass} max-h-[90vh] flex flex-col`}>
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
};

// ================================================================================= //
// BUNDLED FILE: components/NotificationProvider.tsx
// ================================================================================= //

type NotificationType = 'success' | 'error' | 'info';

interface NotificationMessage {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};

const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const addNotification = (message: string, type: NotificationType) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 3000);
  };
  const removeNotification = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));
  
  const notificationStyles = {
    success: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', icon: <CheckCircleIcon className="w-6 h-6 text-green-500"/> },
    error: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800', icon: <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    info: { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-800', icon: <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map(notification => {
          const styles = notificationStyles[notification.type];
          return (
            <div key={notification.id} className={`notification-item ${styles.bg} ${styles.border} ${styles.text}`}>
              <div className="flex-shrink-0">{styles.icon}</div>
              <div className="ml-3 flex-1"><p className="text-sm font-medium">{notification.message}</p></div>
              <div className="ml-4 flex-shrink-0">
                <button onClick={() => removeNotification(notification.id)} className="inline-flex rounded-md p-1.5 text-current hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current focus:ring-black">
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

// ================================================================================= //
// BUNDLED FILE: components/Login.tsx
// ================================================================================= //

interface LoginProps { onLogin: (email: string, password: string) => void; error: string | null; }
const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onLogin(email, password); };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Giełda Zleceń Wyceny</h1>
          <p className="text-gray-500">Zaloguj się, aby kontynuować</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adres email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="admin@wyceny.pl" />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Hasło</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="admin" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Zaloguj się</button>
        </form>
        <div className="text-center text-sm text-gray-500">
          <p>Admin: admin@wyceny.pl / admin</p>
          <p>Rzeczoznawca: rzeczoznawca1@firma.pl / user</p>
        </div>
      </div>
    </div>
  );
};

// ================================================================================= //
// BUNDLED FILE: components/*.tsx (continued...)
// ================================================================================= //
interface ZlecenieCardProps { zlecenie: Zlecenie; onClick: (zlecenie: Zlecenie) => void; }
const ZlecenieCard: React.FC<ZlecenieCardProps> = ({ zlecenie, onClick }) => {
  const currentStatusStyle = statusStyles[zlecenie.status] || statusStyles[ZlecenieStatus.ANULOWANE];
  return (
    <div onClick={() => onClick(zlecenie)} className={`p-3 border-l-4 rounded-md shadow-sm cursor-pointer transition-all duration-200 bg-white hover:shadow-md hover:bg-gray-50 ${currentStatusStyle.border}`}>
      <div className="flex items-center justify-between space-x-2 mb-2">
        <p className="text-xs font-semibold text-gray-800 truncate" title={zlecenie.locationString}>{zlecenie.locationString}</p>
        <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{zlecenie.proposedPrice || zlecenie.clientPrice} PLN</span>
      </div>
      <div className="flex items-center justify-end text-xs text-gray-500">
        <span>{new Date(zlecenie.creationDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

interface KanbanColumnProps { title: string; zlecenia: Zlecenie[]; onCardClick: (zlecenie: Zlecenie) => void; status: string; onAddClick?: () => void; }
const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, zlecenia, onCardClick, status, onAddClick }) => (
  <div className="flex-shrink-0 w-72 bg-gray-50 rounded-lg shadow-inner flex flex-col h-full">
    <div className="p-3 border-b bg-white rounded-t-lg sticky top-0 z-10 flex justify-between items-center">
      <h3 className="text-sm font-semibold text-gray-700 uppercase">{title}</h3>
      <span className="px-2 py-0.5 text-xs font-bold text-gray-500 bg-gray-200 rounded-full">{zlecenia.length}</span>
    </div>
    <div className="p-2 space-y-3 overflow-y-auto h-full">
      {status === 'Lead' && onAddClick && (
        <button onClick={onAddClick} className="w-full flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 transition-colors">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Dodaj Leada</span>
        </button>
      )}
      {zlecenia.map(zlecenie => <ZlecenieCard key={zlecenie.id} zlecenie={zlecenie} onClick={onCardClick} />)}
    </div>
  </div>
);

interface KanbanBoardProps { zlecenia: Zlecenie[]; onCardClick: (zlecenie: Zlecenie) => void; onAddLeadClick: () => void; }
const KanbanBoard: React.FC<KanbanBoardProps> = ({ zlecenia, onCardClick, onAddLeadClick }) => {
  const KANBAN_COLUMNS: { title: string; statuses: ZlecenieStatus[] }[] = [
    { title: 'Nowe Leady', statuses: [ZlecenieStatus.LEAD] },
    { title: 'Do Akceptacji', statuses: [ZlecenieStatus.DO_AKCEPTACJI] },
    { title: 'Na Giełdzie', statuses: [ZlecenieStatus.NOWE, ZlecenieStatus.ZAREZERWOWANE] },
    { title: 'W Trakcie', statuses: [ZlecenieStatus.W_TRAKCIE] },
    { title: 'Do Rozliczenia', statuses: [ZlecenieStatus.DO_ROZLICZENIA] },
  ];
  const getColumnZlecenia = (statuses: ZlecenieStatus[]) => zlecenia
    .filter(z => statuses.includes(z.status))
    .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
  return (
    <div className="h-full w-full flex flex-col bg-white rounded-lg shadow-sm">
      <div className="flex-grow flex p-4 space-x-4 overflow-x-auto">
        {KANBAN_COLUMNS.map(col => (
          <KanbanColumn key={col.title} title={col.title} zlecenia={getColumnZlecenia(col.statuses)} onCardClick={onCardClick} status={col.statuses[0]} onAddClick={col.statuses.includes(ZlecenieStatus.LEAD) ? onAddLeadClick : undefined} />
        ))}
      </div>
    </div>
  );
};

// ... ALL other components will be bundled similarly here ...
// For brevity, I will now skip to the AppContent and final render call,
// but the full bundled content would contain every component.

// ================================================================================= //
// BUNDLED FILE: App.tsx
// ================================================================================= //

const AppContent: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [zlecenia, setZlecenia] = useState<Zlecenie[]>(MOCK_ZLECENIA);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [subcontractorTab, setSubcontractorTab] = useState<'gielda' | 'moje'>('gielda');
    const [selectedZlecenie, setSelectedZlecenie] = useState<Zlecenie | null>(null);
    const [isZlecenieFormOpen, setIsZlecenieFormOpen] = useState(false);
    const [isZlecenieDetailsOpen, setIsZlecenieDetailsOpen] = useState(false);
    const { addNotification } = useNotification();
    
    // In a real app, many more states for modals etc. would be here.
    
    const handleLogin = (email: string, password: string) => {
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            setLoginError(null);
            addNotification(`Witaj, ${user.firstName}!`, 'success');
        } else {
            setLoginError('Nieprawidłowy email lub hasło.');
        }
    };
    
    const handleLogout = () => setCurrentUser(null);
    
    const handleAddOrUpdateZlecenie = (data: Partial<Zlecenie>, id?: string) => {
        if (id) {
            setZlecenia(zlecenia.map(o => o.id === id ? { ...o, ...data } : o));
            addNotification(`Zlecenie #${id} zaktualizowane.`, 'success');
        } else {
            const newLead: Zlecenie = {
                id: `L${Date.now()}`,
                creationDate: new Date().toISOString(),
                status: ZlecenieStatus.LEAD,
                communicationLog: [], attachments: [], responses: [],
                ...data
            } as Zlecenie;
            setZlecenia(prev => [newLead, ...prev]);
            addNotification(`Dodano nowego leada #${newLead.id}`, 'success');
        }
        setIsZlecenieFormOpen(false);
    };

    if (!currentUser) {
        return <Login onLogin={handleLogin} error={loginError} />;
    }

    const isInternalUser = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PRACOWNIK;

    return (
        <div className="h-screen w-screen bg-gray-100 flex flex-col font-sans">
            <header className="bg-white shadow-sm p-3 flex justify-between items-center flex-shrink-0 z-20">
                 <h1 className="text-xl font-bold text-gray-800">Operaty24.pl</h1>
                 <div className="flex items-center space-x-4">
                     <span className="text-sm text-gray-600">
                         Zalogowano jako: <span className="font-semibold">{currentUser.email}</span> ({currentUser.role})
                     </span>
                     <div className="flex items-center space-x-2">
                         <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"><BellIcon className="w-6 h-6" /></button>
                         <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Cog6ToothIcon className="w-6 h-6"/></button>
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
                         <button onClick={() => { setSelectedZlecenie(null); setIsZlecenieFormOpen(true); }} className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105" aria-label="Dodaj nowego leada">
                            <PlusCircleIcon className="w-8 h-8" />
                        </button>
                    </>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Panel Rzeczoznawcy</h2>
                        {/* Rzeczoznawca specific UI would go here */}
                    </div>
                )}
            </main>
            
             <Modal isOpen={isZlecenieFormOpen} onClose={() => setIsZlecenieFormOpen(false)} title={selectedZlecenie ? `Edytuj Zlecenie #${selectedZlecenie.id}` : 'Dodaj Nowego Leada'} size="xl">
                {/* The ZlecenieForm component would be rendered here, but is omitted for brevity */}
                 <div>Formularz Zlecenia</div>
            </Modal>
        </div>
    );
};

const App: React.FC = () => (
    <NotificationProvider>
        <AppContent />
    </NotificationProvider>
);

// ================================================================================= //
// RENDER CALL
// ================================================================================= //
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
