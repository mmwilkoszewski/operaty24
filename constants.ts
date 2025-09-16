import { VoivodeshipData, PropertyType, ValuationPurpose, ZlecenieStatus, User, UserRole, Zlecenie, LeadSource, AppraisalForm, WorkInProgressSubStatus } from './types';
import React from 'react';

// --- SVG ICONS ---
// Using Heroicons (https://heroicons.com/)

// FIX: Replaced JSX syntax with React.createElement to be compatible with .ts files.
export const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" }),
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" })
    )
);
// FIX: Replaced JSX syntax with React.createElement to be compatible with .ts files.
export const BuildingOfficeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6m-6 3h6m-6 3h6m-6 3h6" })
    )
);
// FIX: Replaced JSX syntax with React.createElement to be compatible with .ts files.
export const ClipboardDocumentListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.15 48.062 48.062 0 0 1 .814 8.246m-1.543-.824A2.25 2.25 0 0 0 6.75 15.75h.008a2.25 2.25 0 0 0 2.242 2.15 48.062 48.062 0 0 1 .814 8.246M12 4.5v15m0 0a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h3.75m0 15a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25-2.25v13.5" })
    )
);
// FIX: Replaced JSX syntax with React.createElement to be compatible with .ts files.
export const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" })
    )
);
// FIX: Replaced JSX syntax with React.createElement to be compatible with .ts files.
export const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h22.5" })
    )
);
// FIX: Replaced JSX syntax with React.createElement to be compatible with .ts files.
export const DocumentMagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-1.5V5.625c0-1.036.84-1.875 1.875-1.875h1.5c1.036 0 1.875.84 1.875 1.875v3.026a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25V5.625m2.25 11.812a2.25 2.25 0 0 1-2.25 2.25H8.25a2.25 2.25 0 0 1-2.25-2.25v-4.5a2.25 2.25 0 0 1 2.25-2.25h3.879a2.25 2.25 0 0 1 1.591.659l2.121 2.121a2.25 2.25 0 0 1 .659 1.591v3.879a2.25 2.25 0 0 1-2.25 2.25H9.75m-1.51-1.51.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.01-.01.d" })
    )
);

export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" })
    )
);

export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
    )
);

export const ClipboardDocumentCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.125 2.25h-4.5c-1.125 0-2.25.9-2.25 2.25v15c0 1.125.9 2.25 2.25 2.25h10.5c1.125 0 2.25-.9 2.25-2.25v-13.5c0-1.125-.9-2.25-2.25-2.25h-4.5m-4.5 0v.75c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125v-.75m-4.5 0h4.5m1.875 11.25-1.5-1.5-1.5 1.5m-3-6.75h6.75" })
    )
);

export const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.455.09-.934.09-1.425 0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" })
    )
);

export const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" })
    )
);

export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.71c-1.123 0-2.033.954-2.033 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" })
    )
);

export const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
    )
);

export const ArrowRightStartOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0h6m-6 0-3.375-3.375M12.75 15 9.375 11.625" })
    )
);

export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" })
    )
);

export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
    )
);

export const ArchiveBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4" }),
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" })
    )
);

export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" })
    )
);

export const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
    )
);


export const VOIVODESHIP_DATA: Record<string, VoivodeshipData> = {
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

export const PROPERTY_TYPES = Object.values(PropertyType);
export const VALUATION_PURPOSES = Object.values(ValuationPurpose);
export const ZLECENIE_STATUSES = Object.values(ZlecenieStatus);
export const WORK_IN_PROGRESS_SUBSTATUSES = Object.values(WorkInProgressSubStatus);
export const APPRAISAL_FORMS = Object.values(AppraisalForm);

export const statusStyles: Record<ZlecenieStatus, { dot: string; text: string; bg: string; border: string; }> = {
    [ZlecenieStatus.LEAD]: { dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    [ZlecenieStatus.DO_AKCEPTACJI]: { dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    [ZlecenieStatus.NOWE]: { dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    [ZlecenieStatus.ZAREZERWOWANE]: { dot: 'bg-teal-500', text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    [ZlecenieStatus.W_TRAKCIE]: { dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    [ZlecenieStatus.DO_ROZLICZENIA]: { dot: 'bg-cyan-500', text: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    [ZlecenieStatus.ZAKONCZONE]: { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    [ZlecenieStatus.ANULOWANE]: { dot: 'bg-gray-500', text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export const MOCK_USERS: User[] = [
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

export const MOCK_ZLECENIA: Zlecenie[] = [
    // --- Existing Orders ---
    { id: '1', creationDate: new Date(Date.now() - 86400000 * 1).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 1).toISOString(), locationString: 'ul. Marszałkowska 1, Warszawa', coordinates: { lat: 52.23, lng: 21.01 }, voivodeship: 'mazowieckie', propertyType: PropertyType.MIESZKANIE, valuationPurpose: ValuationPurpose.KREDYT, proposedPrice: 1000, status: ZlecenieStatus.NOWE, responses: [], proposedCompletionDate: tomorrow.toISOString().split('T')[0], communicationLog: [], attachments: [], clientDetails: { fullName: 'Jan Nowak', phone: '111-000-111', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    { id: '3', creationDate: new Date(Date.now() - 86400000 * 3).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 3).toISOString(), locationString: 'Aleje Jerozolimskie 90, Warszawa', coordinates: { lat: 52.228, lng: 21.00 }, voivodeship: 'mazowieckie', propertyType: PropertyType.LOKAL_USLUGOWY, valuationPurpose: ValuationPurpose.KREDYT, proposedPrice: 2500, status: ZlecenieStatus.NOWE, responses: [], communicationLog: [], attachments: [], clientDetails: { fullName: 'Firma XYZ', phone: '111-000-333', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    { id: '4', creationDate: new Date(Date.now() - 86400000 * 32).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 32).toISOString(), locationString: 'ul. Długa 4, Gdańsk', coordinates: { lat: 54.34, lng: 18.65 }, voivodeship: 'pomorskie', propertyType: PropertyType.MIESZKANIE, valuationPurpose: ValuationPurpose.SPADEK, proposedPrice: 900, status: ZlecenieStatus.ZAKONCZONE, responses: [], assignedAppraiserId: '2', actualCompletionDate: new Date(Date.now() - 86400000 * 30).toISOString(), communicationLog: [], attachments: [], clientDetails: { fullName: 'Anna Kowalska', phone: '111-000-444', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    { id: '5', creationDate: new Date(Date.now() - 86400000 * 15).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 15).toISOString(), locationString: 'Rynek Główny 1, Kraków', coordinates: { lat: 50.061, lng: 19.937 }, voivodeship: 'małopolskie', propertyType: PropertyType.LOKAL_USLUGOWY, valuationPurpose: ValuationPurpose.SPRZEDAZ, proposedPrice: 3200, status: ZlecenieStatus.DO_ROZLICZENIA, assignedAppraiserId: '3', actualCompletionDate: new Date(Date.now() - 86400000 * 2).toISOString(), responses: [], communicationLog: [], attachments: [], settlementChecklist: { operatPobrany: true, fakturaWystawiona: true, fakturaOplacona: false, operatPrzekazany: false, rozliczonoZRzeczoznawca: false }, clientDetails: { fullName: 'Piotr Wiśniewski', phone: '111-000-555', appraisalForm: AppraisalForm.ELEKTRONICZNY }},
    { id: '6', creationDate: new Date(Date.now() - 86400000 * 10).toISOString(), publicationDate: new Date(Date.now() - 86400000 * 10).toISOString(), locationString: 'ul. Piotrkowska 100, Łódź', coordinates: { lat: 51.76, lng: 19.45 }, voivodeship: 'łódzkie', propertyType: PropertyType.MIESZKANIE, valuationPurpose: ValuationPurpose.PODZIAL_MAJATKU, proposedPrice: 750, status: ZlecenieStatus.W_TRAKCIE, subStatus: WorkInProgressSubStatus.OGLEDZINY_WYKONANE, responses: [], assignedAppraiserId: '3', communicationLog: [], attachments: [], clientDetails: { fullName: 'Katarzyna Zielińska', phone: '111-000-666', appraisalForm: AppraisalForm.ELEKTRONICZNY } },
    // ... Add other orders as Zlecenie
    
    // --- Merged Lead/Order (ID 2 from Order, L3 from Lead) ---
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

    // --- Existing Leads ---
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