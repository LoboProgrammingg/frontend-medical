'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Clock,
  Star,
  LogOut,
  Loader2,
  Plus,
  FileText,
  Bot
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notesService } from "@/services/notesService";
import type { Note } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNotes: 0,
    favoriteNotes: 0,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadNotes();
    }
  }, [isAuthenticated, authLoading]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await notesService.list({ page_size: 3 });
      setNotes(response.notes);
      setStats({
        totalNotes: response.total,
        favoriteNotes: response.notes.filter(n => n.is_favorite).length,
      });
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    } finally {
      setIsLoading(false);
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

  const getUserFirstName = () => {
    if (!user) return 'Usuário';
    const firstName = user.full_name.split(' ')[0];
    return firstName;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Limpo */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            <h1 className="text-xl font-semibold">Amorinha</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <ThemeToggle />
            <Link href="/dashboard/notes/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Anotação
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Olá, {getUserFirstName()}! 💙
          </h2>
          <p className="text-muted-foreground">
            {stats.totalNotes === 0 
              ? 'Comece sua jornada criando sua primeira anotação médica.' 
              : `Você tem ${stats.totalNotes} ${stats.totalNotes === 1 ? 'anotação' : 'anotações'} salvas.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold">{stats.totalNotes}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Favoritas</p>
                  <p className="text-2xl font-bold">{stats.favoriteNotes}</p>
                </div>
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">IA</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Link href="/dashboard/calendar">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plantão</p>
                    <p className="text-sm font-medium">Calendário</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Anotações Recentes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anotações Recentes</CardTitle>
                <Link href="/dashboard/notes">
                  <Button variant="ghost" size="sm">
                    Ver todas
                  </Button>
                </Link>
              </div>
              <CardDescription>Suas últimas anotações de estudo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Nenhuma anotação ainda
                  </p>
                  <Link href="/dashboard/notes/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Anotação
                    </Button>
                  </Link>
                </div>
              ) : (
                notes.map((note) => (
                  <Link key={note.id} href={`/dashboard/notes/${note.id}`}>
                    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-1">{note.title}</h3>
                        {note.is_favorite && (
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="currentColor" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {note.content.replace(/<[^>]*>/g, ' ').substring(0, 100)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {note.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.updated_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <div className="space-y-4">
            <Link href="/dashboard/chat">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">Assistente IA</CardTitle>
                  <CardDescription>
                    Tire dúvidas médicas com IA
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/notes">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <BookOpen className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">Anotações</CardTitle>
                  <CardDescription>
                    Organize seu conhecimento
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/documents">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">Documentos RAG</CardTitle>
                  <CardDescription>
                    Adicionar PDFs à IA
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/calendar">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">Calendário</CardTitle>
                  <CardDescription>
                    Gerencie seus plantões e dias de trabalho
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/gems">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <Bot className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">Gems</CardTitle>
                  <CardDescription>
                    Crie IAs especializadas para propósitos médicos
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
