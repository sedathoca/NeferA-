

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Database, PerformanceCriterion, HomeModule } from '@/lib/types';
import { useAuth, useUser } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { HIGH_SCHOOL_LESSONS } from '@/lib/lessons';

const initialTimeSlots = Array(10).fill({ start: '', end: '' });
const initialSchedule = Array(5).fill(Array(10).fill({}));

const initialPerformanceCriteria: PerformanceCriterion[] = [
    { id: 'crit_1', label: 'Derse hazırlıklı gelme', points: 10 },
    { id: 'crit_2', label: 'Dersle ilgili araştırma yapma', points: 10 },
    { id: 'crit_3', label: 'Dersin akışını engelleyecek faaliyetlerde bulunmama', points: 10 },
    { id: 'crit_4', label: 'Kendiliğinden söz alarak görüşünü söyleme', points: 10 },
    { id: 'crit_5', label: 'Belirttiği görüşler ve verdiği örneklerin özgün olması', points: 10 },
    { id: 'crit_6', label: 'Sorumluluk alma', points: 10 },
    { id: 'crit_7', label: 'Verilen görevleri isteyerek ve zamanında yapma', points: 10 },
    { id: 'crit_8', label: 'Dersi kullanmada heves ve gayretinin olması', points: 10 },
    { id: 'crit_9', label: 'Ders içerisinde arkadaşlarına karşı saygılı olma', points: 10 },
    { id: 'crit_10', label: 'Ödevlerini zamanında, uygun yapma', points: 10 },
];

const INITIAL_HOME_MODULES: HomeModule[] = [
  { id: "mod9", title: 'Günlük Planlayıcı', description: 'Yıllık planı Excel\'den yükleyin, günlük plan çıktısı alın.', href: '/gunluk-plan', icon: 'BookCopy', visible: true },
  { id: "mod1", title: 'Akıllı Tahta Uygulaması', description: 'Zamanlayıcı, takvim ve diğer sınıf araçları', href: '/akilli-tahta', icon: 'MonitorPlay', visible: true },
  { id: "mod2", title: 'Sınıf Yönetim Modülü', description: 'Sınıf ve öğrenci yönetimi, yoklama, ödevler ve daha fazlası.', href: '/sinif-yonetimi', icon: 'Users', visible: true },
  { id: "mod3", title: 'Ders Programı', description: 'Haftalık ders planlayıcı', href: '/ders-programi', icon: 'Book', visible: true },
  { id: "mod4", title: 'Sınav/Test Olusturucu', description: 'PDF ve resimlerden keserek veya metinle sınav kağıdı hazırlayın.', href: '#', icon: 'ClipboardList', visible: true },
  { id: "mod5", title: 'Takvim', description: 'Etkinlik planlayıcı ve akıllı takvim özellikleri.', href: '#', icon: 'CalendarIcon', visible: true },
  { id: "mod6", title: 'Rehberlik Menüsü', description: 'Sınıf rehberlik ve BEP modülleri', href: '/rehberlik', icon: 'Compass', visible: true },
  { id: "mod7", title: 'Evraklar Menüsü', description: 'Belge ve form oluşturucu', href: '/evraklar', icon: 'FileText', visible: true },
  { id: "mod8", title: 'Kullanıcı Bilgileri Modülü', description: 'Kullanıcı bilgilerini ve ayarları yönetin.', href: '/bilgi-girisi', icon: 'Users2', visible: true },
];

const INITIAL_DB: Database = {
    classes: [],
    homework: [],
    calendarEvents: [],
    annualPlans: [],
    dailyPlans: [],
    dersProgrami: {
        timeSlots: initialTimeSlots,
        schedule: initialSchedule,
    },
    examAnalyses: [],
    schoolInfo: null,
    seatingPlanInfo: null,
    seatingChart: [],
    students: [],
    riskStudents: [],
    election: {
        candidates: [],
        votedStudents: [],
    },
    projectStudents: [],
    dutyStudents: [],
    studentInfoForms: [],
    bepData: {
        students: [],
        selectedStudentId: null,
        plans: {},
    },
    appliedTechniquesData: null,
    observationRecords: [],
    guidanceReferralRecords: [],
    psychologicalSupportReferrals: [],
    homeVisitRecords: [],
    clubs: [],
    zumreData: null,
    performanceCriteria: initialPerformanceCriteria,
    performanceScaleData: {},
    lessons: HIGH_SCHOOL_LESSONS.sort((a,b) => a.localeCompare(b, 'tr')),
    homeModules: INITIAL_HOME_MODULES,
};

export function useDatabase() {
  const { user, loading: authLoading } = useUser();
  const firestoreDb = useFirestore();
  
  const [db, setDb] = useState<Database>(INITIAL_DB);
  const [loading, setLoading] = useState(true);
  
  const updateDb = useCallback((updater: (prevDb: Database) => Database) => {
    setDb(prevDb => {
        const newDb = updater(prevDb);
        if (user && firestoreDb) {
            const docRef = doc(firestoreDb, 'user_data', user.uid);
            // Use a timeout to batch updates
            setTimeout(() => setDoc(docRef, newDb), 500);
        } else {
            localStorage.setItem('localDb', JSON.stringify(newDb));
        }
        return newDb;
    });
  }, [user, firestoreDb]);


  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    let unsubscribe: Unsubscribe | null = null;

    const mergeAndSetData = (sourceData: any) => {
        // Create a deep copy of INITIAL_DB to avoid modifying the constant
        const mergedData: Database = JSON.parse(JSON.stringify(INITIAL_DB));

        // Merge sourceData into mergedData
        for (const key in sourceData) {
            if (Object.prototype.hasOwnProperty.call(sourceData, key)) {
                // @ts-ignore
                mergedData[key] = sourceData[key];
            }
        }

        // Specifically handle homeModules to ensure new modules are added
        if (sourceData.homeModules) {
            const defaultModuleIds = new Set(INITIAL_DB.homeModules.map(m => m.id));
            const userModuleIds = new Set(sourceData.homeModules.map((m: HomeModule) => m.id));
            
            const missingModules = INITIAL_DB.homeModules.filter(m => !userModuleIds.has(m.id));
            
            if (missingModules.length > 0) {
                // Add new modules to the beginning of the user's list
                mergedData.homeModules = [...missingModules, ...sourceData.homeModules];
            } else {
                 mergedData.homeModules = sourceData.homeModules;
            }
        } else {
            mergedData.homeModules = INITIAL_DB.homeModules;
        }

        setDb(mergedData);
    };

    if (user && firestoreDb) {
      setLoading(true);
      const docRef = doc(firestoreDb, 'user_data', user.uid);

      unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          mergeAndSetData(cloudData);
        } else {
          // No document for this user, check local storage for migration
          const localDataString = localStorage.getItem('localDb');
          let dataToSet: Database = JSON.parse(JSON.stringify(INITIAL_DB));
          if (localDataString) {
            try {
              dataToSet = JSON.parse(localDataString);
            } catch {
              console.error("Corrupted local data, starting fresh.");
              dataToSet = JSON.parse(JSON.stringify(INITIAL_DB));
            }
          }
          await setDoc(docRef, dataToSet); // Create the document in Firestore
          mergeAndSetData(dataToSet);
          if(localDataString) localStorage.removeItem('localDb');
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
        setLoading(false);
      });

    } else {
      // No user, use local storage
      setLoading(true);
      const localDataString = localStorage.getItem('localDb');
      if (localDataString) {
        try {
          const localData = JSON.parse(localDataString);
          mergeAndSetData(localData);
        } catch {
          setDb(JSON.parse(JSON.stringify(INITIAL_DB)));
        }
      } else {
        setDb(JSON.parse(JSON.stringify(INITIAL_DB)));
      }
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, firestoreDb, authLoading]);

  return { db, setDb: updateDb, loading };
}
