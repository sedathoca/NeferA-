
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Home, Save, FileDown, Users2, PlusCircle, Trash2, GripVertical, BookOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDatabase } from '@/hooks/use-database';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SENARYOLAR, GUNDEM_MADDELERI, VARSAYILAN_KARARLAR, Scenario } from '@/lib/zumre-senaryolari';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const formSchema = z.object({
    academicYear: z.string().min(1, "Eğitim yılı gerekli"),
    donem: z.string().min(1, "Dönem seçimi gerekli"),
    ders: z.string().min(1, "Ders adı gerekli"),
    tarih: z.string(),
    saat: z.string(),
    yer: z.string().min(1, "Yer gerekli"),
    baskan: z.string().min(1, "Başkan adı gerekli"),
    katilimcilar: z.string().min(1, "Katılımcılar gerekli"),
    gundemMaddeleri: z.array(z.object({ madde: z.string().min(1, "Gündem maddesi boş olamaz") })),
    gorusmeler: z.array(z.object({ detay: z.string() })),
    kararlar: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
    academicYear: '',
    donem: "1. Dönem Başı (Eylül)",
    ders: "Fizik",
    tarih: '',
    saat: '',
    yer: "Öğretmenler Odası",
    baskan: '',
    katilimcilar: '',
    gundemMaddeleri: GUNDEM_MADDELERI.map(madde => ({ madde })),
    gorusmeler: SENARYOLAR.slice(0, GUNDEM_MADDELERI.length).map(() => ({ detay: '' })),
    kararlar: "",
};

export default function ZumrePage() {
    const { db, setDb } = useDatabase();
    const { schoolInfo, zumreData } = db;
    const { toast } = useToast();
    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
    const [activeGundemIndex, setActiveGundemIndex] = useState<number | null>(null);

    const draggedItem = useRef<number | null>(null);
    const draggedOverItem = useRef<number | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        values: zumreData || defaultValues,
    });

    const { fields: gundemFields, append: appendGundem, remove: removeGundem, move: moveGundem } = useFieldArray({
        control: form.control,
        name: "gundemMaddeleri"
    });
    const { fields: gorusmeFields, append: appendGorusme, remove: removeGorusme, move: moveGorusme } = useFieldArray({
        control: form.control,
        name: "gorusmeler"
    });

    useEffect(() => {
        if (!zumreData && schoolInfo) {
            const { academicYear, classTeacherName } = schoolInfo;
            const ders = "Fizik"; // Default
            
            const initialData = {
                ...defaultValues,
                academicYear: academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                ders: ders,
                tarih: new Date().toISOString().split('T')[0],
                saat: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                baskan: classTeacherName || '',
                katilimcilar: classTeacherName || '',
                kararlar: VARSAYILAN_KARARLAR.map(k => k.replace(/{ders}/g, ders)).join('\n'),
             };
             form.reset(initialData);
             setDb(prev => ({...prev, zumreData: initialData}));
        } else if (zumreData) {
            form.reset(zumreData);
        }
    }, [schoolInfo, zumreData, form, setDb]);
    
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'ders' || name === 'baskan' || name === 'katilimcilar' || name === 'academicYear') {
                const currentValues = form.getValues();
                const newDers = currentValues.ders;
                
                const updatedKararlar = VARSAYILAN_KARARLAR.map(k => k.replace(/{ders}/g, newDers)).join('\n');

                form.setValue('kararlar', updatedKararlar, { shouldDirty: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);


    const handleSave = (data: FormData) => {
        setDb(prev => ({...prev, zumreData: data}));
        toast({ title: 'Kaydedildi', description: 'Zümre tutanağı verileri başarıyla kaydedildi.' });
    };

    const handleExport = (data: FormData) => {
      if (!schoolInfo || !schoolInfo.schoolName) {
        toast({ title: 'Hata', description: 'Lütfen önce Ayarlar menüsünden okul bilgilerini girin.', variant: 'destructive'});
        return;
      }

      const generateContent = () => {
        const gündemHtml = data.gundemMaddeleri.map((item, index) => `<p style="margin: 0; padding: 2px 0;">${index + 1}) ${item.madde}</p>`).join('');
        
        const gorusmelerHtml = data.gundemMaddeleri.map((item, index) => `
          <div style="margin-top: 15px;">
            <p style="margin:0; font-weight: bold;">${index + 1}) ${item.madde}</p>
            ${data.gorusmeler[index]?.detay.split('\n').map(p => `<p style="margin: 0; padding: 2px 0;">${p}</p>`).join('') || ''}
          </div>
        `).join('');

        const kararlarHtml = data.kararlar.split('\n').map(karar => `<p style="margin: 0; padding: 2px 0;">- ${karar}</p>`).join('');

        const topMeetingNo = data.donem.includes("Ara") ? "2" : (data.donem.includes("Yıl Sonu") ? "3" : "1");
        const topDonem = data.donem.includes("1. Dönem") ? "1. Dönem" : "2. Dönem";

        return `
          <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Zümre Tutanağı</title>
          <style>
              body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; }
              .container { width: 80%; margin: auto; }
              .header, .footer { text-align: center; }
          </style>
          </head><body><div class="container">
              <div class="header">
                  <p>T.C.<br/>MİLLİ EĞİTİM BAKANLIĞI<br/>${schoolInfo.schoolName.toUpperCase()} MÜDÜRLÜĞÜ’NE</p>
              </div>
              <br/>
              <p><strong>${data.academicYear}</strong> Eğitim öğretim yılı <strong>${data.ders}</strong> dersi <strong>${data.donem}</strong> zümre toplantısı <strong>${new Date(data.tarih).toLocaleDateString('tr-TR')}</strong> tarihi saat <strong>${data.saat}</strong> itibari ile Zümre Başkanı <strong>${data.baskan}</strong> başkanlığında <strong>${data.yer}</strong>'da toplanacaktır. Gündem maddeleri ve toplantıya katılacaklar aşağıda belirtilmiştir. Gereğini bilgilerinize arz ederim.</p>
              <br/>
              <div style="text-align: right; line-height: 1;">
                <p>${data.baskan}<br/>Zümre Başkanı</p>
              </div>
              <h4 style="text-decoration: underline;">GÜNDEM MADDELERİ</h4>
              ${gündemHtml}
              <br/>
              <div class="header" style="margin-top: 50px;">
                  <p><strong>OLUR</strong><br/>${new Date(data.tarih).toLocaleDateString('tr-TR')}<br/>${schoolInfo.schoolPrincipalName}<br/>Okul Müdürü</p>
              </div>
              <p style="page-break-before: always;"></p>
              <div class="header">
                  <h3>${schoolInfo.schoolName.toUpperCase()}<br/>
                  ${data.academicYear} EĞİTİM-ÖĞRETİM YILI<br/>
                  ${data.ders.toUpperCase()} DERSİ ${data.donem.toUpperCase()} ZÜMRE TOPLANTI TUTANAĞI</h3>
              </div>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border:none;">
                  <tr><td style="border:none; padding: 2px 8px;"><strong>Toplantı No</strong></td><td style="border:none; padding: 2px 8px;">: ${topMeetingNo}</td></tr>
                  <tr><td style="border:none; padding: 2px 8px;"><strong>Toplantının Öğretim Yılı</strong></td><td style="border:none; padding: 2px 8px;">: ${data.academicYear}</td></tr>
                  <tr><td style="border:none; padding: 2px 8px;"><strong>Toplantının Dönem</strong></td><td style="border:none; padding: 2px 8px;">: ${topDonem}</td></tr>
                  <tr><td style="border:none; padding: 2px 8px;"><strong>Toplantının Tarihi ve yeri</strong></td><td style="border:none; padding: 2px 8px;">: ${new Date(data.tarih).toLocaleDateString('tr-TR')} - ${data.saat} - ${data.yer}</td></tr>
                  <tr><td style="border:none; padding: 2px 8px;"><strong>Toplantının Başkanı</strong></td><td style="border:none; padding: 2px 8px;">: ${data.baskan}</td></tr>
                  <tr><td style="border:none; padding: 2px 8px;"><strong>Toplantıya Katılanlar</strong></td><td style="border:none; padding: 2px 8px;">: ${data.katilimcilar}</td></tr>
              </table>
              <h4 style="text-decoration: underline;">GÜNDEM MADDELERİ</h4>
              ${gündemHtml}
              <h4 style="text-decoration: underline; margin-top: 20px;">GÜNDEM MADDELERİNİN GÖRÜŞÜLMESİ</h4>
              ${gorusmelerHtml}
              <h4 style="text-decoration: underline; margin-top: 20px;">ALINAN KARARLAR</h4>
              ${kararlarHtml}
              <table style="margin-top: 50px; border: none; width: 100%;">
                  <tr style="text-align: center;">
                      ${data.katilimcilar.split(',').map(k => `<td style="border: none;">${k.trim()}</td>`).join('')}
                  </tr>
              </table>
              <br/><br/>
              <div class="header">
                  <p>${new Date(data.tarih).toLocaleDateString('tr-TR')}<br/>UYGUNDUR<br/>${schoolInfo.schoolPrincipalName}<br/>Okul Müdürü</p>
              </div>
          </div></body></html>
        `;
      };
      
      const content = generateContent();
      const blob = new Blob([content], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zumre-tutanagi.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    const handleSortEnd = () => {
        if(draggedItem.current !== null && draggedOverItem.current !== null) {
             moveGundem(draggedItem.current, draggedOverItem.current);
             moveGorusme(draggedItem.current, draggedOverItem.current);
        }
        draggedItem.current = null;
        draggedOverItem.current = null;
    };

    const handleScenarioSelect = (scenario: Scenario) => {
        if (activeGundemIndex !== null) {
            const { ders, baskan, katilimcilar, academicYear } = form.getValues();
            const katilimciListesi = katilimcilar.split(',').map(k => k.trim());
            
            let formattedContent = scenario.content
                .replace(/{ders}/g, ders)
                .replace(/{baskan}/g, baskan)
                .replace(/{academicYear}/g, academicYear);

            katilimciListesi.forEach((katilimci, i) => {
                formattedContent = formattedContent.replace(new RegExp(`{katilimci${i + 1}}`, 'g'), katilimci);
            });
            // Replace any remaining placeholders
            formattedContent = formattedContent.replace(/{katilimci\d+}/g, katilimciListesi[0] || 'Katılımcı');

            form.setValue(`gorusmeler.${activeGundemIndex}.detay`, formattedContent);
        }
        setIsScenarioModalOpen(false);
    };

    const renderFormattedScenario = (scenario: Scenario) => {
        const { baskan, katilimcilar, ders, academicYear } = form.getValues();
        const katilimciListesi = katilimcilar.split(',').map(k => k.trim());
        
        let content = scenario.content
            .replace(/{baskan}/g, `<strong class="text-primary">${baskan || 'Zümre Başkanı'}</strong>`)
            .replace(/{ders}/g, `<strong class="text-primary">${ders}</strong>`)
            .replace(/{academicYear}/g, `<strong class="text-primary">${academicYear}</strong>`);
            
        katilimciListesi.forEach((katilimci, i) => {
            content = content.replace(new RegExp(`{katilimci${i + 1}}`, 'g'), `<strong class="text-secondary-foreground">${katilimci}</strong>`);
        });
        content = content.replace(/{katilimci\d+}/g, `<strong class="text-secondary-foreground">${katilimciListesi[0] || 'Katılımcı'}</strong>`);

        return <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />;
    };


    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/evraklar"><Home className="mr-2" />Evraklar Menüsü</Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-headline flex items-center gap-2"><Users2 /> Zümre Toplantı Tutanağı</h1>
                        <p className="text-muted-foreground">{schoolInfo?.schoolName || "Okul bilgisi girilmemiş"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/bilgi-girisi" title="Ayarlar"><Settings /></Link>
                    </Button>
                    <Button onClick={form.handleSubmit(handleExport)}><FileDown className="mr-2" /> Word Olarak İndir</Button>
                    <Button onClick={form.handleSubmit(handleSave)}> <Save className="mr-2" /> Taslağı Kaydet</Button>
                </div>
            </header>
            <main className="p-4 sm:p-6 md:p-8">
                 {!schoolInfo && (
                    <Alert variant="destructive" className="mb-6">
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Okul Bilgileri Eksik!</AlertTitle>
                        <AlertDescription>
                            Word çıktısı alabilmek için lütfen önce okul bilgilerinizi girin. 
                            <Button variant="link" asChild className="p-0 h-auto ml-1">
                                <Link href="/bilgi-girisi">Ayarlar sayfasına gitmek için tıklayın.</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                <Form {...form}>
                    <form className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Toplantı Bilgileri</CardTitle>
                                <CardDescription>Zümre toplantısının temel bilgilerini girin.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <FormField control={form.control} name="academicYear" render={({ field }) => (<FormItem><FormLabel>Eğitim Yılı</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="donem" render={({ field }) => (<FormItem><FormLabel>Dönem</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="1. Dönem Başı (Eylül)">1. Dönem Başı (Eylül)</SelectItem><SelectItem value="1. Dönem Ara (Kasım)">1. Dönem Ara (Kasım)</SelectItem><SelectItem value="2. Dönem Başı (Şubat)">2. Dönem Başı (Şubat)</SelectItem><SelectItem value="2. Dönem Ara (Nisan)">2. Dönem Ara (Nisan)</SelectItem><SelectItem value="Yıl Sonu (Haziran)">Yıl Sonu (Haziran)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="ders" render={({ field }) => (<FormItem><FormLabel>Ders</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="tarih" render={({ field }) => (<FormItem><FormLabel>Tarih</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="saat" render={({ field }) => (<FormItem><FormLabel>Saat</FormLabel><FormControl><Input type="time" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="yer" render={({ field }) => (<FormItem><FormLabel>Yer</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="baskan" render={({ field }) => (<FormItem><FormLabel>Zümre Başkanı</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="katilimcilar" render={({ field }) => (<FormItem><FormLabel>Katılımcılar (Virgülle ayırın)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Gündem Maddeleri ve Görüşülmesi</CardTitle>
                                <CardDescription>Her bir gündem maddesi için görüşülen konuları yazın.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {gundemFields.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className={cn("space-y-4 border p-4 rounded-lg bg-background", draggedItem.current === index && "opacity-50")}
                                        draggable
                                        onDragStart={() => (draggedItem.current = index)}
                                        onDragEnter={() => (draggedOverItem.current = index)}
                                        onDragEnd={handleSortEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className='flex items-center gap-2'>
                                                <GripVertical className="cursor-grab text-muted-foreground" />
                                                <label className="font-semibold text-base">Gündem Maddesi {index + 1}</label>
                                            </div>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => { removeGundem(index); removeGorusme(index); }}><Trash2 /></Button>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name={`gundemMaddeleri.${index}.madde`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name={`gorusmeler.${index}.detay`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Görüşme Detayları</FormLabel>
                                                    <FormControl><Textarea rows={6} {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => { setActiveGundemIndex(index); setIsScenarioModalOpen(true); }}
                                            >
                                                <BookOpen className="mr-2" /> Hazır Senaryo Seç
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" onClick={() => { appendGundem({ madde: '' }); appendGorusme({ detay: '' }); }}>
                                    <PlusCircle className="mr-2" /> Gündem Maddesi Ekle
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Alınan Kararlar</CardTitle>
                                <CardDescription>Toplantıda alınan nihai kararları listeleyin. Her kararı yeni bir satıra yazın.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="kararlar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea rows={10} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </form>
                </Form>
                 <Dialog open={isScenarioModalOpen} onOpenChange={setIsScenarioModalOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Hazır Senaryo Seç</DialogTitle>
                            <DialogDescription>
                                "{activeGundemIndex !== null && gundemFields[activeGundemIndex]?.madde}" maddesi için bir senaryo seçin.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                            {activeGundemIndex !== null && SENARYOLAR[activeGundemIndex]?.scenarios.map((scenario, sIndex) => (
                                <Card key={sIndex} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Senaryo {sIndex + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground flex-grow">
                                        <p>{scenario.description}</p>
                                        <div className="prose prose-sm dark:prose-invert mt-2 border-t pt-2">
                                            {renderFormattedScenario(scenario)}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button onClick={() => handleScenarioSelect(scenario)} className="w-full">Bu Senaryoyu Kullan</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
