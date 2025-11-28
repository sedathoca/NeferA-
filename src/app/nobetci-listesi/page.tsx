
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Download, Users, RotateCcw, School, Upload } from 'lucide-react';
import { useDatabase } from '@/hooks/use-database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Home } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Student } from '@/lib/types';


export default function NobetciListesi() {
  // --- STATE TANIMLARI ---
  const { db, setDb, loading } = useDatabase();
  const { schoolInfo, dutyStudents } = db;
  const { toast } = useToast();

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  const [startIndex, setStartIndex] = useState(1);
  const [roster, setRoster] = useState<any[]>([]);
  const [nextStartInfo, setNextStartInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentListText = useMemo(() => dutyStudents.map(s => s.name).join('\n'), [dutyStudents]);

  const daysMap = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  // --- LİSTE OLUŞTURMA MANTIĞI ---
  const generateRoster = () => {
    if (dutyStudents.length === 0) {
      toast({ title: "Hata", description: "Lütfen önce öğrenci listesi yükleyin.", variant: "destructive" });
      return;
    }
    if (!startDate || !endDate) {
      toast({ title: "Hata", description: "Lütfen başlangıç ve bitiş tarihlerini seçin.", variant: "destructive" });
      return;
    }

    const students = dutyStudents;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    if (start > end) {
      toast({ title: "Hata", description: "Bitiş tarihi başlangıç tarihinden önce olamaz.", variant: "destructive" });
      return;
    }

    let tempRoster: any[] = [];
    let currentStudentIndex = (startIndex - 1);
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const student1 = students[currentStudentIndex % students.length];
        currentStudentIndex++;
        
        const student2 = students[currentStudentIndex % students.length];
        currentStudentIndex++;
        
        const studentNames = `${student1.name} - ${student2.name}`;
        
        tempRoster.push({
          date: currentDate.toLocaleDateString('tr-TR'),
          day: daysMap[dayOfWeek],
          student: studentNames
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setRoster(tempRoster);
    
    const nextIndex = (currentStudentIndex % students.length) + 1;
    setNextStartInfo({
      index: nextIndex,
      name: students[nextIndex - 1]?.name
    });
    toast({ title: "Başarılı", description: "Nöbet listesi oluşturuldu." });
  };

    const handleStudentImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, {
                header: ['id', 'name'],
                range: 1
            });

            const newStudents: Student[] = json
                .map((row) => ({
                id: String(row['id'] || `student-${Math.random()}`),
                name: String(row['name'] || ''),
                }))
                .filter((s) => s.name.trim() !== '');

            if (newStudents.length > 0) {
                setDb(prev => ({...prev, dutyStudents: newStudents}));
                toast({
                title: 'Başarılı',
                description: `${newStudents.length} öğrenci içe aktarıldı.`,
                });
            } else {
                toast({ title: 'Öğrenci Bulunamadı', description: "Excel dosyasında geçerli öğrenci verisi bulunamadı.", variant: "destructive" });
            }
            } catch (error) {
            toast({ title: 'Dosya Okuma Hatası', variant: 'destructive' });
            }
        };
        reader.readAsArrayBuffer(file);
        if (event.target) {
            event.target.value = '';
        }
        }
  };


  // --- WORD ÇIKTISI ALMA ---
  const exportToWord = () => {
    if (roster.length === 0) {
      toast({ title: "Hata", description: "Lütfen önce listeyi oluşturun.", variant: "destructive" });
      return;
    }

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${schoolInfo?.className} Nöbetçi Listesi</title>
        <style>
          body { font-family: 'Times New Roman', serif; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .title-area { text-align: center; margin-bottom: 20px; }
          .school-name { font-size: 16pt; font-weight: bold; text-transform: uppercase; }
          .list-name { font-size: 14pt; font-weight: bold; margin-top: 5px; }
          .signature-table { margin-top: 50px; width: 100%; border: none; }
          .signature-table td { border: none; text-align: center; padding-top: 40px; }
        </style>
      </head>
      <body>
        <div class="title-area">
          <div class="school-name">${schoolInfo?.schoolName || ''}</div>
          <div class="list-name">${schoolInfo?.className || ''} SINIFI AYLIK NÖBETÇİ ÖĞRENCİ LİSTESİ</div>
        </div>
    `;
    
    const tableHTML = document.getElementById("roster-table")?.outerHTML || '';
    
    const signatureHTML = `
      <table class="signature-table">
        <tr>
          <td>
            <strong>${schoolInfo?.classTeacherName || ''}</strong><br>
            Sınıf Rehber Öğretmeni
          </td>
          <td>
            <strong>${schoolInfo?.schoolPrincipalName || ''}</strong><br>
            Okul Müdürü
          </td>
        </tr>
      </table>
    `;

    const footer = "</body></html>";
    
    const sourceHTML = header + tableHTML + signatureHTML + footer;
    
    const blob = new Blob([sourceHTML], { type: 'application/vnd.ms-word' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.href = url;
    link.download = `${schoolInfo?.className || 'sinif'}_Nobetci_Listesi.doc`;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
    if (loading) {
        return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>
    }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
        <header className="max-w-6xl mx-auto mb-6">
            <Button asChild variant="outline">
                <Link href="/rehberlik">
                    <Home className="mr-2 h-4 w-4" /> Rehberlik Menüsü
                </Link>
            </Button>
      </header>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- SOL PANEL: AYARLAR --- */}
        <div className="md:col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-700">
              <School size={20} />
              Okul Bilgileri
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Okul:</strong> {schoolInfo?.schoolName}</p>
              <p><strong>Sınıf:</strong> {schoolInfo?.className}</p>
              <p><strong>Öğretmen:</strong> {schoolInfo?.classTeacherName}</p>
              <p><strong>Müdür:</strong> {schoolInfo?.schoolPrincipalName}</p>
               <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/bilgi-girisi">Bilgileri Düzenle</Link>
                </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-700">
              <Users size={20} />
              Liste ve Tarihler
            </h2>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-gray-700">Sınıf Listesi</label>
                 <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Yükle
                 </Button>
                 <input type="file" ref={fileInputRef} onChange={handleStudentImport} className="hidden" accept=".xlsx, .xls" />
              </div>
              <textarea
                readOnly
                className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm bg-gray-50"
                value={studentListText}
              ></textarea>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {dutyStudents.length} Öğrenci
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">BAŞLANGIÇ</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">BİTİŞ</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <label className="block text-xs font-bold text-yellow-800 mb-1 flex items-center gap-2">
                <RotateCcw size={14}/>
                KAÇINCIDAN BAŞLASIN?
              </label>
              <input 
                type="number" 
                min="1"
                className="w-full p-2 border border-yellow-300 rounded-lg text-sm"
                value={startIndex}
                onChange={(e) => setStartIndex(parseInt(e.target.value) || 1)}
              />
            </div>

            <button 
              onClick={generateRoster}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar size={20} />
              Listeyi Oluştur
            </button>
          </div>
        </div>

        {/* --- SAĞ PANEL: ÖNİZLEME VE ÇIKTI --- */}
        <div className="md:col-span-2 space-y-4">
          
          {nextStartInfo && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-green-800">Liste Hazır!</h3>
                <p className="text-sm text-green-700">
                  Gelecek ay <strong>{nextStartInfo.index}</strong> numaralı kişiden (<strong>{nextStartInfo.name}</strong>) başlamalısınız.
                </p>
              </div>
              <button 
                onClick={exportToWord}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-transform active:scale-95"
              >
                <Download size={18} />
                Word İndir
              </button>
            </div>
          )}

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 min-h-[600px] relative">
            {roster.length > 0 ? (
              <div className="w-full">
                <div className="text-center mb-8 border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">{schoolInfo?.schoolName}</h1>
                  <h2 className="text-xl font-semibold text-gray-700 mt-2 uppercase">{schoolInfo?.className} SINIFI AYLIK NÖBETÇİ ÖĞRENCİ LİSTESİ</h2>
                </div>
                
                <table id="roster-table" className="w-full border-collapse text-left text-sm mb-12">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 font-bold border border-gray-300 w-1/4">Tarih</th>
                      <th className="p-3 font-bold border border-gray-300 w-1/4">Gün</th>
                      <th className="p-3 font-bold border border-gray-300 w-1/2">Nöbetçi Öğrenciler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-3 border border-gray-300">{item.date}</td>
                        <td className={`p-3 border border-gray-300 font-medium ${item.day === 'Pazartesi' ? 'text-indigo-600' : 'text-gray-700'}`}>
                          {item.day}
                        </td>
                        <td className="p-3 border border-gray-300 font-bold text-gray-800">
                          {item.student}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-start px-10 mt-10">
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-lg mb-1">{schoolInfo?.classTeacherName}</p>
                    <p className="text-gray-600">Sınıf Rehber Öğretmeni</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-lg mb-1">{schoolInfo?.schoolPrincipalName}</p>
                    <p className="text-gray-600">Okul Müdürü</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-70 mt-20">
                <School size={64} className="mb-4" />
                <p className="text-lg text-center">
                  Sol taraftan "Öğrenci Listesi Yükle" butonu ile listeyi yükleyin<br/>
                  ve "Listeyi Oluştur" butonuna basın.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

    