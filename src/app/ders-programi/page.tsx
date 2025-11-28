
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Home, FileDown, Trash2, Download, FileType, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useDatabase } from '@/hooks/use-database';
import { TimetableData, TimetableCell, TimeSlot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const initialTimeSlots: TimeSlot[] = Array(10).fill({ start: '', end: '' });
const initialSchedule: TimetableCell[][] = Array(5).fill(Array(10).fill({}));

const DersProgramiGelistirilmisPage = () => {
    const { db, setDb, loading } = useDatabase();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCellKey, setActiveCellKey] = useState<{ dayIndex: number; hourIndex: number } | null>(null);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    
    // Always get the latest data directly from the central database hook
    const dersProgrami = db.dersProgrami || { timeSlots: initialTimeSlots, schedule: initialSchedule };
    
    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    const openModal = (dayIndex: number, hourIndex: number) => {
        setActiveCellKey({ dayIndex, hourIndex });
        setIsModalOpen(true);
    };

    const openTimeModal = (hourIndex: number) => {
        setActiveTimeIndex(hourIndex);
        setIsTimeModalOpen(true);
    };

    const handleSaveModal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCellKey) return;
        const { dayIndex, hourIndex } = activeCellKey;

        const form = e.target as HTMLFormElement;
        const ders = (form.elements.namedItem('m_ders') as HTMLInputElement).value;
        const ogretmen = (form.elements.namedItem('m_ogretmen') as HTMLInputElement).value;
        const sinif = (form.elements.namedItem('m_sinif') as HTMLSelectElement)?.value;
        const renk = (form.elements.namedItem('m_renk') as HTMLSelectElement).value;

        setDb(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev.dersProgrami.schedule)); // Deep copy
            newSchedule[dayIndex][hourIndex] = { ders, ogretmen, sinif, renk };
            return {
                ...prev,
                dersProgrami: { ...prev.dersProgrami, schedule: newSchedule }
            };
        });
        setIsModalOpen(false);
    };

    const handleDeleteCell = () => {
        if (!activeCellKey) return;
        const { dayIndex, hourIndex } = activeCellKey;

        setDb(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev.dersProgrami.schedule)); // Deep copy
            newSchedule[dayIndex][hourIndex] = {}; // Clear the cell data
            return {
                ...prev,
                dersProgrami: { ...prev.dersProgrami, schedule: newSchedule }
            };
        });
        setIsModalOpen(false);
    };
    
     const handleSaveTimeModal = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTimeIndex === null) return;
        
        const form = e.target as HTMLFormElement;
        const start = (form.elements.namedItem('m_start_time') as HTMLInputElement).value;
        const end = (form.elements.namedItem('m_end_time') as HTMLInputElement).value;
        
        setDb(prev => {
            const newTimeSlots = [...prev.dersProgrami.timeSlots];
            newTimeSlots[activeTimeIndex] = { start, end };
            return {
                ...prev,
                dersProgrami: { ...prev.dersProgrami, timeSlots: newTimeSlots }
            };
        });
        setIsTimeModalOpen(false);
    };


    const resetProgram = () => {
        if (window.confirm("Tüm program verileri silinecek. Emin misiniz?")) {
            setDb(prev => ({
                ...prev,
                dersProgrami: {
                    timeSlots: Array(10).fill({ start: '', end: '' }),
                    schedule: Array(5).fill(Array(10).fill({})),
                }
            }));
            toast({ title: 'Sıfırlandı', description: 'Ders programı başarıyla sıfırlandı.' });
        }
    };
    
    const exportExcel = () => {
        if (tableRef.current) {
            const wb = XLSX.utils.table_to_book(tableRef.current);
            XLSX.writeFile(wb, "ders_programi.xlsx");
        }
    };

    const exportPDF = async () => {
        if (tableRef.current) {
            const canvas = await html2canvas(tableRef.current);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 15;
            pdf.text("Haftalık Ders Programı", pdfWidth / 2, 10, { align: 'center' });
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save("ders_programi.pdf");
        }
    };

    const days = ["pzt", "sal", "car", "per", "cum"];
    const dayHeaders = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 text-gray-800">
            <header className="mb-6 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                     <Button asChild variant="outline">
                        <Link href="/"><Home className="mr-2"/> Ana Menü</Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Gelişmiş Haftalık Ders Programı</h1>
                 </div>
                <div className="flex justify-center gap-3">
                    <Button onClick={exportExcel} className="bg-green-600 hover:bg-green-700"><FileType className="mr-2"/> Excel’e Aktar</Button>
                    <Button onClick={exportPDF} className="bg-orange-600 hover:bg-orange-700"><Download className="mr-2"/> PDF Çıktı Al</Button>
                    <Button onClick={resetProgram} className="bg-red-600 hover:bg-red-700"><Trash2 className="mr-2"/> Sıfırla</Button>
                </div>
            </header>

            <div className="overflow-x-auto">
                <table ref={tableRef} className="w-full border-collapse bg-white shadow-lg rounded-lg">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-3 bg-blue-800 text-white w-48">Saat</th>
                            {dayHeaders.map(day => (
                                <th key={day} className="border border-gray-300 p-3 bg-blue-800 text-white">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 10 }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                <td onClick={() => openTimeModal(rowIndex)} className="border border-gray-300 p-2 h-20 hover:bg-gray-100 cursor-pointer font-semibold">
                                    <div className="flex flex-col h-full justify-center">
                                        <span>{dersProgrami.timeSlots[rowIndex]?.start || 'Başlangıç'}</span>
                                        <span>-</span>
                                        <span>{dersProgrami.timeSlots[rowIndex]?.end || 'Bitiş'}</span>
                                    </div>
                                </td>
                                {days.map((day, dayIndex) => {
                                    const cellData = dersProgrami.schedule[dayIndex]?.[rowIndex];
                                    const sinifAdi = db.classes.find(c => c.id === cellData?.sinif)?.name || cellData?.sinif;

                                    return (
                                        <td
                                            key={`${day}-${rowIndex}`}
                                            onClick={() => openModal(dayIndex, rowIndex)}
                                            className="border border-gray-300 p-2 h-20 hover:bg-gray-100 cursor-pointer"
                                            style={{ backgroundColor: cellData?.renk || 'transparent' }}
                                        >
                                            {cellData && (
                                                <div className={cellData.renk ? 'text-white' : ''}>
                                                    <strong className="block">{cellData.ders || ""}</strong>
                                                    <small className="block text-xs">{cellData.ogretmen || ""}</small>
                                                    <small className="block text-xs">{sinifAdi || ""}</small>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ders Hücresi Düzenle</DialogTitle>
                        <DialogDescription>
                            Ders bilgilerini girin ve kaydedin.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveModal}>
                        <div className="grid gap-4 py-4">
                            <div><Label htmlFor="m_ders">Ders Adı:</Label><Input id="m_ders" name="m_ders" defaultValue={activeCellKey ? dersProgrami.schedule[activeCellKey.dayIndex][activeCellKey.hourIndex]?.ders : ''} /></div>
                            <div><Label htmlFor="m_ogretmen">Öğretmen:</Label><Input id="m_ogretmen" name="m_ogretmen" defaultValue={activeCellKey ? dersProgrami.schedule[activeCellKey.dayIndex][activeCellKey.hourIndex]?.ogretmen : ''} /></div>
                            <div>
                                <Label htmlFor="m_sinif">Sınıf:</Label>
                                <Select name="m_sinif" defaultValue={activeCellKey ? dersProgrami.schedule[activeCellKey.dayIndex][activeCellKey.hourIndex]?.sinif : ''}>
                                    <SelectTrigger id="m_sinif"><SelectValue placeholder="Sınıf seçin..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Boş</SelectItem>
                                        {db.classes.map(cls => (
                                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="m_renk">Renk:</Label>
                                <Select name="m_renk" defaultValue={activeCellKey ? dersProgrami.schedule[activeCellKey.dayIndex][activeCellKey.hourIndex]?.renk : 'none'}>
                                    <SelectTrigger id="m_renk"><SelectValue placeholder="Renk seçin..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Renk Yok</SelectItem>
                                        <SelectItem value="#3b82f6">Mavi</SelectItem>
                                        <SelectItem value="#10b981">Yeşil</SelectItem>
                                        <SelectItem value="#ef4444">Kırmızı</SelectItem>
                                        <SelectItem value="#f97316">Turuncu</SelectItem>
                                        <SelectItem value="#8b5cf6">Mor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="justify-between">
                            <Button type="button" variant="destructive" onClick={handleDeleteCell}>Ders Hücresini Sil</Button>
                            <div>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="mr-2">Kapat</Button>
                                <Button type="submit">Kaydet</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isTimeModalOpen} onOpenChange={setIsTimeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Saat Dilimini Düzenle</DialogTitle>
                         <DialogDescription>
                            Dersin başlangıç ve bitiş saatini belirleyin.
                        </DialogDescription>
                    </DialogHeader>
                     <form onSubmit={handleSaveTimeModal}>
                        <div className="grid grid-cols-2 gap-4 py-4">
                             <div><Label htmlFor="m_start_time">Başlangıç Saati:</Label><Input id="m_start_time" name="m_start_time" type="time" defaultValue={activeTimeIndex !== null ? dersProgrami.timeSlots[activeTimeIndex]?.start : ''} /></div>
                             <div><Label htmlFor="m_end_time">Bitiş Saati:</Label><Input id="m_end_time" name="m_end_time" type="time" defaultValue={activeTimeIndex !== null ? dersProgrami.timeSlots[activeTimeIndex]?.end : ''} /></div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsTimeModalOpen(false)}>Kapat</Button>
                            <Button type="submit">Kaydet</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default DersProgramiGelistirilmisPage;
    
    

    