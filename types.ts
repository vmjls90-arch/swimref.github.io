
export enum RSVPStatus {
  ATTENDING = 'Confirmado',
  NOT_ATTENDING = 'Indisponível',
  PENDING = 'Pendente'
}

export enum UserStatus {
  PENDING = 'Pendente',
  APPROVED = 'Aprovado'
}

export type UserRole = 'Administrador' | 'Árbitro';

export type CompetitionModality = "Natação Pura" | "Águas Abertas" | "Natação Adaptada";

export interface RSVP {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  status: RSVPStatus;
  comment: string;
  timestamp: string;
}

export interface PaymentLog {
  id: string;
  userName: string;
  status: boolean;
  timestamp: string;
}

export interface CompetitionDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // Base64 simulated URL
  timestamp: string;
}

export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  level: 'Clube' | 'Regional' | 'Nacional' | 'Internacional';
  modality: CompetitionModality;
  isPaid: boolean;
  paymentHistory: PaymentLog[];
  rsvps: RSVP[];
  documents?: CompetitionDocument[];
  craResponsible: string;
}

export interface CRAMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

export interface CRAConfig {
  technicalEmail: string;
  administrativeEmail: string;
}

export interface NotificationChannel {
  toast: boolean;
  email: boolean;
}

export interface NotificationPreferences {
  newCompetitions: NotificationChannel;
  rsvpChanges: NotificationChannel;
  paymentUpdates: NotificationChannel;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  preferences: NotificationPreferences;
  profilePictureUrl?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
  category?: 'newCompetition' | 'rsvpChange' | 'paymentUpdate';
  linkTo?: string; // e.g., competition ID
}