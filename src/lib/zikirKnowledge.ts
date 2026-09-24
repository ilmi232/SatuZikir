import type { GeneratedCampaign } from '@/types';

// Basis data zikir terverifikasi untuk mesin cadangan saat AI tidak tersedia.
// Tiap entri membangun campaign dari target yang diminta admin.

const fmt = (n: number) => n.toLocaleString('id-ID');

interface ZikirTemplate {
  defaultTarget: number;
  build: (t: number) => GeneratedCampaign;
}

export const ZIKIR_TEMPLATES = {
  ikhlas: {
    defaultTarget: 1000,
    build: (t) => ({
      title: `Surah Al-Ikhlas ${fmt(t)}x Peneguh Tauhid & Pintu Rezeki`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ. ٱللَّهُ ٱلصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
      latin_text: 'Qul huwallahu ahad. Allahus samad. Lam yalid walam yuulad. Walam yakul lahu kufuwan ahad.',
      translation_text: 'Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tiada pula diperanakkan. Dan tidak ada seorangpun yang setara dengan Dia.',
      description: 'Membaca Surah Al-Ikhlas sebanding dengan sepertiga Al-Qur\'an. Mari khatamkan bersama ribuan jamaah untuk memohon ampunan, melapangkan rezeki, dan meneguhkan tauhid.'
    }),
  },
  kursi: {
    defaultTarget: 313,
    build: (t) => ({
      title: `Ayat Kursi ${fmt(t)}x Benteng Gaib & Perlindungan`,
      target_count: t,
      category: 'tolak-bala',
      arabic_text: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
      latin_text: 'Allahu laa ilaaha illaa huwal hayyul qayyuum, laa ta\'khudzuhuu sinatuw walaa nauum...',
      translation_text: 'Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)...',
      description: 'Pemimpin segala ayat Al-Qur\'an. Dibaca berjamaah sebagai perisai dari segala kejahatan, penolak bala, dan pelindung keluarga serta harta benda dari gangguan jin dan syaitan.'
    }),
  },
  munjiyat: {
    defaultTarget: 1000,
    build: (t) => ({
      title: `Shalawat Munjiyat ${fmt(t)}x Penyelamat Kesulitan`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلاَةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَهْوَالِ وَالْاٰفَاتِ، وَتَقْضِيْ لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ...',
      latin_text: 'Allahumma shalli \'ala sayyidina Muhammadin shalatan tunjina biha min jami\'il ahwali wal afat...',
      translation_text: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, yang dengan shalawat itu Engkau menyelamatkan kami dari semua keadaan yang menakutkan dan dari semua cobaan...',
      description: 'Shalawat penyelamat yang diturunkan melalui mimpi orang shaleh saat badai lautan. Sangat mustajab dibaca berulang untuk menyelamatkan dari krisis, hutang, dan musibah besar.'
    }),
  },
  tahlil: {
    defaultTarget: 70000,
    build: (t) => ({
      title: `Tahlil Akbar ${fmt(t)}x Kunci Pintu Surga`,
      target_count: t,
      category: 'ramadan',
      arabic_text: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
      latin_text: 'Laa ilaaha illallah',
      translation_text: 'Tiada Tuhan yang berhak disembah selain Allah.',
      description: 'Seutama-utama zikir adalah Laa ilaaha illallah. Mari bersama menghimpun kalimat tauhid 70.000x sebagai pembebas diri dan keluarga dari api neraka (fida\').'
    }),
  },
  sayyidul: {
    defaultTarget: 100,
    build: (t) => ({
      title: `Sayyidul Istighfar ${fmt(t)}x Penghapus Segala Dosa`,
      target_count: t,
      category: 'ramadan',
      arabic_text: 'اَللَّهُمَّ أَنْتَ رَبِّيْ لَا إِلَـٰهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ...',
      latin_text: 'Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa \'abduka...',
      translation_text: 'Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah selain Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu...',
      description: 'Penghulu segala istighfar. Barangsiapa membacanya dengan yakin di siang hari lalu wafat, ia penghuni surga. Mari amalkan bersama.'
    }),
  },
  fatih: {
    defaultTarget: 1000,
    build: (t) => ({
      title: `Shalawat Fatih ${fmt(t)}x Pembuka Pintu Kebaikan`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ عَلى سَيِّدِنَا مُحَمَّدٍ الفاتِحِ لِمَا أُغْلِقَ و الخَاتِمِ لِمَا سَبَقَ نَاصِرِ الحَقِّ بَالحَقَّ و الهَادِي إلى صِرَاطِكَ المُسْتَقِيمِ...',
      latin_text: 'Allahumma shalli \'ala sayyidina Muhammadinil faatihi limaa ughliqa wal khaatimi limaa sabaqa...',
      translation_text: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, pembuka apa yang terkunci, penutup kenabian sebelumnya, penolong kebenaran dengan kebenaran...',
      description: 'Shalawat yang sangat dahsyat untuk membuka jalan buntu, melancarkan rezeki yang seret, dan menembus kesulitan hidup.'
    }),
  },
  jibril: {
    defaultTarget: 10000,
    build: (t) => ({
      title: `Shalawat Jibril ${fmt(t)}x Penarik Pintu Rezeki`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'صَلَّى ٱللَّهُ عَلَىٰ مُحَمَّدٍ',
      latin_text: 'Shallallahu \'ala Muhammad',
      translation_text: 'Semoga Allah melimpahkan shalawat atas Nabi Muhammad.',
      description: 'Shalawat Jibril dikenal luas sebagai amalan mustajab pelancar rezeki dari arah yang tak disangka-sangka. Sangat ringan di lisan, namun sangat berat timbangannya.'
    }),
  },
  yunus: {
    defaultTarget: 1000,
    build: (t) => ({
      title: `Doa Nabi Yunus ${fmt(t)}x Pelepas Kesedihan & Musibah`,
      target_count: t,
      category: 'tolak-bala',
      arabic_text: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
      latin_text: 'Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin',
      translation_text: 'Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim.',
      description: 'Doa agung Nabi Yunus AS saat berada di dalam perut ikan paus. Sangat dahsyat untuk melepaskan diri dari kesedihan mendalam, hutang, dan kesulitan yang mengimpit.'
    }),
  },
  lathif: {
    defaultTarget: 129,
    build: (t) => ({
      title: `Ya Lathif ${fmt(t)}x Pelembut Hati & Takdir`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'يَا لَطِيفُ',
      latin_text: 'Yaa Lathiif',
      translation_text: 'Wahai Yang Maha Lembut.',
      description: 'Asmaul Husna Al-Lathiif. Diamalkan bersama untuk melembutkan hati yang keras, melancarkan urusan yang rumit, dan memohon agar takdir Allah datang dengan kelembutan.'
    }),
  },
  malaikat: {
    defaultTarget: 100,
    build: (t) => ({
      title: `Tasbih Malaikat ${fmt(t)}x Pembuka Pintu Rezeki`,
      target_count: t,
      category: 'harian',
      arabic_text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ العَظِيْمِ أَسْتَغْفِرُ اللَّهَ',
      latin_text: 'Subhanallah wa bihamdihi subhanallahil \'adzim astaghfirullah',
      translation_text: 'Maha Suci Allah dengan segala puji bagi-Nya, Maha Suci Allah Yang Maha Agung, aku memohon ampun kepada Allah.',
      description: 'Tasbih Malaikat yang sangat dianjurkan dibaca 100x antara azan dan iqamah Subuh. Keutamaannya menarik rezeki yang tak terduga dan mempermudah segala urusan.'
    }),
  },
  kabir: {
    defaultTarget: 232,
    build: (t) => ({
      title: `Asmaul Husna Ya Kabir ${fmt(t)}x Pelimpah Rezeki & Kemuliaan`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'يَا كَبِيرُ',
      latin_text: 'Yaa Kabiir',
      translation_text: 'Wahai Yang Maha Besar.',
      description: 'Amalan Asmaul Husna yang diniatkan untuk membukakan pintu rezeki yang melimpah serta membuka jalan-jalan kemuliaan, kehormatan, dan derajat yang tinggi.'
    }),
  },
  fatihah: {
    defaultTarget: 100,
    build: (t) => ({
      title: `Wirid Surah Al-Fatihah ${fmt(t)}x Induk Segala Doa`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ. ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ. ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ. مَـٰلِكِ يَوْمِ ٱلدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ. صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      latin_text: 'Bismillahir-rahmanir-rahim. Alhamdu lillahi rabbil-\'alamin. Ar-rahmanir-rahim. Maliki yaumid-din. Iyyaka na\'budu wa iyyaka nasta\'in. Ihdinas-siratal-mustaqim. Siratal-lazina an\'amta \'alaihim, ghairil-maghdubi \'alaihim wa lad-dallin.',
      translation_text: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam. Yang Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya, bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
      description: 'Ummul Qur\'an, induk dari segala doa. Diamalkan secara rutin sebagai sarana keberkahan hidup, kemudahan segala urusan, penyembuhan, dan kelapangan rezeki.'
    }),
  },
  nariyah: {
    defaultTarget: 4444,
    build: (t) => ({
      title: `Shalawat Nariyah ${fmt(t)}x untuk Kelapangan Hajat & Kesembuhan`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَمًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ',
      latin_text: 'Allahumma shalli shalatan kamilatan wa sallim salaman tamman \'ala sayyidina Muhammadinilladzi tanhallu bihil \'uqadu wa tanfariju bihil kurabu wa tuqdha bihil hawa-iju wa tunalu bihir ragha-ibu wa husnul khawatimi wa yustasqal ghamamu biwajhihil karim wa \'ala aalihi wa shahbihi fi kulli lamhatin wa nafasin bi\'adadi kulli ma\'lumin lak.',
      translation_text: 'Ya Allah, limpahkanlah shalawat yang sempurna dan keselamatan yang utuh kepada junjungan kami Nabi Muhammad, yang melaluinya terurai segala ikatan, terangkat segala duka, terpenuhi segala hajat, tercapai segala keinginan dan husnul khatimah, serta diturunkannya hujan dari awan berkat wajahnya yang mulia. Dan limpahkan juga kepada keluarga dan sahabatnya, di setiap kedipan mata dan hembusan nafas, sebanyak pengetahuan yang Engkau miliki.',
      description: 'Menghimpun ribuan butir Shalawat Nariyah bersama jamaah se-Nusantara. Niatkan semata memohon ridha Allah SWT, kelapangan urusan, dan kesembuhan bagi saudara-saudara kita yang sedang diuji sakit.'
    }),
  },
  hasbunallah: {
    defaultTarget: 10000,
    build: (t) => ({
      title: `Hasbunallah Wa Ni'mal Wakil ${fmt(t)}x Tolak Bala & Keselamatan Umat`,
      target_count: t,
      category: 'tolak-bala',
      arabic_text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ',
      latin_text: 'Hasbunallah wa ni’mal wakiil, ni’mal mawla wa ni’man nashiir',
      translation_text: 'Cukuplah Allah menjadi penolong kami dan Allah adalah sebaik-baik pelindung, sebaik-baik pemimpin, dan sebaik-baik penolong.',
      description: 'Munajat akbar tolak bala dan musibah. Bersama memperteguh tawakkal kepada Allah Sang Maha Kuasa agar senantiasa menjaga negeri dan keluarga kita dari marabahaya.'
    }),
  },
  istighfar: {
    defaultTarget: 100000,
    build: (t) => ({
      title: `Istighfar Akbar ${fmt(t)}x Pelebur Dosa & Pembuka Pintu Berkah`,
      target_count: t,
      category: 'ramadan',
      arabic_text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
      latin_text: 'Astaghfirullahal ‘adziim alladzii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilaih',
      translation_text: 'Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan selain Dia yang Maha Hidup lagi terus-menerus mengurus makhluk-Nya, dan aku bertaubat kepada-Nya.',
      description: 'Membersihkan batin dan memohon ampunan Allah SWT bersama ribuan jamaah. Istighfar adalah kunci diturunkannya hujan rahmat, keturunan yang saleh, dan kelapangan rezeki yang tak disangka-sangka.'
    }),
  },
  tibbil: {
    defaultTarget: 1000,
    build: (t) => ({
      title: `Shalawat Tibbil Qulub ${fmt(t)}x Penawar Jiwa & Kesembuhan Raga`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا، وَعَافِيَةِ الأَبْدَانِ وَشِفَائِهَا، وَنُورِ الأَبْصَارِ وَضِيَائِهَا، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
      latin_text: 'Allahumma shalli ‘ala sayyidina Muhammadin thibbil quluubi wa dawa-ihaa, wa ‘aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa, wa ‘ala aalihi wa shahbihi wa sallim',
      translation_text: 'Ya Allah, curahkanlah rahmat kepada junjungan kami Nabi Muhammad sebagai obat hati dan penawarnya, penyehat badan dan kesembuhannya, serta cahaya penglihatan dan sinarnya.',
      description: 'Majelis zikir syifa mengetuk pintu kesembuhan jasmani dan ketenangan rohani. Dipersembahkan bagi jamaah dan keluarga yang merindukan penawar dari segala penyakit.'
    }),
  },
  hauqalah: {
    defaultTarget: 10000,
    build: (t) => ({
      title: `Hauqalah ${fmt(t)}x Perbendaharaan Surga Peneguh Jiwa`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
      latin_text: 'Laa hawla wa laa quwwata illaa billaahil ‘aliyyil ‘adziim',
      translation_text: 'Tiada daya dan tiada kekuatan melainkan semata-mata dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.',
      description: 'Melepaskan rasa putus asa dan kepasrahan semu kepada kekuatan manusia. Satukan ribuan ketukan tasbih mengaku kelemahan diri di hadapan Sang Pemilik Kehendak.'
    }),
  },
  shalawatNabi: {
    defaultTarget: 1000,
    build: (t) => ({
      title: `Shalawat Nabi ${fmt(t)}x Pembawa Rahmat & Syafaat`,
      target_count: t,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ',
      latin_text: 'Allahumma shalli ‘ala sayyidina Muhammadin wa ‘ala aali sayyidina Muhammad',
      translation_text: 'Ya Allah, limpahkanlah shalawat dan salam atas junjungan kami Nabi Muhammad beserta segenap keluarga junjungan kami Nabi Muhammad.',
      description: `Amalan pembacaan shalawat sebanyak ${fmt(t)}x untuk mengharap syafaat Baginda Nabi SAW dan meraih keberkahan hidup.`
    }),
  },
} satisfies Record<string, ZikirTemplate>;

type ZikirKey = keyof typeof ZIKIR_TEMPLATES;
type Rule = [(p: string) => boolean, ZikirKey];

const has = (...words: string[]) => (p: string) => words.some((w) => p.includes(w));

// Dicek hanya jika prompt menyebut shalawat, agar "shalawat ... rezeki" tidak jatuh ke entri lain.
const SHOLAWAT_RULES: Rule[] = [
  [has('nariyah', 'nariyyah'), 'nariyah'],
  [has('tibbil', 'thibbil'), 'tibbil'],
  [has('jibril'), 'jibril'],
  [has('munjiyat'), 'munjiyat'],
  [has('fatih'), 'fatih'],
];

// Urutan penting: kata kunci yang lebih spesifik harus dicek lebih dulu
// (mis. "fatihah" sebelum "fatih").
const GENERAL_RULES: Rule[] = [
  [has('ikhlas', 'ikhlash', 'ahad'), 'ikhlas'],
  [has('kursi'), 'kursi'],
  [has('munjiyat', 'selamat'), 'munjiyat'],
  [has('tahlil', 'lailahaillallah', 'laa ilaaha illallah'), 'tahlil'],
  [has('sayyidul', 'sayidul'), 'sayyidul'],
  [has('fatihah'), 'fatihah'],
  [has('fatih', 'pembuka'), 'fatih'],
  [has('jibril', 'rezeki'), 'jibril'],
  [has('yunus', 'sedih', 'dzun nun'), 'yunus'],
  [has('lathif', 'latif'), 'lathif'],
  [(p) => p.includes('malaikat') || (p.includes('subhanallah') && p.includes('astaghfirullah')), 'malaikat'],
  [has('kabir'), 'kabir'],
  [has('nariyah', 'nariyyah'), 'nariyah'],
  [has('hasbunallah', 'bala', 'bencana', 'lindung'), 'hasbunallah'],
  [has('istighfar', 'taubat', 'ampun'), 'istighfar'],
  [has('tibbil', 'thibbil', 'hati', 'sembuh'), 'tibbil'],
  [has('hawqalah', 'lahawla', 'laa hawla', 'kekuatan'), 'hauqalah'],
];

/** Ambil target dari prompt ("4.444x" -> 4444); null jika tidak disebut. */
function parseTarget(prompt: string): number | null {
  const match = prompt.match(/(\d[\d.,]*)\s*x?/i);
  if (!match) return null;
  const n = parseInt(match[1].replace(/[.,]/g, ''), 10);
  return !isNaN(n) && n > 0 ? n : null;
}

export function generateFallbackCampaign(prompt: string): GeneratedCampaign {
  const p = prompt.toLowerCase();
  const explicitTarget = parseTarget(prompt);
  const fromTemplate = (key: ZikirKey) => {
    const template: ZikirTemplate = ZIKIR_TEMPLATES[key];
    return template.build(explicitTarget ?? template.defaultTarget);
  };

  if (has('sholawat', 'shalawat', 'selawat')(p)) {
    const rule = SHOLAWAT_RULES.find(([test]) => test(p));
    return fromTemplate(rule ? rule[1] : 'shalawatNabi');
  }

  const rule = GENERAL_RULES.find(([test]) => test(p));
  if (rule) return fromTemplate(rule[1]);

  const target = explicitTarget ?? 1000;
  const cleanPrompt = prompt
    .replace(/^(buatkan|bikin|tolong|buat)\s+(saya\s+)?(kan\s+)?(campaign\s+)?/i, '')
    .trim();
  const titleText = cleanPrompt.length > 0 ? cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1) : 'Zikir & Doa Bersama';

  return {
    title: `${titleText} ${fmt(target)}x`,
    target_count: target,
    category: p.includes('bala') ? 'tolak-bala' : p.includes('hajat') ? 'syifa' : 'ramadan',
    arabic_text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    latin_text: 'Subhaanallaahi wa bihamdihii subhaanallaahil ‘adziim',
    translation_text: 'Maha Suci Allah dengan memuji-Nya, Maha Suci Allah Yang Maha Agung.',
    description: `Ikhtiar bersama jamaah se-Nusantara: "${prompt}". Mari himpun butir-butir tasbih penuh kekhusyukan hingga target tuntas diraih bersama.`,
  };
}
