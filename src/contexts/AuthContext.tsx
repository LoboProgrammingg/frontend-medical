'use client';

/**
 * Auth Context - Gerenciamento global de autenticação
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import type { User, LoginRequest, RegisterRequest } from '@/types';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar se há usuário logado ao carregar (apenas uma vez)
  useEffect(() => {
    const loadUser = () => {
      console.log('🔄 AuthContext: Carregando usuário do localStorage...');
      const isAuth = authService.isAuthenticated();
      
      if (!isAuth) {
        console.log('⚠️ Token inválido ou expirado');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const currentUser = authService.getCurrentUser();
      console.log('👤 Usuário encontrado:', currentUser);
      console.log('🔐 Token válido');
      
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();
  }, []); // Executar apenas uma vez ao montar

  // Verificar token periodicamente (a cada 5 minutos) - separado do loadUser
  useEffect(() => {
    if (!user) return; // Só verificar se há usuário logado
    
    const interval = setInterval(() => {
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        console.log('⚠️ Token expirado durante uso. Fazendo logout...');
        setUser(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(interval);
  }, [user]); // Depende de user, mas só executa se user existir

  // Login
  const login = async (data: LoginRequest) => {
    try {
      console.log('🚀 AuthContext: Iniciando login...');
      const response = await authService.login(data);
      console.log('👤 AuthContext: Setando usuário...', response.user);
      setUser(response.user);
      
      // Pequeno delay para garantir que localStorage foi atualizado
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('📍 AuthContext: Redirecionando para /dashboard...');
      
      // Verificar se token foi salvo
      const token = authService.isAuthenticated();
      console.log('🔐 Token após login:', token ? 'VÁLIDO' : 'INVÁLIDO');
      
      // Usar window.location.href para garantir redirecionamento
      if (typeof window !== 'undefined') {
        // Pequeno delay para garantir que tudo foi salvo
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    } catch (error) {
      console.error('❌ AuthContext: Erro no login:', error);
      throw error;
    }
  };

  // Registro
  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

