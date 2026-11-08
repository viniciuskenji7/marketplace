import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWorkshop,
  createWorkshopSession,
  deleteWorkshopSession,
  fetchWorkshopSessions,
  fetchWorkshops,
  WORKSHOPS_PER_PAGE,
  updateWorkshop,
  updateWorkshopSession,
} from '../services/workshops';
import type {
  WorkshopInput,
  WorkshopPage,
  WorkshopSession,
  WorkshopSessionInput,
  WorkshopSessionUpdateInput,
} from '../types/Workshop';

export const workshopKey = 'workshops';
export const workshopSessionsKey = 'workshop-sessions';

export function useWorkshops(page: number, limit = WORKSHOPS_PER_PAGE) {
  return useQuery<WorkshopPage>({
    queryKey: [workshopKey, page, limit],
    queryFn: () => fetchWorkshops(page, limit),
  });
}

export function useWorkshopSessions(workshopId: number | undefined) {
  return useQuery<WorkshopSession[]>({
    queryKey: [workshopSessionsKey, workshopId],
    queryFn: () => fetchWorkshopSessions(workshopId!),
    enabled: workshopId !== undefined,
  });
}

export function useCreateWorkshop() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, WorkshopInput>({
    mutationFn: createWorkshop,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [workshopKey] }),
  });
}

export function useUpdateWorkshop() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: number; input: Partial<WorkshopInput> }
  >({
    mutationFn: ({ id, input }) => updateWorkshop(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [workshopKey] }),
  });
}

export function useCreateWorkshopSession() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { workshopId: number; input: WorkshopSessionInput }
  >({
    mutationFn: ({ workshopId, input }) =>
      createWorkshopSession(workshopId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [workshopSessionsKey, variables.workshopId],
      });
      queryClient.invalidateQueries({ queryKey: [workshopKey] });
    },
  });
}

export function useUpdateWorkshopSession() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { sessionId: number; workshopId: number; input: WorkshopSessionUpdateInput }
  >({
    mutationFn: ({ sessionId, input }) =>
      updateWorkshopSession(sessionId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [workshopSessionsKey, variables.workshopId],
      });
      queryClient.invalidateQueries({ queryKey: [workshopKey] });
    },
  });
}

export function useDeleteWorkshopSession() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { sessionId: number; workshopId: number }>({
    mutationFn: ({ sessionId }) => deleteWorkshopSession(sessionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [workshopSessionsKey, variables.workshopId],
      });
      queryClient.invalidateQueries({ queryKey: [workshopKey] });
    },
  });
}
