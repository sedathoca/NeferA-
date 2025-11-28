
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Users,
  Home,
  ClipboardList,
  FileDown,
  PlusCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { SınıfYonetimiStudent, SchoolInfo } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDatabase } from '@/hooks/use-database';


const ProjectAssignmentPage: React.FC = () => {
  const { db, setDb, loading } = useDatabase();
  const { schoolInfo, classes, lessons } = db;
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [newLessonName, setNewLessonName] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const studentsInSelectedClass = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find(c => c.id === selectedClassId);
    return selectedClass?.students || [];
  }, [selectedClassId, classes]);
  
  useEffect(() => {
    if (loading) return;

    if (!schoolInfo) {
      toast({
        title: 'Okul Bilgileri Eksik',
        description: 'Lütfen önce okul bilgilerini girin.',
        variant: 'destructive',
      });
      router.push('/bilgi-girisi');
    }
  }, [schoolInfo, loading, router, toast]);
  
  const handleDataChange = (studentId: string, value: string) => {
    setDb(prevDb => {
      const newClasses = prevDb.classes.map(c => {
        if (c.id === selectedClassId) {
          return {
            ...c,
            students: c.students.map(s => 
              s.id === studentId ? { ...s, projectLesson: value } : s
            )
          }
        }
        return c;
      });
      return { ...prevDb, classes: newClasses };
    });
  }

  const handleAddNewLesson = () => {
    const trimmedLesson = newLessonName.trim();
    if (!trimmedLesson) {
        toast({ title: 'Hata', description: 'Ders adı boş olamaz.', variant: 'destructive'});
        return;
    }
    if (lessons.some(lesson => lesson.toLowerCase() === trimmedLesson.toLowerCase())) {
        toast({ title: 'Hata', description: 'Bu ders zaten listede mevcut.', variant: 'destructive'});
        return;
    }

    setDb(prev => ({
        ...prev,
        lessons: [...prev.lessons, trimmedLesson].sort((a,b) => a.localeCompare(b, 'tr'))
    }));
    setNewLessonName('');
    toast({ title: 'Başarılı', description: `"${trimmedLesson}" dersi listeye eklendi.` });
  };
  
  const exportToWord = () => {
    if (!schoolInfo || studentsInSelectedClass.length === 0) {
      toast({ title: 'Hata', description: 'Lütfen önce bir sınıf seçin ve ödevleri atayın.', variant: 'destructive' });
      return;
    }
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;

    let contentHtml = `
      <div style="text-align: center; margin-bottom: 2rem; font-family: 'Times New Roman', Times, serif;">
        <h2 style="font-size: 12pt; font-weight: bold;">${academicYear} EĞİTİM ÖĞRETİM YILI</h2>
        <h1 style="font-size: 14pt; font-weight: bold;">${schoolInfo.schoolName.toUpperCase()}</h1>
        <h2 style="font-size: 12pt; font-weight: bold;">${selectedClass.name} SINIFI PROJE ÖDEVİ ÖĞRENCİ DAĞILIM LİSTESİ</h2>
      </div>
      <table style="width:100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 11pt;" border="1">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid black; padding: 8px;">S.N</th>
            <th style="border: 1px solid black; padding: 8px;">Okul No</th>
            <th style="border: 1px solid black; padding: 8px;">Öğrenci Adı Soyadı</th>
            <th style="border: 1px solid black; padding: 8px;">Proje Aldığı Ders</th>
          </tr>
        </thead>
        <tbody>
    `;

    studentsInSelectedClass.forEach((student, index) => {
      contentHtml += `
        <tr>
          <td style="border: 1px solid black; padding: 8px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: center;">${student.no}</td>
          <td style="border: 1px solid black; padding: 8px;">${student.name}</td>
          <td style="border: 1px solid black; padding: 8px;">${student.projectLesson || ''}</td>
        </tr>
      `;
    });

    contentHtml += `</tbody></table>`;
    
    const signatureArea = `
      <div style="display: flex; justify-content: space-between; margin-top: 80px; font-family: 'Times New Roman', Times, serif; font-size: 11pt;">
        <div style="text-align: center;">
          <p>${schoolInfo.classTeacherName}</p>
          <p>Sınıf Rehber Öğretmeni</p>
        </div>
        <div style="text-align: center;">
          <p>${new Date().toLocaleDateString('tr-TR')}</p>
          <p>${schoolInfo.schoolPrincipalName}</p>
          <p>Okul Müdürü</p>
        </div>
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html><html><head><meta charset='UTF-8'><title>Proje Ödevi Listesi</title></head>
      <body>${contentHtml}${signatureArea}</body></html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proje-odevi-listesi.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Başarılı', description: 'Proje ödevi listesi Word belgesi olarak indirildi.' });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/rehberlik" title="Ana Sayfa">
              <Home className="mr-2" /> Rehberlik Menüsü
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-headline flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-primary" />
              Sınıf Proje Ödevi Modülü
            </h1>
            <p className="text-muted-foreground">
              {schoolInfo?.className} - {schoolInfo?.schoolName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToWord} variant="outline" disabled={studentsInSelectedClass.length === 0}>
            <FileDown className="mr-2" /> Word Çıktı Al
          </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                <CardHeader>
                    <CardTitle>Proje Ödevi Dağılım Listesi</CardTitle>
                    <CardDescription>
                        Bir sınıf seçin ve her öğrenci için proje aldığı dersi belirleyin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                        <Label htmlFor="class-select">Sınıf Seçimi</Label>
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger id="class-select">
                            <SelectValue placeholder="Proje atanacak sınıfı seçin..." />
                            </SelectTrigger>
                            <SelectContent>
                            {classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                        <div>
                        <Label htmlFor="academic-year">Eğitim-Öğretim Yılı</Label>
                        <Input 
                            id="academic-year"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="örn. 2024-2025"
                        />
                        </div>
                    </div>
                    {studentsInSelectedClass.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                            <TableHead className="w-[100px]">Numara</TableHead>
                            <TableHead>Adı Soyadı</TableHead>
                            <TableHead className="w-[250px]">Proje Aldığı Ders</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsInSelectedClass.map(student => (
                            <TableRow key={student.id}>
                                <TableCell>{student.no}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>
                                <Select
                                    value={student.projectLesson || ''}
                                    onValueChange={(value) => handleDataChange(student.id, value)}
                                >
                                    <SelectTrigger>
                                    <SelectValue placeholder="Ders seçin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {lessons.map(lesson => (
                                        <SelectItem key={lesson} value={lesson}>
                                        {lesson}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                    ) : (
                    <div className="h-64 text-center text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
                        <Users className="w-12 h-12 mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold">Henüz sınıf seçilmedi.</h3>
                        <p className="mt-1">Başlamak için lütfen yukarıdaki menüden bir sınıf seçin.</p>
                    </div>
                    )}
                </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Dersleri Yönet</CardTitle>
                        <CardDescription>Proje ödevi verilebilecek dersleri yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="new-lesson">Yeni Ders Ekle</Label>
                            <div className="flex gap-2 mt-1">
                                <Input 
                                    id="new-lesson"
                                    placeholder="Ders adı..."
                                    value={newLessonName}
                                    onChange={(e) => setNewLessonName(e.target.value)}
                                />
                                <Button onClick={handleAddNewLesson}>
                                    <PlusCircle className="mr-2" /> Ekle
                                </Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Mevcut Dersler</Label>
                            <div className="max-h-96 overflow-y-auto border p-2 rounded-md space-y-1">
                                {lessons.map(lesson => (
                                    <p key={lesson} className="text-sm p-1 bg-muted/50 rounded-sm">{lesson}</p>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectAssignmentPage;
