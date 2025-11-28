

export interface Kazanim {
  id: string;
  aciklama: string;
}

export interface Unit {
  unit: string;
  outcomes: Kazanim[];
  isHoliday?: boolean;
  month?: string;
  week?: string;
  hours?: number;
}

export interface ClassLevel {
  [level: string]: Unit[];
}

export interface DersKazanimlari {
  dersAdi: string;
  siniflar: ClassLevel;
}

export const KAZANIM_VERITABANI: DersKazanimlari[] = [
  {
    dersAdi: 'Türkçe',
    siniflar: {
        "Tümü": [
            {
                unit: "Temel Dil Becerileri",
                outcomes: [
                    { id: 'tur-1', aciklama: 'Okuduğu metindeki gerçek ve hayal unsurlarını ayırt eder.' },
                    { id: 'tur-2', aciklama: 'Metnin ana fikrini/ana duygusunu belirler.' },
                    { id: 'tur-3', aciklama: 'Metindeki yardımcı fikirleri/duyguları belirler.' },
                    { id: 'tur-4', aciklama: 'Okuduğu metinle ilgili soruları cevaplar.' },
                    { id: 'tur-5', aciklama: 'Büyük harfleri ve noktalama işaretlerini uygun yerlerde kullanır.' },
                    { id: 'tur-6', aciklama: 'Anlamlı ve kurallı cümleler yazar.' },
                ]
            }
        ]
    }
  },
  {
    dersAdi: 'Matematik',
    siniflar: {
         "Tümü": [
            {
                unit: "Temel Matematik Becerileri",
                outcomes: [
                    { id: 'mat-1', aciklama: 'Doğal sayılarla toplama işlemini yapar.' },
                    { id: 'mat-2', aciklama: 'Doğal sayılarla çıkarma işlemini yapar.' },
                    { id: 'mat-3', aciklama: 'Toplama ve çıkarma işlemi gerektiren problemleri çözer.' },
                    { id: 'mat-4', aciklama: 'Standart olmayan uzunluk ölçme birimlerini kullanarak bir nesnenin uzunluğunu ölçer.' },
                    { id: 'mat-5', aciklama: 'Geometrik cisim ve şekilleri tanır.' },
                ]
            }
        ]
    }
  },
  {
    dersAdi: 'Hayat Bilgisi',
    siniflar: {
         "Tümü": [
            {
                unit: "Okul Hayatı",
                outcomes: [
                    { id: 'hay-1', aciklama: 'Kendini farklı özellikleriyle tanıtır.' },
                    { id: 'hay-2', aciklama: 'Ders araç ve gereçlerini günlük ders programına göre hazırlar.' },
                    { id: 'hay-3', aciklama: 'Sınıfla ilgili konularda karar alma süreçlerine katılır.' },
                    { id: 'hay-4', aciklama: 'Okul kaynaklarını ve eşyalarını özenli kullanır.' },
                ]
            }
        ]
    }
  }
];

export const BEP_OPTIONS = {
  olcut: [
    "%100 başarı sağlar.",
    "%80-%90 arası başarı sağlar.",
    "5 denemenin 4'ünde doğru yapar.",
    "Yardım almadan yapar.",
    "Sözel ipucuyla yapar.",
    "Fiziksel yardımla yapar.",
    "Model olunduğunda yapar.",
  ],
  yontem: [
    "Doğrudan Öğretim",
    "Açık Anlatım",
    "Modelle Öğretim",
    "Fırsat Öğretimi",
    "Rol Oynama / Drama",
    "Soru-Cevap",
    "Gösterip Yaptırma",
    "İşbirlikli Öğrenim",
    "Problem Çözme",
  ],
  materyal: [
    "Ders Kitabı",
    "Çalışma Yaprakları",
    "Akıllı Tahta Etkileşimli İçerikleri",
    "Somut Nesneler (Bloklar, abaküs vb.)",
    "Kavram Kartları",
    "Video ve Görsel Materyaller",
    "Basitleştirilmiş Metinler",
  ],
  degerlendirme: [
    "Gözlem Kayıt Formu",
    "Kontrol Listesi",
    "Derecelendirme Ölçeği",
    "Kısa Sınavlar",
    "Performans Görevi",
    "Ürün Dosyası (Portfolyo)",
    "Akran Değerlendirmesi",
  ],
  hizmet: {
    tur: [
        "Destek Eğitim Odası",
        "Sınıf İçi Destek",
        "Rehberlik ve Psikolojik Danışmanlık",
        "Dil ve Konuşma Terapisi",
        "Fizyoterapi",
        "İş ve Uğraşı Terapisi",
        "Evde Eğitim Hizmeti"
    ],
    alan: [
        "Akademik Beceriler",
        "Sosyal Beceriler",
        "İletişim Becerileri",
        "Psikomotor Beceriler",
        "Öz Bakım Becerileri",
        "Türkçe",
        "Matematik",
        "Hayat Bilgisi",
        "Fizik",
        "Kimya",
        "Biyoloji"
    ],
    sure: [
        "Haftada 1 saat",
        "Haftada 2 saat",
        "Haftada 3 saat",
        "Haftada 4 saat",
        "İhtiyaç duyuldukça"
    ],
    sorumlu: [
        "Sınıf Öğretmeni",
        "Rehber Öğretmen / Psikolojik Danışman",
        "Branş Öğretmeni",
        "Okul Yönetimi",
        "Aile"
    ]
  }
};
