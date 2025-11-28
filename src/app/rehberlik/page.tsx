'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, 
  ShieldCheck, 
  BookOpen, 
  Settings, 
  Vote, 
  Library, 
  FileText, 
  BookMarked,
  ClipboardList,
  CalendarDays,
  Activity,
  ClipboardCheck,
  Users2,
  Send,
  HeartHandshake,
  HomeIcon,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  {
    title: 'Oturma Planı',
    description: 'Sınıfınız için sürükle-bırak özellikli dinamik oturma planları oluşturun ve dışa aktarın.',
    href: '/oturma-plani',
    icon: <LayoutGrid />,
    cta: 'Oturma Planına Git',
  },
  {
    title: 'Sınıf Risk Haritası',
    description: 'Öğrencilerinizin risk durumlarını analiz etmek için Excel\'den veri aktarın ve görsel bir risk haritası oluşturun.',
    href: '/risk-haritasi',
    icon: <ShieldCheck />,
    cta: 'Risk Haritasına Git',
  },
   {
    title: 'Seçim Modülü',
    description: 'Sınıf başkanlığı ve temsilcilik seçimlerini yapın, oylamayı yönetin ve sonuç tutanağını oluşturun.',
    href: '/secim',
    icon: <Vote />,
    cta: 'Seçim Modülüne Git',
  },
  {
    title: 'Kulüp Modülü',
    description: 'Öğrenci kulüpleri oluşturun, öğrencileri kulüplere atayın ve kulüp listelerini dışa aktarın.',
    href: '/kulup',
    icon: <Library />,
    cta: 'Kulüp Modülüne Git',
  },
  {
    title: 'Öğrenci Bilgi Formu',
    description: 'Öğrencileriniz için detaylı bilgi formları oluşturun, yönetin ve dışa aktarın.',
    href: '/ogrenci-bilgi-formu',
    icon: <FileText />,
    cta: 'Forma Git',
  },
  {
    title: 'BEP Dosyası',
    description: 'Bireyselleştirilmiş Eğitim Programı (BEP) ihtiyacı olan öğrenciler için dosyalar hazırlayın ve yönetin.',
    href: '/bep-dosyasi',
    icon: <BookMarked />,
    cta: 'BEP Modülüne Git',
  },
  {
    title: 'Sınıf Proje Ödevi',
    description: 'Öğrencilere proje ödevleri atayın, teslim tarihlerini takip edin ve değerlendirmeleri kaydedin.',
    href: '/proje-odevi',
    icon: <ClipboardList />,
    cta: 'Modüle Git',
  },
  {
    title: 'Aylık Nöbetçi Listesi',
    description: 'Aylık nöbetçi öğrenci listeleri oluşturun ve kolayca çıktısını alın.',
    href: '/nobetci-listesi',
    icon: <CalendarDays />,
    cta: 'Modüle Git',
  },
  {
    title: 'Faaliyet Raporu',
    description: 'Sınıf rehberlik çalışmaları için faaliyet raporları hazırlayın ve yönetin.',
    href: '/faaliyet-raporu',
    icon: <Activity />,
    cta: 'Modüle Git',
  },
  {
    title: 'Uygulanan Teknikler',
    description: 'Bireyi tanıma ve bilgilendirme çalışmaları kapsamında uygulanan teknikleri kaydedin.',
    href: '/uygulanan-teknikler',
    icon: <ClipboardCheck />,
    cta: 'Modüle Git',
  },
  {
    title: 'Öğrenci Gözlem Kaydı',
    description: 'Öğrencilerle ilgili bireysel gözlemlerinizi kaydedin ve takip edin.',
    href: '/ogrenci-gozlem-kaydi',
    icon: <Users2 />,
    cta: 'Modüle Git',
  },
  {
    title: 'Rehberliğe Yönlendirme',
    description: 'Rehberlik servisine öğrenci yönlendirmek için resmi formlar oluşturun.',
    href: '/rehberlige-yonlendirme',
    icon: <Send />,
    cta: 'Modüle Git',
  },
  {
    title: 'Psikolojik Destek Formu',
    description: 'Acil psikolojik destek gerektiren durumlar için yönlendirme formu hazırlayın.',
    href: '/psikolojik-destek',
    icon: <HeartHandshake />,
    cta: 'Modüle Git',
  },
  {
    title: 'Ev Ziyaret Formu',
    description: 'Veli ev ziyaretleri için gözlem ve değerlendirme formları oluşturun ve kaydedin.',
    href: '/ev-ziyareti',
    icon: <HomeIcon />,
    cta: 'Modüle Git',
  },
];

export default function RehberlikPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-14 h-14 bg-purple-600 text-white flex items-center justify-center rounded-xl text-2xl font-bold">
                    💫
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Sınıf Rehberlik Modülü</h1>
                    <p className="text-gray-600">Sınıf yönetimi ve rehberlik araçları</p>
                </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Ana Menüye Dön
              </Link>
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {modules.map((mod) => (
            <Link
                key={mod.title}
                href={mod.href}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg h-full flex flex-col text-center"
            >
                <div className="text-5xl mb-4 mx-auto text-purple-600">{mod.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{mod.title}</h3>
                <p className="text-gray-600 text-sm flex-1">{mod.description}</p>
                <Button variant="secondary" className="mt-4 w-full" disabled={mod.href === '#'}>
                    {mod.cta}
                </Button>
            </Link>
        ))}
      </div>
    </main>
  );
}
