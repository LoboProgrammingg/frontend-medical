'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  X,
} from 'lucide-react';
import type { CalendarEvent } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoogleCalendarViewProps {
  events: CalendarEvent[];
  calendarStartDate: string;
  calendarEndDate: string;
  onAddEvent?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function GoogleCalendarView({
  events,
  calendarStartDate,
  calendarEndDate,
  onAddEvent,
  onEventClick,
}: GoogleCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Converter strings de data para Date
  const startDate = useMemo(() => new Date(calendarStartDate), [calendarStartDate]);
  const endDate = useMemo(() => new Date(calendarEndDate), [calendarEndDate]);

  // Ajustar o mês atual para estar dentro do período do calendário
  const monthStart = useMemo(() => {
    const month = startOfMonth(currentMonth);
    if (month < startDate) return startOfMonth(startDate);
    if (month > endDate) return startOfMonth(endDate);
    return month;
  }, [currentMonth, startDate, endDate]);

  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // Primeiro dia do mês (para alinhar com domingo)
  const firstDayOfMonth = getDay(monthStart);
  const daysBeforeMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Segunda = 0

  // Dias do mês anterior para preencher a primeira semana
  const previousMonthEnd = subMonths(monthStart, 1);
  const previousMonthDays = eachDayOfInterval({
    start: new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), previousMonthEnd.getDate() - daysBeforeMonth),
    end: new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), previousMonthEnd.getDate()),
  });

  // Dias do próximo mês para preencher a última semana
  const totalCells = 42; // 6 semanas * 7 dias
  const daysAfterMonth = totalCells - daysBeforeMonth - daysInMonth.length;
  const nextMonthStart = addMonths(monthStart, 1);
  const nextMonthDays = eachDayOfInterval({
    start: nextMonthStart,
    end: new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), daysAfterMonth),
  });

  // Organizar eventos por data
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const eventDate = new Date(event.event_date);
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const formatDateDDMM = (date: Date) => {
    return format(date, 'dd/MM', { locale: ptBR });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isInCalendarRange = (date: Date) => {
    return date >= startDate && date <= endDate;
  };

  const handlePreviousMonth = () => {
    const newMonth = subMonths(monthStart, 1);
    if (newMonth >= startOfMonth(startDate)) {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(monthStart, 1);
    if (newMonth <= startOfMonth(endDate)) {
      setCurrentMonth(newMonth);
    }
  };

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="w-full">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            disabled={subMonths(monthStart, 1) < startOfMonth(startDate)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">
            {format(monthStart, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={addMonths(monthStart, 1) > startOfMonth(endDate)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b bg-gray-50 dark:bg-gray-800">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do calendário */}
        <div className="grid grid-cols-7">
          {/* Dias do mês anterior */}
          {previousMonthDays.map((date) => (
            <div
              key={`prev-${date.toISOString()}`}
              className="min-h-[120px] border-r border-b last:border-r-0 bg-gray-50 dark:bg-gray-800/50 p-2"
            >
              <div className="text-xs text-gray-400 dark:text-gray-600">
                {formatDateDDMM(date)}
              </div>
            </div>
          ))}

          {/* Dias do mês atual */}
          {daysInMonth.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isCurrentDay = isToday(date);
            const inRange = isInCalendarRange(date);

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[120px] border-r border-b last:border-r-0 p-2 ${
                  isCurrentDay
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : inRange
                    ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                {/* Número do dia */}
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-sm font-medium ${
                      isCurrentDay
                        ? 'text-blue-600 dark:text-blue-400'
                        : inRange
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {formatDateDDMM(date)}
                  </div>
                  {onAddEvent && inRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => onAddEvent(date)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Eventos do dia */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`text-xs p-1 rounded cursor-pointer truncate ${
                        event.event_type === 'on_call'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                      }`}
                      title={`${event.shift_type || event.location || 'Evento'} ${
                        event.start_time && event.end_time
                          ? `- ${formatTime(event.start_time)} às ${formatTime(event.end_time)}`
                          : ''
                      }`}
                    >
                      <div className="font-medium truncate">
                        {event.shift_type || event.location || 'Evento'}
                      </div>
                      {event.start_time && (
                        <div className="text-[10px] opacity-75">
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Dias do próximo mês */}
          {nextMonthDays.map((date) => (
            <div
              key={`next-${date.toISOString()}`}
              className="min-h-[120px] border-r border-b last:border-r-0 bg-gray-50 dark:bg-gray-800/50 p-2"
            >
              <div className="text-xs text-gray-400 dark:text-gray-600">
                {formatDateDDMM(date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

