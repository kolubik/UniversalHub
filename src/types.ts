import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  bio?: string;
  stack?: string[];
  hardSkills?: string[];
  softSkills?: string[];
  experience?: string;
  role: UserRole;
  createdAt: Timestamp | Date;
}

export type CertificateStatus = 'pending' | 'verified' | 'rejected';

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  title: string;
  issuer: string;
  date: string;
  pdfUrl: string;
  status: CertificateStatus;
  createdAt: Timestamp | Date;
}
