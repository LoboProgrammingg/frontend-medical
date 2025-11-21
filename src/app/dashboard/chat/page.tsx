'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Heart,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  X,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { agentsService } from '@/services/agentsService';
import { conversationsService } from '@/services/conversationsService';
import { toast } from 'sonner';
import type { ChatMessage, Conversation, Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await conversationsService.list(1, 50);
      setConversations(response.conversations);
      
      // Se não houver conversa atual e existirem conversas, seleciona a primeira
      if (!currentConversationId && response.conversations.length > 0) {
        selectConversation(response.conversations[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const selectConversation = async (conversationId: string) => {
    try {
      setCurrentConversationId(conversationId);
      const conversation = await conversationsService.get(conversationId);
      setMessages(conversation.messages);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast.error('Erro ao carregar conversa');
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await conversationsService.create('Nova Conversa');
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      setMessages([]);
      toast.success('Nova conversa criada');
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao criar conversa');
    }
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Deseja deletar esta conversa?')) return;

    try {
      await conversationsService.delete(conversationId);
      setConversations(conversations.filter((c) => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      
      toast.success('Conversa deletada');
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      toast.error('Erro ao deletar conversa');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain', 'text/csv',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não suportado. Use imagens (JPG, PNG) ou PDFs.');
        return;
      }
      
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }
      
      setSelectedFile(file);
      toast.success(`Arquivo selecionado: ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile || isAnalyzingFile) return;

    // Se não houver conversa atual, criar uma nova
    let conversationId = currentConversationId;
    if (!conversationId) {
      const newConv = await conversationsService.create('Nova Conversa');
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      setMessages([]);
      conversationId = newConv.id;
    }

    setIsAnalyzingFile(true);

    // Adicionar mensagem do usuário localmente
    const userMessage = `📎 ${selectedFile.name}${input.trim() ? `\n\n${input.trim()}` : ''}`;
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // Analisar arquivo
      const question = input.trim() || 'Analise este arquivo e me dê informações relevantes';
      console.log('📤 Enviando arquivo para análise:', selectedFile.name, 'Pergunta:', question);
      const response = await agentsService.analyzeFile(selectedFile, question);
      console.log('✅ Resposta recebida:', response);

      // Adicionar resposta da IA localmente
      const assistantMessage: Message = {
        id: `temp-${Date.now()}-assistant`,
        conversation_id: conversationId,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Limpar arquivo e input
      setSelectedFile(null);
      setInput('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Atualizar lista de conversas (sem recarregar mensagens)
      await loadConversations();
      
      toast.success('Arquivo analisado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao analisar arquivo:', error);
      toast.error(`Erro ao analisar arquivo: ${error.message || 'Erro desconhecido'}`);

      // Adicionar mensagem de erro
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: `Desculpe, tive um problema ao analisar o arquivo: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Se houver arquivo selecionado, analisar arquivo
    if (selectedFile) {
      await handleAnalyzeFile();
      return;
    }

    if (!input.trim() || isLoading) return;

    // Se não houver conversa atual, criar uma nova
    if (!currentConversationId) {
      await createNewConversation();
      return;
    }

    const userMessage = input.trim();
    setInput('');

    // Adicionar mensagem do usuário localmente
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversationId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      // Preparar histórico
      const history: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Chamar API
      const response = await agentsService.chat({
        message: userMessage,
        conversation_id: currentConversationId,
        conversation_history: history,
      });

      // Adicionar resposta da IA localmente
      const assistantMessage: Message = {
        id: `temp-${Date.now()}-assistant`,
        conversation_id: currentConversationId,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Recarregar conversa para obter IDs corretos
      await selectConversation(currentConversationId);
      
      // Atualizar lista de conversas
      await loadConversations();
    } catch (error) {
      toast.error('Erro ao se comunicar com a assistente');
      console.error(error);

      // Adicionar mensagem de erro
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: currentConversationId,
        role: 'assistant',
        content: 'Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Assistente Médica IA 💙</h1>
          </div>
          <Badge variant="secondary">
            <Heart className="h-3 w-3 mr-1" fill="currentColor" />
            Gemini
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversas */}
        <div className="w-64 border-r bg-background overflow-y-auto">
          <div className="p-4 space-y-2">
            <Button onClick={createNewConversation} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>

            {isLoadingConversations ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma conversa ainda
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors group flex items-start justify-between ${
                    currentConversationId === conv.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {conv.message_count} mensagens
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversationId ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Olá, {user?.full_name.split(' ')[0]}! 💙
                    </h3>
                    <p className="text-muted-foreground">
                      Sou sua assistente médica pessoal. Como posso te ajudar hoje?
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`flex-1 rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-12'
                          : 'bg-muted mr-12'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="space-y-2">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-border/50">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={async () => {
                                try {
                                  const blob = await agentsService.generateDocument(
                                    message.content,
                                    'excel',
                                    `resposta_ia_${Date.now()}`
                                  );
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `resposta_ia_${Date.now()}.xlsx`;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  toast.success('Excel baixado com sucesso!');
                                } catch (error: any) {
                                  toast.error(`Erro ao baixar Excel: ${error.message}`);
                                }
                              }}
                            >
                              <FileSpreadsheet className="h-3 w-3 mr-1" />
                              Excel
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={async () => {
                                try {
                                  const blob = await agentsService.generateDocument(
                                    message.content,
                                    'word',
                                    `resposta_ia_${Date.now()}`
                                  );
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `resposta_ia_${Date.now()}.docx`;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                  toast.success('Word baixado com sucesso!');
                                } catch (error: any) {
                                  toast.error(`Erro ao baixar Word: ${error.message}`);
                                }
                              }}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Word
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {(isLoading || isAnalyzingFile) && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-lg p-4 bg-muted mr-12">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          {isAnalyzingFile ? 'Analisando arquivo...' : 'Pensando...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4 bg-background">
                {/* Arquivo selecionado */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,text/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    disabled={isLoading || isAnalyzingFile}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      selectedFile
                        ? 'Digite sua pergunta sobre o arquivo (opcional)...'
                        : 'Digite sua pergunta médica...'
                    }
                    disabled={isLoading || isAnalyzingFile}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={
                      isLoading || isAnalyzingFile || (!input.trim() && !selectedFile)
                    }
                  >
                    {isLoading || isAnalyzingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Clique em enviar para analisar o arquivo
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Selecione ou crie uma conversa
                </h3>
                <p className="text-muted-foreground mb-4">
                  Suas conversas aparecerão na barra lateral
                </p>
                <Button onClick={createNewConversation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conversa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
