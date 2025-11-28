
'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Users, ChevronDown, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RiskStudent, RISK_FACTORS, SchoolInfo } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/page-header-risk';
import Link from 'next/link';
import { useDatabase } from '@/hooks/use-database';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RiskMapPage: React.FC = () => {
  const { db, setDb, loading } = useDatabase();
  const { schoolInfo, riskStudents: allRiskStudents, classes } = db;

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();

  const students = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return [];
    // Ensure every student has a corresponding risk entry
    return selectedClass.students.map(s => {
        const riskStudent = allRiskStudents.find(rs => rs.id === s.no);
        if (riskStudent) {
            return riskStudent;
        }
        // If no risk data exists, create a default one
        const newRiskStudent: RiskStudent = {
            id: s.no,
            name: s.name,
            riskData: RISK_FACTORS.reduce((acc, factor) => {
                acc[factor.key] = false;
                return acc;
            }, {} as { [key: string]: boolean }),
            riskScore: 0,
        };
        // We should add this new student to the central riskStudents array
        // This will be handled by the toggleRiskForStudent function implicitly
        return newRiskStudent;
    });
  }, [selectedClassId, classes, allRiskStudents]);

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

  const handleExportWord = () => {
    if (students.length === 0 || !schoolInfo || !selectedClassId) {
         toast({ title: "Hata", description: "Lütfen önce bir sınıf seçin ve risk verilerini girin.", variant: "destructive" });
        return;
    }
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if(!selectedClass) return;

    let tableHtml = `
      <div style="text-align: center; margin-bottom: 1rem;">
        <h1 style="font-size: 14pt; font-weight: bold;">${schoolInfo.schoolName.toUpperCase()}</h1>
        <h2 style="font-size: 12pt; font-weight: bold;">${selectedClass.name} SINIFI RİSK HARİTASI</h2>
      </div>
      <table style="width:100%; border-collapse: collapse; font-family: 'Times New Roman', Times, serif; font-size: 8pt;" border="1">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 4px; width: 30px;">Sıra No</th>
          <th style="border: 1px solid black; padding: 4px; width: 70px;">Okul Numarası</th>
          <th style="border: 1px solid black; padding: 4px; width: 120px;">Öğrencinin Adı Soyadı</th>
    `;
    RISK_FACTORS.forEach(factor => {
        tableHtml += `<th style="border: 1px solid black; padding: 4px; height: 150px; text-align: left; vertical-align: bottom;"><div style="transform: rotate(-90deg); white-space: nowrap; width: 20px; margin-bottom: 5px;">${factor.label}</div></th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    students.forEach((student, index) => {
        tableHtml += `
            <tr>
                <td style="border: 1px solid black; padding: 4px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid black; padding: 4px; text-align: center;">${student.id}</td>
                <td style="border: 1px solid black; padding: 4px;">${student.name}</td>
        `;
        RISK_FACTORS.forEach(factor => {
            tableHtml += `<td style="border: 1px solid black; padding: 4px; text-align: center;">${student.riskData[factor.key] ? 'X' : ''}</td>`;
        });
        tableHtml += `</tr>`;
    });
      
    tableHtml += `
      <tr>
        <td colspan="3" style="border: 1px solid black; padding: 4px; text-align: right; font-weight: bold;">TOPLAM</td>
    `;
    RISK_FACTORS.forEach(factor => {
        const total = students.filter(student => student.riskData[factor.key]).length;
        tableHtml += `<td style="border: 1px solid black; padding: 4px; text-align: center; font-weight: bold;">${total}</td>`;
    });
    tableHtml += `</tr>`;
    
    tableHtml += '</tbody></table>';

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
    
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Sınıf Risk Haritası</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
            }
          </style>
        </head>
        <body>
          ${tableHtml}
          ${signatureArea}
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sinif-risk-haritasi-detayli.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
        title: "Dışa Aktarıldı",
        description: "Detaylı sınıf risk haritası Word belgesi olarak indirildi.",
    });
  };

  const handleExportSummaryWord = () => {
    if (students.length === 0 || !schoolInfo || !selectedClassId) {
        toast({ title: "Hata", description: "Lütfen önce bir sınıf seçin ve risk verilerini girin.", variant: "destructive" });
        return;
    }
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if(!selectedClass) return;

    const factorsInRows = [
        RISK_FACTORS.slice(0, 8),
        RISK_FACTORS.slice(8, 17),
        RISK_FACTORS.slice(17, 26),
        RISK_FACTORS.slice(26)
    ];

    let tableHtml = `<table style="width:100%; border-collapse: collapse; font-family: 'Calibri', sans-serif; font-size: 10pt;" border="1">`;

    factorsInRows.forEach(rowOfFactors => {
      // Header row for labels
      tableHtml += '<tr>';
      rowOfFactors.forEach(factor => {
          tableHtml += `<td style="border: 1px solid black; padding: 5px; font-weight: bold; text-align: center; vertical-align: middle;">${factor.label}</td>`;
      });
      tableHtml += '</tr>';

      // Data row for student names
      tableHtml += '<tr>';
      rowOfFactors.forEach(factor => {
          const studentsWithRisk = students
            .filter(s => s.riskData[factor.key])
            .map(s => `${s.name} (${s.id})`)
            .join('<br>');
          tableHtml += `<td style="border: 1px solid black; padding: 5px; vertical-align: top; height: 120px;">${studentsWithRisk || '&nbsp;'}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</table>';

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
    
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Sınıf Risk Haritası Sonuç Raporu</title>
        </head>
        <body style="font-family: 'Calibri', sans-serif;">
          <div style="text-align: center; margin-bottom: 1rem;">
            <h1 style="font-size: 16pt; font-weight: bold;">${schoolInfo.schoolName.toUpperCase()}</h1>
            <h2 style="font-size: 14pt; font-weight: bold;">${selectedClass.name} SINIFI RİSK HARİTASI SONUÇ RAPORU</h2>
          </div>
          ${tableHtml}
           <div style="margin-top: 20px; font-size: 9pt;">
                <p>*Sınıfın risk haritası çıkarılırken sınıf rehber öğretmenlerinin kendi gözlemleri, veli görüşmeleri, öğrenci ile yapılan görüşmeler, rehber öğretmen gözlemleri ve çeşitli test, anket, envanter vb. ölçme araçları sonuçlarından elde edilen veriler kullanılır. Bu modüldeki veriler sınıf rehber öğretmeninin kendi beyanına dayanmaktadır. Modülün amacı sadece sınıf rehber öğretmeninin işini kolaylaştırmaktır.</p>
            </div>
          ${signatureArea}
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sinif-risk-sonuc-raporu.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
        title: "Dışa Aktarıldı",
        description: "Sınıf risk sonuç raporu Word belgesi olarak indirildi.",
    });
  };

  const toggleRiskForStudent = (studentId: string, factorKey: string) => {
    setDb(prevDb => {
      const riskStudentIndex = prevDb.riskStudents.findIndex(s => s.id === studentId);
      
      let targetStudent: RiskStudent;
      if (riskStudentIndex !== -1) {
          targetStudent = { ...prevDb.riskStudents[riskStudentIndex] };
      } else {
          const classStudent = classes.flatMap(c => c.students).find(s => s.no === studentId);
          if (!classStudent) return prevDb; // Should not happen
          targetStudent = {
              id: classStudent.no,
              name: classStudent.name,
              riskData: RISK_FACTORS.reduce((acc, factor) => ({...acc, [factor.key]: false}), {}),
              riskScore: 0
          };
      }
      
      targetStudent.riskData = {
          ...targetStudent.riskData,
          [factorKey]: !targetStudent.riskData[factorKey]
      };

      targetStudent.riskScore = RISK_FACTORS.reduce((score, factor) => {
          return score + (targetStudent.riskData[factor.key] ? factor.weight : 0);
      }, 0);
      
      let newRiskStudents;
      if (riskStudentIndex !== -1) {
          newRiskStudents = [...prevDb.riskStudents];
          newRiskStudents[riskStudentIndex] = targetStudent;
      } else {
          newRiskStudents = [...prevDb.riskStudents, targetStudent];
      }

      return { ...prevDb, riskStudents: newRiskStudents };
    });
  };

  const getRiskColor = (score: number) => {
    if (score >= 5) return 'text-red-600 dark:text-red-400 font-bold';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    return 'text-green-600 dark:text-green-400';
  };
  
  const getSelectedStudentCount = (factorKey: string) => {
    return students.filter(s => s.riskData[factorKey]).length;
  };
  
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => b.riskScore - a.riskScore);
  }, [students]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        onExportWord={handleExportWord}
        onExportSummaryWord={handleExportSummaryWord}
        hasStudents={students.length > 0}
        schoolInfo={schoolInfo}
      />
      <main className="p-4 sm:p-6 md:p-8 no-print">
          <Card className="mb-6">
              <CardHeader>
                  <CardTitle>Sınıf Seçimi</CardTitle>
                  <CardDescription>Risk haritasını oluşturmak için bir sınıf seçin.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger className="w-full md:w-1/3">
                          <SelectValue placeholder="Sınıf seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                          {classes.map(cls => (
                              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </CardContent>
          </Card>

          {!selectedClassId && (
            <div className="h-96 text-center text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
              <Users className="w-12 h-12 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">Henüz sınıf seçilmedi.</h3>
              <p className="mt-1">Başlamak için lütfen yukarıdaki menüden bir sınıf seçin.</p>
            </div>
          )}
          
          {selectedClassId && students.length > 0 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Faktörleri ve Öğrenci Seçimi</CardTitle>
                  <CardDescription>Her risk faktörünün yanındaki menüden ilgili öğrencileri seçin.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  {RISK_FACTORS.map(factor => (
                    <div key={factor.key} className="flex items-center justify-between border-b py-2">
                      <span className="text-sm">{factor.label} (Puan: {factor.weight})</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-48 justify-between">
                             <span>
                              {getSelectedStudentCount(factor.key)} öğrenci seçili
                             </span>
                             <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end">
                          <DropdownMenuLabel>Öğrenciler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <ScrollArea style={{ height: '200px' }}>
                            {students.map(student => (
                              <DropdownMenuCheckboxItem
                                key={student.id}
                                checked={student.riskData[factor.key]}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={() => toggleRiskForStudent(student.id, factor.key)}
                              >
                                {student.name}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Puanı Özeti</CardTitle>
                  <CardDescription>Öğrencilerin risk faktörlerine göre hesaplanan toplam puanları.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sortedStudents.map(student => (
                    <Card key={student.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm">{student.name}</p>
                        <p className={cn("text-base font-bold", getRiskColor(student.riskScore))}>
                          {student.riskScore}
                        </p>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
      </main>
    </div>
  );
};

export default RiskMapPage;
