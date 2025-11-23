'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Upload,
  Loader2,
  ArrowLeft,
  Trash2,
  Clock,
  MapPin,
  FileText,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calendarService } from '@/services/calendarService';
import { toast } from 'sonner';
import type { Calendar as CalendarType, CalendarEvent } from '@/types';
import { GoogleCalendarView } from '@/components/calendar/GoogleCalendarView';
import { EventFormDialog } from '@/components/calendar/EventFormDialog';

export default function CalendarPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    groupNumber: '',
    name: '',
    position: '',
    title: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCalendars();
    }
  }, [isAuthenticated, authLoading]);

  const loadCalendars = async () => {
    try {
      setIsLoading(true);
      const response = await calendarService.list();
      setCalendars(response.calendars);
    } catch (error) {
      console.error('Erro ao carregar calendários:', error);
      toast.error('Erro ao carregar calendários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith('.pdf') && !ext.endsWith('.xlsx') && !ext.endsWith('.xls')) {
        toast.error('Apenas arquivos PDF ou Excel (.xlsx, .xls) são permitidos');
        return;
      }
      setSelectedFile(file);
    }
  };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Selecione um arquivo PDF ou Excel');
            return;
        }

        if (!uploadData.groupNumber || !uploadData.name || !uploadData.position) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            setIsUploading(true);
            console.log('[CALENDAR-UPLOAD] Iniciando upload...');
            
            // Mostrar toast de progresso
            const progressToast = toast.loading('Processando calendário... Isso pode levar até 2 minutos.', {
                duration: Infinity,
            });
            
            const calendar = await calendarService.uploadCalendar(
                selectedFile,
                parseInt(uploadData.groupNumber),
                uploadData.name,
                uploadData.position,
                uploadData.title || undefined
            );

            toast.dismiss(progressToast);
            toast.success('Calendário processado com sucesso!');
            setShowUploadForm(false);
            setSelectedFile(null);
            setUploadData({ groupNumber: '', name: '', position: '', title: '' });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await loadCalendars();
        } catch (error: any) {
            console.error('Erro ao fazer upload:', error);
            const errorMessage = error.message || 'Erro ao processar calendário';
            
            // Mensagens mais amigáveis
            if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
                toast.error('O processamento demorou muito. Tente novamente ou use um arquivo menor.');
            } else if (errorMessage.includes('408')) {
                toast.error('Timeout ao processar. O arquivo pode estar muito grande. Tente novamente.');
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsUploading(false);
        }
    };

  const handleDelete = async (calendarId: string) => {
    if (!confirm('Deseja deletar este calendário?')) return;

    try {
      await calendarService.delete(calendarId);
      toast.success('Calendário deletado');
      await loadCalendars();
    } catch (error) {
      console.error('Erro ao deletar calendário:', error);
      toast.error('Erro ao deletar calendário');
    }
  };

  const handleAddEvent = (date: Date) => {
    // Encontrar o primeiro calendário que contém esta data
    const calendar = calendars.find((cal) => {
      const start = new Date(cal.start_date);
      const end = new Date(cal.end_date);
      return date >= start && date <= end;
    });
    
    if (calendar) {
      setSelectedCalendarId(calendar.id);
      setSelectedDate(date);
      setShowEventForm(true);
    } else {
      toast.error('Selecione um calendário que contenha esta data');
    }
  };

  const handleSaveEvent = async (eventData: {
    event_type: 'work' | 'on_call';
    event_date: string;
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    shift_type?: string;
    notes?: string;
  }) => {
    if (!selectedCalendarId) {
      toast.error('Calendário não selecionado');
      return;
    }

    try {
      await calendarService.createEvent(selectedCalendarId, eventData);
      toast.success('Evento adicionado com sucesso!');
      await loadCalendars();
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      toast.error(error.message || 'Erro ao criar evento');
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getDayName = (dayOfWeek?: string) => {
    const days: Record<string, string> = {
      Seg: 'Segunda',
      Ter: 'Terça',
      Qua: 'Quarta',
      Qui: 'Quinta',
      Sex: 'Sexta',
      Sáb: 'Sábado',
      Dom: 'Domingo',
    };
    return dayOfWeek ? days[dayOfWeek] || dayOfWeek : '';
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
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Calendário e Plantões</h1>
          </div>
          <Button onClick={() => setShowUploadForm(!showUploadForm)}>
            <Upload className="h-4 w-4 mr-2" />
            {showUploadForm ? 'Cancelar' : 'Upload Calendário'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Upload Form */}
        {showUploadForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload de Calendário</CardTitle>
              <CardDescription>
                Envie um PDF ou Excel (.xlsx) de calendário e informe seus dados para extração automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Arquivo (PDF ou Excel) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Número do Grupo *
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 7"
                    value={uploadData.groupNumber}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, groupNumber: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Posição na Lista *
                  </label>
                  <Input
                    placeholder="Ex: A1"
                    value={uploadData.position}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, position: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">
                    Nome Completo *
                  </label>
                  <Input
                    placeholder="Ex: Tatiana Minakami"
                    value={uploadData.name}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, name: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">
                    Título do Calendário (opcional)
                  </label>
                  <Input
                    placeholder="Ex: Calendário 11º Período"
                    value={uploadData.title}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, title: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Processar Calendário
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Calendars List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : calendars.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum calendário ainda
              </h3>
              <p className="text-muted-foreground mb-4">
                Faça upload de um PDF ou Excel de calendário para começar
              </p>
              <Button onClick={() => setShowUploadForm(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Calendário
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {calendars.map((calendar) => {
              const workDays = calendar.events.filter((e) => e.event_type === 'work');
              const onCallShifts = calendar.events.filter((e) => e.event_type === 'on_call');

              return (
                <Card key={calendar.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{calendar.title}</CardTitle>
                        <CardDescription>
                          {calendar.group_number && (
                            <>Grupo {calendar.group_number}</>
                          )}
                          {calendar.group_number && calendar.position_in_list && (
                            <> • </>
                          )}
                          {calendar.position_in_list && (
                            <>Posição {calendar.position_in_list}</>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(calendar.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {workDays.length} Dias de Trabalho
                        </Badge>
                      </div>
                      <div>
                        <Badge variant="destructive" className="mb-2">
                          {onCallShifts.length} Plantões
                        </Badge>
                      </div>
                    </div>

                    {/* Visualização estilo Google Calendar */}
                    <div className="mb-6">
                      <GoogleCalendarView
                        events={calendar.events}
                        calendarStartDate={calendar.start_date}
                        calendarEndDate={calendar.end_date}
                        onAddEvent={handleAddEvent}
                        onEventClick={(event) => {
                          toast.info(
                            `${event.shift_type || event.location || 'Evento'} - ${
                              event.start_time && event.end_time
                                ? `${formatTime(event.start_time)} às ${formatTime(event.end_time)}`
                                : 'Sem horário definido'
                            }`
                          );
                        }}
                      />
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Dialog para adicionar evento */}
      <EventFormDialog
        open={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setSelectedDate(undefined);
          setSelectedCalendarId(null);
        }}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}

