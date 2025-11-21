/**
 * Conversations Service - Gerenciamento de conversas com IA
 */

import { get, post, put, del } from '@/lib/api';
import type {
  Conversation,
  ConversationWithMessages,
  ConversationListResponse,
} from '@/types';

export const conversationsService = {
  /**
   * Criar nova conversa
   */
  async create(title: string): Promise<Conversation> {
    return post<Conversation>('/conversations/', { title });
  },

  /**
   * Listar conversas do usuário
   */
  async list(page: number = 1, pageSize: number = 20): Promise<ConversationListResponse> {
    return get<ConversationListResponse>(`/conversations/?page=${page}&page_size=${pageSize}`);
  },

  /**
   * Obter conversa com mensagens
   */
  async get(conversationId: string): Promise<ConversationWithMessages> {
    return get<ConversationWithMessages>(`/conversations/${conversationId}`);
  },

  /**
   * Atualizar título da conversa
   */
  async update(conversationId: string, title: string): Promise<Conversation> {
    return put<Conversation>(`/conversations/${conversationId}`, { title });
  },

  /**
   * Deletar conversa
   */
  async delete(conversationId: string): Promise<void> {
    return del<void>(`/conversations/${conversationId}`);
  },
};

