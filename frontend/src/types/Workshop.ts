import type { PaginatedResponse } from './PaginatedResponse';

export interface WorkshopSessionApiResponse {
  id: number;
  starts_at: string;
  duration_minutes: number;
  capacity: number;
  booked_count: number;
  available_spots: number;
}

export interface WorkshopApiResponse {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number | string;
  duration_minutes: number;
  location: string;
  created_at: string;
  sessions: WorkshopSessionApiResponse[];
}

export interface WorkshopSession {
  id: number;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  availableSpots: number;
}

export interface Workshop {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  durationMinutes: number;
  location: string;
  createdAt: string;
  sessions: WorkshopSession[];
}

export type WorkshopPage = PaginatedResponse<Workshop>;

export interface WorkshopInput {
  name: string;
  description: string;
  image_url: string;
  price: number;
  duration_minutes: number;
  location: string;
}

export interface WorkshopSessionInput {
  starts_at: string;
  capacity: number;
}

export interface WorkshopSessionUpdateInput {
  starts_at?: string;
  capacity?: number;
}
