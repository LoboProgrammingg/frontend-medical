/**
 * Agents Service - Interação com agentes LangGraph
 */

import { post } from '@/lib/api';
import type {
  MedicalAssistantRequest,
  MedicalAssistantResponse,
  NoteAnalysisRequest,
  NoteAnalysisResponse,
  CalendarRequest,
  CalendarResponse,
} from '@/types';

export const agentsService = {
  /**
   * Chat com Assistente Médica
   */
  async chat(data: MedicalAssistantRequest): Promise<MedicalAssistantResponse> {
    return post<MedicalAssistantResponse>('/agents/medical-assistant/chat', data);
  },

  /**
   * Analisar uma anotação
   */
  async analyzeNote(data: NoteAnalysisRequest): Promise<NoteAnalysisResponse> {
    return post<NoteAnalysisResponse>('/agents/note-analyzer/analyze', data);
  },

  /**
   * Organizar calendário de plantões
   */
  async organizeCalendar(data: CalendarRequest): Promise<CalendarResponse> {
    return post<CalendarResponse>('/agents/calendar-organizer/organize', data);
  },

  /**
   * Analisar imagem/arquivo
   */
  async analyzeFile(
    file: File,
    question: string = 'Analise este arquivo e me dê informações relevantes'
  ): Promise<MedicalAssistantResponse> {
    const formData = new FormData();
    formData.append('file', file);
    // Sempre enviar question (mesmo que vazio, o backend tem default)
    formData.append('question', question.trim() || 'Analise este arquivo e me dê informações relevantes');

    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    console.log('[ANALYZE-FILE] Enviando arquivo:', file.name, 'Pergunta:', question);

    try {
      const response = await fetch(`${API_URL}/agents/medical-assistant/analyze-file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // NÃO adicionar Content-Type - o browser define automaticamente para FormData
        },
        body: formData,
      });

      console.log('[ANALYZE-FILE] Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ANALYZE-FILE] Erro na resposta:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || `Erro ${response.status}` };
        }
        throw new Error(error.detail || `Erro ${response.status}`);
      }

      const data = await response.json();
      console.log('[ANALYZE-FILE] Dados recebidos:', data);
      return data;
    } catch (error: any) {
      console.error('[ANALYZE-FILE] Erro na requisição:', error);
      throw error;
    }
  },

  /**
   * Gerar documento estruturado (Excel ou Word) a partir de resposta da IA
   */
  async generateDocument(
    text: string,
    format: 'excel' | 'word' = 'excel',
    filename: string = 'resposta_ia'
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('format', format);
    formData.append('filename', filename);

    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    const response = await fetch(`${API_URL}/agents/generate-document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(error.detail || `Erro ${response.status}`);
    }

    return response.blob();
  },
};

