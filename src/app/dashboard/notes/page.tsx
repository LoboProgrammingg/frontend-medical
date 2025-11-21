'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  Loader2,
  Eye,
  ArrowLeft,
  FileText,
  Tag,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notesService } from '@/services/notesService';
import { toast } from 'sonner';
import type { Note } from '@/types';
import Link from 'next/link';

export default function NotesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadNotes();
    }
  }, [isAuthenticated, authLoading, filterFavorites]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await notesService.list({
        page_size: 100,
        is_favorite: filterFavorites ? true : undefined,
      });
      setNotes(response.notes);
    } catch (error) {
      toast.error('Erro ao carregar anotações');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (noteId: string, noteTitle: string) => {
    if (!confirm(`Tem certeza que deseja deletar "${noteTitle}"?`)) {
      return;
    }

    try {
      await notesService.delete(noteId);
      toast.success('Anotação deletada');
      loadNotes();
    } catch (error) {
      toast.error('Erro ao deletar');
      console.error(error);
    }
  };

  const handleEdit = (note: Note) => {
    router.push(`/dashboard/notes/${note.id}/edit`);
  };

  const handleView = (note: Note) => {
    router.push(`/dashboard/notes/${note.id}`);
  };

  const handleCreate = () => {
    router.push('/dashboard/notes/new');
  };

  const handleToggleFavorite = async (note: Note) => {
    try {
      await notesService.toggleFavorite(note.id, !note.is_favorite);
      toast.success(note.is_favorite ? 'Removida dos favoritos' : 'Adicionada aos favoritos');
      loadNotes();
    } catch (error) {
      toast.error('Erro ao atualizar');
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  const filteredNotes = notes.filter((note) => {
    const searchLower = search.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  if (authLoading || (isLoading && notes.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando anotações...</p>
        </div>
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
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Minhas Anotações</h1>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Anotação
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar anotações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={filterFavorites ? 'default' : 'outline'}
            onClick={() => setFilterFavorites(!filterFavorites)}
          >
            <Star className="h-4 w-4 mr-2" fill={filterFavorites ? 'currentColor' : 'none'} />
            {filterFavorites ? 'Todas' : 'Favoritas'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold">{notes.length}</p>
                </div>
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Favoritas</p>
                  <p className="text-2xl font-bold">{notes.filter((n) => n.is_favorite).length}</p>
                </div>
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Resultados</p>
                  <p className="text-2xl font-bold">{filteredNotes.length}</p>
                </div>
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tags</p>
                  <p className="text-2xl font-bold">{new Set(notes.flatMap((n) => n.tags)).size}</p>
                </div>
                <Tag className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma anotação encontrada</h2>
              <p className="text-muted-foreground mb-4">
                {search
                  ? 'Tente buscar com outros termos'
                  : 'Comece criando sua primeira anotação'}
              </p>
              {!search && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Anotação
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2 flex-1">{note.title}</CardTitle>
                    <button
                      onClick={() => handleToggleFavorite(note)}
                      className="flex-shrink-0 ml-2"
                    >
                      <Star
                        className="h-5 w-5 text-yellow-500"
                        fill={note.is_favorite ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content.replace(/<[^>]*>/g, ' ').substring(0, 150)}
                    {note.content.length > 150 && '...'}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(note.updated_at)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(note)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(note.id, note.title)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredNotes.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Mostrando {filteredNotes.length} de {notes.length} anotações
          </p>
        )}
      </main>
    </div>
  );
}
