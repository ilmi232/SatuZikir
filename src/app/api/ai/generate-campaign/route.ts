import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export interface GeneratedCampaign {
  title: string;
  target_count: number;
  category: 'syifa' | 'ramadan' | 'tolak-bala' | 'harian';
  arabic_text: string;
  latin_text: string;
  translation_text: string;
  description: string;
}

function generateFallbackCampaign(prompt: string): GeneratedCampaign {
  const p = prompt.toLowerCase();
  const numberMatch = prompt.match(/(\d[\d.,]*)\s*x?/i);
  let parsedTarget = 1000;
  if (numberMatch) {
    const rawNum = numberMatch[1].replace(/[.,]/g, '');
    const n = parseInt(rawNum, 10);
    if (!isNaN(n) && n > 0) parsedTarget = n;
  }

  // Shalawat Nabi Umum & Khusus
  if (p.includes('sholawat') || p.includes('shalawat') || p.includes('selawat')) {
    if (p.includes('nariyah') || p.includes('nariyyah')) {
      return {
        title: `Shalawat Nariyah ${parsedTarget.toLocaleString('id-ID')}x untuk Kelapangan Hajat & Kesembuhan`,
        target_count: parsedTarget || 4444,
        category: 'syifa',
        arabic_text: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَماً تَامّاً عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ...',
        latin_text: 'Allahumma shalli shalatan kaamilatan wa sallim salaaman taamman ‘ala sayyidina Muhammadinilladzi tanhallu bihil ‘uqadu...',
        translation_text: 'Ya Allah, limpahkanlah shalawat yang sempurna dan salam yang tuntas kepada junjungan kami Nabi Muhammad, yang dengannya terlepas segala ikatan...',
        description: 'Amalan pembuka jalan buntu, ikhtiar syifa, dan terkabulnya hajat besar bersama jamaah.'
      };
    }

    if (p.includes('tibbil') || p.includes('thibbil')) {
      return {
        title: `Shalawat Tibbil Qulub ${parsedTarget.toLocaleString('id-ID')}x Penawar Jiwa & Kesembuhan Raga`,
        target_count: parsedTarget || 1000,
        category: 'syifa',
        arabic_text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا، وَعَافِيَةِ الأَبْدَانِ وَشِفَائِهَا، وَنُورِ الأَبْصَارِ وَضِيَائِهَا، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
        latin_text: 'Allahumma shalli ‘ala sayyidina Muhammadin thibbil quluubi wa dawa-ihaa, wa ‘aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa, wa ‘ala aalihi wa shahbihi wa sallim',
        translation_text: 'Ya Allah, curahkanlah rahmat kepada junjungan kami Nabi Muhammad sebagai obat hati dan penawarnya, penyehat badan dan kesembuhannya, serta cahaya penglihatan dan sinarnya.',
        description: 'Majelis zikir syifa mengetuk pintu kesembuhan jasmani dan ketenangan rohani.'
      };
    }

    if (p.includes('jibril')) {
      return {
        title: `Shalawat Jibril ${parsedTarget.toLocaleString('id-ID')}x Penarik Pintu Rezeki`,
        target_count: parsedTarget || 10000,
        category: 'syifa',
        arabic_text: 'صَلَّى ٱللَّهُ عَلَىٰ مُحَمَّدٍ',
        latin_text: 'Shallallahu \'ala Muhammad',
        translation_text: 'Semoga Allah melimpahkan shalawat atas Nabi Muhammad.',
        description: 'Shalawat Jibril dikenal luas sebagai amalan mustajab pelancar rezeki dari arah yang tak disangka-sangka.'
      };
    }

    if (p.includes('munjiyat')) {
      return {
        title: `Shalawat Munjiyat ${parsedTarget.toLocaleString('id-ID')}x Penyelamat Kesulitan`,
        target_count: parsedTarget || 1000,
        category: 'syifa',
        arabic_text: 'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلاَةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَهْوَالِ وَالْاٰفَاتِ، وَتَقْضِيْ لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ...',
        latin_text: 'Allahumma shalli \'ala sayyidina Muhammadin shalatan tunjina biha min jami\'il ahwali wal afat...',
        translation_text: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, yang dengan shalawat itu Engkau menyelamatkan kami dari semua keadaan yang menakutkan...',
        description: 'Shalawat penyelamat dari krisis, hutang, dan musibah besar.'
      };
    }

    if (p.includes('fatih')) {
      return {
        title: `Shalawat Fatih ${parsedTarget.toLocaleString('id-ID')}x Pembuka Pintu Kebaikan`,
        target_count: parsedTarget || 1000,
        category: 'syifa',
        arabic_text: 'اللَّهُمَّ صَلِّ عَلى سَيِّدِنَا مُحَمَّدٍ الفاتِحِ لِمَا أُغْلِقَ و الخَاتِمِ لِمَا سَبَقَ نَاصِرِ الحَقِّ بَالحَقَّ و الهَادِي إلى صِرَاطِكَ المُسْتَقِيمِ...',
        latin_text: 'Allahumma shalli \'ala sayyidina Muhammadinil faatihi limaa ughliqa wal khaatimi limaa sabaqa...',
        translation_text: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, pembuka apa yang terkunci...',
        description: 'Shalawat untuk membuka jalan buntu dan menembus kesulitan hidup.'
      };
    }

    // Default Shalawat Nabi
    return {
      title: `Shalawat Nabi ${parsedTarget.toLocaleString('id-ID')}x Pembawa Rahmat & Syafaat`,
      target_count: parsedTarget,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ',
      latin_text: 'Allahumma shalli ‘ala sayyidina Muhammadin wa ‘ala aali sayyidina Muhammad',
      translation_text: 'Ya Allah, limpahkanlah shalawat dan salam atas junjungan kami Nabi Muhammad beserta segenap keluarga junjungan kami Nabi Muhammad.',
      description: `Amalan pembacaan shalawat sebanyak ${parsedTarget.toLocaleString('id-ID')}x untuk mengharap syafaat Baginda Nabi SAW dan meraih keberkahan hidup.`
    };
  }

  if (p.includes('ikhlas') || p.includes('ikhlash') || p.includes('ahad')) {
    return {
      title: `Surah Al-Ikhlas ${parsedTarget.toLocaleString('id-ID')}x Peneguh Tauhid & Pintu Rezeki`,
      target_count: parsedTarget || 1000,
      category: 'syifa',
      arabic_text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ. ٱللَّهُ ٱلصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
      latin_text: 'Qul huwallahu ahad. Allahus samad. Lam yalid walam yuulad. Walam yakul lahu kufuwan ahad.',
      translation_text: 'Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tiada pula diperanakkan. Dan tidak ada seorangpun yang setara dengan Dia.',
      description: 'Membaca Surah Al-Ikhlas sebanding dengan sepertiga Al-Qur\'an. Mari khatamkan bersama ribuan jamaah untuk memohon ampunan, melapangkan rezeki, dan meneguhkan tauhid.'
    };
  }

  if (p.includes('kursi') || p.includes('ayat kursi')) {
    return {
      title: `Ayat Kursi ${parsedTarget.toLocaleString('id-ID')}x Benteng Gaib & Perlindungan`,
      target_count: parsedTarget || 313,
      category: 'tolak-bala',
      arabic_text: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
      latin_text: 'Allahu laa ilaaha illaa huwal hayyul qayyuum, laa ta\'khudzuhuu sinatuw walaa nauum...',
      translation_text: 'Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)...',
      description: 'Pemimpin segala ayat Al-Qur\'an. Dibaca berjamaah sebagai perisai dari segala kejahatan, penolak bala, dan pelindung keluarga serta harta benda dari gangguan jin dan syaitan.'
    };
  }

  if (p.includes('munjiyat') || p.includes('selamat')) {
    return {
      title: `Shalawat Munjiyat ${parsedTarget.toLocaleString('id-ID')}x Penyelamat Kesulitan`,
      target_count: parsedTarget || 1000,
      category: 'syifa',
      arabic_text: 'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلاَةً تُنْجِيْنَا بِهَا مِنْ جَمِيْعِ الْأَهْوَالِ وَالْاٰفَاتِ، وَتَقْضِيْ لَنَا بِهَا جَمِيْعَ الْحَاجَاتِ...',
      latin_text: 'Allahumma shalli \'ala sayyidina Muhammadin shalatan tunjina biha min jami\'il ahwali wal afat...',
      translation_text: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, yang dengan shalawat itu Engkau menyelamatkan kami dari semua keadaan yang menakutkan dan dari semua cobaan...',
      description: 'Shalawat penyelamat yang diturunkan melalui mimpi orang shaleh saat badai lautan. Sangat mustajab dibaca berulang untuk menyelamatkan dari krisis, hutang, dan musibah besar.'
    };
  }

  if (p.includes('tahlil') || p.includes('lailahaillallah') || p.includes('laa ilaaha illallah')) {
    return {
      title: `Tahlil Akbar ${parsedTarget.toLocaleString('id-ID')}x Kunci Pintu Surga`,
      target_count: parsedTarget || 70000,
      category: 'ramadan',
      arabic_text: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ',
      latin_text: 'Laa ilaaha illallah',
      translation_text: 'Tiada Tuhan yang berhak disembah selain Allah.',
      description: 'Seutama-utama zikir adalah Laa ilaaha illallah. Mari bersama menghimpun kalimat tauhid 70.000x sebagai pembebas diri dan keluarga dari api neraka (fida\').'
    };
  }

  if (p.includes('sayyidul') || p.includes('sayidul')) {
    return {
      title: `Sayyidul Istighfar ${parsedTarget.toLocaleString('id-ID')}x Penghapus Segala Dosa`,
      target_count: parsedTarget || 100,
      category: 'ramadan',
      arabic_text: 'اَللَّهُمَّ أَنْتَ رَبِّيْ لَا إِلَـٰهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ...',
      latin_text: 'Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa anaa \'abduka...',
      translation_text: 'Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan yang berhak disembah selain Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu...',
      description: 'Penghulu segala istighfar. Barangsiapa membacanya dengan yakin di siang hari lalu wafat, ia penghuni surga. Mari amalkan bersama.'
    };
  }

  if (p.includes('fatih') || p.includes('pembuka')) {
    return {
      title: `Shalawat Fatih ${parsedTarget.toLocaleString('id-ID')}x Pembuka Pintu Kebaikan`,
      target_count: parsedTarget || 1000,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ عَلى سَيِّدِنَا مُحَمَّدٍ الفاتِحِ لِمَا أُغْلِقَ و الخَاتِمِ لِمَا سَبَقَ نَاصِرِ الحَقِّ بَالحَقَّ و الهَادِي إلى صِرَاطِكَ المُسْتَقِيمِ...',
      latin_text: 'Allahumma shalli \'ala sayyidina Muhammadinil faatihi limaa ughliqa wal khaatimi limaa sabaqa...',
      translation_text: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, pembuka apa yang terkunci, penutup kenabian sebelumnya, penolong kebenaran dengan kebenaran...',
      description: 'Shalawat yang sangat dahsyat untuk membuka jalan buntu, melancarkan rezeki yang seret, dan menembus kesulitan hidup.'
    };
  }

  if (p.includes('jibril') || p.includes('rezeki')) {
    return {
      title: `Shalawat Jibril ${parsedTarget.toLocaleString('id-ID')}x Penarik Pintu Rezeki`,
      target_count: parsedTarget || 10000,
      category: 'syifa',
      arabic_text: 'صَلَّى ٱللَّهُ عَلَىٰ مُحَمَّدٍ',
      latin_text: 'Shallallahu \'ala Muhammad',
      translation_text: 'Semoga Allah melimpahkan shalawat atas Nabi Muhammad.',
      description: 'Shalawat Jibril dikenal luas sebagai amalan mustajab pelancar rezeki dari arah yang tak disangka-sangka. Sangat ringan di lisan, namun sangat berat timbangannya.'
    };
  }

  if (p.includes('yunus') || p.includes('sedih') || p.includes('dzun nun')) {
    return {
      title: `Doa Nabi Yunus ${parsedTarget.toLocaleString('id-ID')}x Pelepas Kesedihan & Musibah`,
      target_count: parsedTarget || 1000,
      category: 'tolak-bala',
      arabic_text: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
      latin_text: 'Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin',
      translation_text: 'Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim.',
      description: 'Doa agung Nabi Yunus AS saat berada di dalam perut ikan paus. Sangat dahsyat untuk melepaskan diri dari kesedihan mendalam, hutang, dan kesulitan yang mengimpit.'
    };
  }

  if (p.includes('lathif') || p.includes('latif')) {
    return {
      title: `Ya Lathif ${parsedTarget.toLocaleString('id-ID')}x Pelembut Hati & Takdir`,
      target_count: parsedTarget || 129,
      category: 'syifa',
      arabic_text: 'يَا لَطِيفُ',
      latin_text: 'Yaa Lathiif',
      translation_text: 'Wahai Yang Maha Lembut.',
      description: 'Asmaul Husna Al-Lathiif. Diamalkan bersama untuk melembutkan hati yang keras, melancarkan urusan yang rumit, dan memohon agar takdir Allah datang dengan kelembutan.'
    };
  }

  if (p.includes('malaikat') || (p.includes('subhanallah') && p.includes('astaghfirullah'))) {
    return {
      title: `Tasbih Malaikat ${parsedTarget.toLocaleString('id-ID')}x Pembuka Pintu Rezeki`,
      target_count: parsedTarget || 100,
      category: 'harian',
      arabic_text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ العَظِيْمِ أَسْتَغْفِرُ اللَّهَ',
      latin_text: 'Subhanallah wa bihamdihi subhanallahil \'adzim astaghfirullah',
      translation_text: 'Maha Suci Allah dengan segala puji bagi-Nya, Maha Suci Allah Yang Maha Agung, aku memohon ampun kepada Allah.',
      description: 'Tasbih Malaikat yang sangat dianjurkan dibaca 100x antara azan dan iqamah Subuh. Keutamaannya menarik rezeki yang tak terduga dan mempermudah segala urusan.'
    };
  }

  if (p.includes('kabir') || p.includes('ya kabir')) {
    return {
      title: `Asmaul Husna Ya Kabir ${parsedTarget.toLocaleString('id-ID')}x Pelimpah Rezeki & Kemuliaan`,
      target_count: parsedTarget || 232,
      category: 'syifa',
      arabic_text: 'يَا كَبِيرُ',
      latin_text: 'Yaa Kabiir',
      translation_text: 'Wahai Yang Maha Besar.',
      description: 'Amalan Asmaul Husna yang diniatkan untuk membukakan pintu rezeki yang melimpah serta membuka jalan-jalan kemuliaan, kehormatan, dan derajat yang tinggi.'
    };
  }

  if (p.includes('fatihah') || p.includes('al-fatihah')) {
    return {
      title: `Wirid Surah Al-Fatihah ${parsedTarget.toLocaleString('id-ID')}x Induk Segala Doa`,
      target_count: parsedTarget || 100,
      category: 'syifa',
      arabic_text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ. ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ. ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ. مَـٰلِكِ يَوْمِ ٱلدِّينِ. إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ. ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ. صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      latin_text: 'Bismillahir-rahmanir-rahim. Alhamdu lillahi rabbil-\'alamin. Ar-rahmanir-rahim. Maliki yaumid-din. Iyyaka na\'budu wa iyyaka nasta\'in. Ihdinas-siratal-mustaqim. Siratal-lazina an\'amta \'alaihim, ghairil-maghdubi \'alaihim wa lad-dallin.',
      translation_text: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Segala puji bagi Allah, Tuhan seluruh alam. Yang Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya, bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
      description: 'Ummul Qur\'an, induk dari segala doa. Diamalkan secara rutin sebagai sarana keberkahan hidup, kemudahan segala urusan, penyembuhan, dan kelapangan rezeki.'
    };
  }

  if (p.includes('nariyah') || p.includes('nariyyah')) {
    return {
      title: `Shalawat Nariyah ${parsedTarget.toLocaleString('id-ID')}x untuk Kelapangan Hajat & Kesembuhan`,
      target_count: parsedTarget || 4444,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَمًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِيمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ',
      latin_text: 'Allahumma shalli shalatan kamilatan wa sallim salaman tamman \'ala sayyidina Muhammadinilladzi tanhallu bihil \'uqadu wa tanfariju bihil kurabu wa tuqdha bihil hawa-iju wa tunalu bihir ragha-ibu wa husnul khawatimi wa yustasqal ghamamu biwajhihil karim wa \'ala aalihi wa shahbihi fi kulli lamhatin wa nafasin bi\'adadi kulli ma\'lumin lak.',
      translation_text: 'Ya Allah, limpahkanlah shalawat yang sempurna dan keselamatan yang utuh kepada junjungan kami Nabi Muhammad, yang melaluinya terurai segala ikatan, terangkat segala duka, terpenuhi segala hajat, tercapai segala keinginan dan husnul khatimah, serta diturunkannya hujan dari awan berkat wajahnya yang mulia. Dan limpahkan juga kepada keluarga dan sahabatnya, di setiap kedipan mata dan hembusan nafas, sebanyak pengetahuan yang Engkau miliki.',
      description: 'Menghimpun ribuan butir Shalawat Nariyah bersama jamaah se-Nusantara. Niatkan semata memohon ridha Allah SWT, kelapangan urusan, dan kesembuhan bagi saudara-saudara kita yang sedang diuji sakit.'
    };
  }

  if (p.includes('hasbunallah') || p.includes('bala') || p.includes('bencana') || p.includes('lindung')) {
    return {
      title: `Hasbunallah Wa Ni'mal Wakil ${parsedTarget.toLocaleString('id-ID')}x Tolak Bala & Keselamatan Umat`,
      target_count: parsedTarget || 10000,
      category: 'tolak-bala',
      arabic_text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ',
      latin_text: 'Hasbunallah wa ni’mal wakiil, ni’mal mawla wa ni’man nashiir',
      translation_text: 'Cukuplah Allah menjadi penolong kami dan Allah adalah sebaik-baik pelindung, sebaik-baik pemimpin, dan sebaik-baik penolong.',
      description: 'Munajat akbar tolak bala dan musibah. Bersama memperteguh tawakkal kepada Allah Sang Maha Kuasa agar senantiasa menjaga negeri dan keluarga kita dari marabahaya.'
    };
  }

  if (p.includes('istighfar') || p.includes('taubat') || p.includes('ampun')) {
    return {
      title: `Istighfar Akbar ${parsedTarget.toLocaleString('id-ID')}x Pelebur Dosa & Pembuka Pintu Berkah`,
      target_count: parsedTarget || 100000,
      category: 'ramadan',
      arabic_text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
      latin_text: 'Astaghfirullahal ‘adziim alladzii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilaih',
      translation_text: 'Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan selain Dia yang Maha Hidup lagi terus-menerus mengurus makhluk-Nya, dan aku bertaubat kepada-Nya.',
      description: 'Membersihkan batin dan memohon ampunan Allah SWT bersama ribuan jamaah. Istighfar adalah kunci diturunkannya hujan rahmat, keturunan yang saleh, dan kelapangan rezeki yang tak disangka-sangka.'
    };
  }

  if (p.includes('tibbil') || p.includes('thibbil') || p.includes('hati') || p.includes('sembuh')) {
    return {
      title: `Shalawat Tibbil Qulub ${parsedTarget.toLocaleString('id-ID')}x Penawar Jiwa & Kesembuhan Raga`,
      target_count: parsedTarget || 1000,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا، وَعَافِيَةِ الأَبْدَانِ وَشِفَائِهَا، وَنُورِ الأَبْصَارِ وَضِيَائِهَا، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
      latin_text: 'Allahumma shalli ‘ala sayyidina Muhammadin thibbil quluubi wa dawa-ihaa, wa ‘aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa, wa ‘ala aalihi wa shahbihi wa sallim',
      translation_text: 'Ya Allah, curahkanlah rahmat kepada junjungan kami Nabi Muhammad sebagai obat hati dan penawarnya, penyehat badan dan kesembuhannya, serta cahaya penglihatan dan sinarnya.',
      description: 'Majelis zikir syifa mengetuk pintu kesembuhan jasmani dan ketenangan rohani. Dipersembahkan bagi jamaah dan keluarga yang merindukan penawar dari segala penyakit.'
    };
  }

  if (p.includes('hawqalah') || p.includes('lahawla') || p.includes('laa hawla') || p.includes('kekuatan')) {
    return {
      title: `Hauqalah ${parsedTarget.toLocaleString('id-ID')}x Perbendaharaan Surga Peneguh Jiwa`,
      target_count: parsedTarget || 10000,
      category: 'syifa',
      arabic_text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
      latin_text: 'Laa hawla wa laa quwwata illaa billaahil ‘aliyyil ‘adziim',
      translation_text: 'Tiada daya dan tiada kekuatan melainkan semata-mata dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.',
      description: 'Melepaskan rasa putus asa dan kepasrahan semu kepada kekuatan manusia. Satukan ribuan ketukan tasbih mengaku kelemahan diri di hadapan Sang Pemilik Kehendak.'
    };
  }

  const cleanPrompt = prompt
    .replace(/^(buatkan|bikin|tolong|buat)\s+(saya\s+)?(kan\s+)?(campaign\s+)?/i, '')
    .trim();
  const titleText = cleanPrompt.length > 0 ? cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1) : 'Zikir & Doa Bersama';

  return {
    title: `${titleText} ${parsedTarget.toLocaleString('id-ID')}x`,
    target_count: parsedTarget,
    category: p.includes('bala') ? 'tolak-bala' : p.includes('hajat') ? 'syifa' : 'ramadan',
    arabic_text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    latin_text: 'Subhaanallaahi wa bihamdihii subhaanallaahil ‘adziim',
    translation_text: 'Maha Suci Allah dengan memuji-Nya, Maha Suci Allah Yang Maha Agung.',
    description: `Ikhtiar bersama jamaah se-Nusantara: "${prompt}". Mari himpun butir-butir tasbih penuh kekhusyukan hingga target tuntas diraih bersama.`
  };
}

async function callNvidiaNim(
  prompt: string,
  image: string | undefined,
  apiKey: string,
  modelName: string = process.env.NVIDIA_MODEL || 'z-ai/glm-5.3'
): Promise<{ campaign: GeneratedCampaign; modelUsed: string } | null> {
  const systemInstruction =
    'Anda adalah asisten majelis zikir Islam SatuZikir. Tugas Anda adalah mengubah prompt admin menjadi detail kampanye zikir lengkap dan sahih dalam format JSON murni tanpa markdown wrapping.\n\nATURAN PENTING:\n1. Teks Arab berharakat, transliterasi Latin, dan terjemahan HARUS LENGKAP tanpa dipotong (terutama untuk shalawat/doa panjang seperti Shalawat Nariyah, Munjiyat, dll).\n2. Format angka Indonesia: tanda titik (.) adalah pemisah ribuan. Contoh "4.444" berarti 4444 (empat ribu empat ratus empat puluh empat). Pastikan target_count berupa angka bulat tanpa titik/koma.\n\nFormat output WAJIB JSON: {"title": string, "target_count": number, "category": "syifa"|"ramadan"|"tolak-bala"|"harian", "arabic_text": string, "latin_text": string, "translation_text": string, "description": string}';

  const userContent: any[] = [
    { type: 'text', text: `Prompt Admin: "${prompt}"\n\nSusun ke dalam format JSON yang diminta.` },
  ];

  if (image) {
    userContent.push({
      type: 'image_url',
      image_url: { url: image },
    });
  }

  // Model list to try: primary specified model, then kimi-k3 as alternate
  const modelsToTry = [modelName];
  if (!modelsToTry.includes('moonshotai/kimi-k3')) {
    modelsToTry.push('moonshotai/kimi-k3');
  }

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            {
              role: 'user',
              content: image ? userContent : `Prompt Admin: "${prompt}"\n\nSusun ke dalam format JSON yang diminta.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`NVIDIA NIM (${model}) HTTP ${response.status}:`, errText);
        continue; // Try next model
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content || '';
      const cleanJson = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanJson);
      if (parsed.title && parsed.target_count && parsed.arabic_text) {
        return {
          campaign: {
            ...parsed,
            target_count: Number(parsed.target_count) || 10000,
            category: ['syifa', 'ramadan', 'tolak-bala', 'harian'].includes(parsed.category)
              ? parsed.category
              : 'syifa',
          },
          modelUsed: model,
        };
      }
    } catch (err) {
      console.warn(`Error calling NVIDIA NIM (${model}):`, err);
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || '';
    
    if (!prompt.trim() && !body.image) {
      return NextResponse.json(
        { error: 'Prompt atau gambar kampanye tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // 1. Prioritaskan NVIDIA NIM (GLM-5.3 / Kimi K3)
    const nvidiaKey =
      body.nvidiaApiKey ||
      process.env.NVIDIA_API_KEY ||
      process.env.KIMI_API_KEY ||
      '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';

    const preferredModel = body.model || process.env.NVIDIA_MODEL || 'z-ai/glm-5.3';

    if (nvidiaKey) {
      try {
        const nimResult = await callNvidiaNim(prompt, body.image, nvidiaKey, preferredModel);
        if (nimResult) {
          return NextResponse.json({
            success: true,
            source: 'nvidia-nim',
            modelName: nimResult.modelUsed,
            campaign: nimResult.campaign,
            note: `Dihasilkan oleh ${nimResult.modelUsed} via NVIDIA NIM`,
          });
        }
      } catch (nimErr) {
        console.warn('NVIDIA NIM API call failed, falling back to Gemini / Knowledge Engine:', nimErr);
      }
    }

    // 2. Fallback ke Google Gemini
    const apiKey =
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = 'Anda adalah asisten majelis zikir Islam SatuZikir. Tugas Anda adalah mengubah prompt admin menjadi detail kampanye zikir lengkap dan sahih dalam format JSON murni tanpa markdown wrapping.\n\nATURAN PENTING:\n1. Teks Arab berharakat, transliterasi Latin, dan terjemahan HARUS LENGKAP tanpa dipotong (terutama untuk shalawat/doa panjang seperti Shalawat Nariyah, Munjiyat, dll).\n2. Format angka Indonesia: tanda titik (.) adalah pemisah ribuan. Contoh "4.444" berarti 4444 (empat ribu empat ratus empat puluh empat). Pastikan target_count berupa angka bulat tanpa titik/koma.\n\nFormat output WAJIB: {"title": string, "target_count": number, "category": "syifa"|"ramadan"|"tolak-bala", "arabic_text": string, "latin_text": string, "translation_text": string, "description": string}';

        const parts: any[] = [{ text: `${systemInstruction}\n\nPrompt Admin: "${prompt}"\n\n[Jika ada gambar, ekstrak teks Arab/Latin dari gambar, lengkapi yang kurang, dan hitung target yang diminta.]\n\nJSON Output:` }];

        if (body.image) {
          const match = body.image.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: parts
        });

        const rawText = response.text || '';
        const cleanJson = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(cleanJson) as GeneratedCampaign;

        if (parsed.title && parsed.target_count && parsed.arabic_text) {
          return NextResponse.json({
            success: true,
            source: 'gemini-ai',
            campaign: {
              ...parsed,
              target_count: Number(parsed.target_count) || 10000,
              category: ['syifa', 'ramadan', 'tolak-bala', 'harian'].includes(parsed.category)
                ? parsed.category
                : 'syifa'
            }
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using verified Islamic knowledge fallback:', geminiError);
      }
    }

    const fallback = generateFallbackCampaign(prompt);
    return NextResponse.json({
      success: true,
      source: 'knowledge-engine',
      campaign: fallback,
      note: 'Dihasilkan dari database zikir & fiqih SatuZikir.'
    });
  } catch (error) {
    console.error('Error generating campaign:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses prompt AI.' },
      { status: 500 }
    );
  }
}
