'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  X,
  FileText,
  Upload,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gemsService } from '@/services/gemsService';
import { toast } from 'sonner';
import type { Gem, GemDocument } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function GemsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [gems, setGems] = useState<Gem[]>([]);
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadGems();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadGems = async () => {
    try {
      setIsLoading(true);
      const response = await gemsService.list();
      setGems(response.gems);
    } catch (error) {
      console.error('Erro ao carregar Gems:', error);
      toast.error('Erro ao carregar Gems');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const gem = await gemsService.create({
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        instructions: formData.get('instructions') as string,
      });
      
      setGems([gem, ...gems]);
      setShowCreateForm(false);
      toast.success('Gem criada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar Gem');
    }
  };

  const handleUpdateGem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGem) return;
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const updated = await gemsService.update(selectedGem.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        instructions: formData.get('instructions') as string,
      });
      
      setGems(gems.map(g => g.id === updated.id ? updated : g));
      setSelectedGem(updated);
      setShowEditForm(false);
      toast.success('Gem atualizada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar Gem');
    }
  };

  const handleDeleteGem = async (gemId: string) => {
    if (!confirm('Deseja deletar esta Gem? Todos os documentos serão removidos.')) return;
    
    try {
      await gemsService.delete(gemId);
      setGems(gems.filter(g => g.id !== gemId));
      if (selectedGem?.id === gemId) {
        setSelectedGem(null);
        setChatMessages([]);
      }
      toast.success('Gem deletada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar Gem');
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!selectedGem) return;
    
    try {
      setUploadingDoc(true);
      const updated = await gemsService.addDocument(selectedGem.id, file);
      setSelectedGem(updated);
      setGems(gems.map(g => g.id === updated.id ? updated : g));
      toast.success('Documento adicionado e processado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar documento');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGem || !chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    
    try {
      setIsLoadingChat(true);
      const response = await gemsService.chat({
        message: userMessage,
        gem_id: selectedGem.id,
      });
      
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          sources: response.sources_used,
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar mensagem');
      setChatMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoadingChat(false);
    }
  };

  if (authLoading || isLoading) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <h1 className="text-base sm:text-xl font-semibold truncate">Gems</h1>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nova Gem</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Sidebar - Lista de Gems */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Suas Gems</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  IAs especializadas para diferentes propósitos médicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
                {gems.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                      Nenhuma Gem ainda
                    </p>
                    <Button onClick={() => setShowCreateForm(true)} size="sm" className="text-xs">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Criar Gem</span>
                      <span className="sm:hidden">Criar</span>
                    </Button>
                  </div>
                ) : (
                  gems.map((gem) => (
                    <div
                      key={gem.id}
                      className={`p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedGem?.id === gem.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => {
                        setSelectedGem(gem);
                        setChatMessages([]);
                        setShowEditForm(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs sm:text-sm truncate">{gem.name}</h3>
                          {gem.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {gem.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                              {gem.documents.length} docs
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Gem Details & Chat */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {selectedGem ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Gem Info */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{selectedGem.name}</CardTitle>
                        {selectedGem.description && (
                          <CardDescription className="mt-1 text-xs sm:text-sm">
                            {selectedGem.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEditForm(!showEditForm)}
                          className="text-xs h-8 sm:h-9"
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteGem(selectedGem.id)}
                          className="text-xs h-8 sm:h-9"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Deletar</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    {/* Edit Form */}
                    {showEditForm ? (
                      <form onSubmit={handleUpdateGem} className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Nome</label>
                          <Input
                            name="name"
                            defaultValue={selectedGem.name}
                            required
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Descrição</label>
                          <Input
                            name="description"
                            defaultValue={selectedGem.description || ''}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
                            Instruções Personalizadas
                          </label>
                          <Textarea
                            name="instructions"
                            defaultValue={selectedGem.instructions}
                            rows={6}
                            required
                            className="text-sm"
                            placeholder="Ex: Você é uma IA especializada em diagnóstico de doenças cardíacas. Sempre siga este padrão: 1) Anamnese, 2) Exame físico, 3) Exames complementares, 4) Diagnóstico, 5) Tratamento..."
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button type="submit" className="text-xs sm:text-sm h-9">Salvar</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowEditForm(false)}
                            className="text-xs sm:text-sm h-9"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold mb-2">Instruções:</h4>
                          <div className="p-2.5 sm:p-3 bg-muted rounded-lg">
                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                              {selectedGem.instructions}
                            </p>
                          </div>
                        </div>

                        {/* Documents */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-xs sm:text-sm font-semibold">Documentos ({selectedGem.documents.length})</h4>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadDocument(file);
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingDoc}
                              className="text-xs h-8 sm:h-9 w-full sm:w-auto"
                            >
                              {uploadingDoc ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 animate-spin" />
                              ) : (
                                <Upload className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                              )}
                              <span className="hidden sm:inline">Adicionar PDF</span>
                              <span className="sm:hidden">Adicionar</span>
                            </Button>
                          </div>
                          {selectedGem.documents.length > 0 ? (
                            <div className="space-y-2">
                              {selectedGem.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between gap-2 p-2 border rounded-lg"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs truncate">{doc.filename}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                                      ({(doc.file_size / 1024).toFixed(1)} KB)
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        await gemsService.removeDocument(selectedGem.id, doc.id);
                                        const updated = await gemsService.get(selectedGem.id);
                                        setSelectedGem(updated);
                                        setGems(gems.map(g => g.id === updated.id ? updated : g));
                                        toast.success('Documento removido');
                                      } catch (error: any) {
                                        toast.error(error.message || 'Erro ao remover documento');
                                      }
                                    }}
                                    className="h-7 w-7 p-0 flex-shrink-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Nenhum documento adicionado ainda
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chat */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Chat com {selectedGem.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Faça perguntas e a Gem usará seus documentos e instruções
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Messages */}
                      <div className="h-64 sm:h-96 overflow-y-auto space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-lg bg-muted/30">
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-8 sm:py-12">
                            <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Comece uma conversa com {selectedGem.name}
                            </p>
                          </div>
                        ) : (
                          chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex gap-2 sm:gap-3 ${
                                msg.role === 'user' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {msg.role === 'user' ? (
                                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                  <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                              </div>
                              <div
                                className={`flex-1 rounded-lg p-2.5 sm:p-4 min-w-0 ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground ml-10 sm:ml-12'
                                    : 'bg-background border mr-10 sm:mr-12'
                                }`}
                              >
                                {msg.role === 'assistant' ? (
                                  <div className="space-y-1.5 sm:space-y-2">
                                    <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                      </ReactMarkdown>
                                    </div>
                                    {msg.sources && msg.sources.length > 0 && (
                                      <div className="pt-1.5 sm:pt-2 border-t border-border/50">
                                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                                          Fontes usadas:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {msg.sources.map((source, i) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                                              {source}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        {isLoadingChat && (
                          <div className="flex gap-2 sm:gap-3">
                            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center">
                              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <div className="flex-1 rounded-lg p-2.5 sm:p-4 bg-background border mr-10 sm:mr-12">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  Pensando...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <form onSubmit={handleChat} className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Digite sua pergunta..."
                          disabled={isLoadingChat}
                          className="flex-1 text-sm h-9 sm:h-10"
                        />
                        <Button 
                          type="submit" 
                          disabled={isLoadingChat || !chatInput.trim()}
                          className="h-9 sm:h-10 w-9 sm:w-10 sm:w-auto sm:px-4"
                        >
                          {isLoadingChat ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Enviar</span>
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center px-4">
                  <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Selecione uma Gem
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Escolha uma Gem da lista abaixo ou crie uma nova
                  </p>
                  <Button onClick={() => setShowCreateForm(true)} size="sm" className="text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Criar Gem</span>
                    <span className="sm:hidden">Criar</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Create Gem Dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Criar Nova Gem</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Crie uma IA especializada para um propósito médico específico
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleCreateGem} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Nome *</label>
                  <Input
                    name="name"
                    placeholder="Ex: Especialista em Diagnóstico Cardíaco"
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Descrição</label>
                  <Input
                    name="description"
                    placeholder="Breve descrição da especialização"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
                    Instruções Personalizadas *
                  </label>
                  <Textarea
                    name="instructions"
                    rows={8}
                    required
                    className="text-sm"
                    placeholder="Ex: Você é uma IA especializada em diagnóstico de doenças cardíacas. Sempre siga este padrão: 1) Anamnese detalhada, 2) Exame físico completo, 3) Exames complementares indicados, 4) Diagnóstico diferencial, 5) Plano de tratamento baseado em evidências..."
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Descreva como a IA deve se comportar e que padrões seguir
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="text-xs sm:text-sm h-9 w-full sm:w-auto">Criar Gem</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="text-xs sm:text-sm h-9 w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

