export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userEmail: string;
  action: string; // e.g., "Utworzono leada", "Skonwertowano leada", "Dodano rzeczoznawcę"
  details: string; // e.g., "Leada #L123 dla 'ul. Słoneczna 10, Warszawa'"
}
import { LatLngExpression } from 'leaflet';

export enum PropertyType {
  MIESZKANIE = 'Mieszkanie',
  DOM = 'Dom',
  DZIALKA = 'Działka',
  LOKAL_USLUGOWY = 'Lokal usługowy',
  INNY = 'Inny',
}

export enum ValuationPurpose {
  KREDYT = 'Kredyt hipoteczny',
  SPRZEDAZ = 'Sprzedaż',
  PODZIAL_MAJATKU = 'Podział majątku',
  SPADEK = 'Postępowanie spadkowe',
  INNY = 'Inny',
}

export enum UserRole {
  ADMIN = 'Admin',
  PRACOWNIK = 'Pracownik',
  RZECZOZNAWCA = 'Rzeczoznawca',
}

export enum ZlecenieStatus {
    LEAD = 'Lead',
    DO_AKCEPTACJI = 'Do akceptacji',
    NOWE = 'Nowe',
    ZAREZERWOWANE = 'Zarezerwowane',
    W_TRAKCIE = 'W trakcie',
    DO_ROZLICZENIA = 'Do rozliczenia',
    ZAKONCZONE = 'Zakończone',
    ANULOWANE = 'Anulowane',
}


export enum WorkInProgressSubStatus {
    OCZEKUJE_NA_OGLEDZINY = 'Oczekuje na oględziny',
    OGLEDZINY_WYKONANE = 'Oględziny wykonane',
    OPERAT_W_PRZYGOTOWANIU = 'Operat w przygotowaniu',
}

export enum LeadSource {
  TELEFON = 'Telefon',
  EMAIL = 'Email',
  FORMULARZ = 'Formularz',
}

export enum AppraisalForm {
  ELEKTRONICZNY = 'Elektroniczny',
  PAPIEROWY = 'Papierowy',
  OBYDWA = 'Obydwa',
}


export type SortOption = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc' | 'default';


export interface User {
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

export interface Settings {
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

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  coordinates: Coordinates;
  voivodeship: string;
}

export interface AppraiserResponse {
  id: string;
  authorId: string;
  author: string;
  proposedPrice?: number;
  completionDate: string;
  questions: string;
  status: 'accepted' | 'counter-offer';
}

export interface CommunicationEntry {
  id: string;
  date: string; // ISO string
  author: string; // 'System', 'Admin', or user email
  content: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string;
  url: string; // This will be a data URL or blob URL in our case
  uploadedAt: string;
}

export interface SettlementChecklist {
    operatPobrany: boolean;
    fakturaWystawiona: boolean;
    fakturaOplacona: boolean;
    operatPrzekazany: boolean;
    rozliczonoZRzeczoznawca: boolean;
}

export interface ClientDetails {
    fullName: string;
    phone: string;
    email?: string;
    appraisalForm: AppraisalForm;
}

export interface Zlecenie {
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

export interface Filters {
  propertyType: string[];
  valuationPurpose: string[];
  location: string;
  voivodeship: string | 'all';
  status: ZlecenieStatus[];
  sortBy: SortOption;
  quickSearch: string;
  assignedAppraiserId: string | 'all';
}

export interface VoivodeshipData {
  center: LatLngExpression;
  zoom: number;
  geoJson: any; // For GeoJSON boundary data
}

export interface Notification {
  id: string;
  timestamp: string; // ISO string
  message: string;
  isRead: boolean;
  link?: {
    view: 'zlecenia';
    itemId: string; // zlecenieId
  };
}