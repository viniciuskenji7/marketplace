import axios, { isAxiosError } from 'axios';


export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'Não foi possível conectar ao servidor.';
    const message = error.response.data?.message;
    if (Array.isArray(message)) return message.join('. '); // erros do class-validator vêm em lista
    if (typeof message === 'string') return message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}