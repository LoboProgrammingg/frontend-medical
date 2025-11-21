/**
 * Notes Service - Gerenciamento de anotações
 */

import { get, post, put, del } from '@/lib/api';
import type { Note, CreateNoteRequest, UpdateNoteRequest, NoteListResponse } from '@/types';

export const notesService = {
  /**
   * Listar todas as anotações do usuário
   */
  async list(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    tags?: string[];
    is_favorite?: boolean;
  }): Promise<NoteListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.is_favorite !== undefined) {
      queryParams.append('is_favorite', params.is_favorite.toString());
    }
    
    const query = queryParams.toString();
    return get<NoteListResponse>(`/notes${query ? `?${query}` : ''}`);
  },

  /**
   * Obter uma anotação específica
   */
  async get(noteId: string): Promise<Note> {
    return get<Note>(`/notes/${noteId}`);
  },

  /**
   * Criar nova anotação
   */
  async create(data: CreateNoteRequest): Promise<Note> {
    return post<Note>('/notes', data);
  },

  /**
   * Atualizar anotação existente
   */
  async update(noteId: string, data: UpdateNoteRequest): Promise<Note> {
    return put<Note>(`/notes/${noteId}`, data);
  },

  /**
   * Deletar anotação
   */
  async delete(noteId: string): Promise<{ message: string }> {
    return del<{ message: string }>(`/notes/${noteId}`);
  },

  /**
   * Favoritar/desfavoritar anotação
   */
  async toggleFavorite(noteId: string, isFavorite: boolean): Promise<Note> {
    return put<Note>(`/notes/${noteId}`, { is_favorite: isFavorite });
  },
};

