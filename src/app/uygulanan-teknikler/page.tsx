
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SchoolInfo, AppliedTechniquesFormData } from '@/lib/types';
import Link from 'next/link';
import { Home, FileDown, ClipboardCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const techniqueSchema = z.object({
    name: z.string(),
    kiz: z.string().optional(),
    erkek: z.string().optional(),
    veli: z.string().optional(),
    tarih: z.string().optional(),
});

const formSchema = z.object({
    bireyiTanima: z.array(techniqueSchema),
    ogrenciGorusme: z.array(techniqueSchema),
    veliCalisma: z.array(techniqueSchema.extend({ notlar: z.string().optional() })),
    genelDegerlendirme: z.string().optional(),
    cozumOnerileri: z.string().optional(),
});

const defaultTechniques: AppliedTechniquesFormData = {
    bireyiTanima: [
        { name: "Bana Kendini Anlat" },
        { name: "Yaşam Pencerem Envanteri" },
        { name: "Başarısızlık Nedenleri Anketi" },
        { name: "Öğrenci tanıma formları" },
        { name: "Sınıf geçme ve sınav yönetmeliği hk. bilgi verilmesi" },
        { name: "Ödül ve disiplin yönetmeliği hakkında bilgi verilmesi" },
        { name: "Kılık kıyafet hakkında bilgi verilmesi" },
        { name: "Okulun ve çevrenin tanıtılması (oryantasyon çalışması)" },
        { name: "Sınıf Risk Haritası" },
        { name: "Rehberlik İhtiyaçları Belirleme Formu" },
        { name: "(Varsa)" },
        { name: "(Varsa)" },
        { name: "(Varsa)" },
    ].map(t => ({ ...t, kiz: '', erkek: '', veli: '', tarih: '' })),
    ogrenciGorusme: [
        { name: "Psikolojik danışma servisine yönlendirilen Öğrenci/Veli" },
        { name: "Eğitsel Rehberlik Amacıyla Görüşülen Öğrenci/Veli" },
        { name: "Mesleki Rehberlik Amacıyla Görüşülen Öğrenci/Veli" },
        { name: "Kişisel/Sosyal Rehberlik Amacıyla Görüşülen Öğrenci/Veli" },
    ].map(t => ({ ...t, kiz: '', erkek: '', veli: '', tarih: '' })),
    veliCalisma: [
        { name: "Veli Toplantısı" },
        { name: "Bilgilendirme Seminerleri" },
        { name: "Bilgilendirme Broşür/Afiş/Kitapçıkları" },
        { name: "Ev Ziyareti Yapılan Veli Sayısı" },
    ].map(t => ({ ...t, kiz: '', erkek: '', veli: '', tarih: '', notlar: '' })),
    genelDegerlendirme: '',
    cozumOnerileri: '',
};

const AppliedTechniquesPage: React.FC = () => {
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<AppliedTechniquesFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultTechniques,
    });
    
    const { fields: bireyiTanimaFields } = useFieldArray({ control: form.control, name: "bireyiTanima" });
    const { fields: ogrenciGorusmeFields } = useFieldArray({ control: form.control, name: "ogrenciGorusme" });
    const { fields: veliCalismaFields } = useFieldArray({ control: form.control, name: "veliCalisma" });

    useEffect(() => {
        const storedSchoolInfo = localStorage.getItem('schoolInfo');
        if (storedSchoolInfo) {
            setSchoolInfo(JSON.parse(storedSchoolInfo));
        } else {
            toast({ title: 'Okul Bilgileri Eksik', description: 'Lütfen önce okul bilgilerini girin.', variant: 'destructive' });
            router.push('/bilgi-girisi');
        }
        
        const savedData = localStorage.getItem('appliedTechniquesData');
        if (savedData) {
            form.reset(JSON.parse(savedData));
        }
    }, [router, toast, form]);

    const handleSave = (data: AppliedTechniquesFormData) => {
        localStorage.setItem('appliedTechniquesData', JSON.stringify(data));
        toast({ title: 'Kaydedildi', description: 'Veriler başarıyla kaydedildi.' });
    };

    const generateReportHtml = () => {
        if (!schoolInfo) return '';
        const data = form.getValues();

        const createTable = (title: string, fields: any[], hasNotes = false) => {
            let table = `<h3 style="font-size: 11pt; font-weight: bold; margin-top: 20px; border: 1px solid black; padding: 5px; background-color: #f2f2f2; text-align: center;">${title}</h3>`;
            table += `<table style="width:100%; border-collapse: collapse; font-size: 10pt;" border="1">
                <thead>
                    <tr>
                        <th style="padding: 5px; width: 40%;">Yapılan Çalışmalar</th>
                        <th style="padding: 5px;" colspan="3">Katılımcı Sayıları</th>
                        <th style="padding: 5px;">Tarih</th>
                        ${hasNotes ? `<th style="padding: 5px;">Notlar</th>` : ''}
                    </tr>
                    <tr>
                        <th></th>
                        <th style="padding: 5px; width: 10%;">Kız Öğrenci</th>
                        <th style="padding: 5px; width: 10%;">Erkek Öğrenci</th>
                        <th style="padding: 5px; width: 10%;">Veli</th>
                        <th></th>
                        ${hasNotes ? `<th></th>` : ''}
                    </tr>
                </thead>
                <tbody>`;
            fields.forEach(field => {
                table += `
                    <tr>
                        <td style="padding: 5px;">${field.name}</td>
                        <td style="padding: 5px; text-align: center;">${field.kiz || ''}</td>
                        <td style="padding: 5px; text-align: center;">${field.erkek || ''}</td>
                        <td style="padding: 5px; text-align: center;">${field.veli || ''}</td>
                        <td style="padding: 5px; text-align: center;">${field.tarih || ''}</td>
                        ${hasNotes ? `<td style="padding: 5px;">${(field as any).notlar || ''}</td>` : ''}
                    </tr>
                `;
            });
            table += `</tbody></table>`;
            return table;
        };

        const bireyiTanimaHtml = createTable('UYGULANAN TEKNİKLER, BİREYİ TANIMA VE BİLGİLENDİRME ÇALIŞMALARI', data.bireyiTanima);
        const ogrenciGorusmeHtml = createTable('ÖĞRENCİ YÖNLENDİRME, ÖĞRENCİ VE VELİ GÖRÜŞMELERİ', data.ogrenciGorusme);
        const veliCalismaHtml = createTable('VELİLERE YÖNELİK YAPILAN ÇALIŞMALAR', data.veliCalisma, true);

        const genelDegerlendirmeHtml = `
            <h3 style="font-size: 11pt; font-weight: bold; margin-top: 20px; border: 1px solid black; padding: 5px; background-color: #f2f2f2; text-align: center;">GENEL DEĞERLENDİRME</h3>
            <table style="width:100%; border-collapse: collapse; font-size: 10pt;" border="1">
                <tr><td style="padding: 5px; font-weight: bold;">Karşılaşılan Güçlükler ve Nedenleri</td></tr>
                <tr><td style="padding: 5px; min-height: 80px; vertical-align: top;">${(data.genelDegerlendirme || '').replace(/\n/g, '<br/>')}</td></tr>
                <tr><td style="padding: 5px; font-weight: bold;">Çözüm Önerileri</td></tr>
                <tr><td style="padding: 5px; min-height: 80px; vertical-align: top;">${(data.cozumOnerileri || '').replace(/\n/g, '<br/>')}</td></tr>
            </table>
        `;
        
        const signatureArea = `
            <div style="margin-top: 50px; font-size: 11pt; text-align: right;">
                <div style="display: inline-block; text-align: center;">
                    <p>&nbsp;</p>
                    <p>${schoolInfo.classTeacherName}</p>
                    <p>Sınıf Rehber Öğretmeni</p>
                </div>
            </div>
        `;

        return `
            <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Uygulanan Teknikler Raporu</title><style>body { font-family: 'Times New Roman', Times, serif; }</style></head>
            <body>
                ${bireyiTanimaHtml}
                ${ogrenciGorusmeHtml}
                ${veliCalismaHtml}
                ${genelDegerlendirmeHtml}
                ${signatureArea}
            </body></html>
        `;
    };
    
    const handleExport = () => {
        const htmlContent = generateReportHtml();
        if (!htmlContent) {
            toast({ title: 'Hata', description: 'Rapor oluşturulamadı. Okul bilgileri eksik olabilir.', variant: 'destructive' });
            return;
        }
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `uygulanan-teknikler-raporu.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Başarılı", description: "Rapor Word belgesi olarak indirildi." });
    };

    if (!schoolInfo) {
        return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
    }
    
    const renderTable = (title: string, fields: any[], formName: 'bireyiTanima' | 'ogrenciGorusme' | 'veliCalisma', hasNotes = false) => (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Yapılan Çalışmalar</TableHead>
                            <TableHead className="w-[10%]">Kız Öğrenci</TableHead>
                            <TableHead className="w-[10%]">Erkek Öğrenci</TableHead>
                            <TableHead className="w-[10%]">Veli</TableHead>
                            <TableHead className="w-[15%]">Tarih</TableHead>
                            {hasNotes && <TableHead className="w-[15%]">Notlar</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell className="font-medium">{field.name}</TableCell>
                                <TableCell><FormField control={form.control} name={`${formName}.${index}.kiz`} render={({ field }) => <Input {...field} />}/></TableCell>
                                <TableCell><FormField control={form.control} name={`${formName}.${index}.erkek`} render={({ field }) => <Input {...field} />}/></TableCell>
                                <TableCell><FormField control={form.control} name={`${formName}.${index}.veli`} render={({ field }) => <Input {...field} />}/></TableCell>
                                <TableCell><FormField control={form.control} name={`${formName}.${index}.tarih`} render={({ field }) => <Input type="date" {...field} />}/></TableCell>
                                {hasNotes && <TableCell><FormField control={form.control} name={`${formName}.${index}.notlar`} render={({ field }) => <Input {...field} />}/></TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
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
                        <h1 className="text-2xl font-headline flex items-center gap-2"><ClipboardCheck className="w-7 h-7 text-primary" />Uygulanan Teknikler</h1>
                        <p className="text-muted-foreground">{schoolInfo.className} - {schoolInfo.schoolName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleExport}><FileDown className="mr-2"/> Raporu Yazdır</Button>
                    <Button onClick={form.handleSubmit(handleSave)}>Kaydet</Button>
                </div>
            </header>

            <main className="p-4 sm:p-6 md:p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
                        {renderTable('Bireyi Tanıma ve Bilgilendirme Çalışmaları', bireyiTanimaFields, 'bireyiTanima')}
                        {renderTable('Öğrenci Yönlendirme, Öğrenci ve Veli Görüşmeleri', ogrenciGorusmeFields, 'ogrenciGorusme')}
                        {renderTable('Velilere Yönelik Yapılan Çalışmalar', veliCalismaFields, 'veliCalisma', true)}

                        <Card>
                            <CardHeader><CardTitle>Genel Değerlendirme</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="genelDegerlendirme"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Karşılaşılan Güçlükler ve Nedenleri</FormLabel>
                                            <FormControl><Textarea {...field} rows={4} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cozumOnerileri"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Çözüm Önerileri</FormLabel>
                                            <FormControl><Textarea {...field} rows={4} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" size="lg">Tüm Formu Kaydet</Button>
                        </div>
                    </form>
                </Form>
            </main>
        </div>
    );
};

export default AppliedTechniquesPage;
