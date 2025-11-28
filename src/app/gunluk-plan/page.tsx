'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, School, Edit3, FileSpreadsheet, Save, Calendar, RefreshCw, BookOpen, User, Home } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDatabase } from '@/hooks/use-database';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface PlanRow {
  week: string;
  unit: string;
  hours: string;
  topic: string;
  outcome: string;
  process: string;
  sdb: string;
  values: string;
  literacy: string;
  diff: string;
  alanBecerileri?: string;
  kavramsalBeceriler?: string;
  egilimler?: string;
  disiplinlerArasi?: string;
  zenginlestirme?: string;
  destekleme?: string;
  olcme?: string;
}


export default function MaarifPlannerFinal() {
  const { db, setDb } = useDatabase();
  const { schoolInfo } = db;
  const { toast } = useToast();

  const [planData, setPlanData] = useState<PlanRow[]>([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [metaData, setMetaData] = useState({
    schoolName: "OKUL ADI GİRİNİZ",
    teacherName: "Ad Soyad",
    principalName: "Okul Müdürü",
    lessonName: "FİZİK",
    grade: "10. SINIF"
  });

  const [signatureDate, setSignatureDate] = useState(new Date().toLocaleDateString('tr-TR'));

  const [currentWeekData, setCurrentWeekData] = useState({
    unit: "", hours: "", topic: "", outcome: "", process: "",
    alanBecerileri: "", kavramsalBeceriler: "", egilimler: "",
    sdb: "", degerler: "", okuryazarlik: "", disiplinlerArasi: "",
    zenginlestirme: "", destekleme: "", olcme: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (schoolInfo) {
      setMetaData({
        schoolName: schoolInfo.schoolName || "OKUL ADI GİRİNİZ",
        teacherName: schoolInfo.classTeacherName || "Ad Soyad",
        principalName: schoolInfo.schoolPrincipalName || "Okul Müdürü",
        lessonName: "FİZİK", // Varsayılan
        grade: schoolInfo.className || "10. SINIF" // Varsayılan
      });
    }
  }, [schoolInfo]);

  useEffect(() => {
    if (planData.length > 0 && planData[selectedWeekIndex]) {
      const p = planData[selectedWeekIndex];
      
      setCurrentWeekData({
        unit: p.unit || "", hours: p.hours || "2", topic: p.topic || "", outcome: p.outcome || "", process: p.process || "",
        alanBecerileri: p.alanBecerileri || "FBAB10. Tümevarımsal Akıl Yürütme", 
        kavramsalBeceriler: p.kavramsalBeceriler || "KB2.14. Yorumlama",
        egilimler: p.egilimler || "E1.3. Azim ve Kararlılık, E3.6. Analitik Düşünme",
        sdb: p.sdb || "SDB1.1. Kendini Tanıma",
        degerler: p.values || "D3. Çalışkanlık",
        okuryazarlik: p.literacy || "OB1. Bilgi Okuryazarlığı",
        disiplinlerArasi: p.disiplinlerArasi || "", 
        zenginlestirme: p.zenginlestirme || "Konuyla ilgili üst düzey düşünme becerilerini geliştirecek örnek olaylar incelenir.",
        destekleme: p.destekleme || "Temel kavramların anlaşılması için görsel materyaller ve kavram haritaları kullanılır.",
        olcme: p.olcme || "Açık uçlu sorular ile süreç değerlendirmesi yapılır."
      });

      calculateDateFromWeekString(p.week);
    }
  }, [selectedWeekIndex, planData]);

  const calculateDateFromWeekString = (weekStr: string) => {
    try {
      const match = weekStr.match(/(\d{1,2})[-\s].*?([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/);
      if (match) {
        const day = match[1].padStart(2, '0');
        const monthName = match[2].toLowerCase();
        
        const months: { [key: string]: string } = {
          "ocak": "01", "şubat": "02", "mart": "03", "nisan": "04", "mayıs": "05", "haziran": "06",
          "temmuz": "07", "ağustos": "08", "eylül": "09", "ekim": "10", "kasım": "11", "aralık": "12"
        };
        
        const month = months[monthName] || "09"; 
        const currentYear = new Date().getFullYear();
        setSignatureDate(`${day}.${month}.${currentYear}`);
      }
    } catch (e) {
      console.error("Tarih ayrıştırma hatası:", e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fName = file.name.toUpperCase();
    let dLesson = metaData.lessonName;
    let dGrade = metaData.grade;
    if (fName.includes("FİZİK")) dLesson = "FİZİK";
    if (fName.includes("MATEMATİK")) dLesson = "MATEMATİK";
    if (fName.includes("9")) dGrade = "9. SINIF";
    else if (fName.includes("10")) dGrade = "10. SINIF";
    else if (fName.includes("11")) dGrade = "11. SINIF";
    else if (fName.includes("12")) dGrade = "12. SINIF";
    
    setMetaData(prev => ({ ...prev, lessonName: dLesson, grade: dGrade }));

    const reader = new FileReader();
    reader.onload = (event) => {
        const data = new Uint8Array(event.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
        processExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const processExcelData = (rows: any[][]) => {
    const lines = rows.filter(row => row && row.length > 0 && row.some(c => c && String(c).trim() !== ""));
    let headerIndex = -1, headers: string[] = [];

    for (let i = 0; i < Math.min(lines.length, 25); i++) {
      const rowStr = lines[i].map(c => String(c).toUpperCase());
      if (rowStr.some(c => c.includes("HAFTA"))) {
        headerIndex = i; headers = rowStr; break;
      }
    }

    if (headerIndex === -1) { toast({title: "Hata", description: "Excel formatı uygun değil. 'HAFTA' sütunu bulunamadı.", variant: "destructive"}); return; }

    const findCol = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));
    const map = {
      week: findCol(["HAFTA"]), unit: findCol(["ÜNİTE", "TEMA"]), hours: findCol(["SAAT", "SÜRE"]),
      topic: findCol(["KONU", "İÇERİK"]), outcome: findCol(["KAZANIM", "ÇIKTI"]), process: findCol(["SÜREÇ", "AÇIKLAMA"]),
      sdb: findCol(["SOSYAL", "SDB"]), values: findCol(["DEĞERLER"]), literacy: findCol(["OKURYAZARLIK"]), diff: findCol(["FARKLILAŞTIRMA"]),
    };

    let processed: PlanRow[] = [], lastUnit = "";
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const row = lines[i];
      const val = (idx: number) => (idx !== -1 && row[idx]) ? String(row[idx]).trim() : "";
      
      let week = val(map.week); if (!week || week.length < 2) continue;
      let unit = val(map.unit); if (unit) lastUnit = unit; else unit = lastUnit;
      let diffRaw = val(map.diff);
      let diffEnrich = "", diffSupport = "";
      if (diffRaw.includes("Zenginleştirme") || diffRaw.includes("Destekleme")) { diffEnrich = diffRaw; }

      processed.push({
        week, unit, hours: val(map.hours) || "2", topic: val(map.topic), outcome: val(map.outcome), process: val(map.process),
        sdb: val(map.sdb), values: val(map.values), literacy: val(map.literacy), diff: diffRaw, disiplinlerArasi: "",
        zenginlestirme: diffEnrich, destekleme: diffSupport
      });
    }
    setPlanData(processed);
    setIsLoaded(true);
  };

  const downloadWordDoc = () => {
    const p = planData[selectedWeekIndex];
    const d = currentWeekData;

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>Günlük Plan</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 0px; }
        td, th { border: 1px solid black; padding: 6px; vertical-align: middle; text-align: left; }
        .center { text-align: center; } .bold { font-weight: bold; }
        .header-title { font-size: 12pt; font-weight: bold; text-align: center; margin-bottom: 20px; }
        .gray-bg { background-color: #D9D9D9; font-weight: bold; }
        .light-gray-bg { background-color: #F2F2F2; font-weight: bold; }
        .signature { border: none; margin-top: 50px; }
        .signature td { border: none; text-align: center; }
      </style>
      </head><body>
        <div class="header-title">
          ${metaData.schoolName}<br>
          ${metaData.grade} ${metaData.lessonName} DERSİ GÜNLÜK PLANI<br>
          ${p.week}
        </div>
        <table>
          <tr><td colspan="4" class="gray-bg center">DERS BİLGİSİ</td></tr>
          <tr><td width="20%" class="light-gray-bg">Sınıf</td><td width="30%">${metaData.grade}</td><td width="20%" class="light-gray-bg">Ders</td><td width="30%">${metaData.lessonName}</td></tr>
          <tr><td class="light-gray-bg">Tema</td><td>${d.unit}</td><td class="light-gray-bg">Süre</td><td>${d.hours} Ders Saati</td></tr>
          <tr><td class="light-gray-bg">Alan Becerileri</td><td colspan="3">${d.alanBecerileri}</td></tr>
          <tr><td class="light-gray-bg">Kavramsal Beceriler</td><td colspan="3">${d.kavramsalBeceriler}</td></tr>
          <tr><td class="light-gray-bg">Eğilimler</td><td colspan="3">${d.egilimler}</td></tr>
        </table><br>
        <table>
          <tr><td colspan="2" class="gray-bg center">PROGRAMLAR ARASI BİLEŞENLER</td></tr>
          <tr><td width="30%" class="light-gray-bg">Sosyal-Duygusal Öğr. Bec.</td><td>${d.sdb}</td></tr>
          <tr><td class="light-gray-bg">Değerler</td><td>${d.degerler}</td></tr>
          <tr><td class="light-gray-bg">Okuryazarlık Becerileri</td><td>${d.okuryazarlik}</td></tr>
          <tr><td class="light-gray-bg">Disiplinlerarası İlişkiler</td><td>${d.disiplinlerArasi || "-"}</td></tr>
        </table><br>
        <table>
          <tr><td class="gray-bg center">ÖĞRENME ÇIKTILARI VE SÜREÇ BİLEŞENLERİ</td></tr>
          <tr><td class="light-gray-bg" style="border-bottom: none;">Öğrenme Çıktıları:</td></tr>
          <tr><td style="border-top: none; padding-bottom: 10px;">${d.outcome}</td></tr>
          <tr><td class="light-gray-bg" style="border-bottom: none;">Öğretme-Öğrenme Süreci:</td></tr>
          <tr><td style="border-top: none; padding-top: 5px;">${d.process ? d.process.replace(/\n/g, '<br>') : "<i>Süreç bilgisi girilmemiştir.</i>"}</td></tr>
        </table><br>
        <table>
          <tr><td colspan="2" class="gray-bg center">FARKLILAŞTIRMA</td></tr>
          <tr><td width="50%" class="light-gray-bg center">Zenginleştirme</td><td width="50%" class="light-gray-bg center">Destekleme</td></tr>
          <tr><td style="height: 100px; vertical-align: top;">${d.zenginlestirme}</td><td style="height: 100px; vertical-align: top;">${d.destekleme}</td></tr>
        </table><br>
        <table>
          <tr><td class="gray-bg center">ÖLÇME VE DEĞERLENDİRME</td></tr>
          <tr><td style="height: 60px;">${d.olcme}</td></tr>
        </table>
        <table class="signature">
          <tr><td colspan="2" class="bold">UYGUNDUR<br>${signatureDate}</td></tr>
          <tr><td><br><b>${metaData.teacherName}</b><br>Ders Öğretmeni</td><td><br><b>${metaData.principalName}</b><br>Okul Müdürü</td></tr>
        </table>
      </body></html>`;
    
    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Maarif_Plan_${p.week.replace(/[^a-zA-Z0-9]/g, '')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/"><Button variant="outline"><Home /></Button></Link>
          <div className="bg-indigo-600 text-white p-3 rounded-lg"><School size={28}/></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Günlük Planlayıcı</h1>
            <p className="text-slate-500 text-sm">Excel'den Yıllık Planınızı Yükleyip Haftalık Çıktı Alın</p>
          </div>
        </div>
        <div className="flex gap-2">
            <input type="file" accept=".xlsx" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <Button onClick={() => fileInputRef.current?.click()} className="bg-green-600 hover:bg-green-700">
                <FileSpreadsheet size={18} className="mr-2"/> Yıllık Plan Yükle (.xlsx)
            </Button>
        </div>
      </div>

      {!isLoaded ? (
        <div className="flex flex-col items-center justify-center h-80 bg-white border-2 border-dashed border-slate-300 rounded-xl">
           <Upload size={48} className="text-slate-300 mb-4" />
           <p className="text-lg font-medium text-slate-600">Başlamak için Excel Yıllık Planını Yükle</p>
           <p className="text-sm text-slate-400 mt-2">Okul bilgileriniz tarayıcınıza otomatik kaydedilir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-3 bg-slate-100 border-b font-bold text-xs text-slate-600 flex items-center gap-2">
                <Calendar size={14}/> HAFTALAR
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {planData.map((p, i) => (
                    <button key={i} onClick={() => setSelectedWeekIndex(i)} 
                        className={`w-full text-left p-2 rounded text-xs truncate transition ${selectedWeekIndex === i ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'hover:bg-slate-50'}`}>
                        {p.week}
                    </button>
                ))}
            </div>
          </div>

          <div className="col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
             <div className="p-3 bg-slate-100 border-b flex justify-between items-center">
                <span className="font-bold text-xs text-slate-600 flex items-center gap-2"><Edit3 size={14}/> DETAYLI DÜZENLEME</span>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                    <span className="text-[10px] font-bold text-slate-500">İMZA:</span>
                    <Input type="text" value={signatureDate} onChange={e => setSignatureDate(e.target.value)} className="text-xs border-none bg-transparent p-0 w-20 text-center font-bold text-slate-800 focus:ring-0 h-auto" />
                </div>
             </div>
             
             <div className="overflow-y-auto flex-1 p-4 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                    <div className="flex gap-2">
                        <div className="w-1/2">
                             <label className="text-[10px] font-bold text-slate-400 block mb-1">ÖĞRETMEN</label>
                             <Input className="w-full p-2 border rounded text-xs bg-white" placeholder="Öğretmen" value={metaData.teacherName} onChange={e => setMetaData({...metaData, teacherName: e.target.value})} />
                        </div>
                        <div className="w-1/2">
                             <label className="text-[10px] font-bold text-slate-400 block mb-1">MÜDÜR</label>
                             <Input className="w-full p-2 border rounded text-xs bg-white" placeholder="Müdür" value={metaData.principalName} onChange={e => setMetaData({...metaData, principalName: e.target.value})} />
                        </div>
                    </div>
                    <div>
                         <label className="text-[10px] font-bold text-slate-400 block mb-1">OKUL ADI</label>
                         <Input className="w-full p-2 border rounded text-xs bg-white" placeholder="Okul Adı" value={metaData.schoolName} onChange={e => setMetaData({...metaData, schoolName: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">KONU VE KAZANIM</label>
                    <Input className="w-full p-2 border rounded text-sm font-semibold text-slate-700" value={currentWeekData.topic} onChange={e => setCurrentWeekData({...currentWeekData, topic: e.target.value})} placeholder="Konu" />
                    <Textarea className="w-full p-2 border rounded text-sm h-20" value={currentWeekData.outcome} onChange={e => setCurrentWeekData({...currentWeekData, outcome: e.target.value})} placeholder="Kazanım" />
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                    <label className="text-xs font-bold text-indigo-600">MAARİF BECERİLERİ</label>
                    <div className="grid grid-cols-1 gap-2">
                        <Input className="w-full p-2 border rounded text-xs" placeholder="Alan Becerileri" value={currentWeekData.alanBecerileri} onChange={e => setCurrentWeekData({...currentWeekData, alanBecerileri: e.target.value})} />
                        <Input className="w-full p-2 border rounded text-xs" placeholder="Kavramsal Beceriler" value={currentWeekData.kavramsalBeceriler} onChange={e => setCurrentWeekData({...currentWeekData, kavramsalBeceriler: e.target.value})} />
                        <Input className="w-full p-2 border rounded text-xs" placeholder="Eğilimler" value={currentWeekData.egilimler} onChange={e => setCurrentWeekData({...currentWeekData, egilimler: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                    <label className="text-xs font-bold text-teal-600">PROGRAMLAR ARASI BİLEŞENLER</label>
                    <Input className="w-full p-2 border rounded text-xs" placeholder="Sosyal-Duygusal" value={currentWeekData.sdb} onChange={e => setCurrentWeekData({...currentWeekData, sdb: e.target.value})} />
                    <Input className="w-full p-2 border rounded text-xs" placeholder="Değerler" value={currentWeekData.degerler} onChange={e => setCurrentWeekData({...currentWeekData, degerler: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input className="w-full p-2 border rounded text-xs" placeholder="Okuryazarlık" value={currentWeekData.okuryazarlik} onChange={e => setCurrentWeekData({...currentWeekData, okuryazarlik: e.target.value})} />
                        <Input className="w-full p-2 border rounded text-xs" placeholder="Disiplinlerarası İlş." value={currentWeekData.disiplinlerArasi} onChange={e => setCurrentWeekData({...currentWeekData, disiplinlerArasi: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                    <label className="text-xs font-bold text-slate-500">SÜREÇ VE FARKLILAŞTIRMA</label>
                    <Textarea className="w-full p-2 border rounded text-xs h-24" placeholder="Süreç..." value={currentWeekData.process} onChange={e => setCurrentWeekData({...currentWeekData, process: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <Textarea className="w-full p-2 border rounded text-xs h-20" placeholder="Zenginleştirme" value={currentWeekData.zenginlestirme} onChange={e => setCurrentWeekData({...currentWeekData, zenginlestirme: e.target.value})} />
                        <Textarea className="w-full p-2 border rounded text-xs h-20" placeholder="Destekleme" value={currentWeekData.destekleme} onChange={e => setCurrentWeekData({...currentWeekData, destekleme: e.target.value})} />
                    </div>
                </div>
             </div>
          </div>

          <div className="col-span-5 bg-slate-200 rounded-xl border border-slate-300 flex flex-col relative">
             <div className="absolute top-3 right-3 z-10">
                <Button onClick={downloadWordDoc} className="bg-blue-600 hover:bg-blue-700">
                    <Download size={16} className="mr-2"/> WORD İNDİR
                </Button>
             </div>
             <div className="overflow-y-auto flex-1 p-6 flex justify-center">
                <div className="bg-white shadow-xl w-[210mm] min-h-[297mm] p-[15mm] text-[10px] text-black font-serif leading-tight origin-top scale-[0.65] lg:scale-[0.80] transform-gpu">
                    {planData.length > 0 && planData[selectedWeekIndex] && (
                        <>
                            <div className="text-center font-bold text-[12px] mb-4">
                                {metaData.schoolName}<br/>{metaData.grade} {metaData.lessonName} DERSİ GÜNLÜK PLANI<br/>{planData[selectedWeekIndex].week}
                            </div>
                            <div className="border border-black mb-0">
                                <div className="bg-[#D9D9D9] font-bold text-center border-b border-black p-1">DERS BİLGİSİ</div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/4 bg-[#F2F2F2] font-bold p-1 border-r border-black">Sınıf</div><div className="w-1/4 p-1 border-r border-black">{metaData.grade}</div>
                                    <div className="w-1/4 bg-[#F2F2F2] font-bold p-1 border-r border-black">Ders</div><div className="w-1/4 p-1">{metaData.lessonName}</div>
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/4 bg-[#F2F2F2] font-bold p-1 border-r border-black">Tema</div><div className="w-1/4 p-1 border-r border-black">{currentWeekData.unit}</div>
                                    <div className="w-1/4 bg-[#F2F2F2] font-bold p-1 border-r border-black">Süre</div><div className="w-1/4 p-1">{currentWeekData.hours}</div>
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/4 bg-[#F2F2F2] font-bold p-1 border-r border-black">Alan Bec.</div><div className="w-3/4 p-1">{currentWeekData.alanBecerileri}</div>
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/4 bg-[#F2F2F2] font-bold p-1 border-r border-black">Kavramsal Bec.</div><div className="w-3/4 p-1">{currentWeekData.kavramsalBeceriler}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-1/4 bg-[#F2F2F2] font-bold p-1 border-r border-black">Eğilimler</div><div className="w-3/4 p-1">{currentWeekData.egilimler}</div>
                                </div>
                            </div>
                            <div className="h-2"></div>
                            <div className="border border-black mb-0">
                                <div className="bg-[#D9D9D9] font-bold text-center border-b border-black p-1">PROGRAMLAR ARASI BİLEŞENLER</div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/3 bg-[#F2F2F2] font-bold p-1 border-r border-black">Sosyal-Duygusal</div><div className="w-2/3 p-1">{currentWeekData.sdb}</div>
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/3 bg-[#F2F2F2] font-bold p-1 border-r border-black">Değerler</div><div className="w-2/3 p-1">{currentWeekData.degerler}</div>
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/3 bg-[#F2F2F2] font-bold p-1 border-r border-black">Okuryazarlık</div><div className="w-2/3 p-1">{currentWeekData.okuryazarlik}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-1/3 bg-[#F2F2F2] font-bold p-1 border-r border-black">Disiplinlerarası</div><div className="w-2/3 p-1">{currentWeekData.disiplinlerArasi || "-"}</div>
                                </div>
                            </div>
                            <div className="h-2"></div>

                            <div className="border border-black">
                                <div className="bg-[#D9D9D9] font-bold text-center border-b border-black p-1">ÖĞRENME ÇIKTILARI VE SÜREÇ</div>
                                <div className="bg-[#F2F2F2] font-bold p-1">Öğrenme Çıktıları:</div>
                                <div className="p-1 border-b border-black min-h-[40px]">{currentWeekData.outcome}</div>
                                <div className="bg-[#F2F2F2] font-bold p-1">Öğretme-Öğrenme Süreci:</div>
                                <div className="p-1 min-h-[100px] whitespace-pre-wrap">{currentWeekData.process}</div>
                            </div>
                            <div className="h-2"></div>

                            <div className="border border-black">
                                <div className="bg-[#D9D9D9] font-bold text-center border-b border-black p-1">FARKLILAŞTIRMA</div>
                                <div className="flex border-b border-black">
                                    <div className="w-1/2 bg-[#F2F2F2] font-bold p-1 text-center border-r border-black">Zenginleştirme</div>
                                    <div className="w-1/2 bg-[#F2F2F2] font-bold p-1 text-center">Destekleme</div>
                                </div>
                                <div className="flex">
                                    <div className="w-1/2 p-2 border-r border-black min-h-[50px]">{currentWeekData.zenginlestirme}</div>
                                    <div className="w-1/2 p-2 min-h-[50px]">{currentWeekData.destekleme}</div>
                                </div>
                            </div>

                            <div className="h-4"></div>
                            <div className="flex justify-between px-10">
                                <div className="text-center"><br/><b>{metaData.teacherName}</b><br/>Ders Öğretmeni</div>
                                <div className="text-center"><b>UYGUNDUR</b><br/>{signatureDate}<br/><b>{metaData.principalName}</b><br/>Okul Müdürü</div>
                            </div>
                        </>
                    )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
