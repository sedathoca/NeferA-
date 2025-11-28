'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users2,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  {
    title: 'Zümre Toplantı Tutanağı',
    description: 'Zümre toplantılarınız için tutanaklar oluşturun ve yönetin.',
    href: '/evraklar/zumre',
    icon: <Users2 />,
    cta: 'Modüle Git'
  },
];

export default function EvraklarPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-14 h-14 bg-purple-600 text-white flex items-center justify-center rounded-xl text-2xl font-bold">
                    📂
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Evraklar Menüsü</h1>
                    <p className="text-gray-600">Belge ve form oluşturma araçları</p>
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
