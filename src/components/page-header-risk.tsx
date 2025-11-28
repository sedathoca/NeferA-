
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Home, ShieldAlert, FileDown, FileText } from 'lucide-react';
import Link from 'next/link';
import { SchoolInfo } from '@/lib/types';

interface PageHeaderProps {
  onExportWord: () => void;
  onExportSummaryWord: () => void;
  hasStudents: boolean;
  schoolInfo: SchoolInfo | null;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onExportWord, onExportSummaryWord, hasStudents, schoolInfo }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 no-print">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
            <Link href="/rehberlik" title="Ana Sayfa">
                <Home className="mr-2" /> Rehberlik Menüsü
            </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-headline flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-primary" />
            {schoolInfo?.className ? `${schoolInfo.className} Sınıfı` : ''} Risk Haritası
          </h1>
          <p className="text-muted-foreground">
             {schoolInfo?.schoolName || 'Okul Adı'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onExportWord} disabled={!hasStudents}>
          <FileDown className="mr-2" />
          Detaylı Rapor Aktar
        </Button>
        <Button variant="outline" onClick={onExportSummaryWord} disabled={!hasStudents}>
          <FileText className="mr-2" />
          Sonuç Raporu Aktar
        </Button>
      </div>
    </header>
  );
};

export default PageHeader;
