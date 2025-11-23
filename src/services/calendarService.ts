/**
 * Calendar Service - Gerenciamento de Calendários e Plantões
 */

import { post, get, del } from '@/lib/api';
import type { Calendar, CalendarEvent, CalendarListResponse } from '@/types';

export const calendarService = {
  /**
   * Upload de calendário PDF
   */
  async uploadCalendar(
    file: File,
    groupNumber: number,
    name: string,
    position: string,
    title?: string
  ): Promise<Calendar> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('group_number', groupNumber.toString());
    formData.append('name', name);
    formData.append('position', position);
    if (title) {
      formData.append('title', title);
    }

    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    console.log('[CALENDAR-UPLOAD] Enviando calendário:', file.name);

    try {
      console.log('[CALENDAR-UPLOAD] Enviando requisição...');
      
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutos
      
      const response = await fetch(`${API_URL}/calendar/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[CALENDAR-UPLOAD] Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CALENDAR-UPLOAD] Erro na resposta:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || `Erro ${response.status}` };
        }
        throw new Error(error.detail || `Erro ${response.status}`);
      }

      const data = await response.json();
      console.log('[CALENDAR-UPLOAD] ✅ Dados recebidos:', data);
      return data;
    } catch (error: any) {
      console.error('[CALENDAR-UPLOAD] Erro na requisição:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: O processamento demorou mais de 3 minutos. Tente novamente ou use um PDF menor.');
      }
      
      throw error;
    }
  },

  /**
   * Listar calendários
   */
  async list(): Promise<CalendarListResponse> {
    return get<CalendarListResponse>('/calendar/');
  },

  /**
   * Obter calendário específico
   */
  async get(calendarId: string): Promise<Calendar> {
    return get<Calendar>(`/calendar/${calendarId}`);
  },

  /**
   * Deletar calendário
   */
  async delete(calendarId: string): Promise<void> {
    return del(`/calendar/${calendarId}`);
  },

  /**
   * Criar evento personalizado
   */
  async createEvent(calendarId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return post<CalendarEvent>(`/calendar/${calendarId}/events`, event);
  },
};

