'use client';

import React from 'react';
import { 
  ChevronLeft, ChevronRight, Clock, Plus, FileText, Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { Appointment } from '@/lib/types';

export default function CalendarPage() {
  const {
    clients,
    services,
    appointments,
    setAppointments,
    invoices,
    currentCalendarDate,
    setCurrentCalendarDate,
    calendarView,
    setCalendarView,
    draggedAppId,
    setDraggedAppId,
    dragOverSlot,
    setDragOverSlot,
    resizingAppId,
    setResizingAppId,
    tempDuration,
    setTempDuration,
    startResizing,
    setSelectedAppointment,
    setSheetMode,
    setIsSheetOpen,
    openNewInvoiceSheetWithPrefill,
    handleContextMenu,
    showToast,
    setNewAppDate,
    setNewAppHour,
    setNewAppClientId,
    setNewAppServiceId
  } = useDashboard();

  // Helper Functions (Local Utilities)
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatAppTimeRange = (startTimeStr: string, durationMin: number) => {
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + durationMin * 60000);
    const startStr = start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  const getWeekDays = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getMonthDaysGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const grid = [];
    const prevMonthEnd = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      grid.push({ date: new Date(year, month - 1, prevMonthEnd - i), isCurrentMonth: false });
    }
    const currentMonthEnd = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= currentMonthEnd; i++) {
      grid.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const totalCells = Math.ceil(grid.length / 7) * 7;
    const nextMonthPadding = totalCells - grid.length;
    for (let i = 1; i <= nextMonthPadding; i++) {
      grid.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return grid;
  };

  const isSameDay = (d1: Date, d2Str: string) => {
    const d2 = new Date(d2Str);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getAppointmentStyle = (app: Appointment) => {
    const start = new Date(app.startTime);
    const end = new Date(app.endTime);
    const hours = start.getHours();
    const minutes = start.getMinutes();

    const minutesSince09 = (hours - 9) * 60 + minutes;
    const dur = resizingAppId === app.id && tempDuration !== null 
      ? tempDuration 
      : Math.round((end.getTime() - start.getTime()) / 60000);

    const topPx = (minutesSince09 / 60) * 88;
    const heightPx = (dur / 60) * 88;

    return {
      top: `${topPx + 6}px`,
      height: `${heightPx - 12}px`
    };
  };

  const handleCellClick = (dateStr: string, hour: number) => {
    setSheetMode('new');
    setNewAppDate(dateStr);
    setNewAppHour(hour);
    if (clients.length > 0) setNewAppClientId(clients[0].id);
    if (services.length > 0) setNewAppServiceId(services[0].id);
    setIsSheetOpen(true);
  };

  const handlePrevDate = () => {
    const d = new Date(currentCalendarDate);
    if (calendarView === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() - 7);
    } else if (calendarView === 'month') {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentCalendarDate(d);
  };

  const handleNextDate = () => {
    const d = new Date(currentCalendarDate);
    if (calendarView === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() + 7);
    } else if (calendarView === 'month') {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentCalendarDate(d);
  };

  const handleToday = () => {
    setCurrentCalendarDate(new Date('2026-06-01'));
  };

  const getCalendarTitleText = () => {
    const days = getWeekDays(currentCalendarDate);
    const startStr = days[0].toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
    const endStr = days[4].toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

    if (calendarView === 'day') {
      return currentCalendarDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    } else if (calendarView === 'week') {
      return `Woche: ${startStr} - ${endStr}`;
    } else {
      return currentCalendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    }
  };

  const handleDrop = (targetDateStr: string, targetHour: number) => {
    if (!draggedAppId) return;

    setAppointments((prev: Appointment[]) => prev.map(app => {
      if (app.id === draggedAppId) {
        const origStart = new Date(app.startTime);
        const origEnd = new Date(app.endTime);
        const duration = origEnd.getTime() - origStart.getTime();

        const newStart = new Date(targetDateStr);
        newStart.setHours(targetHour, 0, 0, 0);

        // Clamping to not run past 17:00
        const durationMins = duration / 60000;
        let finalStart = newStart;
        if (targetHour * 60 + durationMins > 17 * 60) {
          const shiftMinutes = (targetHour * 60 + durationMins) - 17 * 60;
          finalStart = new Date(newStart.getTime() - shiftMinutes * 60000);
        }

        const newEnd = new Date(finalStart.getTime() + duration);

        return {
          ...app,
          startTime: finalStart.toISOString(),
          endTime: newEnd.toISOString()
        };
      }
      return app;
    }));

    setDraggedAppId(null);
    setDragOverSlot(null);
  };

  const handleMonthCellDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedAppId) return;

    setAppointments((prev: Appointment[]) => prev.map(app => {
      if (app.id === draggedAppId) {
        const origStart = new Date(app.startTime);
        const origEnd = new Date(app.endTime);
        const duration = origEnd.getTime() - origStart.getTime();

        const newStart = new Date(targetDate);
        newStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0);
        const newEnd = new Date(newStart.getTime() + duration);

        return {
          ...app,
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString()
        };
      }
      return app;
    }));

    setDraggedAppId(null);
    setDragOverSlot(null);
  };

  const handleResizeStart = (e: React.MouseEvent, app: Appointment) => {
    e.preventDefault();
    e.stopPropagation();

    const start = new Date(app.startTime);
    const end = new Date(app.endTime);
    const dur = Math.round((end.getTime() - start.getTime()) / 60000);
    
    startResizing(app.id, e.clientY, dur);
  };

  return (
    <div className="flex-grow overflow-y-auto px-12 py-8 flex flex-col space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex border border-[#bfc9c3]/50 rounded-xl overflow-hidden bg-white">
            <button 
              onClick={handlePrevDate}
              className="p-2.5 text-[#003527] hover:bg-zinc-50 border-r border-[#bfc9c3]/50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleToday}
              className="px-4 py-2 text-xs font-bold text-[#003527] hover:bg-zinc-50 border-r border-[#bfc9c3]/50 transition-colors cursor-pointer"
            >
              Heute
            </button>
            <button 
              onClick={handleNextDate}
              className="p-2.5 text-[#003527] hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <h3 className="text-sm font-bold text-[#043F2D] pl-2">{getCalendarTitleText()}</h3>
        </div>

        {/* Segmented Picker */}
        <div className="bg-zinc-200/50 p-1 rounded-2xl flex border border-zinc-200/20 select-none">
          {(['day', 'week', 'month'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                calendarView === view 
                  ? 'bg-white text-[#003527] border border-[#bfc9c3]/30' 
                  : 'text-zinc-500 hover:text-[#003527]'
              }`}
            >
              {view === 'day' && 'Tag'}
              {view === 'week' && 'Woche'}
              {view === 'month' && 'Monat'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View Renders */}
      <AnimatePresence mode="wait">
        
        {/* DAY VIEW */}
        {calendarView === 'day' && (
          <motion.div
            key="day-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-[#bfc9c3]/40 rounded-2xl py-6 px-0 shadow-none overflow-x-auto"
          >
            {/* Header Row */}
            <div className="min-w-[600px] grid grid-cols-6 border-b border-[#bfc9c3]/20 pb-4 mb-6">
              <div className="col-span-1" />
              <div className="col-span-5 text-left pl-3 flex flex-col gap-1 select-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {currentCalendarDate.toLocaleDateString('de-DE', { weekday: 'long' })}
                </span>
                <span className="text-xl font-semibold text-[#003527]">
                  {currentCalendarDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="min-w-[600px] grid grid-cols-6 divide-x divide-zinc-200/50 relative">
              {/* Timeline column */}
              <div className="col-span-1 relative h-[704px] select-none pr-4">
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, idx) => (
                  <div 
                    key={time} 
                    className="absolute right-4 text-[10px] font-bold text-zinc-400 -translate-y-1/2"
                    style={{ top: `${idx * 88}px` }}
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Content column */}
              <div className="col-span-5 relative h-[704px] w-full pl-0">
                <div className="absolute inset-y-0 left-0 right-0 divide-y divide-zinc-100 flex flex-col pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-[88px]" />
                  ))}
                </div>

                <div className="absolute inset-y-0 left-0 right-0 grid grid-rows-8">
                  {Array.from({ length: 8 }).map((_, hourIdx) => {
                    const hour = hourIdx + 9;
                    const dateStr = currentCalendarDate.toISOString().slice(0, 10);
                    return (
                      <div
                        key={hour}
                        onClick={() => handleCellClick(dateStr, hour)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => setDragOverSlot({ dateStr, hour })}
                        className="h-[88px] hover:bg-[#003527]/3 transition-colors cursor-pointer"
                      />
                    );
                  })}
                </div>

                <div className="absolute inset-y-0 left-0 right-0 pointer-events-none">
                  {appointments
                    .filter(app => isSameDay(currentCalendarDate, app.startTime))
                    .map((app) => {
                      const isDragging = draggedAppId === app.id;
                      const isResizing = resizingAppId === app.id;
                      const dur = isResizing && tempDuration !== null ? tempDuration : Math.round((new Date(app.endTime).getTime() - new Date(app.startTime).getTime()) / 60000);
                      const appInvoice = invoices.find(inv => inv.appointmentId === app.id);
                      
                      return (
                        <div
                          key={app.id}
                          draggable={!isResizing}
                          onDragStart={() => setDraggedAppId(app.id)}
                          onDragEnd={() => { setDraggedAppId(null); setDragOverSlot(null); }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(app);
                            setSheetMode('edit');
                            setIsSheetOpen(true);
                          }}
                          style={getAppointmentStyle(app)}
                          className={`absolute left-2 right-2 rounded-lg p-4 border select-none cursor-grab flex flex-col justify-between overflow-hidden pointer-events-auto group ${
                            isDragging ? 'opacity-40 shadow-none' : 'hover:scale-[1.01]'
                          } ${
                            isResizing ? 'z-30 cursor-ns-resize ring-2 ring-[#003527]' : 'z-10'
                          } ${
                            isResizing || isDragging ? '' : 'transition-all duration-200 ease-out'
                          } ${
                            app.status === 'booked' 
                              ? 'bg-amber-50/90 border-amber-200/60 text-amber-900' 
                              : app.status === 'confirmed' 
                              ? 'bg-blue-50/90 border-blue-200/60 text-blue-900'
                              : app.status === 'noshow' 
                              ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900' 
                              : 'bg-rose-50/90 border-rose-200/60 text-rose-900'
                          } shadow-none`}
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-extrabold text-xs tracking-tight">{app.serviceName}</h4>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {appInvoice ? (
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Action menu routing
                                      showToast('Rechnungsdetails geladen.', 'info');
                                    }}
                                    className={`p-1 rounded border flex items-center justify-center cursor-pointer ${
                                      appInvoice.status === 'paid'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : appInvoice.status === 'overdue'
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                    }`}
                                    title={`Rechnung: ${appInvoice.invoiceNumber} (${appInvoice.status === 'paid' ? 'Bezahlt' : appInvoice.status === 'overdue' ? 'Überfällig' : 'Offen'})`}
                                  >
                                    <FileText className="w-2.5 h-2.5" />
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openNewInvoiceSheetWithPrefill({
                                        clientId: app.clientId,
                                        amount: app.price,
                                        appointmentId: app.id,
                                        clientName: app.clientName,
                                        date: app.startTime.slice(0, 10)
                                      });
                                    }}
                                    className="opacity-20 hover:opacity-100 p-1 bg-white hover:bg-zinc-100 border border-[#bfc9c3]/40 rounded text-[#003527] transition-all cursor-pointer flex items-center justify-center shadow-none"
                                    title="Rechnung erstellen"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] font-semibold mt-1 opacity-80 text-left">{app.clientName}</p>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] font-extrabold flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatAppTimeRange(app.startTime, dur)}
                            </span>
                            {isResizing && (
                              <span className="text-[9px] bg-[#003527] text-white px-1.5 py-0.5 rounded-full font-bold">
                                {dur} Min.
                              </span>
                            )}
                          </div>

                          <div 
                            onMouseDown={(e) => handleResizeStart(e, app)}
                            className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center z-20 group-hover:bg-[#003527]/5"
                          >
                            <div className="w-8 h-1 bg-[#003527]/20 rounded-full group-hover:bg-[#003527]/40" />
                          </div>
                        </div>
                      );
                    })}

                  {draggedAppId && dragOverSlot && isSameDay(currentCalendarDate, dragOverSlot.dateStr) && (
                    (() => {
                      const draggedApp = appointments.find(a => a.id === draggedAppId);
                      if (!draggedApp) return null;
                      const dur = Math.round((new Date(draggedApp.endTime).getTime() - new Date(draggedApp.startTime).getTime()) / 60000);
                      
                      const topPx = (dragOverSlot.hour - 9) * 88;
                      const heightPx = (dur / 60) * 88;

                      return (
                        <div
                          style={{ top: `${topPx + 6}px`, height: `${heightPx - 12}px` }}
                          className="absolute left-2 right-2 rounded-lg border-2 border-dashed border-[#003527]/30 bg-[#003527]/5 flex flex-col justify-between p-4 z-20"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-[#003527]/60">{draggedApp.serviceName}</h4>
                            <p className="text-[10px] text-zinc-400 font-semibold mt-1">{draggedApp.clientName}</p>
                          </div>
                          <span className="text-[9px] font-bold text-[#003527]/70">
                            Verschieben nach: {dragOverSlot.hour}:00 ({dur} Min)
                          </span>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* WEEK VIEW */}
        {calendarView === 'week' && (
          <motion.div
            key="week-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-[#bfc9c3]/40 rounded-2xl py-6 px-0 shadow-none overflow-x-auto"
          >
            {/* Week Header Row */}
            <div className="min-w-[800px] grid grid-cols-6 border-b border-[#bfc9c3]/20 pb-4 mb-6">
              <div className="col-span-1" />
              {getWeekDays(currentCalendarDate).map((dayDate) => {
                const isToday = new Date().toDateString() === dayDate.toDateString();
                return (
                  <div key={dayDate.toISOString()} className="col-span-1 flex flex-col items-center gap-1 select-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {dayDate.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className={`text-base font-semibold w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isToday 
                        ? 'text-white bg-[#003527]' 
                        : 'text-[#043F2D] hover:bg-zinc-100'
                    }`}>
                      {dayDate.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="min-w-[800px] grid grid-cols-6 divide-x divide-zinc-200/50 relative">
              {/* Hours Column */}
              <div className="col-span-1 relative h-[704px] select-none pr-4">
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, idx) => (
                  <div 
                    key={time} 
                    className="absolute right-4 text-[10px] font-bold text-zinc-400 -translate-y-1/2"
                    style={{ top: `${idx * 88}px` }}
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {getWeekDays(currentCalendarDate).map((dayDate) => {
                const dateStr = dayDate.toISOString().slice(0, 10);
                const isOverThisDay = dragOverSlot && dragOverSlot.dateStr === dateStr;

                return (
                  <div 
                    key={dateStr} 
                    className="relative h-[704px] w-full"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(dateStr, dragOverSlot?.hour || 9)}
                  >
                    {/* Background Slots */}
                    <div className="absolute inset-0 divide-y divide-zinc-100 flex flex-col pointer-events-none">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[88px]" />
                      ))}
                    </div>

                    {/* Interactive cell overlay slots */}
                    <div className="absolute inset-0 grid grid-rows-8">
                      {Array.from({ length: 8 }).map((_, hourIdx) => {
                        const hour = hourIdx + 9;
                        return (
                          <div
                            key={hour}
                            onClick={() => handleCellClick(dateStr, hour)}
                            onDragEnter={() => setDragOverSlot({ dateStr, hour })}
                            className="h-[88px] hover:bg-[#003527]/3 transition-colors cursor-pointer"
                          />
                        );
                      })}
                    </div>

                    {/* Foreground Appointments Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {appointments
                        .filter(app => isSameDay(dayDate, app.startTime))
                        .map((app) => {
                          const isDragging = draggedAppId === app.id;
                          const isResizing = resizingAppId === app.id;
                          const dur = isResizing && tempDuration !== null ? tempDuration : Math.round((new Date(app.endTime).getTime() - new Date(app.startTime).getTime()) / 60000);
                          const appInvoice = invoices.find(inv => inv.appointmentId === app.id);

                          return (
                            <div
                              key={app.id}
                              draggable={!isResizing}
                              onDragStart={() => setDraggedAppId(app.id)}
                              onDragEnd={() => { setDraggedAppId(null); setDragOverSlot(null); }}
                              onContextMenu={(e) => handleContextMenu(e, app)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(app);
                                setSheetMode('edit');
                                setIsSheetOpen(true);
                              }}
                              style={getAppointmentStyle(app)}
                              className={`absolute left-1 inset-x-1 rounded-lg p-2.5 border select-none cursor-grab flex flex-col justify-between overflow-hidden pointer-events-auto group ${
                                isDragging ? 'opacity-40 shadow-none' : 'hover:scale-[1.01]'
                              } ${
                                isResizing ? 'z-30 cursor-ns-resize ring-2 ring-[#003527]' : 'z-10'
                              } ${
                                isResizing || isDragging ? '' : 'transition-all duration-200 ease-out'
                              } ${
                                app.status === 'booked' 
                                  ? 'bg-amber-50/90 border-amber-200/60 text-amber-900' 
                                  : app.status === 'confirmed' 
                                  ? 'bg-blue-50/90 border-blue-200/60 text-blue-900'
                                  : app.status === 'noshow' 
                                  ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900' 
                                  : 'bg-rose-50/90 border-rose-200/60 text-rose-900'
                              } shadow-none`}
                            >
                              <div>
                                <div className="flex justify-between items-start">
                                  <div className="flex-grow">
                                    <h4 className="font-extrabold text-[10px] tracking-tight leading-tight line-clamp-1">{app.serviceName}</h4>
                                    <p className="text-[9px] font-semibold opacity-75 mt-0.5 text-left">{app.clientName}</p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                    {appInvoice ? (
                                      <span 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showToast('Rechnungsdetails geladen.', 'info');
                                        }}
                                        className={`p-0.5 rounded border flex items-center justify-center cursor-pointer ${
                                          appInvoice.status === 'paid'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : appInvoice.status === 'overdue'
                                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                                            : 'bg-amber-50 border-amber-200 text-amber-800'
                                        }`}
                                        title={`Rechnung: ${appInvoice.invoiceNumber} (${appInvoice.status === 'paid' ? 'Bezahlt' : appInvoice.status === 'overdue' ? 'Überfällig' : 'Offen'})`}
                                      >
                                        <FileText className="w-2 h-2" />
                                      </span>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openNewInvoiceSheetWithPrefill({
                                            clientId: app.clientId,
                                            amount: app.price,
                                            appointmentId: app.id,
                                            clientName: app.clientName,
                                            date: app.startTime.slice(0, 10)
                                          });
                                        }}
                                        className="opacity-20 hover:opacity-100 p-0.5 bg-white hover:bg-zinc-100 border border-[#bfc9c3]/40 rounded text-[#003527] transition-all cursor-pointer flex items-center justify-center shadow-none"
                                        title="Rechnung erstellen"
                                      >
                                        <Plus className="w-2 h-2" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center text-[8px] font-bold">
                                <span className="flex items-center gap-0.5 opacity-80">
                                  <Clock className="w-2 h-2" />
                                  {formatAppTimeRange(app.startTime, dur)}
                                </span>
                                {isResizing && (
                                  <span className="bg-[#003527] text-white px-1 py-0.2 rounded font-bold">{dur} Min.</span>
                                )}
                              </div>

                              <div 
                                onMouseDown={(e) => handleResizeStart(e, app)}
                                className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center z-20 group-hover:bg-[#003527]/5"
                              >
                                <div className="w-6 h-0.5 bg-[#003527]/20 rounded-full group-hover:bg-[#003527]/40" />
                              </div>
                            </div>
                          );
                        })}

                      {isOverThisDay && draggedAppId && (
                        (() => {
                          const draggedApp = appointments.find(a => a.id === draggedAppId);
                          if (!draggedApp) return null;
                          const dur = Math.round((new Date(draggedApp.endTime).getTime() - new Date(draggedApp.startTime).getTime()) / 60000);
                          
                          const topPx = ((dragOverSlot?.hour || 9) - 9) * 88;
                          const heightPx = (dur / 60) * 88;

                          return (
                            <div
                              style={{ top: `${topPx + 6}px`, height: `${heightPx - 12}px` }}
                              className="absolute left-1 right-1 rounded-lg border-2 border-dashed border-[#003527]/30 bg-[#003527]/5 flex flex-col justify-between p-2 z-20"
                            >
                              <h4 className="font-bold text-[9px] text-[#003527]/60 truncate">{draggedApp.serviceName}</h4>
                              <span className="text-[8px] font-bold text-[#003527]/70">
                                {formatAppTimeRange(new Date(dayDate).setHours(dragOverSlot?.hour || 9, 0, 0, 0).toString(), dur)}
                              </span>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* MONTH VIEW */}
        {calendarView === 'month' && (
          <motion.div
            key="month-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden grid grid-cols-7 gap-[1px]"
          >
            {/* Day Headers */}
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="bg-[#f3f4f3] py-2 text-center text-[10px] font-bold text-zinc-400 select-none">
                {day}
              </div>
            ))}

            {/* Month Cell Grid */}
            {getMonthDaysGrid(currentCalendarDate).map(({ date, isCurrentMonth }, idx) => {
              const dayApps = appointments.filter(app => isSameDay(date, app.startTime));
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentCalendarDate(date);
                    setCalendarView('day');
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleMonthCellDrop(e, date)}
                  className={`bg-white min-h-[100px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-[#f9f9f8] ${
                    isCurrentMonth ? '' : 'text-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold ${
                      isToday 
                        ? 'bg-[#003527] text-white w-5 h-5 rounded-full flex items-center justify-center font-sans' 
                        : isCurrentMonth ? 'text-[#043F2D]' : 'text-zinc-300 font-medium'
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1 mt-2">
                    {dayApps.map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedAppId(app.id);
                        }}
                        onDragEnd={() => setDraggedAppId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(app);
                          setSheetMode('edit');
                          setIsSheetOpen(true);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold truncate border text-left ${
                          app.status === 'booked' 
                            ? 'bg-amber-50/70 border-amber-200/50 text-amber-800' 
                            : app.status === 'confirmed' 
                            ? 'bg-blue-50/70 border-blue-200/50 text-blue-800'
                            : app.status === 'noshow' 
                            ? 'bg-emerald-50/70 border-emerald-200/50 text-emerald-800' 
                            : 'bg-rose-50/70 border-rose-200/50 text-rose-800'
                        }`}
                      >
                        {formatTime(app.startTime)} {app.clientName.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
