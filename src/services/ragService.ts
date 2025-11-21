/**
 * RAG Service - Busca semântica e perguntas com IA
 */

import { post } from '@/lib/api';
import type { SemanticSearchRequest, SemanticSearchResult, AskRequest, AskResponse } from '@/types';

export const ragService = {
  /**
   * Busca semântica nas anotações
   */
  async search(data: SemanticSearchRequest): Promise<SemanticSearchResult[]> {
    return post<SemanticSearchResult[]>('/rag/search', data);
  },

  /**
   * Fazer pergunta para a IA (RAG)
   */
  async ask(data: AskRequest): Promise<AskResponse> {
    return post<AskResponse>('/rag/ask', data);
  },

  /**
   * Re-indexar todas as anotações
   */
  async reindex(): Promise<{ message: string; indexed_count: number }> {
    return post<{ message: string; indexed_count: number }>('/rag/reindex');
  },
};

