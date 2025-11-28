
'use client';

import React, { useState, useEffect } from 'react';
import { Users, Grid, Shuffle, Trash2, Download, School, UserPlus, GripVertical, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/hooks/use-database';

export default function App() {
  const { db } = useDatabase();

  // --- Durum Yönetimi (State Management) ---
  const [rowCount, setRowCount] = useState(5);
  const [colCount, setColCount] = useState(3); 
  
  // Okul ve İmza Bilgileri
  const [schoolName, setSchoolName] = useState("");
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [principalName, setPrincipalName] = useState("");

  const [studentInput, setStudentInput] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [seatingPlan, setSeatingPlan] = useState<any>({}); 
  
  const [draggedStudent, setDraggedStudent] = useState<any>(null);
  const [dragSource, setDragSource] = useState<string | null>(null); 

  useEffect(() => {
    if (db.schoolInfo) {
      setSchoolName(db.schoolInfo.schoolName || "");
      setClassName(db.schoolInfo.className || "");
      setTeacherName(db.schoolInfo.classTeacherName || "");
      setPrincipalName(db.schoolInfo.schoolPrincipalName || "");
    }
  }, [db.schoolInfo]);


  // Excel/Metin girişini işleme
  const handleImport = () => {
    const lines = studentInput.split(/\r?\n/).filter(line => line.trim() !== "");
    const newStudents = lines.map((name, index) => ({
      id: `student-${Date.now()}-${index}`,
      name: name.trim()
    }));
    
    setStudents(newStudents);
    setSeatingPlan({}); 
  };

  // Rastgele Dağıtma Algoritması
  const handleRandomize = () => {
    if (students.length === 0) return;

    const newPlan: any = {};
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

    let studentIndex = 0;

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            // Place student on the left seat
            if (studentIndex < shuffledStudents.length) {
                newPlan[`${r}-${c}-0`] = shuffledStudents[studentIndex];
                studentIndex++;
            }
            // Place student on the right seat
            if (studentIndex < shuffledStudents.length) {
                newPlan[`${r}-${c}-1`] = shuffledStudents[studentIndex];
                studentIndex++;
            }
        }
    }
    setSeatingPlan(newPlan);
  };

  const handleClearSeating = () => {
    setSeatingPlan({});
  };

  // --- Word Olarak İndirme Fonksiyonu ---
  const handleExportWord = () => {
    // Word için HTML şablonu
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Sınıf Oturma Planı</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; }
          .school-name { font-size: 16px; font-weight: bold; text-transform: uppercase; }
          .class-name { font-size: 14px; font-weight: bold; margin-top: 5px; }
          
          .board { background-color: #333; color: white; text-align: center; padding: 10px; font-weight: bold; font-size: 12px; margin-bottom: 20px; border-radius: 4px; width: 60%; margin-left: auto; margin-right: auto; }
          
          .layout-table { width: 100%; border-collapse: separate; border-spacing: 10px; }
          .desk-container { vertical-align: top; }
          .desk { width: 100%; border: 1.5px solid #d97706; background-color: #fef3c7; border-collapse: collapse; }
          .seat { width: 50%; height: 50px; border: 1px solid #d97706; padding: 4px; text-align: center; vertical-align: middle; font-size: 11px; }
          .filled { background-color: #ffffff; font-weight: bold; color: #000; }
          .empty { color: #9ca3af; font-style: italic; }
          .desk-label { font-size: 9px; color: #666; text-align: center; margin-bottom: 2px; }

          .signature-table { width: 100%; margin-top: 50px; border: none; }
          .signature-cell { width: 50%; text-align: center; vertical-align: top; padding-top: 20px; }
          .title { font-weight: bold; margin-bottom: 40px; display: block; }
          .name { border-top: 1px solid #000; display: inline-block; padding-top: 5px; min-width: 150px; }
        </style>
      </head>
      <body>
        
        <div class="header">
          <div class="school-name">${schoolName || "OKUL ADI GİRİLMEDİ"}</div>
          <div class="class-name">${className || "Sınıf Adı Girilmedi"} Oturma Planı</div>
        </div>

        <div class="board">TAHTA / ÖĞRETMEN MASASI</div>
        
        <table class="layout-table">
    `;

    // Oturma Düzeni Tablosu
    for (let r = 0; r < rowCount; r++) {
      html += `<tr>`;
      for (let c = 0; c < colCount; c++) {
        const leftStudent = seatingPlan[`${r}-${c}-0`];
        const rightStudent = seatingPlan[`${r}-${c}-1`];

        html += `<td class="desk-container">`;
        html += `<div class="desk-label">Masa ${r + 1}-${c + 1}</div>`;
        html += `<table class="desk"><tr>`;
        
        // Sol Koltuk
        html += `<td class="seat ${leftStudent ? 'filled' : 'empty'}">`;
        html += leftStudent ? leftStudent.name : '';
        html += `</td>`;

        // Sağ Koltuk
        html += `<td class="seat ${rightStudent ? 'filled' : 'empty'}">`;
        html += rightStudent ? rightStudent.name : '';
        html += `</td>`;

        html += `</tr></table>`;
        html += `</td>`;
      }
      html += `</tr>`;
    }
    html += `</table>`;

    // İmza Bölümü
    html += `
      <table class="signature-table">
        <tr>
          <td class="signature-cell">
            <span class="title">Sınıf Rehber Öğretmeni</span>
            <br/><br/><br/>
            <span class="name">${teacherName || "..........................."}</span>
          </td>
          <td class="signature-cell">
            <span class="title">Okul Müdürü</span>
            <br/><br/><br/>
            <span class="name">${principalName || "..........................."}</span>
          </td>
        </tr>
      </table>
    `;

    html += `</body></html>`;

    // Dosyayı oluştur ve indir
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFileName = (className || "Sinif").replace(/[^a-z0-9]/gi, '_');
    link.download = `${safeFileName}_Oturma_Plani.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sürükle Bırak İşlemleri
  const onDragStart = (e: any, student: any, source: string) => {
    setDraggedStudent(student);
    setDragSource(source);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: any) => {
    e.preventDefault(); 
  };

  const onDropSeat = (e: any, row: number, col: number, side: number) => {
    e.preventDefault();
    const targetKey = `${row}-${col}-${side}`;
    const existingStudent = seatingPlan[targetKey];

    const newPlan = { ...seatingPlan };

    if (dragSource && dragSource !== 'list') {
      delete newPlan[dragSource];
    }

    if (existingStudent) {
      if (dragSource && dragSource !== 'list') {
        newPlan[dragSource] = existingStudent;
      }
    }

    newPlan[targetKey] = draggedStudent;
    setSeatingPlan(newPlan);
    setDraggedStudent(null);
    setDragSource(null);
  };

  const onDropList = (e: any) => {
    e.preventDefault();
    if (dragSource && dragSource !== 'list') {
      const newPlan = { ...seatingPlan };
      delete newPlan[dragSource];
      setSeatingPlan(newPlan);
    }
    setDraggedStudent(null);
    setDragSource(null);
  };

  const getUnseatedStudents = () => {
    const seatedIds = Object.values(seatingPlan).map((s: any) => s.id);
    return students.filter(s => !seatedIds.includes(s.id));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8">
       <header className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline">
                    <Link href="/rehberlik">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Rehberlik Menüsü
                    </Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" /> Ana Sayfa
                    </Link>
                </Button>
            </div>
      </header>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SOL PANEL */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. Kutu: Okul ve Sınıf Bilgileri */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-700">
              <School size={20} />
              Sınıf Bilgileri
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Okul Adı</label>
                <input 
                  type="text" 
                  className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Örn: Atatürk Anadolu Lisesi"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sınıf Adı</label>
                <input 
                  type="text" 
                  className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Örn: 11-A"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
               <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sınıf Rehber Öğretmeni</label>
                <input 
                  type="text" 
                  className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="İmza için isim"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Okul Müdürü</label>
                <input 
                  type="text" 
                  className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="İmza için isim"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. Kutu: Öğrenci Listesi */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-indigo-600">
              <Users size={24} />
              Öğrenci Listesi
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Liste (Kopyala / Yapıştır)
              </label>
              <textarea
                className="w-full h-24 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="Ahmet Yılmaz&#10;Ayşe Demir..."
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
              ></textarea>
              <button 
                onClick={handleImport}
                className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                Yükle
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-semibold text-slate-700">Bekleyenler</h3>
                <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  {getUnseatedStudents().length}
                </span>
              </div>
              <div 
                className="bg-slate-100 p-2 rounded-lg min-h-[100px] max-h-[200px] overflow-y-auto space-y-2 border border-slate-200 border-dashed"
                onDragOver={onDragOver}
                onDrop={onDropList}
              >
                {getUnseatedStudents().length === 0 && students.length > 0 && (
                  <div className="text-xs text-slate-400 text-center py-4">Sınıf doldu!</div>
                )}
                 {getUnseatedStudents().length === 0 && students.length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-4">Liste boş.</div>
                )}
                {getUnseatedStudents().map((student) => (
                  <div
                    key={student.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, student, 'list')}
                    className="bg-white p-2 rounded shadow-sm border border-slate-200 text-sm flex items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-indigo-50 transition-colors"
                  >
                    <GripVertical size={14} className="text-slate-400" />
                    {student.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Kutu: Ayarlar ve İndirme */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-700">
              <Grid size={20} />
              Düzen ve Çıktı
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Sıra</label>
                <input 
                  type="number" 
                  min="1" 
                  max="12"
                  value={rowCount}
                  onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Sütun</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={colCount}
                  onChange={(e) => setColCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={handleRandomize}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Shuffle size={18} />
                Dağıt (İkili)
              </button>
              <button 
                onClick={handleClearSeating}
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Temizle
              </button>
              
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button 
                  onClick={handleExportWord}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Word Olarak İndir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: Sınıf Görünümü */}
        <div className="lg:col-span-9">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col relative overflow-x-auto">
            
            {/* Önizleme Başlığı */}
            <div className="text-center mb-6 border-b border-slate-100 pb-4">
              <h1 className="text-2xl font-bold text-slate-800 uppercase">{schoolName || "OKUL ADI"}</h1>
              <h2 className="text-lg text-slate-600">{className || "Sınıf"} Oturma Planı</h2>
            </div>

            {/* KAPI - Sol Duvar */}
            <div 
              className="absolute left-0 top-48 w-8 h-32 bg-orange-200/50 border-r-2 border-y-2 border-orange-300 rounded-r-lg flex items-center justify-center shadow-inner z-10"
              title="Sınıf Kapısı"
            >
              <div 
                className="text-orange-800/50 font-bold text-xs tracking-widest uppercase rotate-180" 
                style={{ writingMode: 'vertical-rl' }}
              >
                KAPI
              </div>
              <div className="absolute right-1 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-sm"></div>
            </div>

            <div className="w-full bg-slate-800 text-white text-center py-3 rounded-lg mb-8 shadow-md">
              <span className="font-bold tracking-widest text-lg">TAHTA / ÖĞRETMEN MASASI</span>
            </div>

            <div className="flex-1 flex justify-center items-start">
              <div 
                className="grid gap-6 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${colCount}, minmax(180px, 1fr))`,
                  gridTemplateRows: `repeat(${rowCount}, minmax(80px, 1fr))`
                }}
              >
                {Array.from({ length: rowCount }).map((_, r) => (
                  Array.from({ length: colCount }).map((_, c) => (
                    
                    /* MASA GRUBU */
                    <div key={`${r}-${c}`} className="relative bg-amber-100 rounded-xl border-2 border-amber-200 p-1 flex gap-1 shadow-sm">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[10px] bg-white px-2 rounded-full border border-slate-200 text-slate-400 font-mono z-10">
                        Masa {r + 1}-{c + 1}
                      </div>

                      {/* İki Koltuk Döngüsü (Sol=0, Sağ=1) */}
                      {[0, 1].map((side) => {
                        const key = `${r}-${c}-${side}`;
                        const student = seatingPlan[key];
                        
                        return (
                          <div
                            key={key}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDropSeat(e, r, c, side)}
                            className={`
                              flex-1 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-200 min-h-[70px]
                              ${student 
                                ? 'bg-white border-2 border-indigo-200 shadow-sm' 
                                : 'bg-white/50 border-2 border-dashed border-amber-300/50 hover:border-amber-400'
                              }
                            `}
                          >
                            {student ? (
                              <div 
                                draggable
                                onDragStart={(e) => onDragStart(e, student, key)}
                                className="relative group/student w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing p-1"
                              >
                                <span className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                                  {student.name}
                                </span>
                                <div className="absolute -top-1 -right-1 opacity-0 group-hover/student:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      const newPlan = {...seatingPlan};
                                      delete newPlan[key];
                                      setSeatingPlan(newPlan);
                                    }}
                                    className="bg-red-100 text-red-600 p-0.5 rounded hover:bg-red-200"
                                    title="Kaldır"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-300/60 text-xs select-none pointer-events-none">
                                {side === 0 ? 'Sol' : 'Sağ'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                ))}
              </div>
            </div>
            
            <div className="mt-8 text-center text-slate-400 text-sm">
              Öğrencileri sol veya sağ koltuğa ayrı ayrı sürükleyebilirsiniz.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
