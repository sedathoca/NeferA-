
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Home, BookMarked, Save, FileDown, PlusCircle, Trash2, UserPlus, FolderDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/use-database';
import { KAZANIM_VERITABANI, BEP_OPTIONS } from '@/lib/kazanimlar';
import type { BepStudent, BepPlan, SchoolInfo, Kazanim, AnnualPlanEntry } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


// Form şeması
const bepPlanSchema = z.object({
  id: z.string(),
  gelisimAlani: z.string().optional(),
  ders: z.string().optional(),
  ay: z.string().optional(),
  uda: z.string().optional(),
  kda: z.string().optional(),
  olcut: z.string().optional(),
  yontem: z.string().optional(),
  materyal: z.string().optional(),
  tarih: z.string().optional(),
  degerlendirme: z.string().optional(),
  performans: z.string().optional(),
});

const bepFormSchema = z.object({
  okulAdi: z.string().optional(),
  ogrenciAdi: z.string().optional(),
  tcKimlik: z.string().optional(),
  dogumTarihi: z.string().optional(),
  sinifi: z.string().optional(),
  okulNo: z.string().optional(),
  veliAdi: z.string().optional(),
  veliYakinligi: z.string().optional(),
  veliTel: z.string().optional(),
  veliAdres: z.string().optional(),
  veliIsAdresi: z.string().optional(),
  bepHazirlanmaTarihi: z.string().optional(),
  bepTuru: z.string().optional(),
  bireyselGereksinimler: z.string().optional(),
  egitselTedbirler: z.string().optional(),
  fizikselTedbirler: z.string().optional(),
  bepPlans: z.array(bepPlanSchema),
});

type BepFormValues = z.infer<typeof bepFormSchema>;


const generateFullWordContent = (formData: BepFormValues, schoolInfo: SchoolInfo, student: BepStudent): string => {
    const { form: data, bepPlans } = { form: formData, bepPlans: formData.bepPlans };
    
    const bepPlanHtml = bepPlans.map((plan, index) => `
        <h3 style="font-size: 11pt; font-weight: bold; margin-top: 20px;">Plan ${index + 1}</h3>
        <table style="width:100%; border-collapse: collapse; font-size: 10pt;" border="1">
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Ders</td><td style="padding: 5px;">${plan.ders || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Ay</td><td style="padding: 5px;">${plan.ay || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Uzun Dönemli Amaç (UDA)</td><td style="padding: 5px;">${(plan.uda || '').replace(/\n/g, '<br/>')}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Kısa Dönemli Amaç (KDA)</td><td style="padding: 5px;">${(plan.kda || '').replace(/\n/g, '<br/>')}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Ölçüt</td><td style="padding: 5px;">${plan.olcut || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Yöntem</td><td style="padding: 5px;">${plan.yontem || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Materyal</td><td style="padding: 5px;">${plan.materyal || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Değerlendirme</td><td style="padding: 5px;">${plan.degerlendirme || ''}</td></tr>
        </table>
    `).join('');

    return `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>BEP Dosyası</title>
      <style>body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }</style></head>
      <body>
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 14pt; font-weight: bold;">${schoolInfo.schoolName.toUpperCase()}</h1>
          <h2 style="font-size: 12pt; font-weight: bold;">BİREYSELLEŞTİRİLMİŞ EĞİTİM PROGRAMI (BEP) DOSYASI</h2>
        </div>
        <h3 style="font-size: 11pt; font-weight: bold; margin-top: 20px;">Öğrenci ve Veli Bilgileri</h3>
        <table style="width:100%; border-collapse: collapse; font-size: 10pt;" border="1">
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Öğrenci Adı</td><td style="padding: 5px;">${data.ogrenciAdi || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">T.C. Kimlik No</td><td style="padding: 5px;">${data.tcKimlik || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Doğum Tarihi</td><td style="padding: 5px;">${data.dogumTarihi ? new Date(data.dogumTarihi).toLocaleDateString('tr-TR') : ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Sınıfı</td><td style="padding: 5px;">${data.sinifi || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Okul No</td><td style="padding: 5px;">${data.okulNo || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Veli Adı</td><td style="padding: 5px;">${data.veliAdi || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Veli Yakınlığı</td><td style="padding: 5px;">${data.veliYakinligi || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Veli Telefon</td><td style="padding: 5px;">${data.veliTel || ''}</td></tr>
        </table>
        <h3 style="font-size: 11pt; font-weight: bold; margin-top: 20px;">BEP Detayları</h3>
         <table style="width:100%; border-collapse: collapse; font-size: 10pt;" border="1">
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">BEP Hazırlanma Tarihi</td><td style="padding: 5px;">${data.bepHazirlanmaTarihi ? new Date(data.bepHazirlanmaTarihi).toLocaleDateString('tr-TR') : ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">BEP Türü</td><td style="padding: 5px;">${data.bepTuru || ''}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Bireysel Gereksinimler</td><td style="padding: 5px;">${(data.bireyselGereksinimler || '').replace(/\n/g, '<br/>')}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Alınacak Eğitsel Tedbirler</td><td style="padding: 5px;">${(data.egitselTedbirler || '').replace(/\n/g, '<br/>')}</td></tr>
            <tr><td style="padding: 5px; font-weight: bold; background-color: #f2f2f2;">Alınacak Fiziksel Tedbirler</td><td style="padding: 5px;">${(data.fizikselTedbirler || '').replace(/\n/g, '<br/>')}</td></tr>
         </table>
        ${bepPlanHtml}
      </body></html>
    `;
};

const generateBepPlanWordContent = (bepPlans: BepPlan[], schoolInfo: SchoolInfo, student: BepStudent): string => {
    const tableHeader = `
        <tr style="background-color: #f2f2f2; font-weight: bold;">
            <th style="border: 1px solid black; padding: 5px;">Ders</th>
            <th style="border: 1px solid black; padding: 5px;">Ay</th>
            <th style="border: 1px solid black; padding: 5px;">UDA</th>
            <th style="border: 1px solid black; padding: 5px;">KDA</th>
            <th style="border: 1px solid black; padding: 5px;">Ölçüt</th>
            <th style="border: 1px solid black; padding: 5px;">Yöntem</th>
            <th style="border: 1px solid black; padding: 5px;">Materyal</th>
            <th style="border: 1px solid black; padding: 5px;">Değerlendirme</th>
        </tr>
    `;

    const tableRows = bepPlans.map(p => `
        <tr>
            <td style="border: 1px solid black; padding: 5px;">${p.ders || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${p.ay || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${(p.uda || '').replace(/\n/g, '<br/>')}</td>
            <td style="border: 1px solid black; padding: 5px;">${(p.kda || '').replace(/\n/g, '<br/>')}</td>
            <td style="border: 1px solid black; padding: 5px;">${p.olcut || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${p.yontem || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${p.materyal || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${p.degerlendirme || ''}</td>
        </tr>
    `).join('');

    return `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>BEP Planı</title>
      <style>body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; } table { width:100%; border-collapse: collapse; } </style></head>
      <body>
        <div style="text-align: center; margin-bottom: 1rem;">
          <h1 style="font-size: 12pt; font-weight: bold;">${schoolInfo.schoolName.toUpperCase()}</h1>
          <h2 style="font-size: 11pt; font-weight: bold;">${student.name} - BİREYSELLEŞTİRİLMİŞ EĞİTİM PROGRAMI (BEP) PLANI</h2>
        </div>
        <table border="1">
          <thead>${tableHeader}</thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body></html>
    `;
};


const KazanımSecici = ({ onSelect, targetField, planIndex, form }: { onSelect: (kazanimlar: string[]) => void, targetField: 'uda' | 'kda', planIndex: number, form: any }) => {
    const { db } = useDatabase();
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [selectedKazanims, setSelectedKazanims] = useState<string[]>([]);

    const outcomes = useMemo(() => {
        if (!selectedPlanId) return [];
        const plan = db.annualPlans.find(p => p.id === selectedPlanId);
        if (!plan) return [];
        
        const uniqueOutcomes = new Set<string>();
        plan.content.forEach(entry => {
            if(entry['ÖĞRENME ÇIKTILARI']) {
                entry['ÖĞRENME ÇIKTILARI'].split('\n').forEach(o => {
                    if(o.trim()) uniqueOutcomes.add(o.trim());
                });
            }
        });
        return Array.from(uniqueOutcomes);
    }, [selectedPlanId, db.annualPlans]);

    const handleKazanımToggle = (kazanım: string) => {
        setSelectedKazanims(prev => 
            prev.includes(kazanım) ? prev.filter(k => k !== kazanım) : [...prev, kazanım]
        );
    };

    const handleAddKazanımlar = () => {
        const currentContent = form.getValues(`bepPlans.${planIndex}.${targetField}`) || '';
        const newContent = selectedKazanims.join('\n');
        const updatedContent = currentContent ? `${currentContent}\n${newContent}` : newContent;
        form.setValue(`bepPlans.${planIndex}.${targetField}`, updatedContent);
        onSelect(selectedKazanims);
    };
    
    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Yıllık Plandan Kazanım Seç</DialogTitle>
                <DialogDescription>
                    İlgili yıllık planı seçerek öğrenme çıktılarını (kazanımlarını) bu alana ekleyin.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger><SelectValue placeholder="Yıllık Plan Seçiniz..." /></SelectTrigger>
                    <SelectContent>
                        {db.annualPlans.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {outcomes.length > 0 && (
                     <ScrollArea className="h-72 w-full rounded-md border p-4">
                        <div className="space-y-2">
                         {outcomes.map((kazanım, index) => (
                             <div key={index} className="flex items-center space-x-2">
                                 <Checkbox 
                                    id={`kazanim-${index}`}
                                    checked={selectedKazanims.includes(kazanım)}
                                    onCheckedChange={() => handleKazanımToggle(kazanım)}
                                 />
                                 <label htmlFor={`kazanim-${index}`} className="text-sm">
                                     {kazanım}
                                 </label>
                             </div>
                         ))}
                         </div>
                     </ScrollArea>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onSelect([])}>İptal</Button>
                <Button onClick={handleAddKazanımlar} disabled={selectedKazanims.length === 0}>Seçilenleri Ekle</Button>
            </DialogFooter>
        </DialogContent>
    );
};


export default function BepDosyasiPage() {
  const { db, setDb, loading } = useDatabase();
  const { schoolInfo, bepData, lessons } = db;
  const { toast } = useToast();

  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [isKazanımModalOpen, setIsKazanımModalOpen] = useState(false);
  const [activePlanContext, setActivePlanContext] = useState<{planIndex: number, targetField: 'uda' | 'kda'} | null>(null);


  const selectedStudent = useMemo(() => {
    return bepData.students.find(s => s.id === bepData.selectedStudentId) || null;
  }, [bepData.students, bepData.selectedStudentId]);

  const selectedStudentData = useMemo(() => {
    if (selectedStudent && bepData.plans[selectedStudent.id]) {
      return bepData.plans[selectedStudent.id];
    }
    return { form: {}, bepPlans: [] };
  }, [selectedStudent, bepData.plans]);

  const form = useForm<BepFormValues>({
    resolver: zodResolver(bepFormSchema),
    values: selectedStudentData?.form || {}, // Formu doğrudan merkezi state'e bağla
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bepPlans",
  });
  
  // Veri değişikliklerini merkezi state'e kaydet
  const handleFormChange = (data: BepFormValues) => {
      if (!bepData.selectedStudentId) return;
      setDb(prev => ({
          ...prev,
          bepData: {
              ...prev.bepData,
              plans: {
                  ...prev.bepData.plans,
                  [bepData.selectedStudentId!]: {
                      form: data,
                      bepPlans: data.bepPlans || [],
                  },
              },
          },
      }));
  };
  
  // form.watch tetiklendiğinde kaydet
  React.useEffect(() => {
    const subscription = form.watch((value) => {
        handleFormChange(value as BepFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, handleFormChange]);


  const handleSelectStudent = (studentId: string) => {
    setDb(prev => ({
      ...prev,
      bepData: {
        ...prev.bepData,
        selectedStudentId: studentId,
      },
    }));
  };

  const handleSaveNewStudent = () => {
    if (!newStudentName.trim()) {
      toast({ title: 'Hata', description: 'Öğrenci adı boş olamaz.', variant: 'destructive' });
      return;
    }
    const newStudent: BepStudent = {
      id: `bep_student_${Date.now()}`,
      name: newStudentName.trim(),
      className: schoolInfo?.className || '',
      number: '',
    };
    setDb(prev => {
        const newBepData = { ...prev.bepData };
        newBepData.students = [...newBepData.students, newStudent];
        newBepData.plans[newStudent.id] = { form: { ogrenciAdi: newStudent.name }, bepPlans: [] };
        newBepData.selectedStudentId = newStudent.id;
        return { ...prev, bepData: newBepData };
    });
    setNewStudentName('');
    setIsNewStudentModalOpen(false);
    toast({ title: 'Başarılı', description: 'Yeni öğrenci eklendi ve seçildi.' });
  };
  
  const handleExport = (type: 'full' | 'plan') => {
      if (!selectedStudent || !schoolInfo) {
          toast({ title: 'Hata', description: 'Lütfen önce bir öğrenci seçin.', variant: 'destructive' });
          return;
      }
      
      const content = type === 'full'
          ? generateFullWordContent(form.getValues(), schoolInfo, selectedStudent)
          : generateBepPlanWordContent(form.getValues().bepPlans, schoolInfo, selectedStudent);

      const blob = new Blob([content], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BEP_${type}_${selectedStudent.name}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  const renderSelectField = (index: number, name: keyof BepPlan, label: string, options: string[]) => (
    <FormField
      control={form.control}
      name={`bepPlans.${index}.${name}` as const}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  const aylar = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/rehberlik" title="Ana Sayfa">
              <Home className="mr-2" /> Rehberlik Menüsü
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-headline flex items-center gap-2"><BookMarked className="w-7 h-7 text-primary" /> BEP Dosyası Hazırlama Modülü</h1>
            <p className="text-muted-foreground">Bireyselleştirilmiş Eğitim Programı (BEP) dosyaları oluşturun ve yönetin.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={() => handleExport('full')} variant="outline" disabled={!selectedStudent}><FolderDown className="mr-2"/> Tam Dosya Çıktısı</Button>
            <Button onClick={() => handleExport('plan')} variant="outline" disabled={!selectedStudent}><FileDown className="mr-2"/> BEP Plan Çıktısı</Button>
        </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8 grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>BEP Öğrencileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={isNewStudentModalOpen} onOpenChange={setIsNewStudentModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full"><UserPlus className="mr-2" /> Yeni Öğrenci Ekle</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Yeni BEP Öğrencisi Ekle</DialogTitle></DialogHeader>
                  <div className="py-4">
                    <Label htmlFor='new-student-name'>Öğrenci Adı Soyadı</Label>
                    <Input id='new-student-name' value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsNewStudentModalOpen(false)}>İptal</Button>
                    <Button onClick={handleSaveNewStudent}>Kaydet</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Select onValueChange={handleSelectStudent} value={bepData.selectedStudentId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Öğrenci seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {bepData.students.length > 0 ? (
                    bepData.students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground">Öğrenci bulunamadı.</p>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Form {...form}>
            {!selectedStudent ? (
              <Card className="flex items-center justify-center h-96">
                <CardContent className="text-center">
                  <BookMarked className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Başlamak için bir öğrenci seçin</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Veya listeden yeni bir BEP öğrencisi ekleyin.
                  </p>
                </CardContent>
              </Card>
            ) : (
                <form className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle>Öğrenci ve Veli Bilgileri</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField name="ogrenciAdi" render={({ field }) => (<FormItem><FormLabel>Öğrenci Adı</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="tcKimlik" render={({ field }) => (<FormItem><FormLabel>T.C. Kimlik No</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="dogumTarihi" render={({ field }) => (<FormItem><FormLabel>Doğum Tarihi</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="sinifi" render={({ field }) => (<FormItem><FormLabel>Sınıfı</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="okulNo" render={({ field }) => (<FormItem><FormLabel>Okul No</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="veliAdi" render={({ field }) => (<FormItem><FormLabel>Veli Adı</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="veliYakinligi" render={({ field }) => (<FormItem><FormLabel>Veli Yakınlığı</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="veliTel" render={({ field }) => (<FormItem><FormLabel>Veli Telefon</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      <FormField name="veliAdres" render={({ field }) => (<FormItem><FormLabel>Veli Adresi</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                       <FormField name="veliIsAdresi" render={({ field }) => (<FormItem><FormLabel>Veli İş Adresi</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                    </CardContent>
                  </Card>

                  <Card>
                      <CardHeader><CardTitle>BEP Detayları</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField name="bepHazirlanmaTarihi" render={({ field }) => (<FormItem><FormLabel>BEP Hazırlanma Tarihi</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                          <FormField name="bepTuru" render={({ field }) => (<FormItem><FormLabel>BEP Türü</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                          <FormField name="bireyselGereksinimler" render={({ field }) => (<FormItem className="col-span-full"><FormLabel>Bireysel Gereksinimler</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                          <FormField name="egitselTedbirler" render={({ field }) => (<FormItem className="col-span-full"><FormLabel>Alınacak Eğitsel Tedbirler</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                          <FormField name="fizikselTedbirler" render={({ field }) => (<FormItem className="col-span-full"><FormLabel>Alınacak Fiziksel Tedbirler</FormLabel><FormControl><Textarea {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                      </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Bireyselleştirilmiş Eğitim Programı Planları</CardTitle>
                        <Button type="button" onClick={() => append({ id: `plan_${Date.now()}` })}>
                          <PlusCircle className="mr-2"/> Plan Ekle
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                      <Dialog open={isKazanımModalOpen} onOpenChange={setIsKazanımModalOpen}>
                        {fields.map((item, index) => (
                          <Card key={item.id} className="p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-semibold">Plan {index + 1}</h4>
                              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 /></Button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {renderSelectField(index, 'ders', 'Ders', lessons)}
                                {renderSelectField(index, 'ay', 'Ay', aylar)}
                                
                                <FormField name={`bepPlans.${index}.uda`} render={({ field }) => (
                                    <FormItem className="col-span-full">
                                        <FormLabel>UDA (Uzun Dönemli Amaç)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} />
                                        </FormControl>
                                        <div className="flex gap-2 mt-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => { setActivePlanContext({ planIndex: index, targetField: 'uda' }); setIsKazanımModalOpen(true);}}>Yıllık Plandan Kazanım Seç</Button>
                                        </div>
                                    </FormItem>
                                )} />
                                <FormField name={`bepPlans.${index}.kda`} render={({ field }) => (
                                     <FormItem className="col-span-full">
                                        <FormLabel>KDA (Kısa Dönemli Amaç)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} />
                                        </FormControl>
                                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => { setActivePlanContext({ planIndex: index, targetField: 'kda' }); setIsKazanımModalOpen(true);}}>Yıllık Plandan Kazanım Seç</Button>
                                    </FormItem>
                                )} />
                                
                                {renderSelectField(index, 'olcut', 'Ölçüt', BEP_OPTIONS.olcut)}
                                {renderSelectField(index, 'yontem', 'Yöntem', BEP_OPTIONS.yontem)}
                                {renderSelectField(index, 'materyal', 'Materyal', BEP_OPTIONS.materyal)}
                                {renderSelectField(index, 'degerlendirme', 'Değerlendirme', BEP_OPTIONS.degerlendirme)}
                            </div>
                          </Card>
                        ))}
                         {activePlanContext && <KazanımSecici onSelect={() => setIsKazanımModalOpen(false)} targetField={activePlanContext.targetField} planIndex={activePlanContext.planIndex} form={form} />}
                      </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </form>
            )}
          </Form>
        </div>
      </main>
    </div>
  );
}
