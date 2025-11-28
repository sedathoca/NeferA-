

import {z} from 'zod';

export interface SchoolInfo {
  schoolName: string;
  className: string; // This will be labeled as "Rehberlik Sınıfı"
  classTeacherName: string;
  schoolCounselorName: string;
  schoolPrincipalName: string;
  email?: string;
  phone?: string;
  academicYear?: string;
}
export interface SeatingPlanInfo {
  rows: number;
  cols: number;
}

export interface Student {
  id: string; // Student Number
  name: string; // Full Name (Adi Soyadi)
  no?: string; // For class management students
  clubId?: string | null;
}

// Each "seat" is a tuple that can hold up to two students.
export type Seat = [Student | null, Student | null];
// A row is an array of seats.
export type SeatingRow = Seat[];
// The chart is an array of rows.
export type SeatingChart = SeatingRow[];


export interface DraggedItem {
  student: Student;
  source: { type: 'list' } | { type: 'desk'; row: number; col: number; position: number };
}

// Risk Map Types
export interface RiskFactor {
  key: string;
  label: string;
  weight: number;
}

export interface RiskStudent {
  id: string;
  name: string;
  riskData: { [key: string]: boolean };
  riskScore: number;
}

// Election Module Types
export type ElectionType = 'class_president' | 'school_representative' | 'honor_board';

export interface Candidate extends SınıfYonetimiStudent {
  votes: number;
}

export interface ElectionResult {
  winner: Candidate | null;
  runnerUp: Candidate | null;
  allCandidates: Candidate[];
}

export interface ElectionData {
    candidates: Candidate[];
    votedStudents: string[]; // Store student IDs who have voted
}

// Club Module Types
export interface Club {
  id: string;
  name: string;
  teacher: string;
}

// Student Info Form Types
export interface StudentInfoFormData {
  formDate: string;
  // Student Info
  studentName: string;
  studentGender: string;
  studentClassAndNumber: string;
  studentBirthPlaceAndDate: string;
  studentSchool: string;
  studentAddress: string;
  studentPreschool: string;
  studentHealthDevice: string;
  studentHobbies: string;
  studentChronicIllness: string;
  studentRecentMove: string;
  studentExtracurricular: string;
  studentTechUsage: string;
  studentMemorableEvent: string;
  // Guardian Info
  guardianKinship: string;
  guardianPhone: string;
  guardianEducation: string;
  guardianOccupation: string;
  // Mother Info
  motherName: string;
  motherBirthPlaceAndDate: string;
  motherIsAlive: string;
  motherIsHealthy: string;
  motherHasDisability: string;
  motherEducation: string;
  motherOccupation: string;
  // Father Info
  fatherName: string;
  fatherBirthPlaceAndDate: string;
  fatherIsAlive: string;
  fatherIsHealthy: string;
  fatherHasDisability: string;
  fatherEducation: string;
  fatherOccupation: string;
  // Family Info
  siblingCount: string;
  birthOrder: string;
  familyLivesWith: string;
  familyMemberWithDisability: string;
  familyFinancialIssues: string;
}

// BEP Module Types
export interface Kazanim {
  id: string;
  aciklama: string;
}

export interface Unit {
  unit: string;
  outcomes: Kazanim[];
}

export interface ClassLevel {
  [level: string]: Unit[];
}

export interface DersKazanimlari {
  dersAdi: string;
  siniflar: ClassLevel;
}

export interface BepStudent {
    id: string;
    name: string;
    number: string;
    className: string;
    isSpecialNeeds?: boolean;
    veliAdi?: string;
}

export interface BepPlan {
    id: string;
    gelisimAlani?: string;
    ders?: string;
    ay?: string;
    uda?: string;
    kda?: string;
    olcut?: string;
    yontem?: string;
    materyal?: string;
    tarih?: string;
    degerlendirme?: string;
    performans?: string;
}

export interface BepFormData {
  students: BepStudent[];
  selectedStudentId: string | null;
  plans: {
    [studentId: string]: {
      form: Record<string, any>; // Öğrencinin genel bilgileri
      bepPlans: BepPlan[]; // Öğrencinin BEP planları
    }
  };
}


// Applied Techniques Types
export interface AppliedTechnique {
    name: string;
    kiz?: string;
    erkek?: string;
    veli?: string;
    tarih?: string;
}

export interface AppliedTechniquesFormData {
    bireyiTanima: AppliedTechnique[];
    ogrenciGorusme: AppliedTechnique[];
    veliCalisma: (AppliedTechnique & { notlar?: string })[];
    genelDegerlendirme?: string;
    cozumOnerileri?: string;
}

// Observation Record Types
export interface ObservationRecord {
  id: string; // Unique ID for the record
  recordDate: string;
  studentName: string;
  studentAgeGender: string;
  studentSchool: string;
  studentClassNumber: string;
  classTeacherName: string;
  observationPlace: string;
  observationDateTime: string;
  observationDuration: string;
  observationBehavior: string;
  observationPlanning: string;
  teacherObservations: string;
  observationEvaluation: string;
  conclusionAndSuggestions: string;
  observerName: string;
  observerTitle: string;
  observerSignature: string;
}

// Guidance Referral Form Types
export interface GuidanceReferralRecord {
  id: string;
  studentName: string;
  className: string;
  date: string;
  studentNumber: string;
  reason: string;
  observations: string;
  otherInfo: string;
  studiesDone: string;
  referrerName: string;
  referrerTitle: string;
  referrerSignature: string;
}

// Psychological Support Referral Form Types
export interface PsychologicalSupportReferral {
  id: string;
  date: string;
  studentName: string;
  tcKimlikNo: string;
  veliAdiSoyadi: string;
  devamEttigiOkul: string;
  okulBasarisi: string;
  okulaDevamDurumu: string;
  okulOgretmenTutum: string;
  dogumYeriTarihi: string;
  cinsiyet: string;
  veliIletisim: string;
  okulDegisikligi: string;
  sinifTekrari: string;
  tibbiTani: string;
  dahaOncePsikolojikDestek: string;
  gozlem_gozKontagi: number;
  gozlem_konusma: number;
  gozlem_duygu: number;
  gozlem_dinleme: number;
  gozlem_empati: number;
  gozlem_arkadaslik: number;
  gozlem_sosyalEtkinlik: number;
  gozlem_hayirDiyebilme: number;
  gozlem_isbirligi: number;
  gozlem_bagimsizHareket: number;
  gozlem_hakArama: number;
  gozlem_kuralUyma: number;
  gozlem_kendineGuven: number;
  gozlem_neseli: number;
  gozlem_girisken: number;
  gozlem_uyumlu: number;
  gozlem_sakin: number;
  gozlem_diger: string;
  davranis_altiniIslatma: boolean;
  davranis_parmakEmme: boolean;
  davranis_tirnakYeme: boolean;
  davranis_zorbalik: boolean;
  davranis_yalanSoyleme: boolean;
  davranis_saldırganlik: boolean;
  davranis_kufurluKonusma: boolean;
  davranis_ofkeKontrolu: boolean;
  davranis_takintili: boolean;
  davranis_kardesKiskancligi: boolean;
  davranis_okulKorkusu: boolean;
  riskli_intiharDusuncesi: boolean;
  riskli_intiharGirisimi: boolean;
  riskli_okuldanKacma: boolean;
  riskli_evdenKacma: boolean;
  riskli_sigara: boolean;
  riskli_alkol: boolean;
  riskli_uyusturucu: boolean;
  riskli_istismar: boolean;
  riskli_cinselDavranis: boolean;
  riskli_arkadaslik: boolean;
  riskli_kesiciAlet: boolean;
  gondermeNedeni: string;
  yapilanCalismalar: string;
  sinifOgrtAd: string;
  sinifOgrtImza: string;
  rehberOgrtAd: string;
  rehberOgrtImza: string;
  okulMdrAd: string;
  okulMdrImza: string;
}

// Home Visit Form Types
export interface HomeVisitRecord {
  id: string;
  date: string;
  studentName: string;
  studentSchool: string;
  studentClassNumber: string;
  socioCultural_evinFizikselKosullari: string;
  socioCultural_aileninEkonomikKosullari: string;
  socioCultural_aileninSosyalYasami: string;
  parentAttitudes_ogrenciyeKarsiTutum: string;
  parentAttitudes_ogretmenlereKarsiTutum: string;
  parentAttitudes_okulaKarsiTutum: string;
  parentAttitudes_birbirlerineKarsiTutum: string;
  parentAttitudes_okuldanBeklentileri: string;
  generalEvaluation: string;
  visitors: {
    name: string;
    signature: string;
  }[];
}

// Ders Programı Tipleri
export interface TimeSlot {
  start: string;
  end: string;
}

export interface TimetableCell {
  ders?: string;
  ogretmen?: string;
  sinif?: string;
  renk?: string;
}

export interface TimetableData {
  timeSlots: TimeSlot[];
  schedule: TimetableCell[][];
}


// --- Sınıf Yönetimi Modülü Tipleri ---

export interface SınıfYonetimiStudent {
    id: string;
    no: string;
    name: string;
    marks: { plus: number; minus: number };
    grades: {
      firstTerm?: { [subject: string]: { exam1?: number, exam2?: number, perf1?: number, perf2?: number, proje?: number } };
      secondTerm?: { [subject: string]: { exam1?: number, exam2?: number, perf1?: number, perf2?: number, proje?: number } };
    };
    performanceScales?: PerformanceScaleData;
    clubId?: string | null;
    projectLesson?: string;
}
  
export interface ClassData {
    id: string;
    name: string;
    students: SınıfYonetimiStudent[];
    attendance: { [date: string]: { [studentId: string]: 'present' | 'absent' } };
    createdAt: string;
    performanceScales?: PerformanceScaleData;
}

export interface HomeworkSubmission {
  studentId: string;
  status: 'completed' | 'not_completed' | 'pending';
}
  
export interface Homework {
    id: string;
    classId: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed';
    submissions: HomeworkSubmission[];
    createdAt: string;
    completedAt?: string;
}
  
export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    title: string;
    classId?: string;
}

export interface AnnualPlanEntry {
  'AY': string;
  'HAFTA': string;
  'DERS SAATİ': string;
  'ÜNİTE / TEMA': string;
  'KONU (İÇERİK ÇERÇEVESİ)': string;
  'ÖĞRENME ÇIKTILARI': string;
  'SÜREÇ BİLEŞENLERİ': string;
  isHoliday?: boolean;
}


export interface AnnualPlan {
    id: string;
    name: string;
    content: AnnualPlanEntry[];
}


export interface DailyPlan {
    id: string; // e.g., 'plan_123_week_29'
    annualPlanId: string;
    week: string; // '29. Hafta'
    // Bölüm 1
    sinif: string;
    ogrenmeAlaniUnite: string;
    altOgrenmeAlaniKonu: string;
    onerilenSure: string;
    // Bölüm 2
    ogrenciKazanimlari: string;
    yontemTeknikler: string;
    aracGerecler: string;
    etkinlikler: string; // This can be a structured string or JSON
    ozet: string;
    // Bölüm 3
    olcmeDegerlendirme: string;
    dersinDigerDerslerleIliskisi: string;
    // Bölüm 4
    planUygulamaAciklamalari: string;
    guvenlikOnlemleri: string;
    // Signatures
    ogretmenImza?: string;
    mudurImza?: string;
}
  
export interface YoklamaStudent {
    id: string;
    name: string;
    no: string;
    present: boolean | null;
}

export interface ExamAnalysis {
    id: string;
    classId: string;
    examKey: string; // e.g., 'firstTerm.exam1'
    questionCount: number;
    questions: {
        points: number;
        successRate?: number;
    }[];
    studentResults: {
        studentId: string;
        scores: (number | null)[];
        totalScore: number;
    }[];
}

export interface PerformanceCriterion {
    id: string;
    label: string;
    points: number;
}

export type PerformanceScaleData = {
    [studentId: string]: {
        [criterionId: string]: {
            p1?: number; // Period 1
            p2?: number; // Period 2
        };
    };
};

export interface FormData {
    academicYear: string;
    donem: string;
    ders: string;
    tarih: string;
    saat: string;
    yer: string;
    baskan: string;
    katilimcilar: string;
    gundemMaddeleri: { madde: string }[];
    gorusmeler: { detay: string }[];
    kararlar: string;
}

export interface HomeModule {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    visible: boolean;
}

// --- Merkezi Veritabanı Tipi ---

export interface Database {
    // Sınıf Yönetimi
    classes: ClassData[];
    homework: Homework[];
    calendarEvents: CalendarEvent[];
    annualPlans: AnnualPlan[];
    dailyPlans: DailyPlan[];
    dersProgrami: TimetableData;
    examAnalyses: ExamAnalysis[];
    performanceCriteria: PerformanceCriterion[];
    performanceScaleData: PerformanceScaleData;

    // Rehberlik
    schoolInfo: SchoolInfo | null;
    seatingPlanInfo: SeatingPlanInfo | null;
    seatingChart: SeatingChart;
    students: Student[]; // Genel öğrenci listesi, oturma planı için
    riskStudents: RiskStudent[];
    election: ElectionData;
    projectStudents: (Student & { lesson: string })[];
    dutyStudents: Student[];
    studentInfoForms: StudentInfoFormData[];
    bepData: BepFormData;
    appliedTechniquesData: AppliedTechniquesFormData | null;
    observationRecords: ObservationRecord[];
    guidanceReferralRecords: GuidanceReferralRecord[];
    psychologicalSupportReferrals: PsychologicalSupportReferral[];
    homeVisitRecords: HomeVisitRecord[];

    // Kulüp
    clubs: Club[];
    
    // Zümre
    zumreData: FormData | null;

    // Proje Ödevi
    lessons: string[];

    // Anasayfa
    homeModules: HomeModule[];
}


export const RISK_FACTORS: RiskFactor[] = [
    { key: "anne_ilkokul", label: "Anne en fazla ilkokul mezunu", weight: 1 },
    { key: "baba_ilkokul", label: "Baba en fazla ilkokul mezunu", weight: 1 },
    { key: "tek_cocuk", label: "Tek çocuk olan", weight: 1 },
    { key: "bes_ustu_kardes", label: "5 ve üstü kardeşi olan", weight: 1 },
    { key: "ebeveyn_ayri", label: "Anne ve babası ayrı yaşayan", weight: 2 },
    { key: "ebeveyn_bosanmis", label: "Anne ve babası boşanmış olan", weight: 2 },
    { key: "yalniz_anne", label: "Yalnızca annesi ile yaşayan", weight: 2 },
    { key: "yalniz_baba", label: "Yalnızca babası ile yaşayan", weight: 2 },
    { key: "anne_vefat", label: "Annesi hayatta olmayan", weight: 3 },
    { key: "baba_vefat", label: "Babası hayatta olmayan", weight: 3 },
    { key: "ebeveyn_vefat", label: "Anne ve babası hayatta olmayan", weight: 3 },
    { key: "sehit_cocugu", label: "Şehit Çocuğu", weight: 3 },
    { key: "dede_nine_yasiyor", label: "Yalnızca büyükanne/büyükbabasıyla yaşayan", weight: 2 },
    { key: "akraba_yasiyor", label: "Yalnızca diğer akrabalarıyla yaşayan", weight: 2 },
    { key: "koruyucu_aile", label: "Koruyucu aile gözetiminde olan", weight: 2 },
    { key: "sevgi_evi", label: "Sevgi Evlerinde kalan", weight: 3 },
    { key: "shcek", label: "Sosyal Hizmetler Çocuk Esirgeme Kurum", weight: 3 },
    { key: "ailede_suregen_hastalik", label: "Ailesinde süreğen hastalığı olan", weight: 2 },
    { key: "ailede_ruhsal_hastalik", label: "Ailesinde ruhsal hastalığı olan", weight: 2 },
    { key: "ailede_bagimli", label: "Ailesinde Bağımlı Bireyler Bulunan (alkol/madde)", weight: 3 },
    { key: "ailede_hukumlu", label: "Ailesinde cezai hükmü bulunan", weight: 2 },
    { key: "mevsimlik_isci", label: "Ailesi mevsimlik işçi olan", weight: 2 },
    { key: "aile_ici_siddet", label: "Aile içi şiddete maruz kalan", weight: 3 },
    { key: "ozel_yetenek", label: "Özel Yetenekli tanısı olan", weight: 0 },
    { key: "ozel_egitim_raporu", label: "Yetersizlik alanında özel eğitim raporu olan", weight: 2 },
    { key: "suregen_hastalik", label: "Süreğen hastalığı olan", weight: 2 },
    { key: "ruhsal_hastalik", label: "Ruhsal hastalığı olan", weight: 2 },
    { key: "danismanlik_tedbiri", label: "Danışmanlık Tedbir Kararı Olan", weight: 2 },
    { key: "egitim_tedbiri", label: "Eğitim Tedbir Kararı Olan", weight: 2 },
    { key: "maddi_sikinti", label: "Maddi Sıkıntı Yaşayan", weight: 2 },
    { key: "surekli_devamsiz", label: "Sürekli Devamsız olan", weight: 2 },
    { key: "calisan_ogrenci", label: "Bir işte çalışan", weight: 2 },
    { key: "basari_dusuk", label: "Akademik Başarısı Düşük", weight: 2 },
    { key: "riskli_akran", label: "Riskli akran grubuna dahil olan", weight: 3 },
    { key: "diger", label: "Diğer", weight: 1 }
];

// Yıllık Plan Modülü için Tatil Günleri
export interface Holiday {
    date: string; // YYYY-MM-DD formatında
    name: string;
    type: 'resmi' | 'dini' | 'ara-tatil' | 'okul' | 'yariyil';
}
