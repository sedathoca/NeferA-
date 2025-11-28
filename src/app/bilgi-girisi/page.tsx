'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Settings, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDatabase } from '@/hooks/use-database';
import { SchoolInfo } from '@/lib/types';


const formSchema = z.object({
  schoolName: z.string().min(2, { message: 'Okul adı gereklidir.' }),
  className: z.string().min(1, { message: 'Sınıf adı gereklidir.' }),
  academicYear: z.string().optional(),
  classTeacherName: z.string().min(2, { message: 'Sınıf öğretmeni adı gereklidir.' }),
  schoolCounselorName: z.string().min(2, { message: 'Okul rehber öğretmeni adı gereklidir.' }),
  schoolPrincipalName: z.string().min(2, { message: 'Okul müdürü adı gereklidir.' }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi girin." }).optional().or(z.literal('')),
  phone: z.string().optional(),
});

export default function BilgiGirisiPage() {
  const { db, setDb } = useDatabase();
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: '',
      className: '',
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      classTeacherName: '',
      schoolCounselorName: '',
      schoolPrincipalName: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (db.schoolInfo) {
      form.reset(db.schoolInfo);
    }
  }, [db.schoolInfo, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setDb(prev => ({ ...prev, schoolInfo: values as SchoolInfo }));
    toast({
      title: 'Kaydedildi',
      description: 'Okul bilgileri başarıyla kaydedildi.',
    });
    router.push('/');
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-purple-100 text-purple-600 rounded-full p-3 w-fit mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Kullanıcı/Okul Bilgileri</CardTitle>
          <CardDescription>
            Raporlarda ve çıktılarda kullanılacak genel bilgileri girin. Bu bilgiler tüm cihazlarınızda senkronize edilecektir.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Okul Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="örn. Cumhuriyet Ortaokulu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="className"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rehberlik Sınıfı</FormLabel>
                        <FormControl>
                          <Input placeholder="örn. 7-C" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eğitim-Öğretim Yılı</FormLabel>
                        <FormControl>
                          <Input placeholder="örn. 2024-2025" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta Adresi</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@mail.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon Numarası</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="555 123 4567" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
              <FormField
                control={form.control}
                name="classTeacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sınıf Rehber Öğretmeni</FormLabel>
                    <FormControl>
                      <Input placeholder="örn. Ayşe Yılmaz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="schoolCounselorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Okul Rehber Öğretmeni</FormLabel>
                    <FormControl>
                      <Input placeholder="örn. Ali Veli" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="schoolPrincipalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Okul Müdürü</FormLabel>
                    <FormControl>
                      <Input placeholder="örn. Fatma Kaya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" asChild>
                  <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Ana Menü</Link>
                </Button>
                <Button type="submit">
                  Bilgileri Kaydet
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}