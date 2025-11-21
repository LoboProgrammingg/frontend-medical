/**
 * Auth Service - Gerenciamento de autenticação
 */

import { get, post } from '@/lib/api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export const authService = {
  /**
   * Login do usuário
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 Tentando login...', { email: data.email });
    const response = await post<AuthResponse>('/auth/login', data);
    console.log('✅ Login bem-sucedido!', response);
    
    // Salvar token no localStorage
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('💾 Token e usuário salvos no localStorage');
    }
    
    return response;
  },

  /**
   * Registro de novo usuário
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await post<AuthResponse>('/auth/register', data);
    
    // Salvar token no localStorage
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  /**
   * Obter dados do usuário logado
   */
  async me(): Promise<User> {
    return get<User>('/auth/me');
  },

  /**
   * Logout do usuário
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Verificar se está autenticado e se o token é válido
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Verificar se o token está expirado
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('⚠️ Token com formato inválido');
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Converter para milissegundos
      const now = Date.now();
      
      // Se expirou, retornar false e limpar
      if (exp < now) {
        console.log('⚠️ Token expirado');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      // Se está próximo de expirar (menos de 1 hora), apenas avisar mas não remover
      if ((exp - now) < 3600000) {
        console.log('⚠️ Token próximo de expirar, mas ainda válido');
      }
      
      return true;
    } catch (e) {
      console.error('❌ Erro ao verificar token:', e);
      // Não remover automaticamente em caso de erro de parsing
      // Pode ser um token válido com formato diferente
      return !!token;
    }
  },

  /**
   * Obter usuário do localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      console.log('⚠️  Window undefined (SSR)');
      return null;
    }
    
    const userStr = localStorage.getItem('user');
    console.log('📦 localStorage user:', userStr ? 'EXISTS' : 'NOT FOUND');
    
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr) as User;
      console.log('✅ User parsed:', user);
      return user;
    } catch (e) {
      console.error('❌ Error parsing user:', e);
      return null;
    }
  },
};

