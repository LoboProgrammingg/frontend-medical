'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/RichTextEditor';
import { notesService } from '@/services/notesService';
import { toast } from 'sonner';
import { Loader2, X, Plus, Save, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Note } from '@/types';

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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
      setIsFetching(true);
      const fetchedNote = await notesService.get(noteId);
      setNote(fetchedNote);
      setTitle(fetchedNote.title);
      setContent(fetchedNote.content);
      setTags(fetchedNote.tags);
      setIsFavorite(fetchedNote.is_favorite);
    } catch (error) {
      toast.error('Erro ao carregar anotação');
      router.push('/dashboard/notes');
    } finally {
      setIsFetching(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (!content.trim()) {
      toast.error('O conteúdo é obrigatório');
      return;
    }

    setIsLoading(true);

    try {
      await notesService.update(noteId, {
        title: title.trim(),
        content: content.trim(),
        tags,
        is_favorite: isFavorite,
      });

      toast.success('Anotação atualizada com sucesso! 💙');
      router.push('/dashboard/notes');
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao atualizar anotação'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isFetching) {
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
    <div className="min-h-screen bg-background flex flex-col">
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
            <h1 className="text-xl font-bold">✏️ Editar Anotação</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/notes')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !title.trim() || !content.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            {/* Título */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-lg font-semibold">
                Título da Anotação *
              </Label>
              <Input
                id="title"
                placeholder="Ex: Farmacologia - Antibióticos Beta-lactâmicos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
                className="text-2xl font-semibold h-14 border-2"
                autoFocus
              />
            </div>

            {/* Tags e Favorito */}
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <Label htmlFor="tags" className="text-base font-medium">
                  Tags (opcional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Ex: farmacologia, antibióticos (pressione Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={addTag}
                    disabled={isLoading || !tagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          disabled={isLoading}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-8">
                <Button
                  type="button"
                  variant={isFavorite ? 'default' : 'outline'}
                  onClick={() => setIsFavorite(!isFavorite)}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  {isFavorite ? 'Favorita' : 'Favoritar'}
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Conteúdo da Anotação *
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Use a barra de ferramentas para formatar seu texto. Negrito, cores, marcadores e muito mais!
              </p>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

