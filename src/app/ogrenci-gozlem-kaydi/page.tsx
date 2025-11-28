
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Home, FileDown, Printer, Save, Trash2, PlusCircle, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ObservationRecord, SchoolInfo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDatabase } from '@/hooks/use-database';


const formSchema = z.object({
  id: z.string(),
  recordDate: z.string(),
  studentName: z.string().min(1, "Öğrenci adı gerekli"),
  studentAgeGender: z.string(),
  studentSchool: z.string(),
  studentClassNumber: z.string(),
  classTeacherName: z.string(),
  observationPlace: z.string(),
  observationDateTime: z.string(),
  observationDuration: z.string(),
  observationBehavior: z.string(),
  observationPlanning: z.string(),
  teacherObservations: z.string(),
  observationEvaluation: z.string(),
  conclusionAndSuggestions: z.string(),
  observerName: z.string(),
  observerTitle: z.string(),
  observerSignature: z.string(),
});


const generateWordContent = (data: ObservationRecord, schoolInfo: SchoolInfo) => {
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <title>Öğrenci Gözlem Kaydı</title>
        <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }
            .container { width: 100%; margin: auto; padding: 1cm; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 14pt; font-weight: bold; }
            .header-logo { display: inline-block; vertical-align: middle; width: 60px; height: 60px; margin-right: 15px; } /* Placeholder for logo */
            .main-title { display: inline-block; vertical-align: middle; }
            .date-field { text-align: right; margin-bottom: 10px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .table td { border: 1px solid black; padding: 8px; }
            .table td:first-child { font-weight: bold; background-color: #f2f2f2; width: 40%; }
            .textarea-content { min-height: 100px; vertical-align: top; }
            .signature-area { margin-top: 50px; text-align: right; }
        </style>
    </head>
    <body>
        <div class="container">
            <p style="text-align:center;">ÖZEL EĞİTİM VE REHBERLİK HİZMETLERİ GENEL MÜDÜRLÜĞÜ</p>
            <div class="header">
                 <!-- Logo can be added here if available -->
                <h1 class="main-title">ÖĞRENCİ GÖZLEM KAYDI</h1>
                <div class="date-field">Tarih: ${new Date(data.recordDate).toLocaleDateString('tr-TR')}</div>
            </div>

            <table class="table">
                <tr><td>Adı Soyadı</td><td>${data.studentName}</td></tr>
                <tr><td>Yaşı/Cinsiyeti</td><td>${data.studentAgeGender}</td></tr>
                <tr><td>Okulu</td><td>${data.studentSchool}</td></tr>
                <tr><td>Sınıfı/Okul Numarası</td><td>${data.studentClassNumber}</td></tr>
                <tr><td>Sınıf/Şube Rehber Öğretmenin Adı Soyadı</td><td>${data.classTeacherName}</td></tr>
                <tr><td>Gözlem Yapılan Yer</td><td>${data.observationPlace}</td></tr>
                <tr><td>Gözlem Yapılan Tarih/Saat</td><td>${data.observationDateTime}</td></tr>
                <tr><td>Gözlem Süresi</td><td>${data.observationDuration}</td></tr>
                <tr><td>Gözlem Yapılacak Davranış</td><td>${data.observationBehavior}</td></tr>
                <tr><td class="textarea-content">Gözlem Sürecinin Planlanması (Davranışın Nerede, Ne Zaman, Ne Sıklıkta vs. Gözlemleneceği)</td><td class="textarea-content">${data.observationPlanning.replace(/\n/g, '<br/>')}</td></tr>
                <tr><td class="textarea-content">Öğretmenin Gözlemleri</td><td class="textarea-content">${data.teacherObservations.replace(/\n/g, '<br/>')}</td></tr>
                <tr><td class="textarea-content">Gözlem Sürecinin Değerlendirilmesi</td><td class="textarea-content">${data.observationEvaluation.replace(/\n/g, '<br/>')}</td></tr>
                <tr><td class="textarea-content">Sonuç ve Öneriler</td><td class="textarea-content">${data.conclusionAndSuggestions.replace(/\n/g, '<br/>')}</td></tr>
            </table>

            <div class="signature-area">
                <p>${data.observerName}</p>
                <p>${data.observerTitle}</p>
                <p>İmza</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export default function OgrenciGozlemKaydiPage() {
  const { db, setDb } = useDatabase();
  const { schoolInfo, observationRecords: records } = db;
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const defaultFormValues: ObservationRecord = {
      id: `record-${Date.now()}`,
      recordDate: new Date().toISOString().split('T')[0],
      studentName: '', studentAgeGender: '', studentSchool: '', studentClassNumber: '', classTeacherName: '',
      observationPlace: '', observationDateTime: '', observationDuration: '', observationBehavior: '',
      observationPlanning: '', teacherObservations: '', observationEvaluation: '', conclusionAndSuggestions: '',
      observerName: '', observerTitle: '', observerSignature: '',
  };

  const form = useForm<ObservationRecord>({
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

  const onSubmit = (values: ObservationRecord) => {
    setDb(prevDb => {
        let updatedRecords;
        const existingRecordIndex = prevDb.observationRecords.findIndex(r => r.id === values.id);

        if (existingRecordIndex > -1) {
            updatedRecords = [...prevDb.observationRecords];
            updatedRecords[existingRecordIndex] = values;
        } else {
            updatedRecords = [...prevDb.observationRecords, values];
        }
        
        return { ...prevDb, observationRecords: updatedRecords };
    });
    setSelectedRecordId(values.id);
    toast({ title: 'Kaydedildi', description: 'Gözlem kaydı başarıyla kaydedildi.' });
  };
  
  const handleNewRecord = () => {
    const newId = `record-${Date.now()}`;
    setSelectedRecordId(null);
    form.reset({
       ...defaultFormValues,
       id: newId,
       recordDate: new Date().toISOString().split('T')[0],
       studentSchool: schoolInfo?.schoolName || '',
       studentClassNumber: schoolInfo ? `${schoolInfo.className} - ` : '',
       classTeacherName: schoolInfo?.classTeacherName || '',
       observerName: schoolInfo?.classTeacherName || '',
       observerTitle: 'Sınıf Rehber Öğretmeni',
    });
  }

  const handleDeleteRecord = () => {
    if (!selectedRecordId) return;
    setDb(prevDb => ({
        ...prevDb,
        observationRecords: prevDb.observationRecords.filter(r => r.id !== selectedRecordId)
    }));
    handleNewRecord();
    toast({ title: 'Silindi', description: 'Gözlem kaydı silindi.', variant: 'destructive' });
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
    link.download = `gozlem-kaydi-${values.studentName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const renderField = (name: keyof ObservationRecord, label: string, isTextArea = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isTextArea ? <Textarea {...field} rows={4} value={field.value || ''} /> : <Input {...field} value={field.value || ''} />}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/" title="Ana Sayfa">
              <Home className="mr-2" /> Ana Sayfa
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-headline flex items-center gap-2"><Users2 /> Öğrenci Gözlem Kaydı</h1>
            <p className="text-muted-foreground">Öğrencilerle ilgili gözlemlerinizi kaydedin ve yönetin.</p>
          </div>
        </div>
         <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" disabled={!selectedRecordId}><Printer className="mr-2"/> Kaydı Yazdır</Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
             <Card>
                <CardHeader><CardTitle>Gözlem Kayıtları</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                     <Button onClick={handleNewRecord} className="w-full"><PlusCircle className="mr-2"/> Yeni Kayıt</Button>
                    <Select onValueChange={setSelectedRecordId} value={selectedRecordId || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kayıtlı gözlem seç..." />
                      </SelectTrigger>
                      <SelectContent>
                        {records.length === 0 && <p className='text-sm text-muted-foreground text-center p-2'>Kayıtlı gözlem yok.</p>}
                        {records.map(r => <SelectItem key={r.id} value={r.id}>{r.studentName} - {new Date(r.recordDate).toLocaleDateString('tr-TR')}</SelectItem>)}
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
                <CardHeader className='flex-row justify-between items-center'>
                    <CardTitle>Gözlem Kayıt Formu</CardTitle>
                    <div className="w-1/4">
                       <FormField control={form.control} name="recordDate" render={({ field }) => (
                            <FormItem><FormControl><Input type="date" placeholder="Tarih" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="font-bold text-lg border-b pb-2">Öğrenci Bilgileri</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {renderField('studentName', 'Adı Soyadı')}
                      {renderField('studentAgeGender', 'Yaşı/Cinsiyeti')}
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        {renderField('studentSchool', 'Okulu')}
                        {renderField('studentClassNumber', 'Sınıfı/Okul Numarası')}
                     </div>
                      {renderField('classTeacherName', 'Sınıf/Şube Rehber Öğretmenin Adı Soyadı')}

                    <p className="font-bold text-lg border-b pb-2 pt-6">Gözlem Bilgileri</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {renderField('observationPlace', 'Gözlem Yapılan Yer')}
                        {renderField('observationDateTime', 'Gözlem Yapılan Tarih/Saat')}
                      </div>
                       <div className="grid md:grid-cols-2 gap-4">
                         {renderField('observationDuration', 'Gözlem Süresi')}
                         {renderField('observationBehavior', 'Gözlem Yapılacak Davranış')}
                      </div>
                      
                      {renderField('observationPlanning', 'Gözlem Sürecinin Planlanması (Davranışın Nerede, Ne Zaman, Ne Sıklıkta vs. Gözlemleneceği)', true)}
                      {renderField('teacherObservations', 'Öğretmenin Gözlemleri', true)}
                      {renderField('observationEvaluation', 'Gözlem Sürecinin Değerlendirilmesi', true)}
                      {renderField('conclusionAndSuggestions', 'Sonuç ve Öneriler', true)}

                     <p className="font-bold text-lg border-b pb-2 pt-6">Gözlemi Yapan</p>
                     <div className="grid md:grid-cols-2 gap-4">
                        {renderField('observerName', 'Adı Soyadı')}
                        {renderField('observerTitle', 'Unvanı')}
                     </div>
                      {renderField('observerSignature', 'İmza')}
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg"><Save className="mr-2"/> Formu Kaydet</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
