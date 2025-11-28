
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Home, FileText, Save, Trash2, PlusCircle, Copy, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StudentInfoFormData, SchoolInfo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useDatabase } from '@/hooks/use-database';

const formSchema = z.object({
  formDate: z.string(),
  studentName: z.string().min(2, { message: "Öğrenci adı gereklidir." }),
  studentGender: z.string(),
  studentClassAndNumber: z.string(),
  studentBirthPlaceAndDate: z.string(),
  studentSchool: z.string(),
  studentAddress: z.string(),
  studentPreschool: z.string(),
  studentHealthDevice: z.string(),
  studentHobbies: z.string(),
  studentChronicIllness: z.string(),
  studentRecentMove: z.string(),
  studentExtracurricular: z.string(),
  studentTechUsage: z.string(),
  studentMemorableEvent: z.string(),
  guardianKinship: z.string(),
  guardianPhone: z.string(),
  guardianEducation: z.string(),
  guardianOccupation: z.string(),
  motherName: z.string(),
  motherBirthPlaceAndDate: z.string(),
  motherIsAlive: z.string(),
  motherIsHealthy: z.string(),
  motherHasDisability: z.string(),
  motherEducation: z.string(),
  motherOccupation: z.string(),
fatherName: z.string(),
  fatherBirthPlaceAndDate: z.string(),
  fatherIsAlive: z.string(),
  fatherIsHealthy: z.string(),
  fatherHasDisability: z.string(),
  fatherEducation: z.string(),
  fatherOccupation: z.string(),
  siblingCount: z.string(),
  birthOrder: z.string(),
  familyLivesWith: z.string(),
  familyMemberWithDisability: z.string(),
  familyFinancialIssues: z.string(),
});

const formQuestions = [
  { section: "ÖĞRENCİ BİLGİSİ", fields: [
    { name: "studentName", label: "Adı Soyadı", type: "text" },
    { name: "studentGender", label: "Cinsiyeti", type: "radio", options: ["Kız", "Erkek"] },
    { name: "studentClassAndNumber", label: "Sınıfı ve Numarası", type: "text" },
    { name: "studentBirthPlaceAndDate", label: "Doğum Yeri ve Tarihi", type: "text" },
    { name: "studentSchool", label: "Okulu", type: "text" },
    { name: "studentAddress", label: "Adresi", type: "textarea" },
    { name: "studentPreschool", label: "Okul öncesi eğitim aldınız mı?", type: "text" },
    { name: "studentHealthDevice", label: "Sürekli kullandığınız ilaç ve/veya tıbbi cihaz var mı? Varsa nedir?", type: "text" },
    { name: "studentHobbies", label: "Ne yapmaktan hoşlanırsınız?", type: "text" },
    { name: "studentChronicIllness", label: "Sürekli bir hastalığınız var mı? Varsa nedir?", type: "text" },
    { name: "studentRecentMove", label: "Yakın zamanda taşındınız mı, okul değiştirdiniz mi?", type: "text" },
    { name: "studentExtracurricular", label: "Ders dışı faaliyetleriniz nelerdir?", type: "text" },
    { name: "studentTechUsage", label: "Kendinize ait teknolojik aletleriniz var mı? Varsa günde/haftada ne kadar süre kullanırsınız?", type: "text" },
    { name: "studentMemorableEvent", label: "Hala etkisi altında olduğunuz bir olay yaşadınız mı? Yaşantınızı açıklayınız.", type: "text" }
  ]},
  { section: "VELİ BİLGİSİ (Öğrenciyle ilgili işlemlerden birinci derecede sorumlu kişi)", fields: [
    { name: "guardianKinship", label: "Yakınlığı", type: "text" },
    { name: "guardianPhone", label: "Telefon Numarası", type: "text" },
    { name: "guardianEducation", label: "Eğitim Durumu", type: "text" },
    { name: "guardianOccupation", label: "Mesleği", type: "text" }
  ]},
  { section: "ANNE BİLGİLERİ", fields: [
    { name: "motherName", label: "Adı Soyadı", type: "text" },
    { name: "motherBirthPlaceAndDate", label: "Doğum Yeri / Doğum Tarihi", type: "text" },
    { name: "motherIsAlive", label: "Öz mü?", type: "radio", options: ["Evet", "Hayır"] },
    { name: "motherIsHealthy", label: "Sağ mı?", type: "radio", options: ["Evet", "Hayır"] },
    { name: "motherHasDisability", label: "Engel durumu var mı?", type: "text" },
    { name: "motherEducation", label: "Eğitim Durumu", type: "text" },
    { name: "motherOccupation", label: "Mesleği", type: "text" }
  ]},
  { section: "BABA BİLGİLERİ", fields: [
    { name: "fatherName", label: "Adı Soyadı", type: "text" },
    { name: "fatherBirthPlaceAndDate", label: "Doğum Yeri / Doğum Tarihi", type: "text" },
    { name: "fatherIsAlive", label: "Öz mü?", type: "radio", options: ["Evet", "Hayır"] },
    { name: "fatherIsHealthy", label: "Sağ mı?", type: "radio", options: ["Evet", "Hayır"] },
    { name: "fatherHasDisability", label: "Engel durumu var mı?", type: "text" },
    { name: "fatherEducation", label: "Eğitim Durumu", type: "text" },
    { name: "fatherOccupation", label: "Mesleği", type: "text" }
  ]},
  { section: "AİLE BİLGİSİ", fields: [
    { name: "siblingCount", label: "Kaç kardeşsiniz?", type: "text" },
    { name: "birthOrder", label: "Ailenizin kaçıncı çocuğusunuz?", type: "text" },
    { name: "familyLivesWith", label: "Evde sizinle birlikte kim/kimler yaşıyor? Yakınlık derecelerini belirtiniz.", type: "text" },
    { name: "familyMemberWithDisability", label: "Aile üyelerinizde sürekli bir hastalığı/engeli olan biri var mı? Varsa yazınız.", type: "text" },
    { name: "familyFinancialIssues", label: "Ailenizde sürekli borçlar ya da farklı nedenlerle yaşanan ekonomik sorunlar yaşanır mı?", type: "text" }
  ]}
];


export default function OgrenciBilgiFormuPage() {
  const { db, setDb } = useDatabase();
  const { schoolInfo, studentInfoForms: students } = db;
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { toast } = useToast();

  const defaultFormValues: StudentInfoFormData = {
      formDate: new Date().toLocaleDateString('tr-TR'),
      studentName: '', studentGender: '', studentClassAndNumber: '', studentBirthPlaceAndDate: '',
      studentSchool: '', studentAddress: '', studentPreschool: '', studentHealthDevice: '',
      studentHobbies: '', studentChronicIllness: '', studentRecentMove: '', studentExtracurricular: '',
      studentTechUsage: '', studentMemorableEvent: '', guardianKinship: '', guardianPhone: '',
      guardianEducation: '', guardianOccupation: '', motherName: '', motherBirthPlaceAndDate: '',
      motherIsAlive: '', motherIsHealthy: '', motherHasDisability: '', motherEducation: '',
      motherOccupation: '', fatherName: '', fatherBirthPlaceAndDate: '', fatherIsAlive: '',
      fatherIsHealthy: '', fatherHasDisability: '', fatherEducation: '', fatherOccupation: '',
      siblingCount: '', birthOrder: '', familyLivesWith: '', familyMemberWithDisability: '',
      familyFinancialIssues: '',
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (selectedStudentId) {
      const studentData = students.find(s => s.studentName === selectedStudentId); 
      if (studentData) {
        form.reset(studentData);
      }
    } else {
      handleNewForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, students, form.reset]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setDb(prevDb => {
        let updatedStudents;
        const existingStudent = prevDb.studentInfoForms.find(s => s.studentName === selectedStudentId);

        if (existingStudent) {
            updatedStudents = prevDb.studentInfoForms.map(s => s.studentName === selectedStudentId ? values : s);
        } else {
            if (prevDb.studentInfoForms.some(s => s.studentName.trim().toLowerCase() === values.studentName.trim().toLowerCase())) {
                toast({ title: 'Hata', description: 'Bu isimde bir öğrenci zaten mevcut.', variant: 'destructive' });
                return prevDb;
            }
            updatedStudents = [...prevDb.studentInfoForms, values];
        }
        
        setSelectedStudentId(values.studentName);
        return { ...prevDb, studentInfoForms: updatedStudents };
    });
    
    toast({ title: 'Kaydedildi', description: 'Öğrenci bilgileri başarıyla kaydedildi.' });
  };
  
  const handleNewForm = () => {
    setSelectedStudentId(null);
    form.reset({
       ...defaultFormValues,
       formDate: new Date().toLocaleDateString('tr-TR'),
       studentSchool: schoolInfo?.schoolName || '',
       studentClassAndNumber: schoolInfo ? `${schoolInfo.className} - ` : '',
    });
  }

  const handleDeleteStudent = () => {
    if (!selectedStudentId) return;
    setDb(prevDb => {
        const updatedStudents = prevDb.studentInfoForms.filter(s => s.studentName !== selectedStudentId);
        return { ...prevDb, studentInfoForms: updatedStudents };
    });
    handleNewForm();
    toast({ title: 'Silindi', description: 'Öğrenci kaydı silindi.', variant: 'destructive' });
  };

  const handlePrint = () => {
    const values = form.getValues();
    if (!values.studentName || !schoolInfo) {
      toast({ title: 'Eksik Bilgi', description: 'Lütfen formu yazdırmak için önce formu kaydedin.', variant: 'destructive' });
      return;
    }
    
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(schoolInfo.schoolName.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("ÖĞRENCİ BİLGİ FORMU", doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Tarih: ${values.formDate || new Date().toLocaleDateString('tr-TR')}`, doc.internal.pageSize.getWidth() - 20, 35, { align: 'right' });

    let yPos = 45;

    const addSection = (title: string, data: any[], colCount = 2) => {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        (doc as any).autoTable({
            startY: yPos,
            head: [[{content: title, colSpan: colCount * 2}]],
            headStyles: { fontStyle: 'bold', fillColor: [220, 220, 220], textColor: 20 },
            body: data,
            theme: 'grid',
        });
        yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    addSection("ÖĞRENCİ BİLGİSİ", [
        ['Adı Soyadı', values.studentName, 'Cinsiyeti', values.studentGender],
        ['Sınıfı ve Numarası', values.studentClassAndNumber, 'Doğum Yeri ve Tarihi', values.studentBirthPlaceAndDate],
        ['Okulu', values.studentSchool, 'Adresi', values.studentAddress],
        ['Okul öncesi eğitim aldınız mı?', values.studentPreschool, 'Sürekli ilaç/tıbbi cihaz var mı?', values.studentHealthDevice],
        ['Ne yapmaktan hoşlanırsınız?', values.studentHobbies, 'Sürekli bir hastalığınız var mı?', values.studentChronicIllness],
    ]);
     addSection("VELİ BİLGİSİ", [
        ['Yakınlığı', values.guardianKinship],
        ['Telefon Numarası', values.guardianPhone],
        ['Eğitim Durumu', values.guardianEducation],
        ['Mesleği', values.guardianOccupation],
    ], 1);

    yPos = (doc as any).lastAutoTable.finalY + 10;
    (doc as any).autoTable({
        startY: yPos,
        head: [['', 'Anne', 'Baba']],
        body: [
            ['Adı Soyadı', values.motherName, values.fatherName],
            ['Doğum Yeri / Tarihi', values.motherBirthPlaceAndDate, values.fatherBirthPlaceAndDate],
            ['Öz mü?', values.motherIsAlive, values.fatherIsAlive],
            ['Sağ mı?', values.motherIsHealthy, values.fatherIsHealthy],
            ['Engel durumu var mı?', values.motherHasDisability, values.fatherHasDisability],
            ['Eğitim Durumu', values.motherEducation, values.fatherEducation],
            ['Mesleği', values.motherOccupation, values.fatherOccupation],
        ],
        theme: 'grid'
    });

    addSection("AİLE BİLGİSİ", [
        ['Kaç kardeşsiniz?', values.siblingCount],
        ['Ailenizin kaçıncı çocuğusunuz?', values.birthOrder],
        ['Evde kimler yaşıyor?', values.familyLivesWith],
        ['Ailede engelli/sürekli hasta var mı?', values.familyMemberWithDisability],
        ['Ekonomik sorunlar yaşanır mı?', values.familyFinancialIssues],
    ], 1);
    
    doc.save(`${values.studentName}-bilgi-formu.pdf`);
    toast({ title: 'Başarılı', description: 'Öğrenci bilgi formu PDF olarak indirildi.' });
  };
  
  const renderField = (name: keyof StudentInfoFormData, label: string, placeholder?: string, isTextArea = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isTextArea ? <Textarea placeholder={placeholder} {...field} value={field.value || ''} /> : <Input placeholder={placeholder} {...field} value={field.value || ''} />}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const renderRadioField = (name: keyof StudentInfoFormData, label: string, options: string[]) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} value={field.value || ''} className="flex space-x-4">
                {options.map(option => (
                     <FormItem key={option} className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                            <RadioGroupItem value={option} />
                        </FormControl>
                        <FormLabel className="font-normal">{option}</FormLabel>
                    </FormItem>
                ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const copyQuestionsToClipboard = () => {
    const textToCopy = formQuestions.map(section => 
        `Bölüm: ${section.section}\n\n` + 
        section.fields.map(field => {
            let question = field.label;
            if (field.type === 'radio' && field.options) {
                question += ` (${field.options.join(' / ')})`;
            }
            return question;
        }).join('\n')
    ).join('\n\n');

    navigator.clipboard.writeText(textToCopy);
    toast({ title: 'Kopyalandı', description: 'Tüm sorular panoya kopyalandı.' });
  }


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
            <h1 className="text-2xl font-headline flex items-center gap-2"><FileText /> Öğrenci Bilgi Formu</h1>
            <p className="text-muted-foreground">Öğrenci bilgilerini girin, kaydedin ve çıktısını alın.</p>
          </div>
        </div>
         <div className="flex items-center gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline"><Copy className="mr-2"/> Google Form Soruları</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                    <DialogTitle>Google Form İçin Sorular</DialogTitle>
                    <DialogDescription>
                        Aşağıdaki soruları kopyalayıp doğrudan yeni bir Google Form'a yapıştırabilirsiniz.
                    </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-96 w-full rounded-md border p-4 bg-muted/30">
                        <pre className="text-sm whitespace-pre-wrap">
                            {formQuestions.map(section => 
                                `Bölüm: ${section.section}\n\n` + 
                                section.fields.map(field => {
                                    let question = field.label;
                                    if (field.type === 'radio' && field.options) {
                                        question += `\nSeçenekler: ${field.options.join(', ')}`;
                                    }
                                    return question;
                                }).join('\n\n')
                            ).join('\n\n--------------------------------\n\n')}
                        </pre>
                    </ScrollArea>
                    <Button onClick={copyQuestionsToClipboard} className="mt-4"><Copy className="mr-2"/> Tümünü Kopyala</Button>
                </DialogContent>
            </Dialog>
            <Button onClick={handlePrint} variant="outline" disabled={!selectedStudentId}><FileDown className="mr-2"/> PDF Çıktı Al</Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
             <Card>
                <CardHeader><CardTitle>Kayıtlı Öğrenciler</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                     <Button onClick={handleNewForm} className="w-full"><PlusCircle className="mr-2"/> Yeni Form</Button>
                    <Select onValueChange={setSelectedStudentId} value={selectedStudentId || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kayıtlı öğrenci seç..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.length === 0 && <p className='text-sm text-muted-foreground text-center p-2'>Kayıtlı öğrenci yok.</p>}
                        {students.map(s => <SelectItem key={s.studentName} value={s.studentName}>{s.studentName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {selectedStudentId && <Button onClick={handleDeleteStudent} variant="destructive" className="w-full mt-2"><Trash2 className="mr-2"/> Seçili Öğrenciyi Sil</Button>}
                </CardContent>
             </Card>
        </div>
        <div className="md:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader className='flex-row justify-between items-center'>
                    <CardTitle>Form Bilgileri</CardTitle>
                    <div className="w-1/4">
                       <FormField
                        control={form.control}
                        name="formDate"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Input type="text" placeholder="Tarih" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Student Info */}
                    <p className="font-bold text-lg border-b pb-2">ÖĞRENCİ BİLGİSİ</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {renderField('studentName', 'Adı Soyadı')}
                      {renderRadioField('studentGender', 'Cinsiyeti', ['Kız', 'Erkek'])}
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        {renderField('studentClassAndNumber', 'Sınıfı ve Numarası')}
                        {renderField('studentBirthPlaceAndDate', 'Doğum Yeri ve Tarihi')}
                     </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {renderField('studentSchool', 'Okulu')}
                        {renderField('studentAddress', 'Adresi', undefined, true)}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {renderField('studentPreschool', 'Okul öncesi eğitim aldınız mı?')}
                        {renderField('studentHealthDevice', 'Sürekli kullandığınız ilaç ve/veya tıbbi cihaz var mı? Varsa nedir?')}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                         {renderField('studentHobbies', 'Ne yapmaktan hoşlanırsınız?')}
                         {renderField('studentChronicIllness', 'Sürekli bir hastalığınız var mı? Varsa nedir?')}
                      </div>
                       <div className="grid md:grid-cols-2 gap-4">
                         {renderField('studentRecentMove', 'Yakın zamanda taşındınız mı, okul değiştirdiniz mi?')}
                         {renderField('studentExtracurricular', 'Ders dışı faaliyetleriniz nelerdir?')}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                         {renderField('studentTechUsage', 'Kendinize ait teknolojik aletleriniz var mı? Varsa günde/haftada ne kadar süre kullanırsınız?')}
                         {renderField('studentMemorableEvent', 'Hala etkisi altında olduğunuz bir olay yaşadınız mı? Yaşantınızı açıklayınız.')}
                      </div>

                     {/* Guardian Info */}
                    <p className="font-bold text-lg border-b pb-2 pt-6">VELİ BİLGİSİ (Öğrenciyle ilgili işlemlerden birinci derecede sorumlu kişi)</p>
                     <div className="grid md:grid-cols-2 gap-4">
                        {renderField('guardianKinship', 'Yakınlığı')}
                        {renderField('guardianPhone', 'Telefon Numarası')}
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        {renderField('guardianEducation', 'Eğitim Durumu')}
                        {renderField('guardianOccupation', 'Mesleği')}
                     </div>

                    {/* Parent Info */}
                     <div className="grid md:grid-cols-2 gap-8 pt-6">
                        <div>
                            <p className="font-bold text-lg border-b pb-2 mb-4">ANNE BİLGİLERİ</p>
                            <div className="space-y-4">
                                {renderField('motherName', 'Adı Soyadı')}
                                {renderField('motherBirthPlaceAndDate', 'Doğum Yeri / Doğum Tarihi')}
                                {renderRadioField('motherIsAlive', 'Öz mü?', ['Evet', 'Hayır'])}
                                {renderRadioField('motherIsHealthy', 'Sağ mı?', ['Evet', 'Hayır'])}
                                {renderField('motherHasDisability', 'Engel durumu var mı?')}
                                {renderField('motherEducation', 'Eğitim Durumu')}
                                {renderField('motherOccupation', 'Mesleği')}
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-lg border-b pb-2 mb-4">BABA BİLGİLERİ</p>
                             <div className="space-y-4">
                                {renderField('fatherName', 'Adı Soyadı')}
                                {renderField('fatherBirthPlaceAndDate', 'Doğum Yeri / Doğum Tarihi')}
                                {renderRadioField('fatherIsAlive', 'Öz mü?', ['Evet', 'Hayır'])}
                                {renderRadioField('fatherIsHealthy', 'Sağ mı?', ['Evet', 'Hayır'])}
                                {renderField('fatherHasDisability', 'Engel durumu var mı?')}
                                {renderField('fatherEducation', 'Eğitim Durumu')}
                                {renderField('fatherOccupation', 'Mesleği')}
                            </div>
                        </div>
                     </div>

                    {/* Family Info */}
                    <p className="font-bold text-lg border-b pb-2 pt-6">AİLE BİLGİSİ</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {renderField('siblingCount', 'Kaç kardeşsiniz?')}
                        {renderField('birthOrder', 'Ailenizin kaçıncı çocuğusunuz?')}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                         {renderField('familyLivesWith', 'Evde sizinle birlikte kim/kimler yaşıyor? Yakınlık derecelerini belirtiniz.')}
                         {renderField('familyMemberWithDisability', 'Aile üyelerinizde sürekli bir hastalığı/engeli olan biri var mı? Varsa yazınız.')}
                      </div>
                      {renderField('familyFinancialIssues', 'Ailenizde sürekli borçlar ya da farklı nedenlerle yaşanan ekonomik sorunlar yaşanır mı?')}

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
