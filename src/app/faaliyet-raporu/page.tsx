
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { SchoolInfo } from '@/lib/types';
import Link from 'next/link';
import { Home, Activity, FileDown, PlusCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { REHBERLIK_KAZANIMLARI, RehberlikKazanim } from '@/lib/rehberlik-kazanimlari';


const monthSchema = z.object({
  monthName: z.string(),
  kazanimlar: z.string(),
  notlar: z.string(),
});

const reportSchema = z.object({
  academicYear: z.string().min(1, "Eğitim-Öğretim Yılı gerekli"),
  schoolName: z.string(),
  className: z.string(),
  teacherName: z.string(),
  term1: z.array(monthSchema),
  term2: z.array(monthSchema),
});

type ReportFormData = z.infer<typeof reportSchema>;

const TERM1_MONTHS = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak"];
const TERM2_MONTHS = ["Şubat", "Mart", "Nisan", "Mayıs", "Haziran"];

const FaaliyetRaporuPage: React.FC = () => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [isKazanimDialogOpen, setIsKazanimDialogOpen] = useState(false);
  const [selectedKazanims, setSelectedKazanims] = useState<RehberlikKazanim[]>([]);
  const [currentTargetField, setCurrentTargetField] = useState<`term1.${number}.kazanimlar` | `term2.${number}.kazanimlar` | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      schoolName: '',
      className: '',
      teacherName: '',
      term1: TERM1_MONTHS.map(m => ({ monthName: m, kazanimlar: '', notlar: '' })),
      term2: TERM2_MONTHS.map(m => ({ monthName: m, kazanimlar: '', notlar: '' })),
    },
  });

  useEffect(() => {
    try {
      const storedSchoolInfo = localStorage.getItem('schoolInfo');
      if (storedSchoolInfo) {
        const info: SchoolInfo = JSON.parse(storedSchoolInfo);
        setSchoolInfo(info);
        form.reset({
            ...form.getValues(),
            academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            schoolName: info.schoolName,
            className: info.className,
            teacherName: info.classTeacherName,
        });
      } else {
        toast({
          title: 'Okul Bilgileri Eksik',
          description: 'Lütfen önce okul bilgilerini girin.',
          variant: 'destructive',
        });
        router.push('/bilgi-girisi');
      }
    } catch (error) {
      toast({ title: "Veri Yükleme Hatası", description: "Lokal veriler okunurken bir hata oluştu.", variant: "destructive" });
    }
  }, [router, toast, form]);

  const { fields: term1Fields } = useFieldArray({ control: form.control, name: "term1" });
  const { fields: term2Fields } = useFieldArray({ control: form.control, name: "term2" });

  const handleOpenKazanimDialog = (fieldName: `term1.${number}.kazanimlar` | `term2.${number}.kazanimlar`) => {
    setCurrentTargetField(fieldName);
    setSelectedKazanims([]); // Clear previous selections
    setIsKazanimDialogOpen(true);
  };
  
  const handleToggleKazanim = (kazanim: RehberlikKazanim) => {
    setSelectedKazanims(prev => 
        prev.some(k => k.id === kazanim.id) 
            ? prev.filter(k => k.id !== kazanim.id) 
            : [...prev, kazanim]
    );
  };
  
  const handleAddKazanimsToField = () => {
    if (currentTargetField && selectedKazanims.length > 0) {
        const currentKazanimlar = form.getValues(currentTargetField) || '';
        const newKazanimlarText = selectedKazanims.map(k => `${k.id} - ${k.aciklama}`).join('\n');
        
        const updatedText = currentKazanimlar 
            ? `${currentKazanimlar}\n${newKazanimlarText}` 
            : newKazanimlarText;
            
        form.setValue(currentTargetField, updatedText);
        toast({ title: 'Kazanımlar Eklendi', description: `${selectedKazanims.length} kazanım metin kutusuna eklendi.` });
    }
    setIsKazanimDialogOpen(false);
    setSelectedKazanims([]);
  };


  const handleExport = (term: 1 | 2) => {
    const data = form.getValues();
    if (!schoolInfo) {
        toast({ title: 'Hata', description: 'Okul bilgileri bulunamadı.', variant: 'destructive' });
        return;
    }

    const termData = term === 1 ? data.term1 : data.term2;
    const termName = `${term}. DÖNEM`;

    let tableRows = '';
    termData.forEach(month => {
        tableRows += `
            <tr>
                <td style="border: 1px solid black; padding: 8px; vertical-align: top;">${month.monthName}</td>
                <td style="border: 1px solid black; padding: 8px; vertical-align: top;">${month.kazanimlar.replace(/\n/g, '<br/>')}</td>
                <td style="border: 1px solid black; padding: 8px; vertical-align: top;">${month.notlar.replace(/\n/g, '<br/>')}</td>
            </tr>
        `;
    });

    const signatureArea = `
        <div style="margin-top: 80px; text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 11pt;">
            <div style="display: inline-block; text-align: center;">
                <p>${data.teacherName}</p>
                <p>Sınıf Rehber Öğretmeni</p>
            </div>
        </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset='UTF-8'>
          <title>Faaliyet Raporu</title>
          <style>body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }</style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="font-size: 12pt; font-weight: bold;">${data.academicYear} EĞİTİM ÖĞRETİM YILI</h2>
            <h2 style="font-size: 12pt; font-weight: bold;">${data.className} SINIF REHBERLİK ÇALIŞMALARI ${termName} SONU FAALİYET RAPORU</h2>
          </div>
          <table style="width:100%; border-collapse: collapse;" border="1">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid black; padding: 8px; width: 15%;">Aylar</th>
                <th style="border: 1px solid black; padding: 8px; width: 55%;">İşlenen Kazanımlar</th>
                <th style="border: 1px solid black; padding: 8px; width: 30%;">Notlar</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          ${signatureArea}
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faaliyet-raporu-${term}-donem.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Başarılı", description: `${term}. Dönem raporu Word belgesi olarak indirildi.` });
  };
  
  const renderTermTab = (fields: any[], term: 1 | 2) => (
    <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>{term}. Dönem Faaliyetleri</CardTitle>
                <CardDescription>Aylık olarak işlenen kazanımları ve notlarınızı girin.</CardDescription>
            </div>
            <Button onClick={() => handleExport(term)}><FileDown className="mr-2"/> Word Çıktısı Al</Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[15%]">Ay</TableHead>
                        <TableHead className="w-[55%]">İşlenen Kazanımlar</TableHead>
                        <TableHead className="w-[30%]">Notlar</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field, index) => (
                        <TableRow key={field.id}>
                            <TableCell className="font-semibold">{term === 1 ? TERM1_MONTHS[index] : TERM2_MONTHS[index]}</TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                     <FormField
                                        control={form.control}
                                        name={`term${term}.${index}.kazanimlar` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea {...field} rows={4} placeholder="Kazanımları buraya yazın veya butona tıklayarak ekleyin..."/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={() => handleOpenKazanimDialog(`term${term}.${index}.kazanimlar`)}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Kazanım Ekle
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>
                                <FormField
                                    control={form.control}
                                    name={`term${term}.${index}.notlar` as const}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea {...field} rows={4} placeholder="Önemli notlarınızı ekleyin..."/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );

  if (!schoolInfo) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }

  return (
    <>
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/rehberlik" title="Ana Sayfa">
              <Home className="mr-2" /> Rehberlik Menüsü
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-headline flex items-center gap-2"><Activity className="w-7 h-7 text-primary" />Sınıf Rehberlik Faaliyet Raporu</h1>
            <p className="text-muted-foreground">{schoolInfo.className} - {schoolInfo.schoolName}</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8">
        <Form {...form}>
          <form className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                        <FormItem className="max-w-xs">
                            <FormLabel>Eğitim-Öğretim Yılı</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="term1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="term1">1. Dönem</TabsTrigger>
                <TabsTrigger value="term2">2. Dönem</TabsTrigger>
              </TabsList>
              <TabsContent value="term1">
                {renderTermTab(term1Fields, 1)}
              </TabsContent>
              <TabsContent value="term2">
                {renderTermTab(term2Fields, 2)}
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </main>
    </div>
    <Dialog open={isKazanimDialogOpen} onOpenChange={setIsKazanimDialogOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Rehberlik Kazanımı Seç</DialogTitle>
                <DialogDescription>
                    Aşağıdaki listeden ilgili kazanımları seçerek rapora ekleyebilirsiniz.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] p-4 border rounded-md">
                <Accordion type="multiple" className="w-full">
                    {REHBERLIK_KAZANIMLARI.map(seviye => (
                        <AccordionItem key={seviye.seviye} value={seviye.seviye}>
                            <AccordionTrigger className="font-bold text-lg">{seviye.seviye}</AccordionTrigger>
                            <AccordionContent>
                                {seviye.alanlar.map(alan => (
                                    <Accordion key={alan.alanAdi} type="multiple" className="w-full pl-4">
                                        <AccordionItem value={alan.alanAdi}>
                                            <AccordionTrigger>{alan.alanAdi}</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pl-4">
                                                    {alan.kazanimlar.map(kazanim => (
                                                        <div key={kazanim.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={kazanim.id}
                                                                checked={selectedKazanims.some(k => k.id === kazanim.id)}
                                                                onCheckedChange={() => handleToggleKazanim(kazanim)}
                                                            />
                                                            <label htmlFor={kazanim.id} className="text-sm">
                                                                {kazanim.id} - {kazanim.aciklama}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollArea>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsKazanimDialogOpen(false)}>İptal</Button>
                <Button onClick={handleAddKazanimsToField} disabled={selectedKazanims.length === 0}>Seçilenleri Ekle ({selectedKazanims.length})</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
};

export default FaaliyetRaporuPage;
