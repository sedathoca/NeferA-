'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useDatabase } from '@/hooks/use-database';
import type { ClassData, Homework, CalendarEvent, Student as SınıfYonetimiStudent, YoklamaStudent, AnnualPlan, DailyPlan, Holiday, AnnualPlanEntry, SchoolInfo, HomeworkSubmission, ExamAnalysis, PerformanceCriterion } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Upload, Trash2, Printer, Info, User, FilePen, PlusCircle, Settings, ArrowLeft, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

Chart.register(...registerables);

// --- HELPER FUNCTIONS & COMPONENTS ---

const calculateTermAverage = (termGrades: { [subject: string]: { exam1?: number, exam2?: number, perf1?: number, perf2?: number, proje?: number } } | undefined): string | null => {
    if (!termGrades) return null;
    
    const grades = Object.values(termGrades).flatMap(subject => 
        [subject.exam1, subject.exam2, subject.perf1, subject.perf2, subject.proje]
    ).filter(g => g !== undefined && g !== null) as number[];

    if (grades.length === 0) return null;

    const sum = grades.reduce((a, b) => a + b, 0);
    return (sum / grades.length).toFixed(2);
};

const StudentDetailModal = ({ student, classId, updateDb, onClose, db }: { student: SınıfYonetimiStudent, classId: string, updateDb: ReturnType<typeof useDatabase>['setDb'], onClose: () => void, db: ReturnType<typeof useDatabase>['db'] }) => {
    const handleMarkChange = (studentId: string, type: 'plus' | 'minus') => {
        updateDb(prevDb => {
            const newClasses = prevDb.classes.map(c => {
                if (c.id === classId) {
                    return {
                        ...c,
                        students: c.students.map(s => {
                            if (s.id === studentId) {
                                const newMarks = { ...s.marks };
                                newMarks[type] = (newMarks[type] || 0) + 1;
                                return { ...s, marks: newMarks };
                            }
                            return s;
                        })
                    };
                }
                return c;
            });
            return { ...prevDb, classes: newClasses };
        });
    };

    const handleGradeChange = (term: 'firstTerm' | 'secondTerm', type: 'exam1' | 'exam2' | 'perf1' | 'perf2' | 'proje', value: string) => {
        const numericValue = value === '' ? undefined : Number(value);
        if (value !== '' && (isNaN(numericValue!) || numericValue! < 0 || numericValue! > 100)) return;

        updateDb(prevDb => {
            const newClasses = prevDb.classes.map(c => {
                if (c.id === classId) {
                    return {
                        ...c,
                        students: c.students.map(s => {
                            if (s.id === student.id) {
                                const newGrades = { ...s.grades };
                                if (!newGrades[term]) newGrades[term] = {};
                                if (!newGrades[term]!['Ders']) newGrades[term]!['Ders'] = {};
                                newGrades[term]!['Ders'][type] = numericValue;
                                return { ...s, grades: newGrades };
                            }
                            return s;
                        })
                    };
                }
                return c;
            });
            return { ...prevDb, classes: newClasses };
        });
    };

    const studentHomeworks = useMemo(() => {
        return db.homework
            .filter(hw => hw.classId === classId)
            .map(hw => {
                const submission = hw.submissions?.find(s => s.studentId === student.id);
                return {
                    ...hw,
                    studentStatus: submission?.status || 'pending'
                };
            });
    }, [db.homework, classId, student.id]);

    const firstTermAverage = useMemo(() => calculateTermAverage(student.grades?.firstTerm), [student.grades?.firstTerm]);
    const secondTermAverage = useMemo(() => calculateTermAverage(student.grades?.secondTerm), [student.grades?.secondTerm]);
    
    const overallAverage = useMemo(() => {
        if (firstTermAverage && secondTermAverage) {
            return ((parseFloat(firstTermAverage) + parseFloat(secondTermAverage)) / 2).toFixed(2);
        } else if (firstTermAverage) {
            return firstTermAverage;
        } else if (secondTermAverage) {
            return secondTermAverage;
        }
        return null;
    }, [firstTermAverage, secondTermAverage]);

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/50">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                            <DialogTitle>{student.name}</DialogTitle>
                            <DialogDescription>No: {student.no}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 space-y-6 pr-6">
                    <Tabs defaultValue="grades">
                        <TabsList>
                            <TabsTrigger value="grades">Notlar</TabsTrigger>
                            <TabsTrigger value="homework">Ödevler</TabsTrigger>
                        </TabsList>
                        <TabsContent value="grades" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader><CardTitle>Artı / Eksi</CardTitle></CardHeader>
                                    <CardContent className="flex items-center gap-4 text-2xl">
                                        <Button onClick={() => handleMarkChange(student.id, 'plus')} size="icon" variant="outline" className="h-8 w-8 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-800/50"><Plus className="h-4 w-4 text-green-600" /></Button>
                                        <span className="text-green-500 font-bold">Artı: {student.marks?.plus || 0}</span>
                                        <Button onClick={() => handleMarkChange(student.id, 'minus')} size="icon" variant="outline" className="h-8 w-8 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/50"><Minus className="h-4 w-4 text-red-600" /></Button>
                                        <span className="text-red-500 font-bold">Eksi: {student.marks?.minus || 0}</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Yıl Sonu Genel Ortalama</CardTitle></CardHeader>
                                    <CardContent><div className="text-3xl font-bold text-blue-600 dark:text-blue-300">{overallAverage ?? 'Hesaplanmadı'}</div></CardContent>
                                </Card>
                            </div>
                            <Tabs defaultValue="firstTerm">
                                <TabsList>
                                    <TabsTrigger value="firstTerm">1. Dönem</TabsTrigger>
                                    <TabsTrigger value="secondTerm">2. Dönem</TabsTrigger>
                                </TabsList>
                                <TabsContent value="firstTerm">
                                    <div className="mb-4 p-4 border rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">Ders Notları</h4>
                                            <p className="font-bold text-lg">Ortalama: {firstTermAverage ?? '---'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            <Input type="number" placeholder="1. Sınav" value={student.grades?.firstTerm?.['Ders']?.exam1 ?? ''} onChange={e => handleGradeChange('firstTerm', 'exam1', e.target.value)} />
                                            <Input type="number" placeholder="2. Sınav" value={student.grades?.firstTerm?.['Ders']?.exam2 ?? ''} onChange={e => handleGradeChange('firstTerm', 'exam2', e.target.value)} />
                                            <Input type="number" placeholder="1. Performans" value={student.grades?.firstTerm?.['Ders']?.perf1 ?? ''} onChange={e => handleGradeChange('firstTerm', 'perf1', e.target.value)} />
                                            <Input type="number" placeholder="2. Performans" value={student.grades?.firstTerm?.['Ders']?.perf2 ?? ''} onChange={e => handleGradeChange('firstTerm', 'perf2', e.target.value)} />
                                            <Input type="number" placeholder="PROJE" value={student.grades?.firstTerm?.['Ders']?.proje ?? ''} onChange={e => handleGradeChange('firstTerm', 'proje', e.target.value)} />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="secondTerm">
                                    <div className="mb-4 p-4 border rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">Ders Notları</h4>
                                            <p className="font-bold text-lg">Ortalama: {secondTermAverage ?? '---'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            <Input type="number" placeholder="1. Sınav" value={student.grades?.secondTerm?.['Ders']?.exam1 ?? ''} onChange={e => handleGradeChange('secondTerm', 'exam1', e.target.value)} />
                                            <Input type="number" placeholder="2. Sınav" value={student.grades?.secondTerm?.['Ders']?.exam2 ?? ''} onChange={e => handleGradeChange('secondTerm', 'exam2', e.target.value)} />
                                            <Input type="number" placeholder="1. Performans" value={student.grades?.secondTerm?.['Ders']?.perf1 ?? ''} onChange={e => handleGradeChange('secondTerm', 'perf1', e.target.value)} />
                                            <Input type="number" placeholder="2. Performans" value={student.grades?.secondTerm?.['Ders']?.perf2 ?? ''} onChange={e => handleGradeChange('secondTerm', 'perf2', e.target.value)} />
                                            <Input type="number" placeholder="PROJE" value={student.grades?.secondTerm?.['Ders']?.proje ?? ''} onChange={e => handleGradeChange('secondTerm', 'proje', e.target.value)} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </TabsContent>
                        <TabsContent value="homework">
                            <Card>
                                <CardHeader><CardTitle>Ödev Geçmişi</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Ödev</TableHead><TableHead>Teslim Tarihi</TableHead><TableHead>Durum</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {studentHomeworks.length > 0 ? studentHomeworks.map(hw => (
                                                <TableRow key={hw.id}>
                                                    <TableCell>{hw.title}</TableCell>
                                                    <TableCell>{new Date(hw.dueDate).toLocaleDateString('tr-TR')}</TableCell>
                                                    <TableCell>
                                                        <Select value={hw.studentStatus} onValueChange={(newStatus: 'completed' | 'not_completed' | 'pending') => {
                                                            updateDb(prevDb => ({...prevDb, homework: prevDb.homework.map(h => h.id === hw.id ? {...h, submissions: h.submissions?.some(s => s.studentId === student.id) ? h.submissions.map(s => s.studentId === student.id ? {...s, status: newStatus} : s) : [...(h.submissions || []), { studentId: student.id, status: newStatus }]} : h)}));
                                                        }}>
                                                            <SelectTrigger className={cn('w-[130px]', {'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300': hw.studentStatus === 'completed', 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300': hw.studentStatus === 'not_completed' })}><SelectValue placeholder="Durum Seçin" /></SelectTrigger>
                                                            <SelectContent><SelectItem value="pending">Bekleniyor</SelectItem><SelectItem value="completed">Yaptı</SelectItem><SelectItem value="not_completed">Yapmadı</SelectItem></SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow><TableCell colSpan={3} className="text-center">Bu öğrenciye atanmış ödev yok.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ClassDetailView = ({ classId, updateDb, db, onBack }: { classId: string, updateDb: ReturnType<typeof useDatabase>['setDb'], db: ReturnType<typeof useDatabase>['db'], onBack: () => void }) => {
    const [selectedStudent, setSelectedStudent] = useState<SınıfYonetimiStudent | null>(null);
    const cls = db.classes.find(c => c.id === classId);

    if (!cls) return <div>Sınıf bulunamadı.</div>;

    return (
        <div>
            <Button onClick={onBack} variant="outline" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Geri</Button>
            <h2 className="text-2xl font-bold mb-4">{cls.name} Sınıfı Detayları</h2>
            <Table>
                <TableHeader><TableRow><TableHead>No</TableHead><TableHead>Adı Soyadı</TableHead><TableHead>Artı/Eksi</TableHead><TableHead>İşlemler</TableHead></TableRow></TableHeader>
                <TableBody>
                    {cls.students.map(student => (
                        <TableRow key={student.id}>
                            <TableCell>{student.no}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell><div className="flex items-center gap-2"><span className="font-bold text-green-600 dark:text-green-400">+{student.marks?.plus || 0}</span><span className="font-bold text-red-600 dark:text-red-400">-{student.marks?.minus || 0}</span></div></TableCell>
                            <TableCell><Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>Detaylar</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {selectedStudent && <StudentDetailModal student={selectedStudent} classId={classId} updateDb={updateDb} onClose={() => setSelectedStudent(null)} db={db} />}
        </div>
    );
};

const ClassActions: React.FC<{ classData: ClassData; updateDb: ReturnType<typeof useDatabase>['setDb']; onClose: () => void; handleOpenExamReportModal: (classId: string) => void;}> = ({ classData, updateDb, onClose, handleOpenExamReportModal }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(classData.name);
    const { toast } = useToast();

    const handleUpdateName = useCallback(() => {
        if (newName.trim() === '') return;
        updateDb(prev => ({...prev, classes: prev.classes.map(c => c.id === classData.id ? { ...c, name: newName.trim() } : c)}));
        setIsEditing(false);
        onClose();
        toast({ title: 'Başarılı', description: 'Sınıf adı güncellendi.' });
    }, [newName, classData.id, updateDb, onClose, toast]);

    const handleDeleteClass = useCallback(() => {
        updateDb(prev => ({...prev, classes: prev.classes.filter(c => c.id !== classData.id)}));
        onClose();
        toast({ title: 'Başarılı', description: 'Sınıf silindi.' });
    }, [classData.id, updateDb, onClose, toast]);

    return (
        <>
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader><DialogTitle>⚙️ {classData.name} - İşlemler</DialogTitle><DialogDescription>Bu sınıfla ilgili genel işlemleri buradan yönetebilirsiniz.</DialogDescription></DialogHeader>
                    <div className="py-4 space-y-3">
                        <Button className="w-full justify-start" variant="secondary" onClick={() => setIsEditing(true)}>✏️ Sınıfı Düzenle</Button>
                        <Button className="w-full justify-start" variant="secondary" onClick={() => { onClose(); handleOpenExamReportModal(classData.id); }}>📄 Sınav Sonuç Değerlendirme Tutanağı</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="w-full justify-start" variant="destructive">🗑️ Sınıfı Sil</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Emin misiniz?</AlertDialogTitle><AlertDialogDescription>Bu eylem geri alınamaz. "{classData.name}" sınıfını ve tüm ilişkili verileri kalıcı olarak sileceksiniz.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>İptal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteClass}>Evet, Sil</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </DialogContent>
            </Dialog>
            {isEditing && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Sınıfı Düzenle</DialogTitle><DialogDescription>Sınıfın adını güncelleyebilirsiniz.</DialogDescription></DialogHeader>
                        <div className="py-4"><label htmlFor="edit-class-name-modal" className="text-sm font-medium">Sınıf Adı</label><Input id="edit-class-name-modal" value={newName} onChange={e => setNewName(e.target.value)} /></div>
                        <DialogFooter><Button variant="ghost" onClick={() => setIsEditing(false)}>İptal</Button><Button onClick={handleUpdateName}>Kaydet</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default function ClassManagementPage() {
    const { db, setDb: updateDb, loading } = useDatabase();
    const { toast } = useToast();
    const [currentTab, setCurrentTab] = useState('sinif-yonetimi');
    const [yoklamaStudents, setYoklamaStudents] = useState<YoklamaStudent[]>([]);
    const [yoklamaClassId, setYoklamaClassId] = useState<string | null>(null);
    const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null);
    const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
    const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [classToInteract, setClassToInteract] = useState<ClassData | null>(null);
    const [activeClassId, setActiveClassId] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [newEventClassId, setNewEventClassId] = useState<string>('');
    const [selectedAnnualPlanId, setSelectedAnnualPlanId] = useState<string>('');
    const [isExamReportModalOpen, setIsExamReportModalOpen] = useState(false);
    const [examReportClassId, setExamReportClassId] = useState<string|null>(null);
    const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
    const [currentOutcomeIndex, setCurrentOutcomeIndex] = useState(0);
    const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
    const [currentTheme, setCurrentTheme] = useState('light');
    const [importClassId, setImportClassId] = useState('');
    const [importTerm, setImportTerm] = useState<'firstTerm' | 'secondTerm'>('firstTerm');
    const [examReportState, setExamReportState] = useState({
        examDate: '',
        examName: '',
        zümreBaşkanı: '',
        zümreÖğretmenleri: '',
        learningOutcomes: [
            { text: '', planText: '', customPlanText: '', planDate: '' },
            { text: '', planText: '', customPlanText: '', planDate: '' },
            { text: '', planText: '', customPlanText: '', planDate: '' },
        ]
    });

    const setTheme = useCallback((theme: string) => {
        setCurrentTheme(theme);
        if(typeof document !== 'undefined'){
            document.documentElement.classList.toggle('dark', theme === 'dark');
            localStorage.setItem('theme', theme);
        }
    }, []);
    
    useEffect(() => {
        const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
        setTheme(savedTheme);
    
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(now.toLocaleDateString('tr-TR', options));
    }, [setTheme]);

    const showTab = useCallback((tabName: string) => {
        setActiveClassId(null);
        setCurrentTab(tabName);
    }, []);

    const handleCreateClass = useCallback(() => {
        const input = document.getElementById('new-class-name-modal') as HTMLInputElement;
        const className = input?.value.trim();
        if (!className) {
            toast({ title: 'Hata', description: 'Sınıf adı zorunludur!', variant: 'destructive' });
            return;
        }

        let isDuplicate = false;
        updateDb(prevDb => {
            if (prevDb.classes.some(cls => cls.name === className)) {
                isDuplicate = true;
                return prevDb;
            }
            const newClass: ClassData = { id: 'class_' + Date.now(), name: className, students: [], attendance: {}, createdAt: new Date().toISOString() };
            return { ...prevDb, classes: [...prevDb.classes, newClass] };
        });

        if (isDuplicate) {
          toast({ title: 'Hata', description: 'Bu isimde bir sınıf zaten var!', variant: 'destructive' });
        } else {
          toast({ title: 'Başarılı', description: `${className} sınıfı oluşturuldu.` });
          setIsNewClassModalOpen(false);
        }
    }, [toast, updateDb]);

    const handleDownloadTemplate = useCallback(() => {
        const headers = ['Sıra No', 'Okul No', 'Adı Soyadı', 'Y1', 'Y2', 'P1', 'P2', 'PROJE'];
        const worksheet = XLSX.utils.aoa_to_sheet([headers]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Not Listesi");
        XLSX.writeFile(workbook, `Ogrenci_Not_Sablonu.xlsx`);
    }, []);

    const handleImportStudents = useCallback((classId: string, term: 'firstTerm' | 'secondTerm') => {
        const fileInput = document.getElementById('excel-file-modal') as HTMLInputElement;
        if (!fileInput.files?.length || !classId) {
            toast({ title: 'Hata', description: 'Lütfen bir sınıf ve Excel dosyası seçin!', variant: 'destructive' });
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                let addedCount = 0, updatedCount = 0;

                updateDb(prevDb => {
                    const newDb = JSON.parse(JSON.stringify(prevDb));
                    const cls = newDb.classes.find((c: ClassData) => c.id === classId);
                    if (!cls) return prevDb;
                    if (!cls.students) cls.students = [];
                    
                    jsonData.slice(1).forEach(row => {
                        if (!row || row.length < 3) return;
                        const studentNo = String(row[1]).trim();
                        const studentName = String(row[2]).trim();
                        if (!studentNo || !studentName) return;

                        let student = cls.students.find((s: SınıfYonetimiStudent) => s.no === studentNo);
                        if (!student) {
                            student = { id: 'student_' + Date.now() + Math.random(), no: studentNo, name: studentName, marks: { plus: 0, minus: 0 }, grades: { firstTerm: {}, secondTerm: {} } };
                            cls.students.push(student);
                            addedCount++;
                        } else {
                            updatedCount++;
                        }

                        if (!student.grades) student.grades = { firstTerm: {}, secondTerm: {} };
                        if (!student.grades[term]) student.grades[term] = {};
                        if (!student.grades[term]!['Ders']) student.grades[term]!['Ders'] = {};

                        const parseGrade = (val: any) => (val !== undefined && val !== '') ? parseFloat(String(val)) : undefined;
                        const gradesToUpdate = { exam1: parseGrade(row[3]), exam2: parseGrade(row[4]), perf1: parseGrade(row[5]), perf2: parseGrade(row[6]), proje: parseGrade(row[7]) };

                        Object.entries(gradesToUpdate).forEach(([key, value]) => {
                            if (value !== undefined && !isNaN(value)) {
                                (student.grades[term]!['Ders'] as any)[key] = value;
                            }
                        });
                    });
                    return newDb;
                });
                
                toast({ title: 'Başarılı', description: `${addedCount} öğrenci eklendi, ${updatedCount} öğrenci güncellendi.` });
                setIsImportModalOpen(false);
            } catch (error) {
                toast({ title: 'Hata', description: 'Excel dosyası işlenirken bir hata oluştu!', variant: 'destructive' });
            }
        };
        reader.readAsArrayBuffer(file);
    }, [toast, updateDb]);

    const handleOpenExamReportModal = useCallback((classId: string) => {
        setExamReportClassId(classId);
        setExamReportState(prev => ({
            ...prev,
            zümreBaşkanı: db.schoolInfo?.classTeacherName || '',
            zümreÖğretmenleri: db.schoolInfo?.classTeacherName || '',
        }));
        setIsExamReportModalOpen(true);
    }, [db.schoolInfo]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
    }
    
    const getTotalHomeworkCount = () => db.homework?.filter(hw => hw.status === 'pending').length || 0;
    const getTotalAttendanceDays = () => db.classes.reduce((total, cls) => total + (cls.attendance ? Object.keys(cls.attendance).length : 0), 0);
    const getClassHomeworkCount = (classId: string) => db.homework?.filter(hw => hw.classId === classId && hw.status === 'pending').length || 0;
    const getClassAverage = (cls: ClassData) => {
        if (!cls.students?.length) return '-';
        let totalAverage = 0, studentWithGradesCount = 0;
        cls.students.forEach(student => {
            const firstTermAvg = calculateTermAverage(student.grades?.firstTerm);
            const secondTermAvg = calculateTermAverage(student.grades?.secondTerm);
            let avg = 0;
            if (firstTermAvg && secondTermAvg) avg = (parseFloat(firstTermAvg) + parseFloat(secondTermAvg)) / 2;
            else if (firstTermAvg) avg = parseFloat(firstTermAvg);
            else if (secondTermAvg) avg = parseFloat(secondTermAvg);

            if(avg > 0) {
              totalAverage += avg;
              studentWithGradesCount++;
            }
        });
        return studentWithGradesCount > 0 ? (totalAverage / studentWithGradesCount).toFixed(2) : '-';
    };
    
    const takeAttendance = (classId: string) => {
        const cls = db.classes.find(c => c.id === classId);
        if (cls?.students) {
            setYoklamaClassId(classId);
            setYoklamaStudents(cls.students.map(s => ({ id: s.id, name: s.name, no: s.no, present: null })));
            setCurrentTab('yoklama');
        }
    };
    
    const markYoklamaPresent = (studentId: string) => setYoklamaStudents(prev => prev.map(s => s.id === studentId ? {...s, present: true} : s));
    const markYoklamaAbsent = (studentId: string) => setYoklamaStudents(prev => prev.map(s => s.id === studentId ? {...s, present: false} : s));
    const resetYoklama = () => setYoklamaStudents(yoklamaStudents.map(s => ({...s, present: null})));
    
    const saveYoklama = () => {
        if (!yoklamaClassId) return toast({ title: 'Hata', variant: 'destructive' });
        const today = format(new Date(), 'yyyy-MM-dd');
        const attendanceRecord: { [studentId: string]: 'present' | 'absent' } = {};
        yoklamaStudents.forEach(s => {
            if (s.present !== null) attendanceRecord[s.id] = s.present ? 'present' : 'absent';
        });
        updateDb(prevDb => {
            const newClasses = prevDb.classes.map(c => c.id === yoklamaClassId ? {...c, attendance: {...c.attendance, [today]: attendanceRecord}} : c);
            return { ...prevDb, classes: newClasses };
        });
        toast({ title: 'Başarılı', description: 'Yoklama kaydedildi.' });
    };

    const handlePrintExamReport = () => {
        if (!examReportClassId || !db.schoolInfo) return toast({ title: 'Hata', variant: 'destructive' });
        const cls = db.classes.find(c => c.id === examReportClassId);
        if (!cls) return toast({ title: 'Hata', variant: 'destructive' });

        const { examDate, examName, learningOutcomes } = examReportState;
        const studentCount = cls.students.length;
        let range1 = 0, range2 = 0, range3 = 0;
        cls.students.forEach(s => {
            const grade = s.grades?.firstTerm?.Ders?.exam1;
            if (grade !== undefined) {
                if (grade < 50) range1++;
                else if (grade < 70) range2++;
                else range3++;
            }
        });

        const table1 = `<tr><td style="font-weight: bold;">Ders</td><td>Fizik</td><td style="font-weight: bold;">Sınav Tarihi</td><td>${examDate}</td></tr><tr><td style="font-weight: bold;">Sınıf</td><td>${cls.name}</td><td style="font-weight: bold;">Sınav Adı</td><td>${examName}</td></tr>`;
        const table2 = `<thead><tr><th>Sınava Giren Öğrenci Sayısı</th><th>0-49 Arası</th><th>50-69 Arası</th><th>70-100 Arası</th></tr></thead><tbody><tr><td style="text-align: center;">${studentCount}</td><td style="text-align: center;">${range1}</td><td style="text-align: center;">${range2}</td><td style="text-align: center;">${range3}</td></tr></tbody>`;
        const table3 = `<thead><tr><th>Eksik Öğrenme Çıktıları</th><th>Gelişim Planı</th><th>Tarih</th></tr></thead><tbody>${learningOutcomes.map(o => `<tr><td style="min-height: 40px; vertical-align: top;">${(o.text || '').replace(/\n/g, '<br/>')}</td><td style="min-height: 40px; vertical-align: top;">${((o.planText === 'Diğer' ? o.customPlanText : o.planText) || '').replace(/\n/g, '<br/>')}</td><td style="min-height: 40px; vertical-align: top;">${o.planDate ? new Date(o.planDate).toLocaleDateString('tr-TR') : ''}</td></tr>`).join('')}</tbody>`;
        const signatureArea = `<table style="width:100%; border: none; margin-top: 50px; font-size: 11pt;"><tr style="text-align: center;"><td style="border: none; padding: 10px;">${examReportState.zümreÖğretmenleri || db.schoolInfo.classTeacherName}<br/>Ders Öğretmeni</td><td style="border: none; padding: 10px;">${examReportState.zümreBaşkanı}<br/>Zümre Başkanı</td><td style="border: none; padding: 10px;">${db.schoolInfo.schoolPrincipalName}<br/>Okul Müdürü</td></tr></table>`;
        const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sınav Sonuç Tutanağı</title><style>body{font-family:'Times New Roman',Times,serif;font-size:10pt}table{width:100%;border-collapse:collapse;margin-bottom:15px}th,td{border:1px solid black;padding:5px;text-align:left}th{background-color:#f2f2f2}h1,h2,h3{text-align:center;margin:5px 0}h1{font-size:14pt}h2{font-size:12pt}h3{font-size:12pt;font-weight:normal}</style></head><body><h1>SINAV SONUÇ DEĞERLENDİRME TUTANAĞI</h1><h2>${db.schoolInfo.schoolName}</h2><h3>${examName}</h3><table border="1">${table1}</table><h3>1. Bölüm: Öğrencilerin Puan Dağılımı</h3><table border="1">${table2}</table><h3>2. Bölüm: Eksik Öğrenme Çıktılarının Belirlenmesi ve Telafi Çalışmalarının Planlanması</h3><table border="1">${table3}</table>${signatureArea}</body></html>`;
        
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sinav-sonuc-tutanagi-${cls.name}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: 'Başarılı' });
    };

    const handleOpenOutcomeSelector = (index: number) => {
        setCurrentOutcomeIndex(index);
        setSelectedOutcomes([]);
        setIsOutcomeModalOpen(true);
    };

    const handleSelectOutcomes = () => {
        setExamReportState(prev => {
            const newOutcomes = [...prev.learningOutcomes];
            if (newOutcomes[currentOutcomeIndex]) {
                const existing = newOutcomes[currentOutcomeIndex].text || '';
                newOutcomes[currentOutcomeIndex].text = existing ? `${existing}\n${selectedOutcomes.join('\n')}` : selectedOutcomes.join('\n');
            }
            return { ...prev, learningOutcomes: newOutcomes };
        });
        setIsOutcomeModalOpen(false);
    };

    const assignHomework = () => setCurrentTab('odev');
    const openHomeworkTracker = (id: string) => { setActiveHomeworkId(id); setIsHomeworkModalOpen(true); };

    return (
        <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <header className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <div className="w-14 h-14 bg-blue-600 text-white flex items-center justify-center rounded-xl text-2xl font-bold">🏫</div>
                        <div>
                            <h1 className="text-3xl font-bold">Sınıf Yönetim Modülü</h1>
                            <p className="text-muted-foreground">{currentDate}</p>
                        </div>
                    </div>
                    <Link href="/" passHref><Button>Ana Sayfa</Button></Link>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <button className={`py-3 px-6 font-medium transition-colors duration-200 ${currentTab === 'sinif-yonetimi' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground'}`} onClick={() => showTab('sinif-yonetimi')}>👥 Sınıf Yönetimi</button>
                    <button className={`py-3 px-6 font-medium transition-colors duration-200 ${currentTab === 'yoklama' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground'}`} onClick={() => showTab('yoklama')}>✅ Yoklama Sistemi</button>
                    <button className={`py-3 px-6 font-medium transition-colors duration-200 ${currentTab === 'odev' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground'}`} onClick={() => showTab('odev')}>📚 Ödev Modülü</button>
                    <button className={`py-3 px-6 font-medium transition-colors duration-200 ${currentTab === 'takvim' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground'}`} onClick={() => showTab('takvim')}>📅 Akıllı Takvim</button>
                    <button className={`py-3 px-6 font-medium transition-colors duration-200 ${currentTab === 'yillik-plan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground'}`} onClick={() => showTab('yillik-plan')}>🗓️ Yıllık Planlar</button>
                </div>
                <div className="p-6">
                    {currentTab === 'sinif-yonetimi' && (
                        activeClassId ? <ClassDetailView classId={activeClassId} updateDb={updateDb} db={db} onBack={() => setActiveClassId(null)} /> : 
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam Sınıf</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{db.classes.length}</div></CardContent></Card>
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{db.classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}</div></CardContent></Card>
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Aktif Ödev</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{getTotalHomeworkCount()}</div></CardContent></Card>
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Yoklama Günü</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{getTotalAttendanceDays()}</div></CardContent></Card>
                            </div>
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <div><CardTitle>Sınıf İşlemleri</CardTitle><CardDescription>Yeni sınıf ekleyin veya mevcutları yönetin.</CardDescription></div>
                                    <div className="flex space-x-3">
                                        <Button onClick={() => setIsImportModalOpen(true)}>📥 Excel'den Öğrenci ve Not Aktar</Button>
                                        <Button onClick={() => setIsNewClassModalOpen(true)} variant="secondary">+ Yeni Sınıf Ekle</Button>
                                    </div>
                                </CardHeader>
                            </Card>
                            {db.classes.length === 0 ? <div className="text-center py-12 border-2 border-dashed rounded-lg">...</div> : 
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {db.classes.map(cls => (
                                    <Card key={cls.id}>
                                        <CardHeader><div className="flex justify-between items-start"><div><CardTitle>{cls.name}</CardTitle><CardDescription>{cls.students?.length || 0} öğrenci</CardDescription></div><span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">{cls.students?.length || 0}</span></div></CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="p-2 rounded-lg"><div className="text-lg font-bold">{getClassHomeworkCount(cls.id)}</div><div className="text-xs">Ödev</div></div>
                                                <div className="p-2 rounded-lg"><div className="text-lg font-bold">{cls.attendance ? Object.keys(cls.attendance).length : 0}</div><div className="text-xs">Yoklama</div></div>
                                                <div className="p-2 rounded-lg"><div className="text-lg font-bold">{getClassAverage(cls)}</div><div className="text-xs">Ortalama</div></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2"><Button onClick={() => takeAttendance(cls.id)} size="sm">📝 Yoklama</Button><Button onClick={assignHomework} size="sm" variant="secondary">📚 Ödev</Button></div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between"><Button onClick={() => setActiveClassId(cls.id)} className="flex-1" variant="outline">Detaylı Görünüm</Button><Button onClick={() => setClassToInteract(cls)} variant="ghost" size="icon" className="ml-2"><Settings /></Button></CardFooter>
                                    </Card>
                                ))}
                            </div>}
                        </div>
                    )}
                    {currentTab === 'yoklama' && (yoklamaClassId ? <div className="space-y-4"><div className="flex justify-between items-center"><h3 className="text-xl font-bold">Yoklama - {db.classes.find(c=>c.id===yoklamaClassId)?.name} ({format(new Date(), 'dd MMMM yyyy')})</h3><div className="flex gap-2"><Button onClick={saveYoklama} className="bg-green-600 hover:bg-green-700">Kaydet</Button><Button onClick={resetYoklama} variant="outline">Sıfırla</Button></div></div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">{yoklamaStudents.map(student => (<div key={student.id} className={cn("p-3 border rounded-lg text-center cursor-pointer", { 'bg-green-100 border-green-400': student.present === true, 'bg-red-100 border-red-400': student.present === false })}><p className="font-semibold text-sm">{student.name}</p><p className="text-xs text-muted-foreground">{student.no}</p><div className="mt-3 flex justify-center gap-2"><Button onClick={() => markYoklamaPresent(student.id)} size="sm" variant="outline" className={cn("w-12", {'bg-green-200': student.present === true})}>Var</Button><Button onClick={() => markYoklamaAbsent(student.id)} size="sm" variant="outline" className={cn("w-12", {'bg-red-200': student.present === false})}>Yok</Button></div></div>))}</div></div> : <div className="text-center py-10"><p>Yoklama almak için önce Sınıf Yönetimi'nden bir sınıf seçin.</p><Button onClick={() => setCurrentTab('sinif-yonetimi')} className="mt-4">Sınıf Yönetimine Git</Button></div>)}
                    {currentTab === 'odev' && (
                        <div className="space-y-6">
                            <Card><CardHeader className="flex flex-row justify-between items-center"><CardTitle>Ödev İşlemleri</CardTitle><Dialog><DialogTrigger asChild><Button>+ Yeni Ödev Ekle</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Yeni Ödev Ekle</DialogTitle></DialogHeader><div className="space-y-4 py-4">...</div><DialogFooter><Button>Ekle</Button></DialogFooter></DialogContent></Dialog></CardHeader></Card>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card><CardHeader><CardTitle>Bekleyen Ödevler</CardTitle></CardHeader><CardContent>{db.homework.filter(hw => hw.status === 'pending').map(hw => <div key={hw.id} onClick={() => openHomeworkTracker(hw.id)} className="border rounded-lg p-4 mb-4 cursor-pointer">...</div>)}</CardContent></Card>
                                <Card><CardHeader><CardTitle>Tamamlanan Ödevler</CardTitle></CardHeader><CardContent>{db.homework.filter(hw => hw.status === 'completed').map(hw => <div key={hw.id} onClick={() => openHomeworkTracker(hw.id)} className="border rounded-lg p-4 mb-4 cursor-pointer">...</div>)}</CardContent></Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {classToInteract && <ClassActions classData={classToInteract} updateDb={updateDb} onClose={() => setClassToInteract(null)} handleOpenExamReportModal={handleOpenExamReportModal} />}
            <Dialog open={isNewClassModalOpen} onOpenChange={setIsNewClassModalOpen}><DialogContent><DialogHeader><DialogTitle>Yeni Sınıf Oluştur</DialogTitle></DialogHeader><div className="py-4"><Input id="new-class-name-modal" placeholder="9-A" /></div><DialogFooter><Button variant="ghost" onClick={() => setIsNewClassModalOpen(false)}>İptal</Button><Button onClick={handleCreateClass}>Oluştur</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}><DialogContent><DialogHeader><DialogTitle>Excel'den Öğrenci Aktar</DialogTitle></DialogHeader><div className="space-y-4 py-4"><Select value={importClassId} onValueChange={setImportClassId}><SelectTrigger><SelectValue placeholder="Sınıf Seçin..."/></SelectTrigger><SelectContent>{db.classes.map(cls => <SelectItem value={cls.id} key={cls.id}>{cls.name}</SelectItem>)}</SelectContent></Select><Select value={importTerm} onValueChange={(v) => setImportTerm(v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="firstTerm">1. Dönem</SelectItem><SelectItem value="secondTerm">2. Dönem</SelectItem></SelectContent></Select><Input type="file" id="excel-file-modal" accept=".xlsx,.xls,.csv" /><Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full"><FileDown className="mr-2 h-4 w-4" /> Şablonu İndir</Button></div><DialogFooter><Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>İptal</Button><Button onClick={() => handleImportStudents(importClassId, importTerm)}>İçe Aktar</Button></DialogFooter></DialogContent></Dialog>
            {isHomeworkModalOpen && <Dialog open={isHomeworkModalOpen} onOpenChange={setIsHomeworkModalOpen}><DialogContent>...</DialogContent></Dialog>}
            {isExamReportModalOpen && <Dialog open={isExamReportModalOpen} onOpenChange={() => setIsExamReportModalOpen(false)}><DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">...</DialogContent></Dialog>}
            {isOutcomeModalOpen && <Dialog open={isOutcomeModalOpen} onOpenChange={setIsOutcomeModalOpen}><DialogContent>...</DialogContent></Dialog>}
        </div>
    );
}