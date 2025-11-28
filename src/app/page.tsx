
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Book, 
  ClipboardList, 
  Calendar as CalendarIcon, 
  Compass, 
  FileText, 
  MonitorPlay,
  Users2,
  Settings,
  GripVertical,
  EyeOff,
  Eye,
  Save,
  Bell,
  BookCopy
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { HOLIDAYS_2024_2025 } from '@/lib/holidays';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useDatabase } from '@/hooks/use-database';
import type { HomeModule, TimeSlot } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const ICONS: { [key: string]: React.ReactNode } = {
  MonitorPlay: <MonitorPlay />,
  Users: <Users />,
  Book: <Book />,
  ClipboardList: <ClipboardList />,
  CalendarIcon: <CalendarIcon />,
  Compass: <Compass />,
  FileText: <FileText />,
  Users2: <Users2 />,
  BookCopy: <BookCopy />,
};


const TimerModule = () => {
    const { db } = useDatabase();
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [statusMessage, setStatusMessage] = useState('Ders Dışı');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const timeSlots = db.dersProgrami?.timeSlots || [];

            let nextBellTime: Date | null = null;
            let message = 'Ders Dışı';

            // Find the current or next lesson/break
            for (const slot of timeSlots) {
                if (slot.start && slot.end) {
                    const start = new Date();
                    const [startH, startM] = slot.start.split(':').map(Number);
                    start.setHours(startH, startM, 0, 0);

                    const end = new Date();
                    const [endH, endM] = slot.end.split(':').map(Number);
                    end.setHours(endH, endM, 0, 0);
                    
                    if (now < start) {
                        nextBellTime = start;
                        message = 'Dersin Başlamasına Kalan Süre';
                        break;
                    }
                    
                    if (now >= start && now < end) {
                        nextBellTime = end;
                        message = 'Dersin Bitmesine Kalan Süre';
                        break;
                    }
                }
            }

            setStatusMessage(message);

            if (nextBellTime) {
                const diffSeconds = Math.round((nextBellTime.getTime() - now.getTime()) / 1000);
                setRemainingTime(diffSeconds > 0 ? diffSeconds : 0);
                
                if (diffSeconds === 1) {
                    playBellSound();
                }

            } else {
                setRemainingTime(null);
            }
        };

        updateTimer(); // Initial call
        timerRef.current = setInterval(updateTimer, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [db.dersProgrami]);

    const playBellSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.log('Ses çalınamadı:', e);
        }
    };
    
    const formatTime = (seconds: number | null) => {
        if (seconds === null) {
            return '--:--';
        }
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell /> Akıllı Zil Sayacı</h3>
            <div className="text-center mb-4">
                <div id="timer-display" className={`text-5xl font-bold font-mono mb-2 ${remainingTime !== null && remainingTime <= 300 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(remainingTime)}
                </div>
                <div className="text-purple-200">{statusMessage}</div>
            </div>
        </div>
    );
};

const CalendarWidget = () => {
    const [date, setDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        setDate(new Date());
    }, []);
  
    const modifiers = {
      resmi: HOLIDAYS_2024_2025.filter(h => h.type === 'resmi').map(h => new Date(h.date)),
      dini: HOLIDAYS_2024_2025.filter(h => h.type === 'dini').map(h => new Date(h.date)),
      'ara-tatil': HOLIDAYS_2024_2025.filter(h => h.type === 'ara-tatil').map(h => new Date(h.date)),
    };
  
    const modifiersClassNames = {
      resmi: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 rounded-md',
      dini: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 rounded-md',
      'ara-tatil': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-md',
      today: 'bg-primary/20 text-primary-foreground',
    };
  
    const selectedDayHoliday = date ? HOLIDAYS_2024_2025.find(h => h.date === format(date, 'yyyy-MM-dd')) : null;
  
    return (
      <div className="bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className='flex-1 flex justify-center'>
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="p-0"
                locale={tr}
            />
        </div>
        <div className="w-full md:w-56 space-y-3 self-start">
            <h4 className="font-semibold text-lg text-center">
                {date ? format(date, 'dd MMMM yyyy', {locale: tr}) : 'Tarih Seçin'}
            </h4>
            {selectedDayHoliday && (
                <Badge 
                    className={cn('w-full justify-center text-base py-2', {
                        'bg-red-600 text-white': selectedDayHoliday.type === 'resmi',
                        'bg-green-600 text-white': selectedDayHoliday.type === 'dini',
                        'bg-blue-600 text-white': selectedDayHoliday.type === 'ara-tatil'
                    })}
                >
                    Bugün {selectedDayHoliday.name}
                </Badge>
            )}
            <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div><span>Resmi Tatil</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div><span>Dini Bayram</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500"></div><span>Ara Tatil</span></div>
            </div>
        </div>
      </div>
    );
  };


export default function AkilliDefterPage() {
  const [currentDate, setCurrentDate] = React.useState('');
  const { db, setDb, loading } = useDatabase();
  const { toast } = useToast();

  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  
  // This state will now only be used inside customize mode.
  const [customizableModules, setCustomizableModules] = useState<HomeModule[]>([]);

  const draggedItem = useRef<number | null>(null);
  const draggedOverItem = useRef<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('tr-TR', options));
  }, []);

  // When entering customize mode, copy the current modules from db to local state.
  useEffect(() => {
    if (isCustomizeMode) {
      setCustomizableModules(db.homeModules || []);
    }
  }, [isCustomizeMode, db.homeModules]);

  const handleSort = () => {
    if (draggedItem.current === null || draggedOverItem.current === null) return;
    const items = [...customizableModules];
    const [reorderedItem] = items.splice(draggedItem.current, 1);
    items.splice(draggedOverItem.current, 0, reorderedItem);
    setCustomizableModules(items);
    draggedItem.current = null;
    draggedOverItem.current = null;
  };
  
  const handleVisibilityChange = (id: string, visible: boolean) => {
    setCustomizableModules(prevModules => prevModules.map(m => m.id === id ? { ...m, visible } : m));
  };

  const handleSaveChanges = () => {
    setDb(prevDb => ({ ...prevDb, homeModules: customizableModules }));
    setIsCustomizeMode(false);
    toast({ title: "Kaydedildi", description: "Menü düzeniniz kaydedildi." });
  };
  
  const handleCancelChanges = () => {
      setIsCustomizeMode(false);
      // No need to reset customizableModules, it will be re-populated on next open.
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
  }
  
  const modulesToDisplay = isCustomizeMode ? customizableModules : db.homeModules;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="w-14 h-14 bg-blue-600 text-white flex items-center justify-center rounded-xl text-2xl font-bold">
              📚
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Akıllı Öğretmen Defteri</h1>
              <p className="text-gray-600">{currentDate}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-3">
             <Button variant="outline" onClick={() => setIsCustomizeMode(prev => !prev)}>
                <Settings className="mr-2" />
                {isCustomizeMode ? 'Özelleştirmeyi Kapat' : 'Menüyü Özelleştir'}
            </Button>
          </div>
        </div>
        {isCustomizeMode && (
          <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <h3 className="font-semibold mb-2">Modül Görünürlüğü ve Sıralama</h3>
            <p className="text-sm text-muted-foreground mb-4">Modülleri sürükleyerek sıralayabilir veya ana menüde gizleyebilirsiniz.</p>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {customizableModules.map((mod, index) => (
                    <div 
                        key={mod.id} 
                        className="flex items-center justify-between p-2 bg-white border rounded-md cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={() => draggedItem.current = index}
                        onDragEnter={() => draggedOverItem.current = index}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div className="flex items-center gap-2">
                            <GripVertical className="text-muted-foreground"/>
                            <span>{mod.title}</span>
                        </div>
                        <Switch
                            checked={mod.visible}
                            onCheckedChange={(checked) => handleVisibilityChange(mod.id, checked)}
                        />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveChanges}><Save className="mr-2"/>Değişiklikleri Kaydet</Button>
                <Button onClick={handleCancelChanges} variant="ghost">İptal</Button>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TimerModule />
        <CalendarWidget />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {modulesToDisplay.map((mod, index) => {
            if (!mod.visible && !isCustomizeMode) return null;
            
            const isDisabled = mod.href === '#';
            
            return (
              <Link 
                key={mod.id} 
                href={mod.href} 
                className={cn(
                  "bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 h-full flex flex-col text-center",
                  (isDisabled || isCustomizeMode) && "pointer-events-none",
                  !isCustomizeMode && !isDisabled && "cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-lg",
                  isCustomizeMode && "cursor-grab active:cursor-grabbing ring-2 ring-blue-500",
                  !mod.visible && "opacity-40 bg-gray-200"
                )}
                draggable={isCustomizeMode}
                onDragStart={isCustomizeMode ? () => (draggedItem.current = index) : undefined}
                onDragEnter={isCustomizeMode ? () => (draggedOverItem.current = index) : undefined}
                onDragEnd={isCustomizeMode ? handleSort : undefined}
                onDragOver={isCustomizeMode ? (e) => e.preventDefault() : undefined}
                onClick={(e) => { if (isDisabled || isCustomizeMode) e.preventDefault(); }}
              >
                  <div className="text-5xl mb-4 mx-auto text-blue-600">{ICONS[mod.icon] || <FileText />}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{mod.title}</h3>
                  <p className="text-gray-600 text-sm flex-1">{mod.description}</p>
              </Link>
            )
        })}
      </div>
    </div>
  );
}
