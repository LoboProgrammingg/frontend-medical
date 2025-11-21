'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import { notesService } from '@/services/notesService';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/RichTextEditor';
import type { Note, CreateNoteRequest } from '@/types';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
  onSuccess: () => void;
}

export function NoteDialog({ open, onOpenChange, note, onSuccess }: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!note;

  // Carregar dados da nota ao editar
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setIsFavorite(note.is_favorite);
    } else {
      // Limpar ao criar nova
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setIsFavorite(false);
    }
  }, [note]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      const noteData: CreateNoteRequest = {
        title: title.trim(),
        content: content.trim(),
        tags,
        is_favorite: isFavorite,
      };

      if (isEditing && note) {
        await notesService.update(note.id, noteData);
        toast.success('Anotação atualizada com sucesso! 💙');
      } else {
        await notesService.create(noteData);
        toast.success('Anotação criada com sucesso! 💙');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao salvar anotação'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? '📝 Editar Anotação' : '💙 Nova Anotação Médica'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize sua anotação com o editor completo' 
              : 'Use o editor completo para criar sua anotação médica'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Título da Anotação *</Label>
            <Input
              id="title"
              placeholder="Ex: Farmacologia - Antibióticos Beta-lactâmicos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
              className="text-lg h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-base">Conteúdo da Anotação *</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Digite sua anotação médica aqui... Use a barra de ferramentas para formatar o texto!"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Ex: farmacologia, antibióticos"
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
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isLoading}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4"
            />
            <Label htmlFor="favorite" className="cursor-pointer">
              ⭐ Marcar como favorita
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {isEditing ? 'Atualizar' : 'Criar'} Anotação
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

