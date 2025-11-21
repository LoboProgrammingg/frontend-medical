'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notesService } from '@/services/notesService';
import { toast } from 'sonner';
import { 
  Loader2, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  Printer, 
  Star,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ViewNotePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const noteId = params.id as string;

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  // Carregar nota
  useEffect(() => {
    if (isAuthenticated && noteId) {
      fetchNote();
    }
  }, [isAuthenticated, noteId]);

  const fetchNote = async () => {
    try {
      setIsLoading(true);
      const fetchedNote = await notesService.get(noteId);
      setNote(fetchedNote);
    } catch (error) {
      toast.error('Erro ao carregar anotação');
      router.push('/dashboard/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/notes/${noteId}/edit`);
  };

  const handleDelete = async () => {
    if (!note) return;
    
    if (!confirm(`Tem certeza que deseja deletar "${note.title}"?`)) {
      return;
    }

    try {
      await notesService.delete(noteId);
      toast.success('Anotação deletada com sucesso! 💙');
      router.push('/dashboard/notes');
    } catch (error) {
      toast.error('Erro ao deletar anotação');
    }
  };

  const handleToggleFavorite = async () => {
    if (!note) return;

    try {
      await notesService.toggleFavorite(noteId, !note.is_favorite);
      toast.success(note.is_favorite ? 'Removida dos favoritos' : 'Adicionada aos favoritos ⭐');
      fetchNote(); // Recarregar nota
    } catch (error) {
      toast.error('Erro ao atualizar favorito');
    }
  };

  const handleDownloadHtml = () => {
    if (!note) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title} - Amorinha</title>
    <style>
        body { 
          font-family: 'Georgia', serif; 
          line-height: 1.8; 
          color: #1a1a1a; 
          margin: 0; 
          padding: 40px; 
          background-color: #f9fafb; 
        }
        .container { 
          max-width: 900px; 
          margin: auto; 
          background: #ffffff; 
          padding: 50px; 
          border-radius: 12px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
        }
        .header { 
          border-bottom: 3px solid #0077B6; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        h1 { 
          font-size: 2.5em; 
          color: #0077B6; 
          margin: 0 0 20px 0; 
          font-weight: 700;
          line-height: 1.2;
        }
        .metadata { 
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 0.95em; 
          color: #555; 
          margin-bottom: 20px; 
          padding: 15px; 
          background-color: #f0f8ff; 
          border-left: 5px solid #0077B6; 
          border-radius: 6px; 
        }
        .metadata-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .metadata-item strong {
          color: #0077B6;
        }
        .tags { 
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
        }
        .tag { 
          display: inline-block; 
          background: linear-gradient(135deg, #06D6A0 0%, #00B4D8 100%);
          color: white; 
          padding: 6px 14px; 
          border-radius: 20px; 
          font-size: 0.85em; 
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .favorite-badge {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .content { 
          margin-top: 40px; 
          font-size: 1.1em;
          line-height: 1.8;
        }
        .content h1, .content h2, .content h3 { 
          color: #0077B6; 
          margin-top: 1.8em; 
          margin-bottom: 0.6em; 
          font-weight: 600;
        }
        .content h1 { font-size: 2em; }
        .content h2 { font-size: 1.6em; color: #06D6A0; }
        .content h3 { font-size: 1.3em; }
        .content p { 
          margin-bottom: 1.2em; 
          text-align: justify;
        }
        .content ul, .content ol { 
          margin: 1em 0 1em 25px; 
          padding-left: 15px;
        }
        .content li {
          margin-bottom: 0.6em;
        }
        .content blockquote { 
          border-left: 5px solid #00B4D8; 
          padding-left: 20px; 
          margin: 1.5em 0; 
          font-style: italic; 
          color: #555; 
          background-color: #f0f8ff;
          padding: 15px 15px 15px 25px;
          border-radius: 6px;
        }
        .content pre { 
          background: #2d3748; 
          color: #e2e8f0;
          font-family: 'Courier New', monospace; 
          padding: 20px; 
          border-radius: 8px; 
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .content code { 
          font-family: 'Courier New', monospace; 
          background: #eef2f7; 
          padding: 3px 6px; 
          border-radius: 4px; 
          font-size: 0.9em;
          color: #d63031;
        }
        .content pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        .content mark { 
          background-color: #fde047; 
          padding: 2px 4px; 
          border-radius: 3px; 
        }
        .content strong { font-weight: 700; }
        .content em { font-style: italic; }
        .content u { text-decoration: underline; }
        
        /* Custom colors from Tiptap */
        .has-text-red { color: #ef4444; }
        .has-text-orange { color: #f97316; }
        .has-text-yellow { color: #eab308; }
        .has-text-green { color: #22c55e; }
        .has-text-blue { color: #3b82f6; }
        .has-text-purple { color: #a855f7; }
        .has-text-pink { color: #ec4899; }
        .has-text-black { color: #000000; }

        .has-highlight-yellow { background-color: #fde047; }
        .has-highlight-green { background-color: #86efac; }
        .has-highlight-blue { background-color: #93c5fd; }
        .has-highlight-pink { background-color: #fbcfe8; }
        .has-highlight-orange { background-color: #fed7aa; }
        
        .footer { 
          text-align: center; 
          margin-top: 60px; 
          padding-top: 30px; 
          border-top: 2px solid #e5e7eb; 
          font-size: 0.9em; 
          color: #888; 
        }
        .footer strong {
          color: #0077B6;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #fff;
          }
          .container { 
            box-shadow: none; 
            border-radius: 0; 
            margin: 0; 
            padding: 30px; 
          }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${note.title}</h1>
            <div class="metadata">
                <div class="metadata-item">
                    <strong>📅 Criado em:</strong> ${formatDate(note.created_at, true)}
                </div>
                <div class="metadata-item">
                    <strong>🔄 Atualizado em:</strong> ${formatDate(note.updated_at, true)}
                </div>
                ${note.is_favorite ? '<div class="favorite-badge">⭐ Favorita</div>' : ''}
            </div>
            ${note.tags.length > 0 ? `
                <div class="tags">
                    ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="content">
            ${note.content}
        </div>
        
        <div class="footer">
            Gerado por <strong>Amorinha 💙</strong> - Sua Assistente Médica Pessoal
        </div>
    </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download iniciado! 💾');
  };

  const handlePrint = () => {
    if (!note || !contentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title} - Impressão</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Georgia', serif; 
          line-height: 1.6; 
          color: #000; 
          padding: 30px; 
        }
        .print-header { 
          text-align: center; 
          margin-bottom: 40px; 
          border-bottom: 2px solid #0077B6; 
          padding-bottom: 20px; 
        }
        .print-header h1 { 
          font-size: 28pt; 
          color: #0077B6; 
          margin-bottom: 15px; 
          font-weight: 700;
        }
        .metadata { 
          font-size: 11pt; 
          color: #555; 
          margin: 15px 0;
        }
        .metadata span { 
          margin-right: 20px; 
          display: inline-block; 
        }
        .tags {
          margin-top: 10px;
        }
        .tag {
          display: inline-block;
          background-color: #e5e7eb;
          color: #374151;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10pt;
          margin-right: 6px;
          font-weight: 600;
        }
        .content { 
          margin-top: 30px; 
        }
        .content p, .content h1, .content h2, .content h3, .content ul, .content ol, .content blockquote {
          margin-bottom: 0.8em;
        }
        .content h1 { font-size: 20pt; font-weight: bold; color: #0077B6; margin-top: 1.2em; }
        .content h2 { font-size: 16pt; font-weight: bold; color: #06D6A0; margin-top: 1em; }
        .content h3 { font-size: 14pt; font-weight: bold; color: #0077B6; margin-top: 0.8em; }
        .content p { text-align: justify; }
        .content ul, .content ol { padding-left: 1.5em; }
        .content li { margin-bottom: 0.4em; }
        .content blockquote { 
          border-left: 4px solid #00B4D8; 
          padding-left: 15px; 
          font-style: italic; 
          color: #555; 
          margin: 1em 0;
        }
        .content code { 
          background-color: #f0f0f0; 
          padding: 2px 5px; 
          border-radius: 3px; 
          font-family: 'Courier New', monospace; 
          font-size: 10pt;
        }
        .content mark { background-color: #fde047; padding: 2px 4px; }
        .content strong { font-weight: bold; }
        .content em { font-style: italic; }
        .content u { text-decoration: underline; }
        
        /* Custom colors */
        .has-text-red { color: #ef4444; }
        .has-text-orange { color: #f97316; }
        .has-text-yellow { color: #eab308; }
        .has-text-green { color: #22c55e; }
        .has-text-blue { color: #3b82f6; }
        .has-text-purple { color: #a855f7; }
        .has-text-pink { color: #ec4899; }
        .has-text-black { color: #000000; }

        .has-highlight-yellow { background-color: #fde047; }
        .has-highlight-green { background-color: #86efac; }
        .has-highlight-blue { background-color: #93c5fd; }
        .has-highlight-pink { background-color: #fbcfe8; }
        .has-highlight-orange { background-color: #fed7aa; }
        
        .print-footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #ccc; 
          font-size: 10pt; 
          color: #777; 
        }
    </style>
</head>
<body>
    <div class="print-header">
        <h1>${note.title}</h1>
        <div class="metadata">
            <span><strong>Criado em:</strong> ${formatDate(note.created_at, true)}</span>
            <span><strong>Atualizado em:</strong> ${formatDate(note.updated_at, true)}</span>
            ${note.is_favorite ? '<span><strong>⭐ Favorita</strong></span>' : ''}
        </div>
        ${note.tags.length > 0 ? `
            <div class="tags">
                ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
    </div>
    <div class="content">
        ${note.content}
    </div>
    <div class="print-footer">
        Gerado por <strong>Amorinha 💙</strong>
    </div>
</body>
</html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const formatDate = (dateString: string, full = false) => {
    const date = new Date(dateString);
    if (full) {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString('pt-BR');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !note) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header Fixo */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/notes')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="h-8 w-px bg-border" />
            <h1 className="text-xl font-bold hidden md:block">📄 Visualizar Anotação</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFavorite}
              className="gap-2"
            >
              <Star 
                className="h-4 w-4" 
                fill={note.is_favorite ? 'currentColor' : 'none'} 
              />
              <span className="hidden md:inline">
                {note.is_favorite ? 'Favorita' : 'Favoritar'}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadHtml}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden md:inline">Imprimir</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleEdit}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden md:inline">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive gap-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="medical-card shadow-lg">
          <CardContent className="p-8 md:p-12">
            {/* Título */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                {note.title}
              </h1>
              
              {/* Metadados */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-l-4 border-primary bg-primary/5 px-4 py-3 rounded-r-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Criado em {formatDate(note.created_at, true)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Atualizado em {formatDate(note.updated_at, true)}</span>
                </div>
                {note.is_favorite && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    <Star className="h-3 w-3 mr-1" fill="currentColor" />
                    Favorita
                  </Badge>
                )}
              </div>
              
              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {note.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-sm px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Separador */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" />

            {/* Conteúdo da Anotação */}
            <div 
              ref={contentRef}
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-primary prose-headings:font-semibold
                prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
                prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6 prose-h2:text-secondary
                prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
                prose-p:text-justify prose-p:mb-4 prose-p:leading-relaxed
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-bold
                prose-ul:my-4 prose-ol:my-4 prose-li:my-1
                prose-blockquote:border-l-accent prose-blockquote:border-l-4 
                prose-blockquote:pl-4 prose-blockquote:italic 
                prose-blockquote:text-muted-foreground
                prose-blockquote:bg-accent/5 prose-blockquote:py-2 prose-blockquote:rounded-r
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 
                prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-img:rounded-lg prose-img:shadow-md"
            >
              {note.content.includes('<') && note.content.includes('>') ? (
                // Se o conteúdo contém HTML (anotações antigas do editor Tiptap)
                <div dangerouslySetInnerHTML={{ __html: note.content }} />
              ) : (
                // Se o conteúdo é Markdown (PDFs convertidos)
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content}
                </ReactMarkdown>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer da página */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Gerado por <span className="text-primary font-semibold">Amorinha 💙</span></p>
        </div>
      </main>
    </div>
  );
}

