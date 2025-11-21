/**
 * API Client - Comunicação com Backend FastAPI
 * Base URL e configuração de requisições
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

/**
 * Faz requisição HTTP com configuração automática de headers
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    // Se for erro 401 (não autorizado), limpar localStorage
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        console.log('🔒 Token inválido ou expirado. Limpando localStorage...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirecionar para login apenas se não estiver já na página de login
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/';
        }
      }
    }
    
    const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }

  // Se não há conteúdo (status 204), retornar objeto vazio
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  // Verificar se há conteúdo antes de fazer parse
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

/**
 * GET request
 */
export async function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

export default {
  get,
  post,
  put,
  delete: del,
};

