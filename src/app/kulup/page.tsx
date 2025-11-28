'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Users,
  Home,
  Library,
  FileDown,
  Trash2,
  PlusCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  SchoolInfo,
  Club,
  Student as ClubStudent,
} from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MEB_CLUBS } from '@/lib/clubs';
import { useDatabase } from '@/hooks/use-database';

const ClubPage: React.FC = () => {
  const { db, setDb, loading } = useDatabase();
  const { schoolInfo, clubs, classes } = db;
  const { toast } = useToast();
  const router = useRouter();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState('');
  const [customClubName, setCustomClubName] = useState('');
  const [newClubTeacher, setNewClubTeacher] = useState('');

  const studentsInSelectedClass = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find(c => c.id === selectedClassId);
    return selectedClass?.students || [];
  }, [selectedClassId, classes]);


  useEffect(() => {
    if (!loading && !schoolInfo) {
      toast({
        title: 'Okul Bilgileri Eksik',
        description: 'Lütfen önce okul bilgilerini girin.',
        variant: 'destructive',
      });
      router.push('/bilgi-girisi');
    }
  }, [loading, schoolInfo, router, toast]);

  const handleAddClub = () => {
    const clubName = selectedClub === 'other' ? customClubName.trim() : selectedClub;

    if (!clubName || !newClubTeacher.trim()) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen kulüp adı ve danışman öğretmen adı girin.',
        variant: 'destructive'
      });
      return;
    }
    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: clubName,
      teacher: newClubTeacher,
    };
    setDb(prev => ({ ...prev, clubs: [...prev.clubs, newClub]}));
    
    setSelectedClub('');
    setCustomClubName('');
    setNewClubTeacher('');
    setDialogOpen(false);

    toast({
      title: 'Kulüp Eklendi',
      description: `${clubName} kulübü başarıyla oluşturuldu.`
    })
  };

  const handleDeleteClub = (clubId: string) => {
    setDb(prev => {
      const newClasses = prev.classes.map(c => ({
        ...c,
        students: c.students.map(s => s.clubId === clubId ? { ...s, clubId: undefined } : s)
      }));
      const newClubs = prev.clubs.filter(c => c.id !== clubId);
      return { ...prev, classes: newClasses, clubs: newClubs };
    });
  }

  const handleAssignClub = (studentId: string, clubId: string | null) => {
    setDb(prev => {
        const newClasses = prev.classes.map(c => {
            if (c.id === selectedClassId) {
                return {
                    ...c,
                    students: c.students.map(s => s.id === studentId ? { ...s, clubId: clubId || undefined } : s)
                }
            }
            return c;
        });
        return { ...prev, classes: newClasses };
    });
  };
  
  const resetClubs = () => {
    setDb(prev => {
      const newClasses = prev.classes.map(c => ({
        ...c,
        students: c.students.map(s => ({ ...s, clubId: undefined }))
      }));
      return { ...prev, classes: newClasses, clubs: [] };
    });
  };

  const exportToWord = () => {
    if (!schoolInfo) return;

    let contentHtml = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 14pt; font-weight: bold;">${schoolInfo.schoolName.toUpperCase()}</h1>
        <h2 style="font-size: 12pt; font-weight: bold;">${schoolInfo.className} SINIFI KULÜP LİSTELERİ</h2>
      </div>
    `;

    const allStudents = classes.flatMap(c => c.students);

    clubs.forEach(club => {
      contentHtml += `
        <h3 style="font-size: 11pt; font-weight: bold; margin-top: 2rem;">${club.name} (${club.teacher})</h3>
        <table style="width:100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 10pt; margin-top: 0.5rem;" border="1">
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 5px; width: 40px;">S.No</th>
              <th style="border: 1px solid black; padding: 5px; width: 100px;">Numara</th>
              <th style="border: 1px solid black; padding: 5px;">Adı Soyadı</th>
            </tr>
          </thead>
          <tbody>
      `;
      const clubStudents = allStudents.filter(s => s.clubId === club.id);
      if (clubStudents.length > 0) {
        clubStudents.forEach((student, index) => {
          contentHtml += `
            <tr>
              <td style="border: 1px solid black; padding: 5px; text-align: center;">${index + 1}</td>
              <td style="border: 1px solid black; padding: 5px; text-align: center;">${student.no}</td>
              <td style="border: 1px solid black; padding: 5px;">${student.name}</td>
            </tr>
          `;
        });
      } else {
        contentHtml += `
          <tr>
            <td colspan="3" style="border: 1px solid black; padding: 5px; text-align: center;">Bu kulüpte öğrenci bulunmamaktadır.</td>
          </tr>
        `;
      }
      contentHtml += `</tbody></table>`;
    });

    const signatureArea = `
      <div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 11pt;">
        <div style="text-align: center;">
          <p>${schoolInfo.schoolCounselorName}</p>
          <p style="border-bottom: 1px solid black; width: 180px; margin: 10px auto 5px auto;"></p>
          <p>Okul Rehber Öğretmeni</p>
        </div>
        <div style="text-align: center;">
          <p>${schoolInfo.classTeacherName}</p>
          <p style="border-bottom: 1px solid black; width: 180px; margin: 10px auto 5px auto;"></p>
          <p>Sınıf Rehber Öğretmeni</p>
        </div>
        <div style="text-align: center;">
          <p>${schoolInfo.schoolPrincipalName}</p>
          <p style="border-bottom: 1px solid black; width: 180px; margin: 10px auto 5px auto;"></p>
          <p>Okul Müdürü</p>
        </div>
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"><title>Kulüp Listeleri</title></head>
        <body style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5;">
          ${contentHtml}
          ${signatureArea}
        </body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kulup-listeleri.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading || !schoolInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-14 h-14 bg-purple-600 text-white flex items-center justify-center rounded-xl text-2xl font-bold">
                    <Library />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kulüp Modülü</h1>
                    <p className="text-gray-600">Öğrenci kulüpleri oluşturun ve öğrencileri atayın.</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/rehberlik">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Rehberlik Menüsü
                    </Link>
                </Button>
                <Button onClick={exportToWord} variant="outline" disabled={clubs.length === 0}>
                    <FileDown className="mr-2" /> Listeleri İndir
                </Button>
                <Button onClick={resetClubs} variant="destructive">
                    <Trash2 className="mr-2" /> Tümünü Sıfırla
                </Button>
            </div>
        </div>
      </header>


      <main className="p-4 sm:p-6 md:p-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Adım: Kulüpleri Yönet</CardTitle>
              <CardDescription>Yeni kulüp ekleyin veya mevcutları silin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full"><PlusCircle className="mr-2"/> Yeni Kulüp Ekle</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Kulüp Oluştur</DialogTitle>
                    <DialogDescription>
                      Listeden bir kulüp seçin veya yeni bir tane oluşturun. Danışman öğretmen adını girin.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="club-name">Kulüp Adı</Label>
                      <Select value={selectedClub} onValueChange={setSelectedClub}>
                        <SelectTrigger>
                          <SelectValue placeholder="Standart bir kulüp seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MEB_CLUBS.map(club => (
                            <SelectItem key={club} value={club}>{club}</SelectItem>
                          ))}
                          <SelectItem value="other">Diğer (Elle Gir)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedClub === 'other' && (
                       <div className="space-y-2">
                        <Label htmlFor="custom-club-name">Özel Kulüp Adı</Label>
                        <Input 
                          id="custom-club-name" 
                          value={customClubName} 
                          onChange={e => setCustomClubName(e.target.value)} 
                          placeholder="Kulüp adını yazın" 
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                       <Label htmlFor="club-teacher">Danışman Öğretmen</Label>
                      <Input 
                        id="club-teacher" 
                        value={newClubTeacher} 
                        onChange={e => setNewClubTeacher(e.target.value)} 
                        placeholder="Öğretmen adını yazın"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddClub}>Ekle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

               <div className="space-y-2">
                {clubs.length > 0 && <Label>Mevcut Kulüpler</Label>}
                {clubs.map(club => (
                  <div key={club.id} className="flex justify-between items-center p-2 border rounded-md">
                    <div>
                      <p className="font-semibold">{club.name}</p>
                      <p className="text-xs text-muted-foreground">{club.teacher}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClub(club.id)}>
                      <XCircle className="text-red-500"/>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>2. Adım: Sınıf Seçimi</CardTitle>
               <CardDescription>Kulüp ataması yapmak için bir sınıf seçin.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sınıf Seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
           <Card>
              <CardHeader>
                <CardTitle>3. Adım: Öğrencileri Kulüplere Ata</CardTitle>
                <CardDescription>Her öğrenci için listeden bir kulüp seçin.</CardDescription>
              </CardHeader>
              <CardContent>
                 {studentsInSelectedClass.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Numara</TableHead>
                          <TableHead>Adı Soyadı</TableHead>
                          <TableHead className="w-[250px]">Kulüp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsInSelectedClass.map(student => (
                          <TableRow key={student.id}>
                            <TableCell>{student.no}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              <Select
                                value={student.clubId || ''}
                                onValueChange={(value) => handleAssignClub(student.id, value === 'none' ? null : value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Kulüp seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Kulübü Yok</SelectItem>
                                  {clubs.map(club => (
                                    <SelectItem key={club.id} value={club.id}>
                                      {club.name}
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
                      <p className="mt-1">Başlamak için lütfen soldaki menüden bir sınıf seçin.</p>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>
      </main>
    </div>
  );
};

export default ClubPage;
