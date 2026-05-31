'use client';

import React from 'react';
import { 
  ChevronLeft, ChevronRight, Clock, Plus, FileText, Calendar as CalendarIcon, PanelRight, Search, Mail
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

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [eventSearch, setEventSearch] = React.useState('');
  const [pendingMove, setPendingMove] = React.useState<{
    appId: string;
    originalStartTime: string;
    originalEndTime: string;
    newStartTime: string;
    newEndTime: string;
  } | null>(null);

  const handleNewAppointmentClick = () => {
    setSheetMode('new');
    setNewAppDate(currentCalendarDate.toISOString().slice(0, 10));
    setNewAppHour(9);
    if (clients.length > 0) setNewAppClientId(clients[0].id);
    if (services.length > 0) setNewAppServiceId(services[0].id);
    setIsSheetOpen(true);
  };

  const commitPendingMove = (sendNotification: boolean) => {
    if (!pendingMove) return;

    const app = appointments.find(a => a.id === pendingMove.appId);
    if (app && sendNotification) {
      const client = clients.find(c => c.id === app.clientId);
      const clientEmail = client?.email ? ` (${client.email})` : '';
      showToast(`Benachrichtigung an ${app.clientName}${clientEmail} wurde gesendet!`, 'success');
    }

    setPendingMove(null);
  };

  const revertPendingMove = () => {
    if (!pendingMove) return;

    setAppointments((prev: Appointment[]) => prev.map(a => {
      if (a.id === pendingMove.appId) {
        return {
          ...a,
          startTime: pendingMove.originalStartTime,
          endTime: pendingMove.originalEndTime
        };
      }
      return a;
    }));

    showToast('Terminänderung rückgängig gemacht.', 'info');
    setPendingMove(null);
  };

  const cancelPendingMove = () => {
    setPendingMove(null);
  };

  React.useEffect(() => {
    if (!pendingMove) return;

    const timer = setTimeout(() => {
      commitPendingMove(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [pendingMove]);

  // Helper Functions (Local Utilities)
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatAppTimeRange = (startTimeStr: string, durationMin: number) => {
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + durationMin * 60000);
    return `${start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getUpcomingEvents = () => {
    const todayStr = '2026-06-01';
    const tomorrowStr = '2026-06-02';
    
    const todayEvents: Appointment[] = [];
    const tomorrowEvents: Appointment[] = [];
    const upcomingEvents: Appointment[] = [];
    
    const filtered = appointments.filter(app => {
      if (!eventSearch) return true;
      const searchLower = eventSearch.toLowerCase();
      return (
        app.clientName.toLowerCase().includes(searchLower) ||
        app.serviceName.toLowerCase().includes(searchLower)
      );
    });

    const sorted = [...filtered].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    sorted.forEach(app => {
      const appDateStr = new Date(app.startTime).toISOString().slice(0, 10);
      if (appDateStr === todayStr) {
        todayEvents.push(app);
      } else if (appDateStr === tomorrowStr) {
        tomorrowEvents.push(app);
      } else if (appDateStr > tomorrowStr) {
        upcomingEvents.push(app);
      }
    });
    
    return { todayEvents, tomorrowEvents, upcomingEvents: upcomingEvents.slice(0, 5) };
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
    const visualDur = Math.max(45, dur);
    const heightPx = (visualDur / 60) * 88;

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

    const app = appointments.find(a => a.id === draggedAppId);
    if (!app) {
      setDraggedAppId(null);
      setDragOverSlot(null);
      return;
    }

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

    // Only update and prompt if the date/time has actually changed
    if (finalStart.getTime() !== origStart.getTime()) {
      const newStartISO = finalStart.toISOString();
      const newEndISO = newEnd.toISOString();

      // 1. Immediately update appointment in the UI
      setAppointments((prev: Appointment[]) => prev.map(a => {
        if (a.id === app.id) {
          return {
            ...a,
            startTime: newStartISO,
            endTime: newEndISO
          };
        }
        return a;
      }));

      // 2. Set pendingMove for the undo/email notification banner
      setPendingMove({
        appId: app.id,
        originalStartTime: app.startTime,
        originalEndTime: app.endTime,
        newStartTime: newStartISO,
        newEndTime: newEndISO
      });
    }

    setDraggedAppId(null);
    setDragOverSlot(null);
  };

  const handleMonthCellDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedAppId) return;

    const app = appointments.find(a => a.id === draggedAppId);
    if (!app) {
      setDraggedAppId(null);
      setDragOverSlot(null);
      return;
    }

    const origStart = new Date(app.startTime);
    const origEnd = new Date(app.endTime);
    const duration = origEnd.getTime() - origStart.getTime();

    const newStart = new Date(targetDate);
    newStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0);
    const newEnd = new Date(newStart.getTime() + duration);

    // Only update and prompt if the date/time has actually changed
    if (newStart.getTime() !== origStart.getTime()) {
      const newStartISO = newStart.toISOString();
      const newEndISO = newEnd.toISOString();

      // 1. Immediately update appointment in the UI
      setAppointments((prev: Appointment[]) => prev.map(a => {
        if (a.id === app.id) {
          return {
            ...a,
            startTime: newStartISO,
            endTime: newEndISO
          };
        }
        return a;
      }));

      // 2. Set pendingMove for the undo/email notification banner
      setPendingMove({
        appId: app.id,
        originalStartTime: app.startTime,
        originalEndTime: app.endTime,
        newStartTime: newStartISO,
        newEndTime: newEndISO
      });
    }

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
    <div className={`flex-grow overflow-y-auto hide-scrollbar pl-12 py-8 flex flex-col space-y-6 h-screen transition-all duration-300 ${
      isSidebarOpen ? 'pr-[368px]' : 'pr-12'
    }`}>
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

        {/* Segmented Picker & Toggle Sidebar */}
        <div className="flex items-center gap-3">
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

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isSidebarOpen 
                ? 'bg-[#003527] border-[#003527] text-white shadow-none' 
                : 'bg-white border-[#bfc9c3]/50 text-[#003527] hover:bg-zinc-50 shadow-none'
            }`}
            title={isSidebarOpen ? "Termine ausblenden" : "Termine einblenden"}
          >
            <PanelRight className="w-4 h-4" />
          </button>
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
            className="bg-white border border-[#bfc9c3]/40 rounded-2xl pt-0 pb-6 px-0 shadow-none overflow-x-auto hide-scrollbar"
          >
            {/* Header Row */}
            <div className="min-w-[600px] grid grid-cols-[80px_1fr] border-b border-[#bfc9c3]/20 bg-zinc-50/75 backdrop-blur-md rounded-t-2xl py-3 mb-0 sticky top-0 z-30">
              <div className="w-[80px]" />
              <div className="text-left pl-3 flex flex-col gap-0.5 select-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {currentCalendarDate.toLocaleDateString('de-DE', { weekday: 'long' })}
                </span>
                <span className="text-xl font-semibold text-[#003527]">
                  {currentCalendarDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="min-w-[600px] grid grid-cols-[80px_1fr] divide-x divide-zinc-200/50 relative">
              {/* Timeline column */}
              <div className="relative h-[704px] select-none pr-4">
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, idx) => (
                  <div 
                    key={time} 
                    className={`absolute right-4 text-[10px] font-bold text-zinc-400 ${
                      idx === 0 ? 'translate-y-1' : '-translate-y-1/2'
                    }`}
                    style={{ top: `${idx * 88}px` }}
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Content column */}
              <div className="relative h-[704px] w-full pl-0">
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
                          className={`absolute left-2 right-2 rounded-lg px-4 py-2 border select-none cursor-grab flex items-center justify-between overflow-hidden pointer-events-auto group ${
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
                          {/* Left: Service & Client inline */}
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <h4 className="font-extrabold text-xs tracking-tight truncate">{app.serviceName}</h4>
                            <span className="text-[10px] opacity-40 font-bold">•</span>
                            <p className="text-[10px] font-bold opacity-80 truncate">{app.clientName}</p>
                          </div>

                          {/* Right: Time, Resize badge, Invoice actions */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-[9px] font-extrabold flex items-center gap-1 opacity-90">
                              <Clock className="w-2.5 h-2.5 opacity-70" />
                              {formatAppTimeRange(app.startTime, dur)}
                            </span>
                            {isResizing && (
                              <span className="text-[9px] bg-[#003527] text-white px-1.5 py-0.5 rounded-full font-bold">
                                {dur} Min.
                              </span>
                            )}
                            <div className="flex items-center gap-1.5">
                              {appInvoice ? (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
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
                      const visualDur = Math.max(45, dur);
                      const heightPx = (visualDur / 60) * 88;

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
            className="bg-white border border-[#bfc9c3]/40 rounded-2xl pt-0 pb-6 px-0 shadow-none overflow-x-auto hide-scrollbar"
          >
            {/* Week Header Row */}
            <div className="min-w-[800px] grid grid-cols-[80px_repeat(5,1fr)] divide-x divide-zinc-200/50 border-b border-[#bfc9c3]/20 bg-zinc-50/75 backdrop-blur-md rounded-t-2xl mb-0 sticky top-0 z-30">
              <div className="w-[80px]" />
              {getWeekDays(currentCalendarDate).map((dayDate) => {
                const isToday = new Date().toDateString() === dayDate.toDateString();
                return (
                  <div key={dayDate.toISOString()} className="flex items-center justify-center gap-1.5 py-2.5 select-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {dayDate.toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
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

            <div className="min-w-[800px] grid grid-cols-[80px_repeat(5,1fr)] divide-x divide-zinc-200/50 relative">
              {/* Hours Column */}
              <div className="relative h-[704px] select-none pr-4">
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, idx) => (
                  <div 
                    key={time} 
                    className={`absolute right-4 text-[10px] font-bold text-zinc-400 ${
                      idx === 0 ? 'translate-y-1' : '-translate-y-1/2'
                    }`}
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
                          const visualDur = Math.max(45, dur);
                          const heightPx = (visualDur / 60) * 88;

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
    
      {/* Right Side: Upcoming Events Sidebar (100vh full-height panel with Framer Motion slide in/out) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: 320, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0.8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-[#bfc9c3]/30 flex flex-col z-40 shadow-none"
          >
            {/* Sidebar Header (Matches Patients List layout style) */}
            <div className="p-6 pt-8 space-y-4 border-b border-[#bfc9c3]/20 flex-shrink-0 bg-white">
              <div className="flex justify-between items-center select-none">
                {(() => {
                  const { todayEvents, tomorrowEvents, upcomingEvents } = getUpcomingEvents();
                  const count = todayEvents.length + tomorrowEvents.length + upcomingEvents.length;
                  return <h3 className="text-sm font-bold text-[#003527]">Anstehende Termine ({count})</h3>;
                })()}
                <button
                  onClick={handleNewAppointmentClick}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-[#003527] hover:bg-[#003527]/5 transition-all cursor-pointer animate-fade-in"
                  title="Termin anlegen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Termin suchen..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full bg-[#f3f4f3] focus:bg-white border border-[#bfc9c3]/30 focus:border-[#003527]/60 focus:ring-1 focus:ring-[#003527]/60 rounded-xl pl-9 pr-4 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto py-5 space-y-6 hide-scrollbar">
              {(() => {
                const { todayEvents, tomorrowEvents, upcomingEvents } = getUpcomingEvents();
                
                const renderEventCard = (app: Appointment) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppointment(app);
                      setSheetMode('edit');
                      setIsSheetOpen(true);
                    }}
                    className="flex items-center gap-3 p-3 bg-zinc-50 hover:bg-zinc-100/70 border border-[#bfc9c3]/20 rounded-xl transition-all cursor-pointer select-none text-left"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      app.status === 'booked' 
                        ? 'bg-amber-500' 
                        : app.status === 'confirmed' 
                        ? 'bg-blue-500' 
                        : app.status === 'noshow' 
                        ? 'bg-emerald-500' 
                        : 'bg-rose-500'
                    }`} />
                    <div className="min-w-0 flex-grow">
                      <h5 className="font-extrabold text-xs text-[#003527] leading-tight truncate">{app.serviceName}</h5>
                      <p className="text-[10px] font-bold text-zinc-400 mt-0.5 truncate">{app.clientName}</p>
                      <p className="text-[9px] font-bold text-zinc-500 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-zinc-400" />
                        {formatTime(app.startTime)} - {formatTime(app.endTime)}
                      </p>
                    </div>
                  </div>
                );

                const hasAnyEvents = todayEvents.length > 0 || tomorrowEvents.length > 0 || upcomingEvents.length > 0;

                if (!hasAnyEvents) {
                  return (
                    <div className="text-xs text-zinc-400 font-semibold italic text-center py-8">
                      Keine anstehenden Termine
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Today */}
                    {todayEvents.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-4 mb-2 select-none">Heute</h5>
                        <div className="space-y-2 px-4">
                          {todayEvents.map(renderEventCard)}
                        </div>
                      </div>
                    )}

                    {/* Tomorrow */}
                    {tomorrowEvents.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-4 mb-2 select-none">Morgen</h5>
                        <div className="space-y-2 px-4">
                          {tomorrowEvents.map(renderEventCard)}
                        </div>
                      </div>
                    )}

                    {/* Upcoming */}
                    {upcomingEvents.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-4 mb-2 select-none">Demnächst</h5>
                        <div className="space-y-2 px-4">
                          {upcomingEvents.map(renderEventCard)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Apple-Style Toast Banner for Rescheduling Notification & Undo */}
      <AnimatePresence>
        {pendingMove && (() => {
          const app = appointments.find(a => a.id === pendingMove.appId);
          if (!app) return null;
          const client = clients.find(c => c.id === app.clientId);

          const newStart = new Date(pendingMove.newStartTime);
          const formattedDate = newStart.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
          const formattedTime = newStart.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 z-50 flex flex-col bg-white/95 backdrop-blur-xl border border-[#bfc9c3]/30 w-full max-w-sm rounded-2xl shadow-[0_12px_45px_rgba(0,53,39,0.14)] p-5 select-none overflow-hidden m-4 transition-all duration-300 ${
                isSidebarOpen ? 'right-[344px]' : 'right-6'
              }`}
            >
              {/* Header and Details */}
              <div className="text-center mb-4">
                <div className="mx-auto w-10 h-10 rounded-full bg-[#003527]/5 flex items-center justify-center text-[#003527] mb-2.5">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-[#003527] px-2 leading-snug">
                  Terminbestätigung per E-Mail an <span className="font-extrabold">{app.clientName}</span> senden?
                </h4>
                <div className="text-[10px] text-zinc-400 font-semibold bg-zinc-50 border border-zinc-100 rounded-lg p-2 mt-2.5 inline-block">
                  Neuer Termin: {formattedDate} um {formattedTime} Uhr
                </div>
              </div>
              
              {/* Buttons Stack (macOS style layout stacked vertically) */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => commitPendingMove(true)}
                  className="w-full bg-[#003527] hover:bg-[#003527]/90 text-white text-xs font-bold rounded-xl py-2.5 transition-all cursor-pointer active:scale-95"
                >
                  Senden
                </button>
                <button
                  onClick={() => commitPendingMove(false)}
                  className="w-full bg-[#f3f4f3] hover:bg-zinc-100 border border-[#bfc9c3]/30 text-[#003527] text-xs font-bold rounded-xl py-2.5 transition-all cursor-pointer active:scale-95"
                >
                  Nicht senden
                </button>
                <button
                  onClick={revertPendingMove}
                  className="w-full text-zinc-400 hover:text-[#003527] text-[10px] font-bold py-1.5 transition-colors cursor-pointer text-center"
                >
                  Widerrufen
                </button>
              </div>

              {/* Progress Countdown Line */}
              <motion.div
                key={pendingMove.appId} // forces resetting progress bar when a new drop occurs
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: 6, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-0.5 bg-[#003527]/30"
              />
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
