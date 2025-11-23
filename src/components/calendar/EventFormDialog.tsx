'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Select component - usando select nativo por enquanto
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: {
    event_type: 'work' | 'on_call';
    event_date: string;
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    shift_type?: string;
    notes?: string;
  }) => Promise<void>;
  selectedDate?: Date;
}

const dayNames: Record<string, string> = {
  'Segunda': 'Seg',
  'Terça': 'Ter',
  'Quarta': 'Qua',
  'Quinta': 'Qui',
  'Sexta': 'Sex',
  'Sábado': 'Sáb',
  'Domingo': 'Dom',
};

export function EventFormDialog({
  open,
  onClose,
  onSave,
  selectedDate,
}: EventFormDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    event_type: 'work' as 'work' | 'on_call',
    event_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    day_of_week: selectedDate ? dayNames[format(selectedDate, 'EEEE', { locale: ptBR })] : '',
    start_time: '',
    end_time: '',
    location: '',
    shift_type: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        event_date: format(selectedDate, 'yyyy-MM-dd'),
        day_of_week: dayNames[format(selectedDate, 'EEEE', { locale: ptBR })] || '',
      }));
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
      // Reset form
      setFormData({
        event_type: 'work',
        event_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        day_of_week: selectedDate ? dayNames[format(selectedDate, 'EEEE', { locale: ptBR })] : '',
        start_time: '',
        end_time: '',
        location: '',
        shift_type: '',
        notes: '',
      });
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Evento</DialogTitle>
          <DialogDescription>
            {selectedDate && `Data: ${format(selectedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="event_type">Tipo de Evento *</Label>
            <select
              id="event_type"
              value={formData.event_type}
              onChange={(e) =>
                setFormData({ ...formData, event_type: e.target.value as 'work' | 'on_call' })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="work">Trabalho</option>
              <option value="on_call">Plantão</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Horário Início</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_time">Horário Fim</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: UPA1, UPA2, HERSO"
            />
          </div>

          <div>
            <Label htmlFor="shift_type">Tipo de Turno</Label>
            <Input
              id="shift_type"
              value={formData.shift_type}
              onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
              placeholder="Ex: Sala Vermelha, Global, Plantão Cinderela"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre este evento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

