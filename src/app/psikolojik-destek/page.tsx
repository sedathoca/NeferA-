

'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Home, FileDown, Printer, Save, Trash2, PlusCircle, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PsychologicalSupportReferral, SchoolInfo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDatabase } from '@/hooks/use-database';

const formSchema = z.object({
  id: z.string(),
  date: z.string(),
  studentName: z.string().min(1, "Öğrenci adı gerekli"),
  tcKimlikNo: z.string().optional(),
  veliAdiSoyadi: z.string().optional(),
  devamEttigiOkul: z.string().optional(),
  okulBasarisi: z.string().optional(),
  okulaDevamDurumu: z.string().optional(),
  okulOgretmenTutum: z.string().optional(),
  dogumYeriTarihi: z.string().optional(),
  cinsiyet: z.string().optional(),
  veliIletisim: z.string().optional(),
  okulDegisikligi: z.string().optional(),
  sinifTekrari: z.string().optional(),
  tibbiTani: z.string().optional(),
  dahaOncePsikolojikDestek: z.string().optional(),
  gozlem_gozKontagi: z.number().min(0).max(3),
  gozlem_konusma: z.number().min(0).max(3),
  gozlem_duygu: z.number().min(0).max(3),
  gozlem_dinleme: z.number().min(0).max(3),
  gozlem_empati: z.number().min(0).max(3),
  gozlem_arkadaslik: z.number().min(0).max(3),
  gozlem_sosyalEtkinlik: z.number().min(0).max(3),
  gozlem_hayirDiyebilme: z.number().min(0).max(3),
  gozlem_isbirligi: z.number().min(0).max(3),
  gozlem_bagimsizHareket: z.number().min(0).max(3),
  gozlem_hakArama: z.number().min(0).max(3),
  gozlem_kuralUyma: z.number().min(0).max(3),
  gozlem_kendineGuven: z.number().min(0).max(3),
  gozlem_neseli: z.number().min(0).max(3),
  gozlem_girisken: z.number().min(0).max(3),
  gozlem_uyumlu: z.number().min(0).max(3),
  gozlem_sakin: z.number().min(0).max(3),
  gozlem_diger: z.string().optional(),
  davranis_altiniIslatma: z.boolean(),
  davranis_parmakEmme: z.boolean(),
  davranis_tirnakYeme: z.boolean(),
  davranis_zorbalik: z.boolean(),
  davranis_yalanSoyleme: z.boolean(),
  davranis_saldırganlik: z.boolean(),
  davranis_kufurluKonusma: z.boolean(),
  davranis_ofkeKontrolu: z.boolean(),
  davranis_takintili: z.boolean(),
  davranis_kardesKiskancligi: z.boolean(),
  davranis_okulKorkusu: z.boolean(),
  riskli_intiharDusuncesi: z.boolean(),
  riskli_intiharGirisimi: z.boolean(),
  riskli_okuldanKacma: z.boolean(),
  riskli_evdenKacma: z.boolean(),
  riskli_sigara: z.boolean(),
  riskli_alkol: z.boolean(),
  riskli_uyusturucu: z.boolean(),
  riskli_istismar: z.boolean(),
  riskli_cinselDavranis: z.boolean(),
  riskli_arkadaslik: z.boolean(),
  riskli_kesiciAlet: z.boolean(),
  gondermeNedeni: z.string().optional(),
  yapilanCalismalar: z.string().optional(),
  sinifOgrtAd: z.string().optional(),
  sinifOgrtImza: z.string().optional(),
  rehberOgrtAd: z.string().optional(),
  rehberOgrtImza: z.string().optional(),
  okulMdrAd: z.string().optional(),
  okulMdrImza: z.string().optional(),
});


const gozlemMaddeleri = [
    { key: "gozlem_gozKontagi", label: "Göz kontağı kurar" },
    { key: "gozlem_konusma", label: "Konuşmayı başlatır ve sürdürür" },
    { key: "gozlem_duygu", label: "Duygu ve düşüncelerini ifade eder" },
    { key: "gozlem_dinleme", label: "Etkin dinler ve geribildirim verir" },
    { key: "gozlem_empati", label: "Empatik beceriye sahiptir" },
    { key: "gozlem_arkadaslik", label: "Sağlıklı arkadaşlık ilişkileri kurar" },
    { key: "gozlem_sosyalEtkinlik", label: "Sosyal etkinliklere katılır" },
    { key: "gozlem_hayirDiyebilme", label: "Hayır diyebilme becerisi" },
    { key: "gozlem_isbirligi", label: "İşbirliği yapar" },
    { key: "gozlem_bagimsizHareket", label: "Bağımsız hareket eder" },
    { key: "gozlem_hakArama", label: "Hakkını arar" },
    { key: "gozlem_kuralUyma", label: "Okul kurallarına uyar" },
    { key: "gozlem_kendineGuven", label: "Kendine güvenir" },
    { key: "gozlem_neseli", label: "Neşelidir" },
    { key: "gozlem_girisken", label: "Girişkendir" },
    { key: "gozlem_uyumlu", label: "Uyumludur" },
    { key: "gozlem_sakin", label: "Sakin'dir" },
] as const;

const davranisProblemleri = [
    { key: "davranis_altiniIslatma", label: "Altını ıslatma" },
    { key: "davranis_parmakEmme", label: "Parmak emme" },
    { key: "davranis_tirnakYeme", label: "Tırnak yeme" },
    { key: "davranis_zorbalik", label: "Zorbalık" },
    { key: "davranis_yalanSoyleme", label: "Yalan söyleme" },
    { key: "davranis_saldırganlik", label: "Saldırganlık" },
    { key: "davranis_kufurluKonusma", label: "Küfürlü konuşma" },
    { key: "davranis_ofkeKontrolu", label: "Öfke kontrolünde zorluk" },
    { key: "davranis_takintili", label: "Takıntılı davranışlar" },
    { key: "davranis_kardesKiskancligi", label: "Kardeş kıskançlığı" },
    { key: "davranis_okulKorkusu", label: "Okul Korkusu" },
] as const;

const riskliDavranislar = [
    { key: "riskli_intiharDusuncesi", label: "İntihar düşünceleri" },
    { key: "riskli_intiharGirisimi", label: "İntihar girişimi" },
    { key: "riskli_okuldanKacma", label: "Okuldan kaçma" },
    { key: "riskli_evdenKacma", label: "Evden kaçma" },
    { key: "riskli_sigara", label: "Sigara kullanımı" },
    { key: "riskli_alkol", label: "Alkol kullanımı" },
    { key: "riskli_uyusturucu", label: "Uyuşturucu kullanımı" },
    { key: "riskli_istismar", label: "İstismar öyküsü" },
    { key: "riskli_cinselDavranis", label: "Cinsel davranış bozukluğu" },
    { key: "riskli_arkadaslik", label: "Riskli arkadaşlık ilişkileri" },
    { key: "riskli_kesiciAlet", label: "Kesici-delici alet taşıma" },
] as const;



const generateWordContent = (data: PsychologicalSupportReferral, schoolInfo: SchoolInfo) => {
    let gozlemHtml = '';
    gozlemMaddeleri.forEach((item, index) => {
        gozlemHtml += `<tr>
            <td style="border: 1px solid black; padding: 5px;">${index + 1}</td>
            <td style="border: 1px solid black; padding: 5px;">${item.label}</td>
            ${[0,1,2,3].map(v => `<td style="border: 1px solid black; padding: 5px; text-align: center;">${data[item.key] === v ? 'X' : ''}</td>`).join('')}
        </tr>`;
    });
    gozlemHtml += `<tr><td style="border: 1px solid black; padding: 5px;">18</td><td style="border: 1px solid black; padding: 5px;">Diğer</td><td colspan="4" style="border: 1px solid black; padding: 5px;">${data.gozlem_diger || ''}</td></tr>`;


    const createCheckboxList = (items: readonly { key: any; label: string }[]) => {
        let html = '';
        const half = Math.ceil(items.length / 2);
        const col1 = items.slice(0, half);
        const col2 = items.slice(half);

        for (let i = 0; i < half; i++) {
            html += '<tr>';
            if (col1[i]) {
                html += `<td style="border: 1px solid black; padding: 5px;">(${data[col1[i].key] ? 'X' : '&nbsp;'}) ${col1[i].label}</td>`;
            } else {
                html += '<td style="border: 1px solid black; padding: 5px;"></td>';
            }
            if (col2[i]) {
                 html += `<td style="border: 1px solid black; padding: 5px;">(${data[col2[i].key] ? 'X' : '&nbsp;'}) ${col2[i].label}</td>`;
            } else {
                html += '<td style="border: 1px solid black; padding: 5px;"></td>';
            }
            html += '</tr>';
        }
        return html;
    }

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>Psikolojik Destek Yönlendirme Formu</title>
        <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; }
            .container { width: 100%; margin: auto; }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
            .header h2 { font-size: 11pt; font-weight: bold; margin: 0; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .table td, .table th { border: 1px solid black; padding: 4px; vertical-align: top;}
            .table th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
            .label-cell { background-color: #f2f2f2; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>(RAM Rehberlik Hizmetleri Bölümüne)</h2>
                <h1>PSİKOLOJİK DESTEK YÖNLENDİRME FORMU</h1>
                <p style="text-align: right;">Tarih: ${new Date(data.date).toLocaleDateString('tr-TR')}</p>
            </div>
            <table class="table">
                <tr><th colspan="4">Öğrenci Bilgileri</th></tr>
                <tr>
                    <td class="label-cell">Öğrencinin Adı Soyadı:</td><td>${data.studentName}</td>
                    <td class="label-cell">Doğum Yeri ve Tarihi:</td><td>${data.dogumYeriTarihi || ''}</td>
                </tr>
                <tr>
                    <td class="label-cell">T.C. Kimlik No:</td><td>${data.tcKimlikNo || ''}</td>
                    <td class="label-cell">Cinsiyeti:</td><td>${data.cinsiyet || ''}</td>
                </tr>
                <tr>
                    <td class="label-cell">Veli Adı Soyadı:</td><td>${data.veliAdiSoyadi || ''}</td>
                    <td class="label-cell">Veli İletişim Bilgisi/Tel:</td><td>${data.veliIletisim || ''}</td>
                </tr>
                <tr>
                    <td class="label-cell">Devam Ettiği Okul ve Sınıfı:</td><td>${data.devamEttigiOkul || ''}</td>
                    <td class="label-cell">Okul Değişikliği Var Mı?</td><td>${data.okulDegisikligi || ''}</td>
                </tr>
                 <tr>
                    <td class="label-cell">Okul Başarısı:</td><td>${data.okulBasarisi || ''}</td>
                    <td class="label-cell">Sınıf Tekrarı Var Mı?</td><td>${data.sinifTekrari || ''}</td>
                </tr>
                 <tr>
                    <td class="label-cell">Okula Devam Durumu:</td><td>${data.okulaDevamDurumu || ''}</td>
                    <td class="label-cell">Varsa Tıbbi Tanı:</td><td>${data.tibbiTani || ''}</td>
                </tr>
                 <tr>
                    <td class="label-cell">Okula Ve Öğretmenlerine Karşı Tutumu:</td><td>${data.okulOgretmenTutum || ''}</td>
                    <td class="label-cell">Daha Önce Psikolojik Destek Aldı Mı?</td><td>${data.dahaOncePsikolojikDestek || ''}</td>
                </tr>
            </table>

            <table class="table">
                <tr><th colspan="6">Öğrenciye İlişkin Gözlemler</th></tr>
                 <tr><th>S.No</th><th>Gözlem</th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
                ${gozlemHtml}
            </table>
             <table class="table">
                <tr><th colspan="2">Varsa Davranış Problemleri</th></tr>
                ${createCheckboxList(davranisProblemleri)}
            </table>
             <table class="table">
                <tr><th colspan="2">Varsa Riskli Davranışları</th></tr>
                ${createCheckboxList(riskliDavranislar)}
            </table>
            
             <table class="table">
                <tr><th>Rehberlik ve Araştırma Merkezine Gönderme Nedeni</th></tr>
                <tr><td style="min-height: 80px;">${(data.gondermeNedeni || '').replace(/\n/g, '<br/>')}</td></tr>
                <tr><th>Probleme Yönelik Olarak Okulda Yapılan Çalışmalar (Detaylı bir şekilde doldurulacaktır)</th></tr>
                <tr><td style="min-height: 80px;">${(data.yapilanCalismalar || '').replace(/\n/g, '<br/>')}</td></tr>
            </table>

            <h3 style="text-align: center; font-size:11pt; margin-top: 20px;">Probleme Yönelik Olarak İş birliği Yapılan Kişi ve Kurumlar</h3>
            <table class="table">
                <tr><th>Sınıf/Şube Öğretmeni</th><th>Okul Rehberlik Öğretmeni</th><th>Okul Müdürü</th></tr>
                <tr>
                    <td style="height: 80px; text-align:center; vertical-align:bottom;">${data.sinifOgrtAd || ''}<br/>İmza</td>
                    <td style="height: 80px; text-align:center; vertical-align:bottom;">${data.rehberOgrtAd || ''}<br/>İmza</td>
                    <td style="height: 80px; text-align:center; vertical-align:bottom;">${data.okulMdrAd || ''}<br/>İmza</td>
                </tr>
            </table>
            <p style="font-size: 8pt;">*Bu bölümdeki her madde için öğrencide o davranış veya özellik hiç yoksa (0), nadiren varsa (1), sık sık varsa (2), her zaman varsa (3) tam olarak varsa (g) şeklinde doldurulacaktır.</p>
        </div>
    </body>
    </html>
  `;
};

export default function PsikolojikDestekPage() {
  const { db, setDb } = useDatabase();
  const { schoolInfo, psychologicalSupportReferrals: records } = db;
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const defaultFormValues: PsychologicalSupportReferral = {
      id: `record-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      studentName: '',
      tcKimlikNo: '',
      veliAdiSoyadi: '',
      devamEttigiOkul: '',
      okulBasarisi: '',
      okulaDevamDurumu: '',
      okulOgretmenTutum: '',
      dogumYeriTarihi: '',
      cinsiyet: '',
      veliIletisim: '',
      okulDegisikligi: '',
      sinifTekrari: '',
      tibbiTani: '',
      dahaOncePsikolojikDestek: '',
      gozlem_gozKontagi: 0,
      gozlem_konusma: 0,
      gozlem_duygu: 0,
      gozlem_dinleme: 0,
      gozlem_empati: 0,
      gozlem_arkadaslik: 0,
      gozlem_sosyalEtkinlik: 0,
      gozlem_hayirDiyebilme: 0,
      gozlem_isbirligi: 0,
      gozlem_bagimsizHareket: 0,
      gozlem_hakArama: 0,
      gozlem_kuralUyma: 0,
      gozlem_kendineGuven: 0,
      gozlem_neseli: 0,
      gozlem_girisken: 0,
      gozlem_uyumlu: 0,
      gozlem_sakin: 0,
      gozlem_diger: '',
      davranis_altiniIslatma: false,
      davranis_parmakEmme: false,
      davranis_tirnakYeme: false,
      davranis_zorbalik: false,
      davranis_yalanSoyleme: false,
      davranis_saldırganlik: false,
      davranis_kufurluKonusma: false,
      davranis_ofkeKontrolu: false,
      davranis_takintili: false,
      davranis_kardesKiskancligi: false,
      davranis_okulKorkusu: false,
      riskli_intiharDusuncesi: false,
      riskli_intiharGirisimi: false,
      riskli_okuldanKacma: false,
      riskli_evdenKacma: false,
      riskli_sigara: false,
      riskli_alkol: false,
      riskli_uyusturucu: false,
      riskli_istismar: false,
      riskli_cinselDavranis: false,
      riskli_arkadaslik: false,
      riskli_kesiciAlet: false,
      gondermeNedeni: '',
      yapilanCalismalar: '',
      sinifOgrtAd: '',
      sinifOgrtImza: '',
      rehberOgrtAd: '',
      rehberOgrtImza: '',
      okulMdrAd: '',
      okulMdrImza: '',
  };

  const form = useForm<PsychologicalSupportReferral>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (selectedRecordId) {
      const recordData = records.find(r => r.id === selectedRecordId); 
      if (recordData) {
        form.reset(recordData);
      }
    } else {
      handleNewRecord();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecordId, records, form.reset]);

  const onSubmit = (values: PsychologicalSupportReferral) => {
    setDb(prevDb => {
        let updatedRecords;
        const existingRecordIndex = prevDb.psychologicalSupportReferrals.findIndex(r => r.id === values.id);

        if (existingRecordIndex > -1) {
          updatedRecords = [...prevDb.psychologicalSupportReferrals];
          updatedRecords[existingRecordIndex] = values;
        } else {
          updatedRecords = [...prevDb.psychologicalSupportReferrals, values];
        }
        
        return { ...prevDb, psychologicalSupportReferrals: updatedRecords };
    });
    setSelectedRecordId(values.id);
    toast({ title: 'Kaydedildi', description: 'Yönlendirme formu başarıyla kaydedildi.' });
  };
  
  const handleNewRecord = () => {
    const newId = `record-${Date.now()}`;
    setSelectedRecordId(null);
    form.reset({
       ...defaultFormValues,
       id: newId,
       date: new Date().toISOString().split('T')[0],
       devamEttigiOkul: schoolInfo ? `${schoolInfo.schoolName} - ${schoolInfo.className}`: '',
       sinifOgrtAd: schoolInfo?.classTeacherName || '',
       rehberOgrtAd: schoolInfo?.schoolCounselorName || '',
       okulMdrAd: schoolInfo?.schoolPrincipalName || '',
    });
  }

  const handleDeleteRecord = () => {
    if (!selectedRecordId) return;
    setDb(prevDb => ({
        ...prevDb,
        psychologicalSupportReferrals: prevDb.psychologicalSupportReferrals.filter(r => r.id !== selectedRecordId)
    }));
    handleNewRecord();
    toast({ title: 'Silindi', description: 'Yönlendirme formu silindi.', variant: 'destructive' });
  };

  const handlePrint = () => {
    const values = form.getValues();
    if (!values.studentName || !schoolInfo) {
      toast({ title: 'Eksik Bilgi', description: 'Lütfen formu yazdırmak için önce formu kaydedin.', variant: 'destructive' });
      return;
    }
    const content = generateWordContent(values, schoolInfo);
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `psikolojik-destek-formu-${values.studentName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderCheckboxList = (items: readonly { key: any; label: string }[]) => {
    const half = Math.ceil(items.length / 2);
    const col1 = items.slice(0, half);
    const col2 = items.slice(half);

    return (
        <div className="grid grid-cols-2 gap-x-8">
            <div className="space-y-2">
                {col1.map(item => (
                    <FormField key={item.key} control={form.control} name={item.key}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                        )}
                    />
                ))}
            </div>
             <div className="space-y-2">
                {col2.map(item => (
                     <FormField key={item.key} control={form.control} name={item.key}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                        )}
                    />
                ))}
            </div>
        </div>
    )
  }

  const renderField = (name: keyof PsychologicalSupportReferral, label: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (<FormItem><FormLabel>{label}</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
  );
  const renderRadioField = (name: keyof PsychologicalSupportReferral, label: string) => (
      <FormField control={form.control} name={name} render={({ field }) => (
        <FormItem><FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value || ''} className="flex space-x-4">
              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Evet" /></FormControl><FormLabel className="font-normal">Evet</FormLabel></FormItem>
              <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Hayır" /></FormControl><FormLabel className="font-normal">Hayır</FormLabel></FormItem>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )} />
  );
  
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
            <h1 className="text-2xl font-headline flex items-center gap-2"><HeartHandshake /> Psikolojik Destek Yönlendirme Formu</h1>
            <p className="text-muted-foreground">Acil destek gerektiren durumlar için yönlendirme formu oluşturun.</p>
          </div>
        </div>
         <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" disabled={!selectedRecordId}><Printer className="mr-2"/> Formu Yazdır</Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
             <Card>
                <CardHeader><CardTitle>Yönlendirme Kayıtları</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                     <Button onClick={handleNewRecord} className="w-full"><PlusCircle className="mr-2"/> Yeni Form</Button>
                    <Select onValueChange={setSelectedRecordId} value={selectedRecordId || ''}>
                      <SelectTrigger><SelectValue placeholder="Kayıtlı formu seç..." /></SelectTrigger>
                      <SelectContent>
                        {records.length === 0 && <p className='text-sm text-muted-foreground text-center p-2'>Kayıtlı form yok.</p>}
                        {records.map(r => <SelectItem key={r.id} value={r.id}>{r.studentName} - {new Date(r.date).toLocaleDateString('tr-TR')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {selectedRecordId && <Button onClick={handleDeleteRecord} variant="destructive" className="w-full mt-2"><Trash2 className="mr-2"/> Seçili Kaydı Sil</Button>}
                </CardContent>
             </Card>
        </div>
        <div className="md:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                    <CardTitle>Öğrenci Bilgileri</CardTitle>
                    <div className="flex justify-between items-center">
                        <CardDescription>RAM Rehberlik Hizmetleri Bölümüne</CardDescription>
                        <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="w-1/4"><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {renderField('studentName', 'Öğrencinin Adı Soyadı')}
                        {renderField('dogumYeriTarihi', 'Doğum Yeri ve Tarihi')}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {renderField('tcKimlikNo', 'T.C. Kimlik No')}
                        {renderField('cinsiyet', 'Cinsiyeti')}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {renderField('veliAdiSoyadi', 'Veli Adı Soyadı')}
                        {renderField('veliIletisim', 'Veli İletişim Bilgisi/Tel')}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {renderField('devamEttigiOkul', 'Devam Ettiği Okul ve Sınıfı')}
                        {renderRadioField('okulDegisikligi', 'Okul Değişikliği Var Mı?')}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {renderField('okulBasarisi', 'Okul Başarısı')}
                        {renderRadioField('sinifTekrari', 'Sınıf Tekrarı Var Mı?')}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {renderField('okulaDevamDurumu', 'Okula Devam Durumu')}
                        {renderField('tibbiTani', 'Varsa Tıbbi Tanı')}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {renderField('okulOgretmenTutum', 'Okula Ve Öğretmenlerine Karşı Tutumu')}
                        {renderRadioField('dahaOncePsikolojikDestek', 'Daha Önce Psikolojik Destek Aldı Mı?')}
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Öğrenciye İlişkin Gözlemler</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">S.No</TableHead>
                                <TableHead>Gözlem</TableHead>
                                <TableHead className="w-12 text-center">0</TableHead>
                                <TableHead className="w-12 text-center">1</TableHead>
                                <TableHead className="w-12 text-center">2</TableHead>
                                <TableHead className="w-12 text-center">3</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gozlemMaddeleri.map((item, index) => (
                                <TableRow key={item.key}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.label}</TableCell>
                                    <TableCell colSpan={4}>
                                        <Controller control={form.control} name={item.key}
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)} className="flex justify-around">
                                                    {[0, 1, 2, 3].map(v => (
                                                        <FormItem key={v} className="flex items-center"><FormControl><RadioGroupItem value={String(v)} /></FormControl></FormItem>
                                                    ))}
                                                </RadioGroup>
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                             <TableRow>
                                <TableCell>18</TableCell>
                                <TableCell>Diğer</TableCell>
                                <TableCell colSpan={4}>
                                   <FormField control={form.control} name="gozlem_diger" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Varsa Davranış Problemleri</CardTitle></CardHeader>
                <CardContent>{renderCheckboxList(davranisProblemleri)}</CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Varsa Riskli Davranışları</CardTitle></CardHeader>
                <CardContent>{renderCheckboxList(riskliDavranislar)}</CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                    <FormField control={form.control} name="gondermeNedeni" render={({ field }) => (<FormItem><FormLabel className="font-bold">Rehberlik ve Araştırma Merkezine Gönderme Nedeni</FormLabel><FormControl><Textarea rows={4} {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="yapilanCalismalar" render={({ field }) => (<FormItem><FormLabel className="font-bold">Probleme Yönelik Olarak Okulda Yapılan Çalışmalar</FormLabel><FormControl><Textarea rows={4} {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader><CardTitle>İşbirliği Yapılan Kişi ve Kurumlar</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                     <FormField control={form.control} name="sinifOgrtAd" render={({ field }) => (<FormItem><FormLabel>Sınıf/Şube Öğretmeni</FormLabel><FormControl><Input {...field} placeholder="Adı Soyadı" value={field.value || ''} /></FormControl></FormItem>)} />
                     <FormField control={form.control} name="rehberOgrtAd" render={({ field }) => (<FormItem><FormLabel>Okul Rehberlik Öğretmeni</FormLabel><FormControl><Input {...field} placeholder="Adı Soyadı" value={field.value || ''} /></FormControl></FormItem>)} />
                     <FormField control={form.control} name="okulMdrAd" render={({ field }) => (<FormItem><FormLabel>Okul Müdürü</FormLabel><FormControl><Input {...field} placeholder="Adı Soyadı" value={field.value || ''} /></FormControl></FormItem>)} />
                </CardContent>
              </Card>

              <CardFooter>
                  <Button type="submit" size="lg"><Save className="mr-2"/> Formu Kaydet</Button>
              </CardFooter>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
