
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HomeIcon, Save, Trash2, PlusCircle, ArrowLeft, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HomeVisitRecord, SchoolInfo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useDatabase } from '@/hooks/use-database';

const formSchema = z.object({
  id: z.string(),
  date: z.string(),
  studentName: z.string().min(1, "Öğrenci adı gerekli"),
  studentSchool: z.string(),
  studentClassNumber: z.string(),
  socioCultural_evinFizikselKosullari: z.string(),
  socioCultural_aileninEkonomikKosullari: z.string(),
  socioCultural_aileninSosyalYasami: z.string(),
  parentAttitudes_ogrenciyeKarsiTutum: z.string(),
  parentAttitudes_ogretmenlereKarsiTutum: z.string(),
  parentAttitudes_okulaKarsiTutum: z.string(),
  parentAttitudes_birbirlerineKarsiTutum: z.string(),
  parentAttitudes_okuldanBeklentileri: z.string(),
  generalEvaluation: z.string(),
  visitors: z.array(z.object({
    name: z.string(),
    signature: z.string(),
  })),
});


const generatePdfContent = (data: HomeVisitRecord, schoolInfo: SchoolInfo, doc: jsPDF) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('EV ZİYARET FORMU', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    const tableBody = [
        ['Öğrencinin Adı Soyadı', data.studentName, 'Tarih', new Date(data.date).toLocaleDateString('tr-TR')],
        ['Okulu', data.studentSchool, 'Sınıf - Numarası', data.studentClassNumber],
    ];

    (doc as any).autoTable({
        startY: 30,
        body: tableBody,
        theme: 'grid',
    });

    const addSection = (title: string, fields: { label: string; value: string }[], startY: number) => {
        (doc as any).autoTable({
            startY,
            head: [[title]],
            headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' },
            body: fields.map(f => [f.label, f.value]),
            theme: 'grid',
        });
        return (doc as any).lastAutoTable.finalY + 10;
    };

    let currentY = (doc as any).lastAutoTable.finalY + 10;

    currentY = addSection('SOSYO-KÜLTÜREL ÖZELLİKLER', [
        { label: 'Evin Fiziksel Koşulları', value: data.socioCultural_evinFizikselKosullari },
        { label: 'Ailenin Ekonomik Koşulları', value: data.socioCultural_aileninEkonomikKosullari },
        { label: 'Ailenin Sosyal Yaşamı', value: data.socioCultural_aileninSosyalYasami },
    ], currentY);

    currentY = addSection('EBEVEYN TUTUMLARI', [
        { label: 'Ebeveynlerin Öğrenciye Karşı Tutumları', value: data.parentAttitudes_ogrenciyeKarsiTutum },
        { label: 'Ebeveynlerin Öğretmenlere Karşı Tutumları', value: data.parentAttitudes_ogretmenlereKarsiTutum },
        { label: 'Ebeveynlerin Okula Karşı Tutumları', value: data.parentAttitudes_okulaKarsiTutum },
        { label: 'Ebeveynlerin Birbirlerine Karşı Tutumları', value: data.parentAttitudes_birbirlerineKarsiTutum },
        { label: 'Ebeveynlerin Okuldan Beklentileri', value: data.parentAttitudes_okuldanBeklentileri },
    ], currentY);

    currentY = addSection('GENEL DEĞERLENDİRME', [
        { label: 'Genel Değerlendirme', value: data.generalEvaluation },
    ], currentY);

    doc.setFontSize(10);
    doc.text('Ziyaret Edenler:', 14, currentY);
    currentY += 10;
    
    data.visitors.forEach((visitor, index) => {
        doc.text(`${visitor.name || ''}`, 14 + (index * 65), currentY);
        doc.text(`İmza`, 14 + (index * 65), currentY + 10);
    });

};

export default function HomeVisitFormPage() {
  const { db, setDb } = useDatabase();
  const { schoolInfo, homeVisitRecords: records } = db;
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const defaultFormValues: HomeVisitRecord = {
      id: `record-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      studentName: '',
      studentSchool: '',
      studentClassNumber: '',
      socioCultural_evinFizikselKosullari: '',
      socioCultural_aileninEkonomikKosullari: '',
      socioCultural_aileninSosyalYasami: '',
      parentAttitudes_ogrenciyeKarsiTutum: '',
      parentAttitudes_ogretmenlereKarsiTutum: '',
      parentAttitudes_okulaKarsiTutum: '',
      parentAttitudes_birbirlerineKarsiTutum: '',
      parentAttitudes_okuldanBeklentileri: '',
      generalEvaluation: '',
      visitors: [{ name: '', signature: '' }],
  };

  const form = useForm<HomeVisitRecord>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });
  
  const { fields: visitorFields, append: appendVisitor, remove: removeVisitor } = useFieldArray({
    control: form.control,
    name: "visitors"
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

  const onSubmit = (values: HomeVisitRecord) => {
    setDb(prevDb => {
        let updatedRecords;
        const existingRecordIndex = prevDb.homeVisitRecords.findIndex(r => r.id === values.id);

        if (existingRecordIndex > -1) {
          updatedRecords = [...prevDb.homeVisitRecords];
          updatedRecords[existingRecordIndex] = values;
        } else {
          updatedRecords = [...prevDb.homeVisitRecords, values];
        }
        return { ...prevDb, homeVisitRecords: updatedRecords };
    });
    setSelectedRecordId(values.id);
    toast({ title: 'Kaydedildi', description: 'Ev ziyaret formu başarıyla kaydedildi.' });
  };
  
  const handleNewRecord = () => {
    const newId = `record-${Date.now()}`;
    setSelectedRecordId(null);
    form.reset({
       ...defaultFormValues,
       id: newId,
       date: new Date().toISOString().split('T')[0],
       studentSchool: schoolInfo?.schoolName || '',
       studentClassNumber: schoolInfo ? `${schoolInfo.className} - ` : '',
       visitors: [{ name: schoolInfo?.classTeacherName || '', signature: '' }]
    });
  }

  const handleDeleteRecord = () => {
    if (!selectedRecordId) return;
    setDb(prevDb => ({
        ...prevDb,
        homeVisitRecords: prevDb.homeVisitRecords.filter(r => r.id !== selectedRecordId)
    }));
    handleNewRecord();
    toast({ title: 'Silindi', description: 'Ev ziyaret formu silindi.', variant: 'destructive' });
  };

  const handlePrint = () => {
    const values = form.getValues();
    if (!values.studentName || !schoolInfo) {
      toast({ title: 'Eksik Bilgi', description: 'Lütfen formu yazdırmak için önce formu kaydedin.', variant: 'destructive' });
      return;
    }
    const doc = new jsPDF();
    generatePdfContent(values, schoolInfo, doc);
    doc.save(`ev-ziyareti-${values.studentName}.pdf`);
  };
  
  const renderField = (name: keyof HomeVisitRecord, label: string, isTextArea = false) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isTextArea ? <Textarea {...field} rows={3} value={field.value || ''} /> : <Input {...field} value={field.value || ''} />}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
        <header className="mb-8 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="w-14 h-14 bg-purple-600 text-white flex items-center justify-center rounded-xl text-2xl font-bold">
                        <HomeIcon />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Ev Ziyaret Formu</h1>
                        <p className="text-gray-600">Veli ev ziyaretlerinizi kaydedin ve yönetin.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/rehberlik">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Rehberlik Menüsü
                        </Link>
                    </Button>
                    <Button onClick={handlePrint} variant="outline" disabled={!selectedRecordId}><FileDown className="mr-2"/> PDF Çıktı Al</Button>
                </div>
            </div>
        </header>

        <main className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader><CardTitle>Ziyaret Kayıtları</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Button onClick={handleNewRecord} className="w-full"><PlusCircle className="mr-2"/> Yeni Form</Button>
                        <Select onValueChange={setSelectedRecordId} value={selectedRecordId || ''}>
                        <SelectTrigger>
                            <SelectValue placeholder="Kayıtlı formu seç..." />
                        </SelectTrigger>
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
                    <div className='flex justify-between items-center'>
                        <CardTitle>Ev Ziyaret Formu</CardTitle>
                        <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="w-1/4"><FormLabel>Tarih</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                        {renderField('studentName', 'Öğrencinin Adı Soyadı')}
                        {renderField('studentSchool', 'Okulu')}
                        {renderField('studentClassNumber', 'Sınıf - Numarası')}
                        </div>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Sosyo-Kültürel Özellikler</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {renderField('socioCultural_evinFizikselKosullari', 'Evin Fiziksel Koşulları', true)}
                                {renderField('socioCultural_aileninEkonomikKosullari', 'Ailenin Ekonomik Koşulları', true)}
                                {renderField('socioCultural_aileninSosyalYasami', 'Ailenin Sosyal Yaşamı', true)}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Ebeveyn Tutumları</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {renderField('parentAttitudes_ogrenciyeKarsiTutum', 'Ebeveynlerin Öğrenciye Karşı Tutumları', true)}
                                {renderField('parentAttitudes_ogretmenlereKarsiTutum', 'Ebeveynlerin Öğretmenlere Karşı Tutumları', true)}
                                {renderField('parentAttitudes_okulaKarsiTutum', 'Ebeveynlerin Okula Karşı Tutumları', true)}
                                {renderField('parentAttitudes_birbirlerineKarsiTutum', 'Ebeveynlerin Birbirlerine Karşı Tutumları', true)}
                                {renderField('parentAttitudes_okuldanBeklentileri', 'Ebeveynlerin Okuldan Beklentileri', true)}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Genel Değerlendirme</CardTitle></CardHeader>
                            <CardContent>
                                {renderField('generalEvaluation', '', true)}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-lg">Ziyaret Edenler</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {visitorFields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                                    <FormField control={form.control} name={`visitors.${index}.name`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Ad Soyad</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`visitors.${index}.signature`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>İmza</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeVisitor(index)}><Trash2/></Button>
                                </div>
                                ))}
                                <Button type="button" variant="secondary" onClick={() => appendVisitor({ name: '', signature: ''})} disabled={visitorFields.length >= 3}>
                                    <PlusCircle className="mr-2"/> Ziyaret Eden Ekle
                                </Button>
                            </CardContent>
                        </Card>

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
