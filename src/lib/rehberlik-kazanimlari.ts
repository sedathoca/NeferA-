export interface RehberlikKazanim {
    id: string;
    aciklama: string;
}

interface RehberlikAlan {
    alanAdi: string;
    kazanimlar: RehberlikKazanim[];
}

interface RehberlikSeviye {
    seviye: string;
    alanlar: RehberlikAlan[];
}

export const REHBERLIK_KAZANIMLARI: RehberlikSeviye[] = [
    {
        seviye: "9. Sınıf",
        alanlar: [
            {
                alanAdi: "Akademik Gelişim",
                kazanimlar: [
                    { id: "O.9.1", aciklama: "Okula ve okulun çevresine uyum sağlar." },
                    { id: "O.9.2", aciklama: "Okulun ve sınıfın kurallarını gerekçeleriyle açıklar." },
                    { id: "O.9.3", aciklama: "Zamanı etkili bir şekilde kullanır." },
                    { id: "O.9.4", aciklama: "Verimli ders çalışma yöntemlerini uygular." },
                    { id: "O.9.5", aciklama: "Öğrenme stilinin özelliklerini açıklar." },
                    { id: "O.9.6", aciklama: "Hedef belirlemenin önemini açıklar." },
                    { id: "O.9.7", aciklama: "Derslere ve konulara ilişkin ilgi ve yeteneklerini değerlendirir." }
                ]
            },
            {
                alanAdi: "Kariyer Gelişimi",
                kazanimlar: [
                    { id: "O.9.8", aciklama: "Mesleki ilgi ve yeteneklerinin farkına varır." },
                    { id: "O.9.9", aciklama: "Mesleklerin gerektirdiği kişilik özelliklerini açıklar." },
                    { id: "O.9.10", aciklama: "Kariyer keşfetmenin önemini açıklar." },
                    { id: "O.9.11", aciklama: "Meslekleri farklı özellikleri açısından karşılaştırır." },
                    { id: "O.9.12", aciklama: "Mesleki karar verme sürecinde dikkat edilmesi gerekenleri fark eder." }
                ]
            },
            {
                alanAdi: "Sosyal Duygusal Gelişim",
                kazanimlar: [
                    { id: "O.9.13", aciklama: "Kişisel özelliklerinin farkına varır." },
                    { id: "O.9.14", aciklama: "Olumlu ve olumsuz duygularını yönetir." },
                    { id: "O.9.15", aciklama: "Ergenlik dönemindeki gelişimsel değişimleri kabul eder." },
                    { id: "O.9.16", aciklama: "Ergenlik döneminde yaşanan duygusal sorunlarla başa çıkma yollarını kullanır." },
                    { id: "O.9.17", aciklama: "Başkalarıyla ilişkilerinde saygılı davranır." },
                    { id: "O.9.18", aciklama: "Etkili iletişim becerilerini kullanır." },
                    { id: "O.9.19", aciklama: "Akran baskısıyla başa çıkar." },
                    { id: "O.9.20", aciklama: "Şiddetin türlerini ve etkilerini açıklar." },
                    { id: "O.9.21", aciklama: "İhmal ve istismarın türlerini ve etkilerini açıklar." },
                    { id: "O.9.22", aciklama: "İhmal ve istismar durumlarında başvurulabilecek kişi ve kurumları bilir." },
                    { id: "O.9.23", aciklama: "Siber zorbalığın ne olduğunu ve nasıl başa çıkacağını bilir." },
                    { id: "O.9.24", aciklama: "Kişisel sınırlarını korur." },
                    { id: "O.9.25", aciklama: "Problem çözme ve karar verme becerilerini geliştirir." },
                    { id: "O.9.26", aciklama: "Sosyal ve kültürel etkinliklere katılmanın önemini fark eder." },
                    { id: "O.9.27", aciklama: "Aile içi ilişkilerin önemini fark eder." }
                ]
            }
        ]
    },
    {
        seviye: "10. Sınıf",
        alanlar: [
            {
                alanAdi: "Akademik Gelişim",
                kazanimlar: [
                    { id: "O.10.1", aciklama: "Çalışma davranışlarını değerlendirir." },
                    { id: "O.10.2", aciklama: "Hedef belirlemenin kendisi için önemini açıklar." },
                    { id: "O.10.3", aciklama: "Öğrenme sürecini etkileyen faktörleri açıklar." },
                    { id: "O.10.4", aciklama: "Öğrenme stratejilerini kullanır." },
                    { id: "O.10.5", aciklama: "Motivasyon kaynaklarını açıklar." },
                    { id: "O.10.6", aciklama: "Sorumluluklarının farkına varır." },
                    { id: "O.10.7", aciklama: "Okul başarısını etkileyen faktörleri analiz eder." }
                ]
            },
            {
                alanAdi: "Kariyer Gelişimi",
                kazanimlar: [
                    { id: "O.10.8", aciklama: "Mesleki değerlerini keşfeder." },
                    { id: "O.10.9", aciklama: "Mesleki eğilimlerini fark eder." },
                    { id: "O.10.10", aciklama: "İlgi, yetenek ve değerleri ile meslekler arasında ilişki kurar." },
                    { id: "O.10.11", aciklama: "Çalışma yaşamındaki yasal düzenlemeleri bilir." },
                    { id: "O.10.12", aciklama: "Kariyer planlamanın yaşam boyu devam eden bir süreç olduğunu kabul eder." }
                ]
            },
            {
                alanAdi: "Sosyal Duygusal Gelişim",
                kazanimlar: [
                    { id: "O.10.13", aciklama: "Güçlü ve zayıf yönlerini analiz eder." },
                    { id: "O.10.14", aciklama: "Stresle başa çıkma becerilerini kullanır." },
                    { id: "O.10.15", aciklama: "Ergenlik dönemindeki bedensel ve ruhsal sağlığını korumaya yönelik davranışlar sergiler." },
                    { id: "O.10.16", aciklama: "Öfkesini uygun yollarla ifade eder." },
                    { id: "O.10.17", aciklama: "Toplumsal cinsiyet rollerine ilişkin kalıp yargıları sorgular." },
                    { id: "O.10.18", aciklama: "Çatışma çözme becerilerini kullanır." },
                    { id: "O.10.19", aciklama: "Zorbalıkla başa çıkma stratejilerini uygular." },
                    { id: "O.10.20", aciklama: "Şiddetin önlenmesine yönelik sorumluluk alır." },
                    { id: "O.10.21", aciklama: "Riskli yaşam durumlarında kişisel güvenliğini sağlar." },
                    { id: "O.10.22", aciklama: "Bağımlılığın türlerini ve olumsuz etkilerini açıklar." },
                    { id: "O.10.23", aciklama: "Bağımlılıkla mücadelede koruyucu faktörlerin önemini fark eder." },
                    { id: "O.10.24", aciklama: "Farklılıklara saygı duymanın önemini açıklar." },
                    { id: "O.10.25", aciklama: "Topluma hizmet çalışmalarına katılır." },
                    { id: "O.10.26", aciklama: "Ailedeki sorumluluklarını yerine getirir." },
                    { id: "O.10.27", aciklama: "Yardım istemenin önemini fark eder." }
                ]
            }
        ]
    },
    {
        seviye: "11. Sınıf",
        alanlar: [
            {
                alanAdi: "Akademik Gelişim",
                kazanimlar: [
                    { id: "O.11.1", aciklama: "Akademik hedeflerini belirler." },
                    { id: "O.11.2", aciklama: "Öğrenme hedeflerini gerçekleştirmeye yönelik plan yapar." },
                    { id: "O.11.3", aciklama: "Sınav kaygısıyla başa çıkma yöntemlerini kullanır." },
                    { id: "O.11.4", aciklama: "Yükseköğretim sistemini tanır." },
                    { id: "O.11.5", aciklama: "Yurt içi ve yurt dışı eğitim olanaklarını araştırır." },
                    { id: "O.11.6", aciklama: "Eleştirel düşünme becerilerini kullanır." },
                    { id: "O.11.7", aciklama: "Bilgiye ulaşma ve bilgiyi kullanma becerilerini geliştirir." }
                ]
            },
            {
                alanAdi: "Kariyer Gelişimi",
                kazanimlar: [
                    { id: "O.11.8", aciklama: "Kariyer hedeflerini belirler." },
                    { id: "O.11.9", aciklama: "Kariyer hedeflerine ulaşmak için gerekli adımları planlar." },
                    { id: "O.11.10", aciklama: "Yükseköğretim programlarını ve meslekleri inceler." },
                    { id: "O.11.11", aciklama: "Geleceğin mesleklerini araştırır." },
                    { id: "O.11.12", aciklama: "Girişimcilik ve istihdam edilebilirlik becerilerini geliştirir." }
                ]
            },
            {
                alanAdi: "Sosyal Duygusal Gelişim",
                kazanimlar: [
                    { id: "O.11.13", aciklama: "Kendini değerli bir birey olarak kabul eder." },
                    { id: "O.11.14", aciklama: "Yaşam olaylarının psikolojik sağlamlık üzerindeki etkilerini değerlendirir." },
                    { id: "O.11.15", aciklama: "Geleceğe yönelik olumlu bakış açısı geliştirir." },
                    { id: "O.11.16", aciklama: "Romantik ilişkilerde sağlıklı sınırlar koyar." },
                    { id: "O.11.17", aciklama: "Empati kurarak başkalarının duygularını anlar." },
                    { id: "O.11.18", aciklama: "Toplumsal sorunlara duyarlılık gösterir." },
                    { id: "O.11.19", aciklama: "Akran zorbalığını önlemeye yönelik sorumluluk alır." },
                    { id: "O.11.20", aciklama: "Şiddetin her türüne karşı durur." },
                    { id: "O.11.21", aciklama: "Doğal afetler ve kriz durumlarında ne yapacağını bilir." },
                    { id: "O.11.22", aciklama: "Teknoloji bağımlılığının etkilerini ve başa çıkma yollarını açıklar." },
                    { id: "O.11.23", aciklama: "Zararlı alışkanlıklara 'hayır' deme becerisini gösterir." },
                    { id: "O.11.24", aciklama: "Farklılıklara sahip bireylerle bir arada yaşama becerisi geliştirir." },
                    { id: "O.11.25", aciklama: "Gönüllülük çalışmalarının bireysel ve toplumsal önemini açıklar." },
                    { id: "O.11.26", aciklama: "Aile yaşamında meydana gelen değişikliklere uyum sağlar." },
                    { id: "O.11.27", aciklama: "Psikolojik yardım alma konusunda bilinçlenir." }
                ]
            }
        ]
    },
    {
        seviye: "12. Sınıf",
        alanlar: [
            {
                alanAdi: "Akademik Gelişim",
                kazanimlar: [
                    { id: "O.12.1", aciklama: "Akademik başarısını ve motivasyonunu artırmaya yönelik stratejiler geliştirir." },
                    { id: "O.12.2", aciklama: "Yükseköğretime geçiş sınavlarına yönelik hedeflerini gözden geçirir." },
                    { id: "O.12.3", aciklama: "Sınav kaygısını yönetmeye yönelik stratejiler geliştirir." },
                    { id: "O.12.4", aciklama: "Yükseköğretim kurumlarına başvuru sürecini bilir." },
                    { id: "O.12.5", aciklama: "Burs, kredi ve barınma olanaklarını araştırır." },
                    { id: "O.12.6", aciklama: "Problem çözme ve karar verme becerilerini akademik yaşamında kullanır." },
                    { id: "O.12.7", aciklama: "Yaşam boyu öğrenmenin önemini kavrar." }
                ]
            },
            {
                alanAdi: "Kariyer Gelişimi",
                kazanimlar: [
                    { id: "O.12.8", aciklama: "Kariyer kararını verir." },
                    { id: "O.12.9", aciklama: "İş arama kanallarını ve yöntemlerini kullanır." },
                    { id: "O.12.10", aciklama: "Öz geçmiş (CV) ve niyet mektubu hazırlar." },
                    { id: "O.12.11", aciklama: "Mülakat becerilerini geliştirir." },
                    { id: "O.12.12", aciklama: "İş yaşamının gerektirdiği temel becerileri açıklar." }
                ]
            },
            {
                alanAdi: "Sosyal Duygusal Gelişim",
                kazanimlar: [
                    { id: "O.12.13", aciklama: "Kişisel değerlerini ve yaşam hedeflerini belirler." },
                    { id: "O.12.14", aciklama: "Gelecek kaygısıyla başa çıkar." },
                    { id: "O.12.15", aciklama: "Yetişkinlik dönemine ilişkin sorumluluklarını fark eder." },
                    { id: "O.12.16", aciklama: "Sağlıklı ve güvenli ilişkiler kurar." },
                    { id: "O.12.17", aciklama: "Toplumsal sorumluluk projeleri geliştirir ve uygular." },
                    { id: "O.12.18", aciklama: "İnsan hakları ve demokrasi bilincini geliştirir." },
                    { id: "O.12.19", aciklama: "Flört şiddeti ve siber zorbalıkla mücadele eder." },
                    { id: "O.12.20", aciklama: "Çatışmaları yapıcı bir şekilde yönetir." },
                    { id: "O.12.21", aciklama: "Travmatik yaşantılar sonrası psikolojik destek almanın önemini bilir." },
                    { id: "O.12.22", aciklama: "Dijital vatandaşlık sorumluluklarını yerine getirir." },
                    { id: "O.12.23", aciklama: "Zararlı alışkanlıklara karşı akranlarına destek olur." },
                    { id: "O.12.24", aciklama: "Sosyal adalet ve eşitlik konularında farkındalık geliştirir." },
                    { id: "O.12.25", aciklama: "Boş zamanlarını verimli kullanır." },
                    { id: "O.12.26", aciklama: "Aile içi iletişimde yapıcı bir rol üstlenir." },
                    { id: "O.12.27", aciklama: "Kendini gerçekleştirme yolunda adımlar atar." }
                ]
            }
        ]
    }
];
