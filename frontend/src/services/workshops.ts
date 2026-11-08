import { api } from './api';
import type {
  Workshop,
  WorkshopApiResponse,
  WorkshopInput,
  WorkshopPage,
  WorkshopSession,
  WorkshopSessionApiResponse,
  WorkshopSessionInput,
  WorkshopSessionUpdateInput,
} from '../types/Workshop';

function mapSession(session: WorkshopSessionApiResponse): WorkshopSession {
  return {
    id: session.id,
    startsAt: session.starts_at,
    durationMinutes: session.duration_minutes,
    capacity: session.capacity,
    bookedCount: session.booked_count,
    availableSpots: session.available_spots,
  };
}

function mapWorkshop(workshop: WorkshopApiResponse): Workshop {
  return {
    id: workshop.id,
    name: workshop.name,
    description: workshop.description,
    imageUrl: workshop.image_url,
    price: Number(workshop.price),
    durationMinutes: workshop.duration_minutes,
    location: workshop.location,
    createdAt: workshop.created_at,
    sessions: workshop.sessions.map(mapSession),
  };
}

export async function fetchWorkshops(page = 1, limit = 12): Promise<WorkshopPage> {
  const response = await api.get<{
    items: WorkshopApiResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>('/oficinas', { params: { page, limit } });
  return { ...response.data, items: response.data.items.map(mapWorkshop) };
}

export async function fetchWorkshopSessions(workshopId: number) {
  const response = await api.get<WorkshopSessionApiResponse[]>(
    `/oficinas/${workshopId}/sessoes`,
  );
  return response.data.map(mapSession);
}

export async function createWorkshop(input: WorkshopInput) {
  await api.post('/oficinas', input);
}

export async function updateWorkshop(id: number, input: Partial<WorkshopInput>) {
  await api.put(`/oficinas/${id}`, input);
}

export async function createWorkshopSession(
  workshopId: number,
  input: WorkshopSessionInput,
) {
  await api.post(`/oficinas/${workshopId}/sessoes`, input);
}

export async function updateWorkshopSession(
  sessionId: number,
  input: WorkshopSessionUpdateInput,
) {
  await api.put(`/oficinas/sessoes/${sessionId}`, input);
}

export async function deleteWorkshopSession(sessionId: number) {
  await api.delete(`/oficinas/sessoes/${sessionId}`);
}
