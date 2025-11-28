
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Users,
  Home,
  Vote,
  Crown,
  UserCheck,
  Building,
  FileDown,
  Trash2,
  CheckSquare,
  Square,
  Undo,
  ShieldCheck as HonorIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Student, Candidate, ElectionResult, ElectionType } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { useDatabase } from '@/hooks/use-database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEB_CLUBS } from '@/lib/clubs';

type Stage = 'setup' | 'voting' | 'results';

const ElectionPage: React.FC = () => {
  const { db, setDb, loading } = useDatabase();
  const { schoolInfo, classes, election } = db;
  const { candidates, votedStudents: votedStudentIds } = election;

  const [stage, setStage] = useState<Stage>('setup');
  const [electionType, setElectionType] = useState<ElectionType>('class_president');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const students = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find(c => c.id === selectedClassId);
    return selectedClass?.students || [];
  }, [selectedClassId, classes]);

  const votedStudents = useMemo(() => new Set(votedStudentIds), [votedStudentIds]);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !schoolInfo) {
      toast({
        title: "Okul Bilgileri Eksik",
        description: "Lütfen önce okul bilgilerini girin.",
        variant: "destructive",
      });
      router.push('/bilgi-girisi');
    }
  }, [loading, schoolInfo, router, toast]);

  const toggleCandidate = (studentId: string) => {
    setDb(prev => {
        const isCandidate = prev.election.candidates.some(c => c.id === studentId);
        let newCandidates;
        if (isCandidate) {
            newCandidates = prev.election.candidates.filter(c => c.id !== studentId);
        } else {
            const student = students.find(s => s.id === studentId);
            if (student) {
                newCandidates = [...prev.election.candidates, { ...student, votes: 0 }];
            } else {
                newCandidates = prev.election.candidates;
            }
        }
        return {...prev, election: {...prev.election, candidates: newCandidates}};
    });
  };

  const startVoting = () => {
    if (candidates.length < 2) {
      toast({
        title: "Yetersiz Aday",
        description: "Lütfen oylamayı başlatmak için en az 2 aday seçin.",
        variant: "destructive",
      });
      return;
    }
    setStage('voting');
  };
  
  const handleVote = (candidateId: string, studentId: string) => {
    if (votedStudents.has(studentId)) {
        toast({
            title: "Uyarı",
            description: "Bu öğrenci zaten oy kullandı.",
            variant: "destructive"
        })
        return;
    }
    
    setDb(prev => {
        const newCandidates = prev.election.candidates.map(c => c.id === candidateId ? { ...c, votes: c.votes + 1 } : c);
        const newVotedStudents = [...prev.election.votedStudents, studentId];
        return {...prev, election: { candidates: newCandidates, votedStudents: newVotedStudents }};
    });
  }

  const finishVoting = () => {
    setStage('results');
  };

  const sortedCandidates = useMemo(() => {
    if (stage !== 'results') return [];
    return [...candidates].sort((a, b) => b.votes - a.votes);
  }, [candidates, stage]);
  
  const electionInfo = useMemo(() => {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const className = selectedClass ? selectedClass.name : schoolInfo?.className;

    const infoMap = {
        class_president: {
            title: `SINIF BAŞKANI VE BAŞKAN YARDIMCISI SEÇİM TUTANAĞI`,
            winnerLabel: 'Sınıf Başkanı',
            runnerUpLabel: 'Sınıf Başkan Yardımcısı',
            decisionText: (winner: Candidate, runnerUp: Candidate | null) =>
                `Okulumuz ${className} sınıfı öğrencileri arasında yapılan oylama sonucunda ${winner.votes} oyla ${winner.name} sınıf başkanı, ${runnerUp ? `${runnerUp.votes} oyla ${runnerUp.name} sınıf başkan yardımcısı seçilmiştir.` : ''}`
        },
        school_representative: {
            title: `SINIF TEMSİLCİSİ SEÇİM TUTANAĞI`,
            winnerLabel: 'Sınıf Temsilcisi',
            runnerUpLabel: null,
            decisionText: (winner: Candidate) =>
                `Okulumuz ${className} sınıfı öğrencileri arasında sınıf temsilcisi olarak ${winner.name} seçilmiştir.`
        },
        honor_board: {
            title: `ONUR KURULU TEMSİLCİSİ SEÇİM TUTANAĞI`,
            winnerLabel: 'Onur Kurulu Temsilcisi',
            runnerUpLabel: null,
            decisionText: (winner: Candidate) =>
                `Okulumuz ${className} sınıfı öğrencileri arasında onur kurulu temsilcisi olarak ${winner.name} seçilmiştir.`
        }
    };
    return infoMap[electionType];
  }, [electionType, schoolInfo?.className, selectedClassId, classes]);


  const electionResult: ElectionResult | null = useMemo(() => {
    if (stage !== 'results' || sortedCandidates.length === 0) return null;

    const winner = sortedCandidates[0] || null;
    const runnerUp = sortedCandidates.length > 1 ? sortedCandidates[1] : null;
    
    return {
      winner,
      runnerUp,
      allCandidates: sortedCandidates,
    };
  }, [stage, sortedCandidates]);

  const resetElection = () => {
    setDb(prev => ({
        ...prev,
        election: { candidates: [], votedStudents: [] }
    }));
    setStage('setup');
    setSelectedClassId('');
  };

  const exportResultsToWord = () => {
    if (!schoolInfo || !electionResult || !electionResult.winner) {
         toast({
            title: "Hata",
            description: "Çıktı almadan önce seçimi tamamlamalısınız.",
            variant: "destructive"
        });
        return;
    }

    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;

    const introText = `Okulumuz ${selectedClass.name} sınıfı öğrencileri arasında sınıf başkanı seçimi yapılmıştır. Oyların sayımı yapılarak, oy dökümü aşağıya çıkarılmıştır.`;
    
    let tableHtml = `<table style="width:100%; border-collapse: collapse; margin-top: 20px;" border="1"><thead><tr style="background-color: #f2f2f2;">
      <th style="padding: 8px;">S.No</th>
      <th style="padding: 8px;">Adı Soyadı</th>
      <th style="padding: 8px;">Numarası</th>
      <th style="padding: 8px;">Aldığı Oy</th>
      <th style="padding: 8px;">Yazıyla</th>
    </tr></thead><tbody>`;

    electionResult.allCandidates.forEach((candidate, index) => {
        tableHtml += `<tr>
            <td style="padding: 8px; text-align: center;">${index + 1}</td>
            <td style="padding: 8px;">${candidate.name}</td>
            <td style="padding: 8px; text-align: center;">${candidate.id}</td>
            <td style="padding: 8px; text-align: center;">${candidate.votes}</td>
            <td style="padding: 8px;"></td>
        </tr>`;
    });
    tableHtml += `</tbody></table>`;
    
    let decisionText;
    if (electionType === 'class_president') {
        decisionText = electionInfo.decisionText(electionResult.winner, electionResult.runnerUp);
    } else {
        decisionText = electionInfo.decisionText(electionResult.winner, null);
    }
    
    const signatureArea = `
        <div style="margin-top: 50px; text-align: right;">
             <p style="text-align: right;">${schoolInfo.classTeacherName}</p>
             <p style="text-align: right;">Sınıf Rehber Öğretmeni</p>
        </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset='UTF-8'>
          <title>Seçim Sonuç Tutanağı</title>
          <style>body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }</style>
        </head>
        <body>
          <h2 style="text-align: center;">${schoolInfo.schoolName.toUpperCase()}</h2>
          <h3 style="text-align: center;">${electionInfo.title}</h3>
          <p>${introText}</p>
          ${tableHtml}
          <p style="margin-top: 20px;">${decisionText}</p>
          ${signatureArea}
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `secim-sonuc-tutanagi.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  if (loading || !schoolInfo) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>
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
              <Vote className="w-7 h-7 text-primary" />
              Seçim Modülü
            </h1>
            <p className="text-muted-foreground">{schoolInfo.className} - {schoolInfo.schoolName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {stage === 'results' && (
                <Button onClick={exportResultsToWord} variant="outline">
                    <FileDown className="mr-2"/> Word Çıktısı Al
                </Button>
            )}
            <Button onClick={resetElection} variant="destructive">
              <Trash2 className="mr-2"/> Seçimi Sıfırla
            </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8">
        {stage === 'setup' && (
          <Card>
            <CardHeader>
              <CardTitle>1. Adım: Kurulum</CardTitle>
              <CardDescription>Önce seçim türünü ve sınıfı seçin, ardından adayları belirleyin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="font-semibold">Seçim Türü</Label>
                    <Tabs defaultValue={electionType} onValueChange={(value) => setElectionType(value as ElectionType)} className="w-full mt-2">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="class_president">Sınıf Başkanlığı</TabsTrigger>
                            <TabsTrigger value="school_representative">Sınıf Temsilciliği</TabsTrigger>
                            <TabsTrigger value="honor_board">Onur Kurulu Temsilciliği</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="space-y-2">
                     <Label className="font-semibold">Sınıf Seçimi</Label>
                     <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                         <SelectTrigger>
                             <SelectValue placeholder="Oylama yapılacak sınıfı seçin..." />
                         </SelectTrigger>
                         <SelectContent>
                             {classes.map(cls => (
                                 <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                </div>
              {students.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Adayları Seçin</h3>
                   <div className="max-h-64 overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-12">Aday</TableHead>
                                <TableHead>Öğrenci No</TableHead>
                                <TableHead>Adı Soyadı</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                <TableRow key={student.id} onClick={() => toggleCandidate(student.id)} className="cursor-pointer">
                                    <TableCell>
                                    <Checkbox checked={candidates.some(c => c.id === student.id)} />
                                    </TableCell>
                                    <TableCell>{student.id}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                   </div>
                   <Button onClick={startVoting} className="w-full bg-green-600 hover:bg-green-700">Oylamayı Başlat</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {stage === 'voting' && (
          <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>2. Adım: Oylama</CardTitle>
                        <CardDescription>{students.length} öğrenci oy kullanacak. {votedStudents.size} oy kullanıldı.</CardDescription>
                    </div>
                    <Button onClick={finishVoting} size="lg" className="bg-blue-600 hover:bg-blue-700">Oylamayı Bitir</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map(student => (
                         <Card key={student.id} className={votedStudents.has(student.id) ? 'bg-muted/50' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex justify-between items-center">
                                    {student.name}
                                    {votedStudents.has(student.id) 
                                        ? <CheckSquare className="text-green-500"/>
                                        : <Square className="text-muted-foreground"/>
                                    }
                                </CardTitle>
                                <CardDescription>No: {student.no || student.id}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm font-semibold">Oyunu Kullan:</p>
                                {candidates.map(candidate => (
                                    <Button 
                                        key={candidate.id}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => handleVote(candidate.id, student.id)}
                                        disabled={votedStudents.has(student.id)}
                                    >
                                        {candidate.name}
                                    </Button>
                                ))}
                            </CardContent>
                         </Card>
                    ))}
                </div>
            </CardContent>
          </Card>
        )}

        {stage === 'results' && electionResult && electionResult.winner && (
           <Card>
             <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>3. Adım: Seçim Sonuçları</CardTitle>
                        <CardDescription>{electionInfo.title} sonuçları aşağıdadır.</CardDescription>
                    </div>
                    <Button onClick={() => setStage('voting')} variant="outline">
                        <Undo className="mr-2" /> Oylamaya Geri Dön
                    </Button>
                </div>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                    {electionType === 'class_president' && (
                        <>
                            <Card className="bg-green-100 dark:bg-green-900/50 border-green-500">
                                <CardHeader>
                                    <Crown className="mx-auto text-yellow-500 w-10 h-10"/>
                                    <CardTitle>Sınıf Başkanı</CardTitle>
                                    <CardDescription>{electionResult.winner.name}</CardDescription>
                                    <p className="font-bold text-2xl">{electionResult.winner.votes} Oy</p>
                                </CardHeader>
                            </Card>
                            {electionResult.runnerUp && (
                                <Card className="bg-blue-100 dark:bg-blue-900/50 border-blue-500">
                                    <CardHeader>
                                        <UserCheck className="mx-auto text-blue-500 w-10 h-10"/>
                                        <CardTitle>Başkan Yardımcısı</CardTitle>
                                        <CardDescription>{electionResult.runnerUp.name}</CardDescription>
                                        <p className="font-bold text-2xl">{electionResult.runnerUp.votes} Oy</p>
                                    </CardHeader>
                                </Card>
                            )}
                        </>
                    )}
                     {electionType === 'school_representative' && (
                        <Card className="bg-purple-100 dark:bg-purple-900/50 border-purple-500 col-span-full max-w-sm mx-auto">
                            <CardHeader>
                                <Building className="mx-auto text-purple-500 w-10 h-10"/>
                                <CardTitle>Sınıf Temsilcisi</CardTitle>
                                <CardDescription>{electionResult.winner.name}</CardDescription>
                                <p className="font-bold text-2xl">{electionResult.winner.votes} Oy</p>
                            </CardHeader>
                        </Card>
                    )}
                    {electionType === 'honor_board' && (
                        <Card className="bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 col-span-full max-w-sm mx-auto">
                            <CardHeader>
                                <HonorIcon className="mx-auto text-indigo-500 w-10 h-10"/>
                                <CardTitle>Onur Kurulu Temsilcisi</CardTitle>
                                <CardDescription>{electionResult.winner.name}</CardDescription>
                                <p className="font-bold text-2xl">{electionResult.winner.votes} Oy</p>
                            </CardHeader>
                        </Card>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tüm Adaylar ve Oy Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Adı Soyadı</TableHead>
                                <TableHead className="text-right">Aldığı Oy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {electionResult.allCandidates.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.name} ({c.id})</TableCell>
                                        <TableCell className="text-right font-bold">{c.votes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

             </CardContent>
           </Card>
        )}
      </main>
    </div>
  );
};

export default ElectionPage;
