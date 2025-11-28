export interface Scenario {
    description: string;
    content: string;
}

export interface AgendaItemScenarios {
    agenda: string;
    scenarios: Scenario[];
}

export const GUNDEM_MADDELERI: string[] = [
    "Açılış ve yoklama",
    "Bir önceki zümre toplantısında alınan kararların incelenmesi",
    "Öğretim programlarının uygulanmasında karşılaşılan sorunlar ve çözüm önerileri",
    "Eğitim-öğretim materyalleri ve araç-gereç ihtiyaçlarının belirlenmesi",
    "Öğrenci başarısının ölçülmesi ve değerlendirilmesi, sınavlar",
    "Diğer zümre öğretmenleriyle yapılacak iş birliği",
    "Öğrenci sosyal ve kişilik hizmetleri kapsamında yapılacak çalışmalar",
    "Veli toplantıları ve velilerle iş birliği",
    "İş sağlığı ve güvenliği tedbirleri",
    "Öğrenci başarısını artırmaya yönelik alınacak tedbirler",
    "Milli ve manevi değerlerin öğrencilere kazandırılması",
    "Dilek, temenniler ve kapanış",
];

export const SENARYOLAR: AgendaItemScenarios[] = [
    // 1. Açılış ve yoklama
    {
        agenda: "Açılış ve yoklama",
        scenarios: Array(10).fill({
            description: "Toplantının başlangıcı, katılımcıların tespiti ve gündemin okunması.",
            content: `{baskan}: Değerli arkadaşlar, {academicYear} Eğitim-Öğretim Yılı {donem} {ders} dersi zümre öğretmenler kurulu toplantısına hepiniz hoş geldiniz.\n{katilimci1}: Hoş bulduk.\n{baskan}: Toplantıya katılımın tam olduğunu görüyorum. Gündem maddelerimizi okuyorum... Gündeme eklemek istediğiniz bir madde var mıdır?\n{katilimci2}: Yoktur, teşekkür ederiz.`
        })
    },
    // 2. Bir önceki zümre...
    {
        agenda: "Bir önceki zümre toplantısında alınan kararların incelenmesi",
        scenarios: [
            { description: "Alınan kararların başarıyla uygulandığı ve olumlu sonuçlar alındığı senaryo.", content: `{baskan}: Arkadaşlar, bir önceki toplantımızda aldığımız kararları gözden geçirelim. Özellikle {ders} dersinde materyal kullanımını artırma kararımızın öğrenci başarısını olumlu etkilediğini gözlemledim. Sizin görüşleriniz nelerdir?\n{katilimci1}: Evet, öğrenciler görsel materyallerle konuları daha iyi kavradı. Özellikle deney setleri çok faydalı oldu.` },
            { description: "Bazı kararların uygulanamadığı ve nedenlerinin tartışıldığı senaryo.", content: `{baskan}: Önceki kararlarımızdan biri olan veli bilgilendirme seminerini zamanlama sorunları nedeniyle gerçekleştiremedik. Bu dönem için yeni bir takvim belirlememiz gerekiyor.\n{katilimci1}: Haklısınız, velilerin katılımını en üst düzeye çıkaracak bir tarih ve saat belirleyelim.` },
            { description: "Kararların kısmen uygulandığı ve geliştirilmesi gereken yönlerin konuşulduğu senaryo.", content: `{baskan}: Ortak sınav takvimi oluşturma kararımız büyük ölçüde işe yaradı ancak bazı sınıflarda müfredat takviminde küçük aksaklıklar yaşandı. Bu dönem daha esnek bir planlama yapabiliriz.\n{katilimci1}: Evet, bayram tatillerini ve diğer etkinlikleri göz önünde bulundurarak daha dinamik bir takvim hazırlayalım.` },
            { description: "Yeni bir öğretmenin katılımıyla eski kararların özetlendiği senaryo.", content: `{baskan}: Aramıza yeni katılan {katilimci2} arkadaşımıza hoş geldin diyoruz. Geçen dönemki kararlarımızı kısaca özetlemek gerekirse, {ders} dersi için proje tabanlı öğrenmeye ağırlık vermiş ve olumlu sonuçlar almıştık.\n{katilimci1}: Bu dönem de proje konularını çeşitlendirerek devam edebiliriz.` },
            { description: "Alınan bir kararın beklenmedik olumsuz bir sonuç doğurduğu ve geri adım atılmasının tartışıldığı senaryo.", content: `{baskan}: Değerli arkadaşlar, her hafta yaptığımız ek deneme sınavı kararının öğrenciler üzerinde baskı yarattığını ve motivasyonlarını düşürdüğünü gözlemledik. Bu uygulamayı tekrar değerlendirmemiz gerektiğini düşünüyorum.\n{katilimci1}: Aynı fikirdeyim. Belki ayda bir veya ünite sonlarında deneme yapmak daha verimli olabilir.` },
            { description: "Kararların teknoloji entegrasyonu açısından değerlendirildiği bir senaryo.", content: `{baskan}: Geçen dönem EBA ve diğer dijital platformları daha etkin kullanma kararı almıştık. Uygulama düzeyini ve karşılaşılan zorlukları konuşalım.\n{katilimci1}: Öğrencilerin ilgisi yüksek oldu ancak bazı öğrencilerimizin evde internet erişiminde sorun yaşadığını tespit ettik. Okulda ek telafi saatleri düzenleyebiliriz.` },
            { description: "Öğrenci geri bildirimlerine dayalı olarak kararların revize edildiği bir senaryo.", content: `{baskan}: Yaptığımız anketlerde, öğrencilerin {ders} dersinde grup çalışmalarından çok keyif aldığını ancak bireysel projelerde zorlandığını gördük. Bu dönem grup projelerine daha fazla ağırlık verebiliriz.\n{katilimci1}: Mantıklı. Grup içinde rol dağılımı yaparak bireysel sorumlulukları da takip edebiliriz.` },
            { description: "Okul idaresinin yeni bir politikası nedeniyle eski kararların geçersiz kaldığı bir senaryo.", content: `{baskan}: Okul yönetimimiz, tüm dersler için ortak bir yazılı sınav formatı belirledi. Bu nedenle, bizim daha önce aldığımız {ders} dersine özel sınav formatı kararımız bu dönem geçerli olmayacak. Yeni formata nasıl adapte olacağımızı konuşmalıyız.\n{katilimci1}: Yeni formatın detaylarını inceleyip soru tiplerini ona göre hazırlamamız gerekecek.` },
            { description: "Bütçe kısıtlamaları nedeniyle uygulanamayan kararların ele alındığı bir senaryo.", content: `{baskan}: Maalesef, istediğimiz yeni {ders} laboratuvar malzemeleri için bütçe onayı alamadık. Bu durumda mevcut materyallerle nasıl daha verimli olabiliriz veya alternatif, düşük maliyetli çözümler üretebilir miyiz?\n{katilimci1}: Belki basit malzemelerle kendi deney setlerimizi oluşturabiliriz. Öğrenciler için de yaratıcı bir etkinlik olur.` },
            { description: "Alınan kararların okul genelindeki başarıya olan etkisinin istatistiksel olarak incelendiği bir senaryo.", content: `{baskan}: Rakamlar gösteriyor ki, {ders} dersinde problem çözme saatlerini artırma kararımızdan sonra okul genelindeki net ortalamamız %15 artmış. Bu çok sevindirici. Bu başarıyı nasıl sürdürülebilir kılarız?\n{katilimci1}: Bu yöntemi diğer konulara da uygulayarak ve farklı soru tipleriyle zenginleştirerek devam edebiliriz.` },
        ]
    },
     // 3. Öğretim programları
    {
        agenda: "Öğretim programlarının uygulanmasında karşılaşılan sorunlar ve çözüm önerileri",
        scenarios: [
            { description: "Müfredatın zamanında bitirilememesi ve zaman yönetimi sorunu.", content: `{baskan}: Değerli arkadaşlar, özellikle {ders} dersinde bazı konuların çok detaylı olması ve ayrılan sürenin yetersiz kalması gibi bir sorunla karşılaşıyoruz. Bu da müfredatı zamanında bitirmemizi zorlaştırıyor.\n{katilimci1}: Evet, bazı temel konulara daha fazla zaman ayırıp, daha az önemli detayları öğrencilere araştırma ödevi olarak vererek zamanı daha verimli kullanabiliriz.` },
            { description: "Öğrencilerin ön bilgi eksiklikleri ve temel oluşturma ihtiyacı.", content: `{baskan}: Yeni gelen öğrencilerimizde {ders} dersi için gereken temel bilgi ve becerilerde eksiklikler olduğunu gözlemliyorum. Bu durum, mevcut programı işlememizi yavaşlatıyor.\n{katilimci1}: Dönem başında hızlı bir tekrar ve temel bilgileri hatırlatıcı bir ön hazırlık programı uygulayabiliriz. Gerekirse destekleme kursları için idareyle görüşebiliriz.` },
            { description: "Soyut konuların somutlaştırılamaması ve öğrencilerin anlamakta zorlanması.", content: `{baskan}: {ders} dersindeki bazı soyut kavramları öğrencilerin somutlaştırmakta zorlandığını görüyorum. Bu da konunun anlaşılmasını güçleştiriyor.\n{katilimci1}: Günlük hayattan örnekler, basit deneyler, simülasyonlar ve modeller kullanarak bu konuları daha anlaşılır hale getirebiliriz. Teknolojiden bu konuda daha fazla yararlanmalıyız.` },
            { description: "Öğrencilerin motivasyon eksikliği ve derse karşı ilgisizlik.", content: `{baskan}: Genel olarak öğrencilerde {ders} dersine karşı bir motivasyon eksikliği ve ilgisizlik fark ediyorum. Programı daha ilgi çekici hale nasıl getirebiliriz?\n{katilimci1}: Konuları oyunlaştırma, yarışmalar düzenleme, dersi daha fazla görsel ve işitsel materyalle destekleme gibi yöntemler deneyebiliriz. Başarı hikayeleri paylaşmak da ilham verici olabilir.` },
            { description: "Sınıflar arası seviye farklılıkları ve farklılaştırılmış öğretim ihtiyacı.", content: `{baskan}: Aynı seviyedeki farklı şubeler arasında bile {ders} dersi anlama ve kavrama düzeyinde belirgin farklar var. Standart bir anlatım herkes için verimli olmuyor.\n{katilimci1}: İleri seviyedeki öğrenciler için zenginleştirilmiş etkinlikler ve ek projeler, temel seviyedeki öğrenciler için ise basitleştirilmiş anlatımlar ve ek alıştırmalar içeren farklılaştırılmış bir öğretim planı hazırlamamız gerekiyor.` },
            { description: "Öğretim programının güncel gelişmelerle uyumsuzluğu.", content: `{baskan}: {ders} dersi müfredatının bazı kısımlarının günümüz teknolojisi ve bilimsel gelişmelerin gerisinde kaldığını düşünüyorum. Bu durum, öğrencilerin ilgisini çekmemizi zorlaştırıyor.\n{katilimci1}: Müfredatın ana hatlarına sadık kalarak, ders içeriğini güncel örnekler, yeni keşifler ve modern uygulamalarla zenginleştirebiliriz. Bu konuda birbirimizle materyal paylaşımı yapalım.` },
            { description: "Ölçme ve değerlendirme araçlarının program hedefleriyle uyumsuzluğu.", content: `{baskan}: Sınavlarda sorduğumuz soruların, programın kazandırmayı hedeflediği üst düzey düşünme becerilerinden çok, ezber bilgiyi ölçtüğünü fark ettim. Değerlendirme yöntemlerimizi gözden geçirmeliyiz.\n{katilimci1}: Sadece yazılı sınavlara bağlı kalmayalım. Projeler, sunumlar, portfolyolar ve performansa dayalı görevlerle öğrencilerin becerilerini daha bütüncül bir şekilde ölçebiliriz.` },
            { description: "BEP'li (Bireyselleştirilmiş Eğitim Programı) öğrenciler için programın uyarlanmasında yaşanan zorluklar.", content: `{baskan}: Kaynaştırma öğrencilerimiz için {ders} programını bireyselleştirmekte zorlanıyoruz. Hem öğrencinin hedeflerine ulaşması hem de sınıfın genel akışını bozmaması gerekiyor.\n{katilimci1}: Rehberlik servisiyle ve özel eğitim öğretmenleriyle daha sıkı iş birliği yapmalıyız. Her öğrencinin BEP dosyasını dönem başında detaylıca inceleyip, ona özel materyal ve değerlendirme yöntemleri belirleyelim.` },
            { description: "Proje ve performans görevlerinin çok zaman alması ve ders saatini etkilemesi.", content: `{baskan}: Programda yer alan proje ve performans görevlerinin hazırlanması ve sunulması ders saatlerimizi önemli ölçüde etkiliyor. Bu dengeyi nasıl kurabiliriz?\n{katilimci1}: Projelerin bazı aşamalarını ders dışında yapmaları için öğrencileri yönlendirebiliriz. Ayrıca, disiplinler arası projeler tasarlayarak birkaç dersin proje yükünü tek bir çalışmada birleştirebiliriz.` },
            { description: "Ders kitaplarının içeriğinin yetersiz veya karmaşık olması.", content: `{baskan}: Kullandığımız {ders} ders kitabının bazı konuları çok yüzeysel geçtiğini, bazılarını ise gereksiz yere karmaşık anlattığını düşünüyorum. Bu durum öğretim sürecimizi olumsuz etkiliyor.\n{katilimci1}: Ders kitabını sadece bir rehber olarak kullanalım. Eksik kalan noktaları kendi hazırladığımız notlar, EBA içerikleri ve diğer güvenilir kaynaklardan derlediğimiz materyallerle tamamlayalım. Bir sonraki yıl için farklı bir yayın evini değerlendirmek üzere bir rapor hazırlayabiliriz.` },
        ]
    },
    // 4. Eğitim-öğretim materyalleri
    {
        agenda: "Eğitim-öğretim materyalleri ve araç-gereç ihtiyaçlarının belirlenmesi",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Materyal ihtiyacı, teknoloji kullanımı ve bütçe olanakları üzerine odaklanan farklı bir tartışma.`,
            content: `{baskan}: Arkadaşlar, {ders} dersini daha etkili işleyebilmek için materyal ve araç-gereç durumumuzu gözden geçirelim. Mevcut materyallerimiz yeterli mi, nelere ihtiyacımız var?\n{katilimci1}: Akıllı tahta içeriklerimiz güncel değil. Ayrıca, özellikle deney gerektiren konularda laboratuvar malzemelerimiz eksik. Öğrencilerin konuları somutlaştırması için daha fazla modele ve simülasyona ihtiyacımız var.\n{baskan}: Anlaşıldı. İhtiyaç listemizi detaylandırıp okul idaresine sunalım. Bütçe onaylanana kadar mevcut imkanlarla neler yapabileceğimizi de planlayalım.`
        }))
    },
    // 5. Öğrenci başarısının ölçülmesi
    {
        agenda: "Öğrenci başarısının ölçülmesi ve değerlendirilmesi, sınavlar",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Sınav türleri, değerlendirme kriterleri ve yeni nesil soru hazırlama teknikleri üzerine bir tartışma.`,
            content: `{baskan}: Bu dönem {ders} dersi için yapacağımız sınavların formatını ve değerlendirme kriterlerini netleştirelim. Sadece yazılı sınavlar yeterli oluyor mu?\n{katilimci1}: Bence değil. Öğrencilerin süreç içindeki performanslarını da değerlendirmeye katmalıyız. Proje, sunum ve derse katılım notları ile daha adil bir ölçme yapabiliriz. Ayrıca, sınavlarımızda daha fazla analiz ve yorumlama gerektiren yeni nesil sorulara yer vermeliyiz.\n{baskan}: Çok doğru. O halde dönem boyunca 2 yazılı, 1 proje ve 2 performans notu üzerinden değerlendirme yapalım. Sınav sorularını hazırlarken de zümre olarak ortak bir soru havuzu oluşturalım.`
        }))
    },
    // 6. Diğer zümreler
    {
        agenda: "Diğer zümre öğretmenleriyle yapılacak iş birliği",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Disiplinler arası projeler, ortak etkinlikler ve müfredat senkronizasyonu üzerine bir planlama.`,
            content: `{baskan}: {ders} dersini diğer derslerle nasıl daha etkili bir şekilde ilişkilendirebiliriz? Disiplinler arası iş birliği için önerileriniz var mı?\n{katilimci1}: Matematik zümresi ile {ders} dersindeki formüllerin ve hesaplamaların pekiştirilmesi için ortak bir çalışma yapabiliriz. Edebiyat zümresi ile de bilim insanlarının hayatını konu alan metinler okutabiliriz.\n{baskan}: Harika fikirler. Bu dönem en az bir tane disiplinler arası proje hedefi koyalım ve ilgili zümrelerle en kısa zamanda bir araya gelerek planlamayı yapalım.`
        }))
    },
    // 7. Öğrenci sosyal ve kişilik hizmetleri
    {
        agenda: "Öğrenci sosyal ve kişilik hizmetleri kapsamında yapılacak çalışmalar",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Rehberlik servisi işbirliği, sosyal becerilerin geliştirilmesi ve değerler eğitimi üzerine bir beyin fırtınası.`,
            content: `{baskan}: Akademik başarının yanı sıra öğrencilerimizin sosyal ve kişilik gelişimlerini nasıl destekleyebiliriz? Rehberlik servisiyle iş birliği içinde neler yapabiliriz?\n{katilimci1}: Sınıf içinde grup çalışmaları ve rol oynama etkinlikleriyle iletişim ve empati becerilerini geliştirebiliriz. Ayrıca, {ders} dersiyle ilgili bilim insanlarının etik değerlerini ve çalışma prensiplerini konu alarak değerler eğitimine katkı sağlayabiliriz.\n{baskan}: Güzel. Belirli gün ve haftalarda {ders} ile ilgili panolar hazırlayarak ve sosyal sorumluluk projeleri geliştirerek de öğrencilerimizin bu yönlerini güçlendirebiliriz.`
        }))
    },
    // 8. Veli toplantıları
    {
        agenda: "Veli toplantıları ve velilerle iş birliği",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Veli katılımını artırma, etkili iletişim kurma ve beklentileri yönetme stratejileri.`,
            content: `{baskan}: Veli toplantılarımıza katılımın düşük olduğunu gözlemliyoruz. Velilerle iş birliğini nasıl daha verimli hale getirebiliriz?\n{katilimci1}: Toplantı saatlerini velilerin çalışma saatlerine göre ayarlamayı deneyebiliriz. Ayrıca, sadece öğrencinin olumsuz yönlerini değil, olumlu gelişimlerini de paylaşarak yapıcı bir iletişim kurmalıyız. {ders} dersinde evde yapabilecekleri basit etkinlikler önererek onları sürece dahil edebiliriz.\n{baskan}: Katılıyorum. Dönem başında velilere yönelik beklentilerimizi ve dersin işleyişini anlatan bir mektup hazırlayalım. Bu, iletişimi baştan güçlü kurmamızı sağlar.`
        }))
    },
    // 9. İş sağlığı ve güvenliği
    {
        agenda: "İş sağlığı ve güvenliği tedbirleri",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Laboratuvar, atölye ve sınıf içi güvenlik önlemlerinin gözden geçirilmesi.`,
            content: `{baskan}: Arkadaşlar, özellikle {ders} dersi uygulamalarında iş sağlığı ve güvenliği çok önemli. Laboratuvardaki malzemelerin kontrolü ve öğrencilerin uyması gereken kurallar konusunda bir hatırlatma yapmakta fayda var.\n{katilimci1}: Kesinlikle. Her deney öncesi güvenlik kurallarını tekrar hatırlatalım. Yangın söndürücü ve ilk yardım dolabının yerini ve kullanımını tüm öğrencilerin bildiğinden emin olalım. Eksik veya tehlikeli ekipmanları hemen idareye bildirelim.\n{baskan}: Tamamdır. Bu kuralları içeren bir talimatnameyi laboratuvarın görünür bir yerine asalım.`
        }))
    },
    // 10. Başarıyı artırma
    {
        agenda: "Öğrenci başarısını artırmaya yönelik alınacak tedbirler",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Destekleme ve yetiştirme kursları, birebir etütler ve farklılaştırılmış ödevlendirme yöntemleri.`,
            content: `{baskan}: {ders} dersinde başarıyı artırmak için bu dönem ne gibi ek tedbirler alabiliriz?\n{katilimci1}: Konuları anlamakta zorlanan öğrenciler için okul sonrası etüt saatleri veya destekleme ve yetiştirme kursları planlayabiliriz. Başarılı öğrenciler için ise onları daha da ileri taşıyacak TÜBİTAK gibi proje yarışmalarına yönlendirebiliriz. Farklılaştırılmış ödevlendirme de her öğrencinin kendi seviyesinde ilerlemesine yardımcı olacaktır.\n{baskan}: Çok mantıklı. Bu planlamayı yapmak için rehberlik servisiyle birlikte çalışarak risk grubundaki öğrencileri ve ileri seviyedeki öğrencileri belirleyelim.`
        }))
    },
    // 11. Milli ve manevi değerler
    {
        agenda: "Milli ve manevi değerlerin öğrencilere kazandırılması",
        scenarios: Array(10).fill(null).map((_, i) => ({
            description: `Senaryo ${i + 1}: Ders içeriğiyle milli ve manevi değerlerin nasıl ilişkilendirileceği üzerine bir tartışma.`,
            content: `{baskan}: Değerli arkadaşlar, öğretim programımızda yer alan kök değerleri {ders} dersiyle nasıl daha etkili bir şekilde ilişkilendirebiliriz?\n{katilimci1}: Örneğin, {ders} alanında önemli buluşlara imza atmış Aziz Sancar gibi Türk-İslam bilim insanlarının hayatlarını ve çalışmalarını inceleyebiliriz. Bu, öğrencilerimize hem bilimi sevdirir hem de vatanseverlik ve çalışma ahlakı gibi değerleri kazandırır.\n{baskan}: Çok güzel bir yaklaşım. Ayrıca, ders içinde adalet, sorumluluk, dürüstlük gibi değerleri grup çalışmalarında ve proje değerlendirmelerinde ön planda tutarak bu değerleri yaşayarak öğrenmelerini sağlayabiliriz.`
        }))
    },
    // 12. Dilek, temenniler ve kapanış
    {
        agenda: "Dilek, temenniler ve kapanış",
        scenarios: Array(10).fill({
            description: "Toplantının sonlandırılması, iyi dileklerin sunulması.",
            content: `{baskan}: Gündemimizdeki tüm maddeleri görüştük. Başka söz almak isteyen veya dilek ve temennilerini iletmek isteyen var mı?\n{katilimci1}: Verimli bir toplantı oldu, teşekkür ederiz.\n{baskan}: Ben de katılımınız ve değerli görüşleriniz için hepinize teşekkür ediyorum. Yeni eğitim-öğretim döneminin hepimiz için başarılı ve sağlıklı geçmesini dilerim. Toplantıyı sonlandırıyorum.`
        })
    }
];

export const VARSAYILAN_KARARLAR: string[] = [
    "{ders} dersinde müfredatın zamanında tamamlanması için yıllık plana sadık kalınmasına,",
    "Öğrenci seviyelerindeki farklılıklar göz önünde bulundurularak farklılaştırılmış öğretim metotlarının kullanılmasına,",
    "Derslerde teknolojik araçlardan (EBA, akıllı tahta, simülasyonlar) daha etkin bir şekilde yararlanılmasına,",
    "Öğrenci başarısını ölçmek için yazılı sınavların yanı sıra proje, performans görevi ve derse katılım gibi farklı ölçütlerin de kullanılmasına,",
    "Özellikle Matematik ve Türkçe zümreleri ile disiplinler arası iş birliği yapılmasına,",
    "Veli toplantılarına katılımı artırmak için velilerle iletişimin güçlendirilmesine ve toplantı saatlerinin velilere de danışılarak belirlenmesine,",
    "Laboratuvar ve atölye kullanımında iş sağlığı ve güvenliği kurallarına titizlikle uyulmasına,",
    "Başarıyı artırmak amacıyla ihtiyacı olan öğrenciler için destekleme ve yetiştirme kursları açılması konusunda okul idaresiyle görüşülmesine,",
    "Ders konuları işlenirken milli ve manevi değerlere (vatanseverlik, sorumluluk, dürüstlük vb.) vurgu yapılmasına,",
    "Bir sonraki zümre toplantısının dönem sonunda yapılmasına karar verilmiştir."
];
