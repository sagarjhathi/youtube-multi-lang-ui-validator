import { checkLanguage, summarize, type LanguageCheck } from './languageDetector.mts';

// Text = YouTube sidebar/menu labels copied from the screenshots. Expected = base language code.
const samples = [
  { name: 'Afrikaans',            expected: 'af', text: "Tuis Kortvideo's Intekeninge Myne Geskiedenis Musiek Flieks Regstreeks YouTube Premium YouTube Music YouTube Kids Instellings Aangeegeskiedenis Hulp Stuur terugvoer" },
  { name: 'Azərbaycan',           expected: 'az', text: 'Ev Shorts Abunəliklər Siz Tarixçə Musiqi Filmlər Canlı YouTube Premium YouTube Music YouTube Kids Ayarlar Xəbər tarixçəsi Yardım Rəy göndərin' },
  { name: 'Bahasa Indonesia',     expected: 'id', text: 'Beranda Shorts Subscription Anda Histori Musik Film Live YouTube Premium YouTube Music YouTube Kids Setelan Histori laporan Bantuan Kirim masukan' },
  { name: 'Bosanski',             expected: 'bs', text: 'Početna stranica Shorts Pretplate Vi Historija Muzika Filmovi Uživo YouTube Premium YouTube Music YouTube Kids Postavke Historija prijava Pomoć Pošaljite povratne informacije' },
  { name: 'Català',               expected: 'ca', text: "Inici YouTube Shorts Subscripcions Tu Historial Música Pel·lícules En directe YouTube Premium YouTube Music YouTube Kids Configuració Historial d'informes Ajuda Envia suggeriments" },
  { name: 'Dansk',                expected: 'da', text: 'Start Shorts Abonnementer Dig Historik Musik Film Live YouTube Premium YouTube Music YouTube Kids Indstillinger Rapporteringshistorik Hjælp Send feedback' },
  { name: 'Deutsch',              expected: 'de', text: 'Startseite Shorts Abos Mein YouTube Verlauf Musik Filme Live YouTube Premium YouTube Music YouTube Kids Einstellungen Meldeverlauf Hilfe Feedback senden' },
  { name: 'Eesti',                expected: 'et', text: 'Avaleht Shorts Tellimused Teie Ajalugu Muusika Filmid Otse YouTube Premium YouTube Music YouTube Kids Seaded Teavituste ajalugu Abi Tagasiside saatmine' },
  { name: 'English (India)',      expected: 'en', text: 'Home Shorts Subscriptions You History Shopping Music Films Live YouTube Premium YouTube Music YouTube Kids Settings Report history Help Send feedback' },
  { name: 'English (UK)',         expected: 'en', text: 'Home Shorts Subscriptions You History Shopping Music Films Live YouTube Premium YouTube Music YouTube Kids Settings Report history Help Send feedback' },
  { name: 'English (US)',         expected: 'en', text: 'Home Shorts Subscriptions You History Shopping Music Movies Live YouTube Premium YouTube Music YouTube Kids Settings Report history Help Send feedback' },
  { name: 'Español (España)',     expected: 'es', text: 'Inicio Suscripciones Tú Historial Música Películas En directo YouTube Premium YouTube Music YouTube Kids Configuración Historial de denuncias Ayuda Enviar sugerencias' },
  { name: 'Español (Latinoamérica)', expected: 'es', text: 'Principal Shorts Suscripciones Tú Historial Música Películas En vivo YouTube Premium YouTube Music YouTube Kids Configuración Historial de denuncias Ayuda Enviar comentarios' },
  { name: 'Español (US)',         expected: 'es', text: 'Principal Shorts Suscripciones Tú Historial Música Películas En vivo YouTube Premium YouTube Music YouTube Kids Configuración Historial de denuncias Ayuda Enviar comentarios' },
  { name: 'Euskara',              expected: 'eu', text: 'Orri nagusia Shorts Harpidetzak Zu Historia Musika Filmak Zuzenean YouTube Premium YouTube Music YouTube Kids Ezarpenak Salaketa-historia Laguntza Bidali oharrak' },
  { name: 'Français',             expected: 'fr', text: 'Accueil Shorts Abonnements Vous Historique Musique Films Direct YouTube Premium YouTube Music YouTube Kids Paramètres Historique des signalements Aide Envoyer des commentaires' },
  { name: 'Français (Canada)',    expected: 'fr', text: 'Accueil Shorts Abonnements Vous Historique Musique Films Jeux vidéo YouTube Premium YouTube Music YouTube Kids Paramètres Historique des rapports Aide Envoyer des commentaires' },
  { name: 'Hrvatski',             expected: 'hr', text: 'Početna Shorts Pretplate Moje Povijest Glazba Filmovi Uživo YouTube Premium YouTube Music YouTube Kids Postavke Povijest prijava Pomoć Slanje povratnih informacija' },
  { name: 'Íslenska',             expected: 'is', text: 'Heim Shorts Áskriftir Þú Ferill Tónlist Kvikmyndir Í beinni YouTube Premium YouTube Music YouTube Kids Stillingar Tilkynningaferill Hjálp Senda inn ábendingu' },
  { name: 'Italiano',             expected: 'it', text: 'Home Shorts Iscrizioni Tu Cronologia Musica Film Live YouTube Premium YouTube Music YouTube Kids Impostazioni Cronologia segnalazioni Guida Invia feedback' },
  { name: 'Latviešu valoda',      expected: 'lv', text: 'Sākums Shorts Abonementi Jūs Vēsture Mūzika Filmas Tiešraide YouTube Premium YouTube Music YouTube Kids Iestatījumi Ziņošanas vēsture Palīdzība Sūtīt atsauksmes' },
  { name: 'Lietuvių',             expected: 'lt', text: 'Pagrindinis Shorts Prenumeratos Jūs Istorija Muzika Filmai Tiesiogiai YouTube Premium YouTube Music YouTube Kids Nustatymai Pranešimų istorija Pagalba Siųsti atsiliepimą' },
  { name: 'Magyar',               expected: 'hu', text: 'Kezdőlap Shorts Feliratkozások Te Előzmények Zene Filmek Élő YouTube Premium YouTube Music YouTube Kids Beállítások Bejelentési előzmények Súgó Visszajelzés küldése' },
  { name: 'Nederlands',           expected: 'nl', text: 'Home Shorts Abonnementen Jij Geschiedenis Muziek Films Live YouTube Premium YouTube Music YouTube Kids Instellingen Rapportagegeschiedenis Hulp Feedback sturen' },
  { name: 'Polski',               expected: 'pl', text: 'Główna Shorts Subskrypcje Ty Historia Muzyka Filmy Na żywo YouTube Premium YouTube Music YouTube Kids Ustawienia Historia zgłoszeń Pomoc Prześlij opinię' },
  { name: 'Português',            expected: 'pt', text: 'Início Shorts Subscrições Eu Histórico Música Filmes Em direto YouTube Premium YouTube Music YouTube Kids Definições Histórico de denúncias Ajuda Enviar feedback' },
  { name: 'Português (Brasil)',   expected: 'pt', text: 'Início Shorts Inscrições Você Histórico Música Filmes Ao vivo YouTube Premium YouTube Music YouTube Kids Configurações Histórico de denúncias Ajuda Enviar feedback' },
  { name: 'Shqip',                expected: 'sq', text: 'Faqja e parë Shorts Abonimet Ti Historiku Muzikë Filma Drejtpërdrejt YouTube Premium YouTube Music YouTube Kids Cilësimet Historiku i raportimeve Ndihmë Dërgo koment' },
  { name: 'Slovenščina',          expected: 'sl', text: 'Domača stran Kratki videoposnetki Naročnine Vi Zgodovina Glasba Filmi V živo YouTube Premium YouTube Music YouTube Kids Nastavitve Zgodovina poročil Pomoč Pošlji povratne informacije' },
  { name: 'Suomi',                expected: 'fi', text: 'Koti Shorts Tilaukset Sinä Historia Musiikki Elokuvat Livetapahtumat YouTube Premium YouTube Music YouTube Kids Asetukset Ilmoitushistoria Ohje Lähetä palautetta' },
  { name: 'Svenska',              expected: 'sv', text: 'Hem Shorts Prenumerationer Ditt YouTube Historik Musik Filmer Live YouTube Premium YouTube Music YouTube Kids Inställningar Rapporthistorik Hjälp Skicka feedback' },
  { name: 'Tiếng Việt',           expected: 'vi', text: 'Trang chủ Shorts Kênh đăng ký Bạn Video đã xem Âm nhạc Phim ảnh Trực tiếp YouTube Premium YouTube Music YouTube Kids Cài đặt Nhật ký báo cáo Trợ giúp Gửi ý kiến phản hồi' },
  { name: 'Türkçe',               expected: 'tr', text: 'Ana Sayfa Shorts Abonelikler Siz Geçmiş Müzik Filmler Canlı YouTube Premium YouTube Music YouTube Kids Ayarlar İçerik bildirme geçmişi Yardım Geri bildirim gönder' },
  { name: 'Беларуская',           expected: 'be', text: 'Галоўная старонка Shorts Падпіскі Вы Гісторыя Музыка Фільмы У жывым эфіры YouTube Premium YouTube Music YouTube Kids Налады Гісторыя скаргаў Даведка Адправіць водгук' },
  { name: 'Български',            expected: 'bg', text: 'Начало Shorts Абонаменти Вие История Музика Филми На живо YouTube Premium YouTube Music YouTube Kids Настройки Подадени сигнали Помощ Изпращане на отзиви' },
  { name: 'Русский',              expected: 'ru', text: 'Главная Shorts Подписки Вы История Музыка Фильмы Трансляции YouTube Premium YouTube Music YouTube Детям Настройки Жалобы Справка Отправить отзыв' },
  { name: 'Українська',           expected: 'uk', text: 'Головна YouTube Shorts Підписки Ви Історія Музика Фільми Прямі трансляції YouTube Premium YouTube Music YouTube Kids Налаштування Історія скарг Довідка Надіслати відгук' },
  { name: 'Ελληνικά',             expected: 'el', text: 'Αρχική Shorts Εγγραφές Εσείς Ιστορικό Μουσική Ταινίες Live YouTube Premium YouTube Music YouTube Kids Ρυθμίσεις Ιστορικό αναφορών Βοήθεια Αποστολή σχολίων' },
  { name: 'Հայերեն',              expected: 'hy', text: 'Սկիզբ Shorts Բաժանորդագրություններ Դուք Պատմություն Երաժշտություն Ֆիլմեր Ուղիղ եթեր YouTube Premium YouTube Music YouTube Kids Կարգավորումներ Բողոքների պատմություն Օգնություն Կարծիք ուղարկել' },
  { name: 'עברית',                expected: 'he', text: 'דף הבית Shorts מינויים הדף שלי היסטוריה מוזיקה סרטים שידור חי YouTube Premium YouTube Music YouTube Kids הגדרות היסטוריית הדיווחים עזרה שליחת משוב' },
  { name: 'العربية',              expected: 'ar', text: 'الصفحة الرئيسية Shorts الاشتراكات أنت السجلّ موسيقى أفلام بث مباشر YouTube Premium YouTube Music YouTube Kids الإعدادات سجلّ الإبلاغ عن المحتوى مساعدة إرسال ملاحظات' },
  { name: 'فارسی',                expected: 'fa', text: 'صفحه اصلی Shorts اشتراک‌ها شما سابقه موسیقی فیلم‌ها زنده YouTube Premium YouTube Music YouTube Kids تنظیمات سابقه گزارش راهنما ارسال بازخورد' },
  { name: 'हिन्दी',                expected: 'hi', text: 'होम पेज Shorts सदस्यता आप देखे गए वीडियो संगीत फ़िल्में लाइव YouTube Premium YouTube Music YouTube Kids सेटिंग शिकायत का डेटा सहायता सुझाव भेजें' },
  { name: 'বাংলা',                expected: 'bn', text: 'হোম Shorts সাবস্ক্রিপশন আপনি ইতিহাস মিউজিক সিনেমা লাইভ YouTube Premium YouTube Music YouTube Kids সেটিংস অভিযোগ জানানোর ইতিহাস সহায়তা মতামত জানান' },
  { name: 'ਪੰਜਾਬੀ',               expected: 'pa', text: 'ਹੋਮ Shorts ਸਬਸਕ੍ਰਿਪਸ਼ਨਾਂ ਤੁਸੀਂ ਇਤਿਹਾਸ ਸੰਗੀਤ ਫ਼ਿਲਮਾਂ ਲਾਈਵ YouTube Premium YouTube Music YouTube Kids ਸੈਟਿੰਗਾਂ ਰਿਪੋਰਟ ਸੰਬੰਧੀ ਇਤਿਹਾਸ ਮਦਦ ਵਿਚਾਰ ਭੇਜੋ' },
  { name: 'ગુજરાતી',              expected: 'gu', text: 'હોમ Shorts સબ્સ્ક્રિપ્શન તમે ઇતિહાસ સંગીત મૂવી લાઇવ YouTube Premium YouTube Music YouTube Kids સેટિંગ રિપોર્ટનો ઇતિહાસ સહાય પ્રતિસાદ મોકલો' },
  { name: 'தமிழ்',                expected: 'ta', text: 'முகப்பு Shorts சந்தாக்கள் நீங்கள் இதுவரை பார்த்தவை இசை திரைப்படங்கள் நேரலை YouTube Premium YouTube Music YouTube Kids அமைப்புகள் புகார் வரலாறு உதவி கருத்து தெரிவி' },
  { name: 'తెలుగు',               expected: 'te', text: 'మొదటి ట్యాబ్ Shorts సబ్‌స్క్రిప్షన్‌లు ఖాతా హిస్టరీ మ్యూజిక్ సినిమాలు లైవ్ YouTube Premium YouTube Music YouTube Kids సెట్టింగ్‌లు రిపోర్ట్‌ల హిస్టరీ సహాయం ఫీడ్‌బ్యాక్ పంపండి' },
  { name: '中文 (简体)',           expected: 'zh', text: '首页 Shorts 订阅 我 历史记录 音乐 电影 直播 YouTube Premium YouTube Music YouTube Kids 设置 举报记录 帮助 发送反馈' },
  { name: '中文 (繁體)',           expected: 'zh', text: '首頁 Shorts 訂閱內容 個人中心 觀看記錄 音樂 電影 直播 YouTube Premium YouTube Music YouTube Kids 設定 檢舉記錄 說明 提供意見' },
  { name: '中文 (香港)',           expected: 'zh', text: '主頁 Shorts 訂閱項目 個人中心 記錄 音樂 電影 直播 YouTube Premium YouTube Music YouTube Kids 設定 舉報記錄 說明 傳送意見' },
  { name: '日本語',               expected: 'ja', text: 'ホーム ショート 登録チャンネル マイページ 履歴 音楽 映画 ライブ YouTube Premium YouTube Music YouTube Kids 設定 報告履歴 ヘルプ フィードバックを送信' },
  { name: '한국어',               expected: 'ko', text: '홈 Shorts 구독 내 페이지 기록 음악 영화 라이브 YouTube Premium YouTube Music YouTube Kids 설정 신고 기록 고객센터 의견 보내기' },
];

const checks: (LanguageCheck & { language: string })[] = samples.map((sample) => ({
  language: sample.name,
  ...checkLanguage(sample.text, sample.expected),
}));

const summary = summarize(checks);

console.log('\nSummary');
console.table([
  { result: 'PASS', checks: summary.PASS },
  { result: 'FAIL', checks: summary.FAIL },
  { result: 'FAIL (language not supported by eld)', checks: summary.FAIL_UNSUPPORTED },
  { result: 'TOTAL', checks: summary.TOTAL },
]);

console.log('\nChecks that did not pass');
console.table(
  checks
    .filter((check) => check.status !== 'PASS')
    .map((check) => ({ language: check.language, expected: check.expectedName, detected: check.detectedName }))
);
