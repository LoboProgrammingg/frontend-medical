/**
 * Gems Service - Gerenciamento de Gems (IAs Especializadas)
 */

import { get, post, put, del } from '@/lib/api';
import type { Gem, GemListResponse, GemCreateRequest, GemUpdateRequest, GemChatRequest, GemChatResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const gemsService = {
  /**
   * Listar todas as Gems
   */
  async list(): Promise<GemListResponse> {
    return get<GemListResponse>('/gems/');
  },

  /**
   * Obter Gem específica
   */
  async get(gemId: string): Promise<Gem> {
    return get<Gem>(`/gems/${gemId}`);
  },

  /**
   * Criar Gem
   */
  async create(data: GemCreateRequest): Promise<Gem> {
    return post<Gem>('/gems/', data);
  },

  /**
   * Atualizar Gem
   */
  async update(gemId: string, data: GemUpdateRequest): Promise<Gem> {
    return put<Gem>(`/gems/${gemId}`, data);
  },

  /**
   * Deletar Gem
   */
  async delete(gemId: string): Promise<void> {
    return del(`/gems/${gemId}`);
  },

  /**
   * Adicionar documento PDF à Gem
   */
  async addDocument(gemId: string, file: File): Promise<Gem> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/gems/${gemId}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { detail: errorText || `Erro ${response.status}` };
      }
      throw new Error(error.detail || `Erro ${response.status}`);
    }

    return response.json();
  },

  /**
   * Remover documento da Gem
   */
  async removeDocument(gemId: string, documentId: string): Promise<void> {
    return del(`/gems/${gemId}/documents/${documentId}`);
  },

  /**
   * Chat com Gem
   */
  async chat(data: GemChatRequest): Promise<GemChatResponse> {
    return post<GemChatResponse>(`/gems/${data.gem_id}/chat`, {
      message: data.message,
      gem_id: data.gem_id,
    });
  },
};

