'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Loader2,
  ArrowLeft,
  Upload,
  CheckCircle,
  X,
  File,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  noteId?: string;
  error?: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter((file) => file.type === 'application/pdf');
    
    if (pdfFiles.length < newFiles.length) {
      toast.error('Apenas arquivos PDF são permitidos');
    }

    const uploadedFiles: UploadedFile[] = pdfFiles.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      if (fileData.status !== 'pending') continue;

      // Atualizar status para uploading
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', fileData.file);

        const token = localStorage.getItem('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        
        const response = await fetch(`${API_URL}/documents/upload?tag=documento_medico`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
          throw new Error(errorData.detail || `Erro ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: 'success', progress: 100, noteId: result.note_id }
                : f
            )
          );
          toast.success(`${fileData.file.name} processado!`);
        } else {
          throw new Error(result.message || 'Erro ao processar arquivo');
        }
      } catch (error: any) {
        console.error('Erro detalhado:', error);
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'error', progress: 0, error: error.message }
              : f
          )
        );
        toast.error(`Erro: ${error.message}`);
      }
    }

    setIsUploading(false);
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status === 'pending'));
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

  const hasCompleted = files.some((f) => f.status === 'success' || f.status === 'error');

  return (
    <div className="min-h-screen bg-background">
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
            <Upload className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Upload de Documentos</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Adicionar PDFs ao Sistema RAG
            </CardTitle>
            <CardDescription>
              Faça upload dos seus documentos PDF para que a IA possa usá-los como fonte de conhecimento.
              Os documentos serão processados e indexados automaticamente.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Arquivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Arraste e solte seus PDFs aqui
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ou clique no botão abaixo para selecionar
              </p>
              <input
                type="file"
                id="file-input"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button asChild>
                <label htmlFor="file-input" className="cursor-pointer">
                  <File className="h-4 w-4 mr-2" />
                  Selecionar PDFs
                </label>
              </Button>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Arquivos Selecionados ({files.length})
                  </p>
                  {hasCompleted && (
                    <Button variant="ghost" size="sm" onClick={clearCompleted}>
                      Limpar Concluídos
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {files.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {fileData.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fileData.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {fileData.status === 'uploading' && (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                        {fileData.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {fileData.status === 'error' && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
              <Button
                onClick={uploadFiles}
                disabled={isUploading || files.every((f) => f.status !== 'pending')}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Processar {files.filter((f) => f.status === 'pending').length}{' '}
                    {files.filter((f) => f.status === 'pending').length === 1
                      ? 'Arquivo'
                      : 'Arquivos'}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {hasCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Processamento Concluído
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Sucesso</p>
                  <p className="text-2xl font-bold text-green-500">
                    {files.filter((f) => f.status === 'success').length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Erros</p>
                  <p className="text-2xl font-bold text-red-500">
                    {files.filter((f) => f.status === 'error').length}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/notes')}
                  className="flex-1"
                >
                  Ver Anotações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/chat')}
                  className="flex-1"
                >
                  Testar IA
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como funciona?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Selecione um ou mais arquivos PDF do seu computador</p>
            <p>2. Clique em "Processar Arquivos"</p>
            <p>3. O sistema irá extrair o texto dos PDFs</p>
            <p>4. Criar anotações automaticamente</p>
            <p>5. Gerar embeddings para busca semântica</p>
            <p>
              6. A IA poderá usar esses documentos como fonte de conhecimento!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
