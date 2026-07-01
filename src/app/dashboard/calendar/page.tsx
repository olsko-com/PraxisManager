'use client';

import React from 'react';
import { 
  ChevronLeft, ChevronRight, Clock, Plus, FileText, Calendar as CalendarIcon, PanelRight, Search, Mail, RotateCcw, ChevronUp, MessageSquare, Edit2, X, Filter
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
    setNewAppServiceId,
    selectedClientId,
    setSelectedClientId,
    selectedMailAppointmentId,
    setSelectedMailAppointmentId,
    isMailModalOpen,
    setIsMailModalOpen
  } = useDashboard();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const touchStartTimeoutRef = React.useRef<any>(null);
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const [mobileCalendarMode, setMobileCalendarMode] = React.useState<'week' | 'month' | 'year'>('week');
  const [eventSearch, setEventSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const isAppointmentMatching = (app: Appointment) => {
    if (eventSearch) {
      const searchLower = eventSearch.toLowerCase();
      const clientMatch = app.clientName?.toLowerCase().includes(searchLower) || false;
      const serviceMatch = app.serviceName?.toLowerCase().includes(searchLower) || false;
      if (!clientMatch && !serviceMatch) return false;
    }
    if (statusFilter !== 'all') {
      if (app.status !== statusFilter) return false;
    }
    return true;
  };
  const [pendingMove, setPendingMove] = React.useState<{
    appId: string;
    originalStartTime: string;
    originalEndTime: string;
    newStartTime: string;
    newEndTime: string;
  } | null>(null);

  const [timerSeconds, setTimerSeconds] = React.useState(6);
  const [isHoverToast, setIsHoverToast] = React.useState(false);
  const [sendEmail, setSendEmail] = React.useState(true);
  const [sendSms, setSendSms] = React.useState(true);
  const [isToastDropdownOpen, setIsToastDropdownOpen] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!isToastDropdownOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const toastEl = document.getElementById('global-toast');
      if (toastEl && !toastEl.contains(e.target as Node)) {
        setIsToastDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isToastDropdownOpen]);

  // Current time state for real-time indicator line
  const [currentTime, setCurrentTime] = React.useState(new Date());

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // update every 30 seconds
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const now = new Date();
        const isCurrentPeriod = calendarView === 'day' 
          ? isSameDay(currentCalendarDate, now.toISOString())
          : getWeekDays(currentCalendarDate).some(d => d.toDateString() === now.toDateString());

        let targetHour = 8; // Default morning view (08:00)
        if (isCurrentPeriod) {
          // Scroll to 2 hours before the current hour to give context
          targetHour = Math.max(0, now.getHours() - 2);
          targetHour = Math.min(targetHour, 16); 
        }
        
        const scrollOffset = targetHour * 88;
        
        scrollContainerRef.current.scrollTo({
          top: scrollOffset,
          behavior: 'smooth'
        });
      }
    };

    // Use a tiny timeout to ensure DOM layout has settled
    const timer = setTimeout(handleScroll, 100);
    return () => clearTimeout(timer);
  }, [calendarView, currentCalendarDate]);

  const getNowIndicatorPosition = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const minutesSinceStart = hours * 60 + minutes;
    return (minutesSinceStart / 60) * 88;
  };

  const handleNewAppointmentClick = () => {
    setSheetMode('new');
    setNewAppDate(currentCalendarDate.toISOString().slice(0, 10));
    setNewAppHour(9);
    if (clients.length > 0) setNewAppClientId(clients[0].id);
    if (services.length > 0) setNewAppServiceId(services[0].id);
    setIsSheetOpen(true);
  };

  const commitPendingMove = (sendEmailFlag: boolean, sendSmsFlag: boolean) => {
    if (!pendingMove) return;

    const app = appointments.find(a => a.id === pendingMove.appId);
    if (app && (sendEmailFlag || sendSmsFlag)) {
      const client = clients.find(c => c.id === app.clientId);
      
      const sentMethods = [];
      if (sendEmailFlag && client?.email) sentMethods.push("E-Mail");
      if (sendSmsFlag && client?.phone) sentMethods.push("SMS");
      
      if (sentMethods.length > 0) {
        showToast(`Terminbestätigung an ${app.clientName} per ${sentMethods.join(" & ")} wurde gesendet!`, 'success');
      } else {
        showToast(`Termin verschoben (ohne Benachrichtigung).`, 'info');
      }
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

  // Reset timer state when a new move is triggered
  React.useEffect(() => {
    if (pendingMove) {
      setTimerSeconds(6);
      setIsHoverToast(false);
      setSendEmail(true);
      setSendSms(true);
      setIsToastDropdownOpen(false);
    }
  }, [pendingMove]);

  // Interval timer ticking down by 0.1s every 100ms
  React.useEffect(() => {
    if (!pendingMove) return;
    if (isHoverToast) return; // Pause ticking

    if (timerSeconds <= 0) {
      commitPendingMove(false, false);
      return;
    }

    const interval = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [pendingMove, isHoverToast, timerSeconds]);

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
    const today = new Date();
    
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateString(today);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(today.getDate() + 2);
    const afterTomorrowStr = getLocalDateString(afterTomorrow);
    
    const todayEvents: Appointment[] = [];
    const tomorrowEvents: Appointment[] = [];
    const afterTomorrowEvents: Appointment[] = [];
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
      const appDate = new Date(app.startTime);
      const appDateStr = getLocalDateString(appDate);
      if (appDateStr === todayStr) {
        todayEvents.push(app);
      } else if (appDateStr === tomorrowStr) {
        tomorrowEvents.push(app);
      } else if (appDateStr === afterTomorrowStr) {
        afterTomorrowEvents.push(app);
      } else if (appDateStr > afterTomorrowStr) {
        upcomingEvents.push(app);
      }
    });
    
    return { 
      todayEvents, 
      tomorrowEvents, 
      afterTomorrowEvents, 
      upcomingEvents: upcomingEvents.slice(0, 5) 
    };
  };

  const getWeekDays = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getMobileWeekDays = (date: Date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handlePrevMobileStripe = () => {
    const d = new Date(currentCalendarDate);
    if (mobileCalendarMode === 'year') {
      d.setFullYear(d.getFullYear() - 1);
    } else if (mobileCalendarMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentCalendarDate(d);
  };

  const handleNextMobileStripe = () => {
    const d = new Date(currentCalendarDate);
    if (mobileCalendarMode === 'year') {
      d.setFullYear(d.getFullYear() + 1);
    } else if (mobileCalendarMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentCalendarDate(d);
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

  const getYearMonthDaysGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const grid = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }
    const currentMonthEnd = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= currentMonthEnd; i++) {
      grid.push(new Date(year, month, i));
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

    const minutesSinceStart = hours * 60 + minutes;
    const dur = resizingAppId === app.id && tempDuration !== null 
      ? tempDuration 
      : Math.round((end.getTime() - start.getTime()) / 60000);

    const topPx = (minutesSinceStart / 60) * 88;
    const visualDur = Math.max(45, dur);
    const heightPx = (visualDur / 60) * 88;

    return {
      top: `${topPx + 6}px`,
      height: `${heightPx - 12}px`
    };
  };

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    
    // Hides browser default ghost image to keep layout clean and overlap-free
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOverCell = (e: React.DragEvent, dateStr: string, hour: number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top; // 0 to 88px
    
    // Snapping into 15-minute intervals (4 blocks of 22px)
    let minutes = 0;
    if (relativeY >= 22 && relativeY < 44) {
      minutes = 15;
    } else if (relativeY >= 44 && relativeY < 66) {
      minutes = 30;
    } else if (relativeY >= 66) {
      minutes = 45;
    }
    
    if (!dragOverSlot || dragOverSlot.dateStr !== dateStr || dragOverSlot.hour !== hour || dragOverSlot.minutes !== minutes) {
      setDragOverSlot({ dateStr, hour, minutes });
    }
  };

  const handleTouchStart = (e: React.TouchEvent, appId: string) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    if (touchStartTimeoutRef.current) clearTimeout(touchStartTimeoutRef.current);
    
    touchStartTimeoutRef.current = setTimeout(() => {
      setDraggedAppId(appId);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      showToast("Termin halten & ziehen zum Verschieben", "info");
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedAppId) {
      if (touchStartPosRef.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
        if (dx > 10 || dy > 10) {
          if (touchStartTimeoutRef.current) {
            clearTimeout(touchStartTimeoutRef.current);
            touchStartTimeoutRef.current = null;
          }
        }
      }
      return;
    }
    
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    
    if (element) {
      const slotElement = element.closest('.calendar-slot') as HTMLElement;
      if (slotElement) {
        const dateStr = slotElement.dataset.date;
        const hourVal = slotElement.dataset.hour;
        if (dateStr && hourVal) {
          const hour = Number(hourVal);
          const rect = slotElement.getBoundingClientRect();
          const relativeY = touch.clientY - rect.top;
          
          let minutes = 0;
          if (relativeY >= 22 && relativeY < 44) {
            minutes = 15;
          } else if (relativeY >= 44 && relativeY < 66) {
            minutes = 30;
          } else if (relativeY >= 66) {
            minutes = 45;
          }
          
          if (!dragOverSlot || dragOverSlot.dateStr !== dateStr || dragOverSlot.hour !== hour || dragOverSlot.minutes !== minutes) {
            setDragOverSlot({ dateStr, hour, minutes });
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartTimeoutRef.current) {
      clearTimeout(touchStartTimeoutRef.current);
      touchStartTimeoutRef.current = null;
    }
    
    if (draggedAppId && dragOverSlot) {
      handleDrop(dragOverSlot.dateStr, dragOverSlot.hour, dragOverSlot.minutes);
    }
    
    setDraggedAppId(null);
    setDragOverSlot(null);
    touchStartPosRef.current = null;
  };

  const checkConflict = (appId: string, dateStr: string, hour: number, minutes: number, durationMinutes: number) => {
    const targetStart = new Date(dateStr);
    targetStart.setHours(hour, minutes, 0, 0);
    const targetStartTime = targetStart.getTime();
    const targetEndTime = targetStartTime + durationMinutes * 60000;

    return appointments.some(app => {
      if (app.id === appId) return false;
      const appStart = new Date(app.startTime).getTime();
      const appEnd = new Date(app.endTime).getTime();
      
      // Check overlap
      return (
        (targetStartTime >= appStart && targetStartTime < appEnd) ||
        (targetEndTime > appStart && targetEndTime <= appEnd) ||
        (targetStartTime <= appStart && targetEndTime >= appEnd)
      );
    });
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
    setCurrentCalendarDate(new Date());
  };

  const getCalendarTitleText = () => {
    const days = getWeekDays(currentCalendarDate);
    const startStr = days[0].toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
    const endStr = days[6].toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

    if (calendarView === 'day') {
      return currentCalendarDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    } else if (calendarView === 'week') {
      return `Woche: ${startStr} - ${endStr}`;
    } else {
      return currentCalendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    }
  };

  const handleDrop = (targetDateStr: string, targetHour: number, targetMinutes: number = 0) => {
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
    newStart.setHours(targetHour, targetMinutes, 0, 0);

    // Clamping to not run past 24:00
    const durationMins = duration / 60000;
    let finalStart = newStart;
    const targetMinutesTotal = targetHour * 60 + targetMinutes;
    if (targetMinutesTotal + durationMins > 24 * 60) {
      const shiftMinutes = (targetMinutesTotal + durationMins) - 24 * 60;
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
    <div className="relative flex-grow bg-[#eef0ed] rounded-none lg:rounded-[24px] border-0 lg:border border-[#003527]/10 m-0 lg:my-4 lg:mr-4 lg:ml-4 flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-32px)] overflow-hidden shadow-none transition-all duration-300">
      
      {/* Desktop Calendar View wrapper */}
      <div className="hidden md:flex flex-col flex-grow overflow-hidden relative min-h-0">
      {/* Header Layout (Dashboard Style) */}
      <div className="flex justify-between items-start w-full relative pl-6 md:pl-8 pr-6 md:pr-8 pt-4 md:pt-6 mb-4 md:mb-6">
        <div className="text-left space-y-1.5 pt-0">
          <h1 className="text-[28px] font-bold text-[#003527] tracking-tight">Kalender</h1>
        </div>

        {/* Quick Add Button */}
        <div className="relative">
          <button 
            onClick={handleNewAppointmentClick}
            className="p-2 rounded-xl border border-[#bfc9c3]/50 bg-white text-[#003527] hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-none"
            title="Termin eintragen"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Controls (Sticky Header inside Card) - Full Width */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pl-6 md:pl-8 pr-6 md:pr-8 pt-0 pb-3 bg-transparent flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden lg:flex border border-[#bfc9c3]/50 rounded-xl overflow-hidden bg-white">
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

        {/* Search & Status Filter Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search Toggle Button / Expandable Input */}
          <div className="flex items-center gap-1.5">
            <AnimatePresence initial={false}>
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Suchen..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="bg-white border border-[#bfc9c3]/50 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none w-full h-[36px]"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => {
                if (isSearchOpen) {
                  setEventSearch('');
                }
                setIsSearchOpen(!isSearchOpen);
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center text-[#003527] bg-white border-[#bfc9c3]/50 hover:bg-zinc-50 active:scale-95 shadow-none h-[36px] w-[36px] ${
                isSearchOpen || eventSearch ? 'bg-[#003527]/5 border-[#003527]/30 font-bold' : ''
              }`}
              title="Suche öffnen"
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {/* Status Filter Dropdown Popover */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 text-[#003527] bg-white border-[#bfc9c3]/50 hover:bg-zinc-50 active:scale-95 shadow-none h-[36px] w-[36px] ${
                statusFilter !== 'all' ? 'bg-[#003527]/5 border-[#003527]/30 font-bold' : ''
              }`}
              title="Filter nach Status"
            >
              <Filter className="w-4 h-4" />
              {statusFilter !== 'all' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#003527]" />
              )}
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-[#003527]/10 rounded-2xl shadow-xl py-2 z-50 origin-top-right text-left flex flex-col"
                  >
                    <div className="px-4 py-1.5 text-[10px] font-bold text-zinc-400 select-none uppercase tracking-wider">
                      Status filtern
                    </div>
                    {[
                      { value: 'all', label: 'Alle Termine' },
                      { value: 'booked', label: 'Reserviert' },
                      { value: 'confirmed', label: 'Bestätigt' },
                      { value: 'noshow', label: 'Wahrgenommen' },
                      { value: 'cancelled', label: 'Storniert' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setIsFilterOpen(false);
                        }}
                        className={`px-4 py-2 text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                          statusFilter === opt.value
                            ? 'bg-[#003527]/5 text-[#003527]'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {statusFilter === opt.value && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#003527]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
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
            className={`hidden lg:flex p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
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

      {/* Content Body Layout Wrapper */}
      <div className="flex-grow flex relative min-h-0 overflow-hidden">
        {/* Calendar View Renders */}
        <AnimatePresence mode="wait">
        
        {/* DAY VIEW */}
        {calendarView === 'day' && (
          <motion.div
            key="day-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex-grow flex flex-col pb-24 md:pb-6 pt-0 px-4 md:pl-8 transition-all duration-300 min-h-0 min-w-0 ${
              isSidebarOpen ? 'pr-4 md:pr-8 lg:pr-96' : 'pr-4 md:pr-8 lg:pr-8'
            }`}
          >
            <div ref={scrollContainerRef} className="mt-3 bg-white border border-[#bfc9c3]/40 rounded-2xl flex-grow overflow-y-auto overflow-x-auto hide-scrollbar pt-0 pb-6 px-0 shadow-none flex flex-col min-h-0 min-w-0">
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
              <div className="relative h-[2112px] select-none pr-4">
                {['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'].map((time, idx) => (
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
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const dateStr = currentCalendarDate.toISOString().slice(0, 10);
                  handleDrop(dateStr, dragOverSlot?.hour || 0, dragOverSlot?.minutes || 0);
                }}
                className="relative h-[2112px] w-full pl-0"
              >
                <div className="absolute inset-y-0 left-0 right-0 divide-y divide-zinc-100 flex flex-col pointer-events-none">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="h-[88px]" />
                  ))}
                </div>

                <div className="absolute inset-y-0 left-0 right-0 flex flex-col">
                  {Array.from({ length: 24 }).map((_, hourIdx) => {
                    const hour = hourIdx;
                    const dateStr = currentCalendarDate.toISOString().slice(0, 10);
                    return (
                      <div
                        key={hour}
                        onClick={() => handleCellClick(dateStr, hour)}
                        onDragOver={(e) => handleDragOverCell(e, dateStr, hour)}
                        className="h-[88px] hover:bg-[#003527]/3 transition-colors cursor-pointer calendar-slot"
                        data-date={dateStr}
                        data-hour={hour}
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
                          draggable={!isResizing && isAppointmentMatching(app)}
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onDragEnd={() => { setDraggedAppId(null); setDragOverSlot(null); }}
                          onTouchStart={(e) => handleTouchStart(e, app.id)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onContextMenu={(e) => handleContextMenu(e, app)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(app);
                            setSheetMode('edit');
                            setIsSheetOpen(true);
                          }}
                          style={getAppointmentStyle(app)}
                          className={(() => {
                            const isMatched = isAppointmentMatching(app);
                            return `absolute left-2 right-2 rounded-lg pl-5 pr-4 py-2 border select-none overflow-hidden pointer-events-auto group ${
                              isDragging 
                                ? 'opacity-40 shadow-none pointer-events-none' 
                                : isMatched 
                                ? 'hover:scale-[1.01] cursor-grab' 
                                : 'opacity-15 grayscale pointer-events-none'
                            } ${
                              isResizing ? 'z-30 cursor-ns-resize ring-2 ring-[#003527]' : 'z-10'
                            } ${
                              isResizing || isDragging || !isMatched ? '' : 'transition-all duration-200 ease-out'
                            } ${
                              !app.clientId
                                ? 'bg-zinc-100/90 border-zinc-200/70 text-zinc-800'
                                : app.status === 'booked' 
                                ? 'bg-amber-50/90 border-amber-200/60 text-amber-900' 
                                : app.status === 'confirmed' 
                                ? 'bg-blue-50/90 border-blue-200/60 text-blue-900'
                                : app.status === 'noshow' 
                                ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900' 
                                : 'bg-rose-50/90 border-rose-200/60 text-rose-900'
                            } shadow-none`;
                          })()}
                        >
                          {/* Inner Status Indicator Accent Bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${
                            !app.clientId
                              ? 'bg-zinc-400'
                              : app.status === 'booked' 
                              ? 'bg-amber-505' 
                              : app.status === 'confirmed' 
                              ? 'bg-blue-505'
                              : app.status === 'noshow' 
                              ? 'bg-emerald-600' 
                              : 'bg-rose-505'
                          }`} />

                          {/* Left: Info details stacked vertically */}
                          <div className="flex flex-col min-w-0 text-left">
                            <h4 className="font-extrabold text-[12px] tracking-tight text-zinc-900 truncate leading-snug">
                              {app.serviceName}
                            </h4>
                            
                            {app.clientId && (
                              <p className="text-[10px] font-bold text-zinc-500 truncate mt-0.5 leading-none">
                                {app.clientName}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1.5 text-zinc-400 text-[9.5px] font-semibold leading-none">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 opacity-60" />
                                {formatAppTimeRange(app.startTime, dur)} ({dur} Min)
                              </span>
                              {app.price > 0 && (
                                <span className="bg-[#003527]/5 text-[#003527] px-1.5 py-0.5 rounded-md font-extrabold text-[9px] leading-none">
                                  {app.price.toFixed(2)} €
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions, Invoice states, and Resizing Badge */}
                          <div className="flex items-center gap-3.5 flex-shrink-0">
                            {isResizing && (
                              <span className="text-[9px] bg-[#003527] text-white px-2 py-0.5 rounded-full font-bold">
                                {dur} Min.
                              </span>
                            )}
                            
                            {app.clientId && (
                              <div className="flex items-center gap-2">
                                {appInvoice ? (
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showToast('Rechnungsdetails geladen.', 'info');
                                    }}
                                    className={`px-2.5 py-1 rounded-full border text-[9px] font-extrabold tracking-wider uppercase cursor-pointer flex items-center gap-1 shadow-none transition-all hover:scale-[1.02] ${
                                      appInvoice.status === 'paid'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : appInvoice.status === 'overdue'
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                    }`}
                                    title={`Rechnung: ${appInvoice.invoiceNumber}`}
                                  >
                                    <FileText className="w-2.5 h-2.5" />
                                    <span>{appInvoice.status === 'paid' ? 'Bezahlt' : appInvoice.status === 'overdue' ? 'Überfällig' : 'Offen'}</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openNewInvoiceSheetWithPrefill({
                                        clientId: app.clientId || '',
                                        amount: app.price,
                                        appointmentId: app.id,
                                        clientName: app.clientName,
                                        date: app.startTime.slice(0, 10)
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-zinc-100 border border-[#bfc9c3]/40 rounded text-[#003527] transition-all cursor-pointer flex items-center justify-center shadow-none"
                                    title="Rechnung erstellen"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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
                      
                      const snapTopPx = (dragOverSlot.hour + (dragOverSlot.minutes || 0) / 60) * 88;
                      const targetDate = new Date(currentCalendarDate);
                      targetDate.setHours(dragOverSlot.hour, dragOverSlot.minutes || 0, 0, 0);
                      const hasConflict = checkConflict(draggedApp.id, dragOverSlot.dateStr, dragOverSlot.hour, dragOverSlot.minutes || 0, dur);
                      const visualDur = Math.max(45, dur);
                      const heightPx = (visualDur / 60) * 88;
                      
                      return (
                        <div
                          style={{ top: `${snapTopPx + 6}px`, height: `${heightPx - 12}px` }}
                          className={`absolute left-2 right-2 rounded-lg border-2 border-dashed flex flex-col justify-between p-4 z-20 shadow-sm transition-all duration-150 ${
                            hasConflict 
                              ? 'border-rose-500 bg-rose-500/[0.08]' 
                              : 'border-emerald-500 bg-emerald-500/[0.04]'
                          }`}
                        >
                          <div>
                            <h4 className={`font-extrabold text-xs ${hasConflict ? 'text-rose-900' : 'text-[#003527]'}`}>{draggedApp.serviceName}</h4>
                            {draggedApp.clientId && <p className="text-[10px] text-zinc-500 font-bold mt-0.5">{draggedApp.clientName}</p>}
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                            <span className={`text-[9px] font-extrabold px-2 py-1 rounded-md self-start ${
                              hasConflict 
                                ? 'text-rose-900 bg-rose-500/20' 
                                : 'text-[#003527] bg-emerald-500/20'
                            }`}>
                              {hasConflict ? '🚫 Konflikt! Überlappung' : '✓ Freies Zeitfenster'}: {formatAppTimeRange(targetDate.toISOString(), dur)} Uhr ({dur} Min)
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
              {/* Day View Current Time Indicator Line (placed in parent grid container) */}
              {(() => {
                const isToday = currentTime.getFullYear() === currentCalendarDate.getFullYear() &&
                                currentTime.getMonth() === currentCalendarDate.getMonth() &&
                                currentTime.getDate() === currentCalendarDate.getDate();
                const topPx = getNowIndicatorPosition(currentTime);
                if (!isToday || topPx === null) return null;
                return (
                  <div 
                    className="absolute left-0 right-0 z-20 pointer-events-none h-0 grid grid-cols-[80px_1fr]" 
                    style={{ top: `${topPx}px` }}
                  >
                    {/* Time Pill column */}
                    <div className="relative w-full h-0">
                      <div 
                        className="absolute right-2 -translate-y-1/2 bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full select-none flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                      >
                        {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {/* Line column */}
                    <div className="relative w-full h-0">
                      <div className="w-full border-t-2 border-rose-500" />
                    </div>
                  </div>
                );
              })()}
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
            className={`flex-grow flex flex-col pb-24 md:pb-6 pt-0 px-4 md:pl-8 transition-all duration-300 min-h-0 min-w-0 ${
              isSidebarOpen ? 'pr-4 md:pr-8 lg:pr-96' : 'pr-4 md:pr-8 lg:pr-8'
            }`}
          >
            <div ref={scrollContainerRef} className="mt-3 bg-white border border-[#bfc9c3]/40 rounded-2xl flex-grow overflow-y-auto overflow-x-auto hide-scrollbar pt-0 pb-6 px-0 shadow-none flex flex-col min-h-0 min-w-0">
            {/* Week Header Row */}
            <div className="min-w-[1000px] grid grid-cols-[80px_repeat(7,1fr)] divide-x divide-zinc-200/50 border-b border-[#bfc9c3]/20 bg-zinc-50/75 backdrop-blur-md rounded-t-2xl mb-0 sticky top-0 z-30">
              <div className="w-[80px]" />
              {getWeekDays(currentCalendarDate).map((dayDate) => {
                const isToday = new Date().toDateString() === dayDate.toDateString();
                return (
                  <div 
                    key={dayDate.toISOString()} 
                    onClick={() => {
                      setCurrentCalendarDate(dayDate);
                      setCalendarView('day');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 select-none relative cursor-pointer hover:bg-zinc-100/50 transition-colors"
                  >
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
                    {isToday && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#003527] z-10" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="min-w-[1000px] grid grid-cols-[80px_repeat(7,1fr)] divide-x divide-zinc-200/50 relative">
              {/* Hours Column */}
              <div className="relative h-[2112px] select-none pr-4">
                {['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'].map((time, idx) => (
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
                const isToday = new Date().toDateString() === dayDate.toDateString();

                return (
                  <div 
                    key={dateStr} 
                    className={`relative h-[2112px] w-full ${isToday ? 'bg-[#003527]/[0.015]' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(dateStr, dragOverSlot?.hour || 0, dragOverSlot?.minutes || 0)}
                  >
                    {/* Background Slots */}
                    <div className="absolute inset-0 divide-y divide-zinc-100 flex flex-col pointer-events-none">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="h-[88px]" />
                      ))}
                    </div>

                    {/* Interactive cell overlay slots */}
                    <div className="absolute inset-0 flex flex-col">
                      {Array.from({ length: 24 }).map((_, hourIdx) => {
                        const hour = hourIdx;
                        return (
                          <div
                            key={hour}
                            onClick={() => handleCellClick(dateStr, hour)}
                            onDragOver={(e) => handleDragOverCell(e, dateStr, hour)}
                            className="h-[88px] hover:bg-[#003527]/3 transition-colors cursor-pointer calendar-slot"
                            data-date={dateStr}
                            data-hour={hour}
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
                              draggable={!isResizing && isAppointmentMatching(app)}
                              onDragStart={(e) => handleDragStart(e, app.id)}
                              onDragEnd={() => { setDraggedAppId(null); setDragOverSlot(null); }}
                              onTouchStart={(e) => handleTouchStart(e, app.id)}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              onContextMenu={(e) => handleContextMenu(e, app)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(app);
                                setSheetMode('edit');
                                setIsSheetOpen(true);
                              }}
                              style={getAppointmentStyle(app)}
                              className={(() => {
                                const isMatched = isAppointmentMatching(app);
                                return `absolute left-1 inset-x-1 rounded-lg p-2.5 border select-none overflow-hidden pointer-events-auto group ${
                                  isDragging 
                                    ? 'opacity-40 shadow-none pointer-events-none' 
                                    : isMatched 
                                    ? 'hover:scale-[1.01] cursor-grab' 
                                    : 'opacity-15 grayscale pointer-events-none'
                                } ${
                                  isResizing ? 'z-30 cursor-ns-resize ring-2 ring-[#003527]' : 'z-10'
                                } ${
                                  isResizing || isDragging || !isMatched ? '' : 'transition-all duration-200 ease-out'
                                } ${
                                  !app.clientId
                                    ? 'bg-zinc-100/90 border-zinc-200/70 text-zinc-800'
                                    : app.status === 'booked' 
                                    ? 'bg-amber-50/90 border-amber-200/60 text-amber-900' 
                                    : app.status === 'confirmed' 
                                    ? 'bg-blue-50/90 border-blue-200/60 text-blue-900'
                                    : app.status === 'noshow' 
                                    ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900' 
                                    : 'bg-rose-50/90 border-rose-200/60 text-rose-900'
                                } shadow-none`;
                              })()}
                            >
                              <div className="flex justify-between items-center text-[8px] font-bold mb-1">
                                <span className="flex items-center gap-0.5 opacity-80">
                                  <Clock className="w-2 h-2" />
                                  {formatAppTimeRange(app.startTime, dur)}
                                </span>
                                {isResizing && (
                                  <span className="bg-[#003527] text-white px-1 py-0.2 rounded font-bold">{dur} Min.</span>
                                )}
                              </div>

                              <div>
                                <div className="flex justify-between items-start">
                                  <div className="flex-grow min-w-0">
                                    <h4 className="font-extrabold text-[10px] tracking-tight leading-tight line-clamp-1">{app.serviceName}</h4>
                                    {app.clientId && <p className="text-[9px] font-semibold opacity-75 mt-0.5 text-left">{app.clientName}</p>}
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                    {app.clientId && (
                                      appInvoice ? (
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
                                              clientId: app.clientId || '',
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
                                      )
                                    )}
                                  </div>
                                </div>
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
                          
                          const snapTopPx = ((dragOverSlot?.hour || 0) + (dragOverSlot?.minutes || 0) / 60) * 88;
                          const targetDate = new Date(dayDate);
                          targetDate.setHours(dragOverSlot?.hour || 0, dragOverSlot?.minutes || 0, 0, 0);
                          const hasConflict = checkConflict(draggedApp.id, dayDate.toISOString().slice(0, 10), dragOverSlot?.hour || 0, dragOverSlot?.minutes || 0, dur);
                          const visualDur = Math.max(45, dur);
                          const heightPx = (visualDur / 60) * 88;
                          
                          return (
                            <div
                              style={{ top: `${snapTopPx + 6}px`, height: `${heightPx - 12}px` }}
                              className={`absolute left-1 right-1 rounded-lg border-2 border-dashed flex flex-col justify-between p-2.5 z-20 shadow-sm transition-all duration-150 ${
                                hasConflict 
                                  ? 'border-rose-500 bg-rose-500/[0.08]' 
                                  : 'border-emerald-500 bg-emerald-500/[0.04]'
                              }`}
                            >
                              <div>
                                <h4 className={`font-extrabold text-[9px] truncate leading-snug ${hasConflict ? 'text-rose-900' : 'text-[#003527]'}`}>{draggedApp.serviceName}</h4>
                                {draggedApp.clientId && <p className="text-[8px] text-zinc-500 font-bold truncate leading-none mt-0.5">{draggedApp.clientName}</p>}
                              </div>
                              <div className="flex flex-col gap-1 mt-2.5">
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md self-start leading-none uppercase tracking-wide text-white ${
                                  hasConflict ? 'bg-rose-500' : 'bg-[#003527]'
                                }`}>
                                  {dayDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                                </span>
                                <span className={`text-[8px] font-bold leading-none ${hasConflict ? 'text-rose-700/80' : 'text-[#003527]/80'}`}>
                                  {formatAppTimeRange(targetDate.toISOString(), dur)} Uhr {hasConflict && '🚫'}
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Week View Current Time Indicator Line (placed in parent grid container) */}
              {(() => {
                const weekDays = getWeekDays(currentCalendarDate);
                const isTodayInWeek = weekDays.some(dayDate => 
                  currentTime.getFullYear() === dayDate.getFullYear() &&
                  currentTime.getMonth() === dayDate.getMonth() &&
                  currentTime.getDate() === dayDate.getDate()
                );
                const topPx = getNowIndicatorPosition(currentTime);
                if (!isTodayInWeek || topPx === null) return null;
                return (
                  <div 
                    className="absolute left-0 right-0 z-20 pointer-events-none h-0 grid grid-cols-[80px_repeat(7,1fr)]" 
                    style={{ top: `${topPx}px` }}
                  >
                    {/* Time Pill Column */}
                    <div className="relative w-full h-0">
                      <div 
                        className="absolute right-2 -translate-y-1/2 bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full select-none flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                      >
                        {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {/* Day Column lines (faded for other days, solid for today) */}
                    {weekDays.map((dayDate) => {
                      const isToday = currentTime.getFullYear() === dayDate.getFullYear() &&
                                      currentTime.getMonth() === dayDate.getMonth() &&
                                      currentTime.getDate() === dayDate.getDate();
                      return (
                        <div key={dayDate.toISOString()} className="relative w-full h-0">
                          <div className={`w-full border-t-2 ${isToday ? 'border-rose-500' : 'border-rose-500/25'}`} />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
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
            className={`flex-grow flex flex-col pb-24 md:pb-6 pt-0 px-4 md:pl-8 transition-all duration-300 min-h-0 min-w-0 ${
              isSidebarOpen ? 'pr-4 md:pr-8 lg:pr-96' : 'pr-4 md:pr-8 lg:pr-8'
            }`}
          >
            <div 
              style={{ gridTemplateRows: 'auto repeat(6, 1fr)' }}
              className="mt-3 bg-zinc-200 border border-zinc-200 rounded-2xl flex-grow overflow-y-auto overflow-x-auto hide-scrollbar grid grid-cols-7 gap-[1px] min-h-0 min-w-[600px] md:min-w-0"
            >
            {/* Day Headers */}
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="bg-[#f3f4f3] py-2 text-center text-[10px] font-bold text-zinc-400 select-none sticky top-0 z-30">
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
                  className={`bg-white min-h-[100px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-[#f9f9f8] calendar-slot ${
                    isCurrentMonth ? '' : 'text-zinc-300'
                  }`}
                  data-date={date.toISOString().slice(0, 10)}
                  data-hour="9"
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
                    {dayApps.map((app) => {
                      const isMatched = isAppointmentMatching(app);
                      return (
                        <div
                          key={app.id}
                          draggable={isMatched}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggedAppId(app.id);
                          }}
                          onDragEnd={() => setDraggedAppId(null)}
                          onTouchStart={(e) => handleTouchStart(e, app.id)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onContextMenu={(e) => handleContextMenu(e, app)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(app);
                            setSheetMode('edit');
                            setIsSheetOpen(true);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold truncate border text-left ${
                            draggedAppId === app.id
                              ? 'opacity-40 shadow-none pointer-events-none'
                              : isMatched 
                              ? 'hover:scale-[1.01] cursor-pointer' 
                              : 'opacity-15 grayscale pointer-events-none'
                          } ${
                            !app.clientId
                              ? 'bg-zinc-100/90 border-zinc-200/50 text-zinc-700 font-bold'
                              : app.status === 'booked' 
                              ? 'bg-amber-50/70 border-amber-200/50 text-amber-800' 
                              : app.status === 'confirmed' 
                              ? 'bg-blue-50/70 border-blue-200/50 text-blue-800'
                              : app.status === 'noshow' 
                              ? 'bg-emerald-50/70 border-emerald-200/50 text-emerald-800' 
                              : 'bg-rose-50/70 border-rose-200/50 text-rose-800'
                          }`}
                        >
                          {formatTime(app.startTime)} {!app.clientId ? app.serviceName : app.clientName.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    
      {/* Right Side: Upcoming Events Sidebar (100vh full-height panel with Framer Motion slide in/out) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: 400, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0.8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="hidden lg:flex absolute right-8 top-3 bottom-6 w-80 bg-white border border-[#003527]/10 flex-col z-30 shadow-none rounded-[20px] overflow-hidden"
          >
            {/* Sidebar Header (Matches Clients List layout style) */}
            <div className="p-6 pt-5 space-y-4 border-b border-[#bfc9c3]/20 flex-shrink-0 bg-white">
              <div className="flex justify-between items-center select-none">
                {(() => {
                  const { todayEvents, tomorrowEvents, afterTomorrowEvents, upcomingEvents } = getUpcomingEvents();
                  const count = todayEvents.length + tomorrowEvents.length + afterTomorrowEvents.length + upcomingEvents.length;
                  return <h3 className="text-sm font-bold text-[#003527]">Anstehende Termine ({count})</h3>;
                })()}
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
                const { todayEvents, tomorrowEvents, afterTomorrowEvents, upcomingEvents } = getUpcomingEvents();
                
                const renderEventCard = (app: Appointment) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppointment(app);
                      setSheetMode('edit');
                      setIsSheetOpen(true);
                    }}
                    onContextMenu={(e) => handleContextMenu(e, app)}
                    className="flex items-center gap-3 p-3 bg-zinc-50 hover:bg-zinc-100/70 border border-[#bfc9c3]/20 rounded-xl transition-all cursor-pointer select-none text-left"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      !app.clientId
                        ? 'bg-zinc-400'
                        : app.status === 'booked' 
                        ? 'bg-amber-500' 
                        : app.status === 'confirmed' 
                        ? 'bg-blue-500' 
                        : app.status === 'noshow' 
                        ? 'bg-emerald-500' 
                        : 'bg-rose-500'
                    }`} />
                    <div className="min-w-0 flex-grow">
                      <h5 className="font-extrabold text-xs text-[#003527] leading-tight truncate">{app.serviceName}</h5>
                      {app.clientId && <p className="text-[10px] font-bold text-zinc-400 mt-0.5 truncate">{app.clientName}</p>}
                      <p className="text-[9px] font-bold text-zinc-500 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-zinc-400" />
                        {formatTime(app.startTime)} - {formatTime(app.endTime)}
                      </p>
                    </div>
                  </div>
                );

                const hasAnyEvents = todayEvents.length > 0 || tomorrowEvents.length > 0 || afterTomorrowEvents.length > 0 || upcomingEvents.length > 0;

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

                    {/* Day after tomorrow (Übermorgen) */}
                    {afterTomorrowEvents.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-4 mb-2 select-none">Übermorgen</h5>
                        <div className="space-y-2 px-4">
                          {afterTomorrowEvents.map(renderEventCard)}
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
      </div>

      </div>

      {/* Mobile Calendar Layout */}
      <div className="flex md:hidden flex-col flex-grow overflow-hidden relative select-none">
        
        {/* Header: Month & Year Navigator */}
        <div className="px-6 pt-6 pb-4 flex justify-between items-center bg-transparent flex-shrink-0">
          <div className="flex items-center gap-3 text-left">
            <h1 
              onClick={() => {
                if (mobileCalendarMode === 'week') setMobileCalendarMode('month');
                else if (mobileCalendarMode === 'month') setMobileCalendarMode('year');
                else setMobileCalendarMode('month');
              }}
              className="text-xl font-bold text-[#003527] tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            >
              {mobileCalendarMode === 'year' 
                ? currentCalendarDate.getFullYear() 
                : currentCalendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
            </h1>
            
            {/* Dynamic month/year navigation arrows - hidden in month mode */}
            {mobileCalendarMode !== 'month' && (
              <div className="flex items-center gap-1 bg-white border border-[#bfc9c3]/30 rounded-lg p-0.5 shadow-none select-none">
                <button 
                  onClick={handlePrevMobileStripe}
                  className="p-1 text-[#003527] hover:bg-[#003527]/5 rounded-md transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleToday}
                  className="px-2 py-0.5 text-[9px] font-bold text-[#003527] hover:bg-[#003527]/5 rounded-md transition-colors cursor-pointer border-l border-r border-[#bfc9c3]/20"
                >
                  Heute
                </button>
                <button 
                  onClick={handleNextMobileStripe}
                  className="p-1 text-[#003527] hover:bg-[#003527]/5 rounded-md transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          
          {/* Controls: Calendar view toggle & Quick add appointment */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (mobileCalendarMode === 'week') setMobileCalendarMode('month');
                else if (mobileCalendarMode === 'month') setMobileCalendarMode('year');
                else setMobileCalendarMode('week');
              }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-none ${
                mobileCalendarMode !== 'week' 
                  ? 'bg-[#003527] border-[#003527] text-white' 
                  : 'bg-white border-[#bfc9c3]/50 text-[#003527] hover:bg-zinc-50'
              }`}
              title="Kalenderansicht wechseln"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>

            <button 
              onClick={handleNewAppointmentClick}
              className="p-2.5 rounded-xl border border-[#bfc9c3]/50 bg-white text-[#003527] hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-none"
              title="Termin eintragen"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {mobileCalendarMode !== 'year' ? (
          <>
            {/* Weekly/Monthly Stripe Picker */}
            <motion.div 
              layout
              className="px-6 pb-4 border-b border-[#bfc9c3]/20 flex-shrink-0 overflow-hidden"
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            >
              {/* Static Weekday Headers - Always Visible & Highlighted Selected */}
              <div className="grid grid-cols-7 text-center mb-1">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => {
                  const selectedIndex = (currentCalendarDate.getDay() + 6) % 7;
                  const isSelectedDay = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][selectedIndex] === day;
                  return (
                    <span key={day} className={`text-[9px] uppercase tracking-wider font-extrabold py-1 transition-colors duration-200 ${
                      isSelectedDay ? 'text-[#003527] font-extrabold' : 'text-zinc-400'
                    }`}>
                      {day}
                    </span>
                  );
                })}
              </div>

              {/* Week Stripe View */}
              <motion.div
                initial={false}
                animate={{
                  height: mobileCalendarMode === 'week' ? 'auto' : 0,
                  opacity: mobileCalendarMode === 'week' ? 1 : 0
                }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-7 gap-1 text-center py-1">
                  {getMobileWeekDays(currentCalendarDate).map((dayDate) => {
                    const isSelected = dayDate.toDateString() === currentCalendarDate.toDateString();
                    const isToday = new Date().toDateString() === dayDate.toDateString();
                    const hasEvents = appointments.some(app => isSameDay(dayDate, app.startTime));

                    return (
                      <button
                        key={dayDate.toISOString()}
                        onClick={() => {
                          if (isSelected) {
                            setMobileCalendarMode('month');
                          } else {
                            setCurrentCalendarDate(dayDate);
                          }
                        }}
                        className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative"
                      >
                        <span className={`text-xs font-bold flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                          isSelected 
                            ? 'bg-[#003527] text-white shadow-sm font-extrabold' 
                            : isToday 
                            ? 'text-red-500 font-extrabold' 
                            : 'text-[#003527]'
                        }`}>
                          {dayDate.getDate()}
                        </span>

                        {/* Dot indicator for events on this day (hidden when selected) */}
                        {hasEvents && !isSelected && (
                          <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#003527]/30" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Month Grid View */}
              <motion.div
                initial={false}
                animate={{
                  height: mobileCalendarMode === 'month' ? 'auto' : 0,
                  opacity: mobileCalendarMode === 'month' ? 1 : 0
                }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="overflow-hidden"
              >
                {/* Monthly Grid Numbers */}
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center py-1">
                  {getMonthDaysGrid(currentCalendarDate).map(({ date: dayDate, isCurrentMonth }, idx) => {
                    const isSelected = dayDate.toDateString() === currentCalendarDate.toDateString();
                    const isToday = new Date().toDateString() === dayDate.toDateString();
                    const hasEvents = appointments.some(app => isSameDay(dayDate, app.startTime));

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentCalendarDate(dayDate);
                          setMobileCalendarMode('week');
                        }}
                        className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative"
                      >
                        <span className={`text-xs font-bold flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                          isSelected 
                            ? 'bg-[#003527] text-white shadow-sm font-extrabold' 
                            : isToday 
                            ? 'text-red-500 font-extrabold border border-red-200' 
                            : isCurrentMonth 
                            ? 'text-[#003527]' 
                            : 'text-zinc-300 font-normal'
                        }`}>
                          {dayDate.getDate()}
                        </span>

                        {/* Dot indicator for events on this day (hidden when selected) */}
                        {hasEvents && !isSelected && (
                          <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#003527]/30" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Agenda List Area */}
            <div className="flex-grow overflow-y-auto px-6 py-4 space-y-3 pb-24">
              {(() => {
                const dayAppointments = appointments
                  .filter(app => isSameDay(currentCalendarDate, app.startTime))
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                if (dayAppointments.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-[#bfc9c3]/30 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.01)] animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 mb-3">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[#003527]">Keine Termine für diesen Tag</p>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-1 max-w-[200px] leading-relaxed">
                        Hier werden anstehende Termine für diesen Tag angezeigt.
                      </p>
                    </div>
                  );
                }

                return dayAppointments.map((app) => {
                  const start = new Date(app.startTime);
                  const end = new Date(app.endTime);
                  const duration = Math.round((end.getTime() - start.getTime()) / 60000);
                  
                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        setSelectedAppointment(app);
                        setSheetMode('edit');
                        setIsSheetOpen(true);
                      }}
                      onContextMenu={(e) => handleContextMenu(e, app)}
                      className={`bg-white border border-[#bfc9c3]/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] active:scale-[0.99] transition-all cursor-pointer text-left relative overflow-hidden group border-l-4 ${
                        !app.clientId
                          ? 'border-l-zinc-400'
                          : app.status === 'booked' 
                          ? 'border-l-amber-400' 
                          : app.status === 'confirmed' 
                          ? 'border-l-blue-400'
                          : app.status === 'noshow' 
                          ? 'border-l-emerald-400' 
                          : 'border-l-rose-400'
                      }`}
                    >
                      <div className="min-w-0 flex-grow pr-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold text-[#003527]">
                            {start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400">({duration} Min.)</span>
                        </div>
                        
                        <h4 className="font-extrabold text-xs text-[#003527] mt-1 leading-snug truncate">{app.serviceName}</h4>
                        {app.clientId && (
                          <p className="text-[10px] font-bold text-zinc-400 mt-0.5 truncate">{app.clientName}</p>
                        )}
                      </div>

                      {/* Status indicator badge */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                          !app.clientId
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-500'
                            : app.status === 'booked'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : app.status === 'confirmed'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : app.status === 'noshow'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          {!app.clientId
                            ? 'Privat'
                            : app.status === 'booked'
                            ? 'Gebucht'
                            : app.status === 'confirmed'
                            ? 'Bestätigt'
                            : app.status === 'noshow'
                            ? 'Erledigt'
                            : 'Absage'}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </>
        ) : (
          /* Year Grid View - 2 Columns of 12 Months */
          <div className="flex-grow overflow-y-auto px-3 pb-24 pt-2">
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
              {[
                'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
              ].map((monthName, monthIndex) => {
                const year = currentCalendarDate.getFullYear();
                const monthDays = getYearMonthDaysGrid(year, monthIndex);
                const isSelectedMonth = currentCalendarDate.getMonth() === monthIndex && currentCalendarDate.getFullYear() === year;

                return (
                  <button
                    key={monthIndex}
                    onClick={() => {
                      const newDate = new Date(currentCalendarDate);
                      newDate.setDate(1);
                      newDate.setMonth(monthIndex);
                      
                      const today = new Date();
                      if (today.getFullYear() === year && today.getMonth() === monthIndex) {
                        newDate.setDate(today.getDate());
                      } else {
                        newDate.setDate(1);
                      }

                      setCurrentCalendarDate(newDate);
                      setMobileCalendarMode('month');
                    }}
                    className="flex flex-col text-left p-1 rounded-xl hover:bg-[#003527]/5 transition-colors border border-transparent active:border-[#bfc9c3]/30 cursor-pointer"
                  >
                    <span className={`text-[10px] font-extrabold tracking-tight mb-1.5 transition-colors ${
                      isSelectedMonth ? 'text-red-500 font-extrabold' : 'text-[#003527]'
                    }`}>
                      {monthName}
                    </span>

                    <div className="grid grid-cols-7 gap-y-0.5 text-center w-full">
                      {monthDays.map((dayDate, idx) => {
                        if (!dayDate) {
                          return <span key={`empty-${idx}`} className="w-3.5 h-3.5" />;
                        }

                        const isToday = new Date().toDateString() === dayDate.toDateString();
                        const isSelected = dayDate.toDateString() === currentCalendarDate.toDateString();

                        return (
                          <span
                            key={idx}
                            className={`text-[8.5px] font-bold flex items-center justify-center w-3.5 h-3.5 rounded-full transition-all ${
                              isSelected
                                ? 'bg-[#003527] text-white font-extrabold'
                                : isToday
                                ? 'text-red-500 font-extrabold'
                                : 'text-zinc-500'
                            }`}
                          >
                            {dayDate.getDate()}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}



      </div>

      {/* Apple-Style Toast Banner for Rescheduling Notification & Undo */}
      <AnimatePresence>
        {pendingMove && (() => {
          const app = appointments.find(a => a.id === pendingMove.appId);
          if (!app) return null;
          const client = clients.find(c => c.id === app.clientId);

          const newStart = new Date(pendingMove.newStartTime);
          const formattedDate = newStart.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' });
          const formattedTime = newStart.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div
              key={`${pendingMove.appId}-${pendingMove.newStartTime}`}
              initial={{ opacity: 0, y: 50, x: "-50%", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
              exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.95 }}
              onMouseEnter={() => setIsHoverToast(true)}
              onMouseLeave={() => setIsHoverToast(false)}
              id="global-toast"
              className="fixed bottom-6 left-1/2 z-50 flex items-center bg-white/95 backdrop-blur-xl border border-[#bfc9c3]/30 rounded-2xl shadow-[0_20px_50px_rgba(0,53,39,0.08)] p-2 pl-4 text-[#003527] w-[510px] max-w-[calc(100vw-3rem)] m-0 select-none transition-all duration-300 relative animate-slide-up-toast"
            >
              {/* Left Column: Info Text */}
              <div className="flex flex-col justify-center pr-4 min-w-[170px] text-left flex-grow">
                <span className="text-[10.5px] font-bold text-zinc-500">
                  Verschoben auf {formattedDate}, {formattedTime} Uhr
                </span>
                <span className="text-[13px] font-bold text-[#003527] mt-0.5">
                  {app.clientName} benachrichtigen?
                </span>
              </div>

              {/* Splitter Divider */}
              <div className="w-px h-8 bg-[#bfc9c3]/30 mx-1.5 flex-shrink-0" />

              {/* Actions Section */}
              <div className="relative flex items-center ml-1.5 flex-shrink-0">
                <div className="flex items-center bg-[#003527] text-white rounded-xl shadow-sm border border-[#003527]">
                  <button
                    onClick={() => commitPendingMove(true, false)}
                    className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-extrabold hover:bg-white/10 rounded-l-xl transition-colors cursor-pointer text-white whitespace-nowrap justify-center"
                  >
                    <Mail className="w-3.5 h-3.5 text-white" />
                    <span>Mail senden</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsToastDropdownOpen(!isToastDropdownOpen);
                    }}
                    className="px-2 py-2 hover:bg-white/10 border-l border-white/10 rounded-r-xl transition-colors h-full flex items-center cursor-pointer text-white/80"
                  >
                    <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${isToastDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Upward Dropdown */}
                {isToastDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-3 w-60 bg-white border border-zinc-200 shadow-2xl rounded-2xl p-1 z-[60] flex flex-col text-left text-zinc-800 animate-dropdown-up origin-bottom">
                    <div className="px-2.5 py-1.5 text-[9.5px] font-extrabold text-zinc-400">
                      Senden als
                    </div>

                    <button
                      onClick={() => commitPendingMove(true, false)}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold hover:bg-zinc-50 rounded-xl text-zinc-800 transition cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-zinc-400" /> E-Mail</span>
                      {client?.email && <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[110px]">{client.email}</span>}
                    </button>

                    {client?.phone && (
                      <>
                        <button
                          onClick={() => commitPendingMove(false, true)}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold hover:bg-zinc-50 rounded-xl text-zinc-800 transition cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> SMS</span>
                          <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[110px]">{client.phone}</span>
                        </button>

                        <button
                          onClick={() => commitPendingMove(true, true)}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold hover:bg-zinc-50 rounded-xl text-zinc-800 transition cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-zinc-400" /> E-Mail & SMS</span>
                        </button>
                      </>
                    )}

                    <div className="h-px bg-zinc-100 my-1 mx-2" />

                    <button
                      onClick={() => {
                        setSelectedClientId(client?.id || '');
                        setSelectedMailAppointmentId(pendingMove.appId);
                        setIsMailModalOpen(true);
                        setPendingMove(null);
                      }}
                      className="w-full flex items-start gap-2.5 px-2.5 py-2.5 text-xs font-semibold hover:bg-zinc-50 rounded-xl text-zinc-800 transition text-left cursor-pointer group"
                    >
                      <Edit2 className="w-3.5 h-3.5 mt-0.5 text-zinc-400 group-hover:text-[#003527]" />
                      <div className="leading-tight">
                        <span className="block text-zinc-900 font-bold mb-0.5">Vorschau bearbeiten</span>
                        <span className="text-[10px] text-zinc-500 font-medium italic">"Hallo {client?.name || 'Klient'}, dein Termin..."</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Undo Action */}
              <button
                onClick={revertPendingMove}
                className="ml-2.5 p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition flex items-center justify-center cursor-pointer active:scale-95 flex-shrink-0"
                title="Widerrufen"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Progress Countdown Line */}
              <div className="absolute bottom-[1px] left-[1px] right-[1px] h-[2px] rounded-b-[15px] overflow-hidden pointer-events-none">
                <div
                  style={{ width: `${(timerSeconds / 6) * 100}%` }}
                  className="h-full bg-[#003527] transition-all duration-100 ease-linear"
                />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
