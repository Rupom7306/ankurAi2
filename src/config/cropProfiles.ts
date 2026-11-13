export interface CropAgronomicProfile {
  name: string;
  bengaliName: string;
  nRange: [number, number]; // mg/kg
  pRange: [number, number]; // mg/kg
  kRange: [number, number]; // mg/kg
  humidityRange: [number, number]; // %
  tempRange: [number, number]; // °C
  moistureRange: [number, number]; // %
  phRange: [number, number];
  weatherRisks: {
    highRain: { risk: 'High' | 'Moderate' | 'Low'; reasonBn: string; reasonEn: string; tipBn: string; tipEn: string };
    highHeat: { risk: 'High' | 'Moderate' | 'Low'; reasonBn: string; reasonEn: string; tipBn: string; tipEn: string };
    lowHumidity: { risk: 'High' | 'Moderate' | 'Low'; reasonBn: string; reasonEn: string; tipBn: string; tipEn: string };
    highHumidity: { risk: 'High' | 'Moderate' | 'Low'; reasonBn: string; reasonEn: string; tipBn: string; tipEn: string };
  };
}

export const CROP_PROFILES: Record<string, CropAgronomicProfile> = {
  'Boro Rice': {
    name: 'Boro Rice',
    bengaliName: 'বোরো ধান',
    nRange: [75, 95],
    pRange: [28, 36],
    kRange: [130, 155],
    humidityRange: [65, 80],
    tempRange: [22, 32],
    moistureRange: [30, 45],
    phRange: [6.0, 7.0],
    weatherRisks: {
      highRain: {
        risk: 'High',
        reasonBn: 'ভারী বৃষ্টিতে নাইট্রেট লিচিং (মাটির নিচে অপচয়) এবং ব্লাস্ট ছত্রাকের ঝুঁকি বৃদ্ধি পেতে পারে।',
        reasonEn: 'Heavy rain causes nitrogen leaching and elevates rice blast fungal risk.',
        tipBn: 'জমির অতিরিক্ত পানি নিষ্কাশন নিশ্চিত করুন এবং ইউরিয়ার উপরিপ্রয়োগ আপাতত বন্ধ রাখুন।',
        tipEn: 'Ensure clear drainage trenches and postpone top-dressing nitrogen fertilizers.',
      },
      highHeat: {
        risk: 'Moderate',
        reasonBn: 'উচ্চ তাপে শীষে চিটা হওয়ার শঙ্কা ও দ্রুত বাষ্পীভবন ঘটে।',
        reasonEn: 'Elevated heat accelerates spikelet sterility and evapotranspiration.',
        tipBn: 'জমিতে ২-৩ ইঞ্চি পানি ধরে রাখুন যাতে শিকড়ের অঞ্চল শীতল থাকে।',
        tipEn: 'Maintain 2-3 inches standing water to regulate soil temperature.',
      },
      lowHumidity: {
        risk: 'Moderate',
        reasonBn: 'শুষ্ক আবহাওয়ায় পানির ঘাটতি ও পত্ররন্ধ্র বন্ধ হতে পারে।',
        reasonEn: 'Dry ambient conditions lead to stomatal closure and moisture stress.',
        tipBn: 'নিয়মিত সেচ প্রদান করুন এবং বিকেলে হালকা স্প্রে করুন।',
        tipEn: 'Provide scheduled irrigation preferably in early mornings or evenings.',
      },
      highHumidity: {
        risk: 'High',
        reasonBn: 'উচ্চ আর্দ্রতায় পাতাপোড়া ও বাদামি দাগ রোগের সংক্রমণ বাড়ে।',
        reasonEn: 'High humidity creates prime vectors for bacterial leaf blight and brown spot.',
        tipBn: 'সকালবেলা জমিতে বাতাস চলাচলের ব্যবস্থা রাখুন এবং উপযুক্ত ছত্রাকনাশক প্রস্তুত রাখুন।',
        tipEn: 'Ensure plant spacing allows cross-ventilation and keep fungicide ready.',
      },
    },
  },
  'Wheat': {
    name: 'Wheat',
    bengaliName: 'গম',
    nRange: [60, 75],
    pRange: [24, 32],
    kRange: [110, 125],
    humidityRange: [50, 68],
    tempRange: [18, 26],
    moistureRange: [24, 35],
    phRange: [6.2, 7.2],
    weatherRisks: {
      highRain: {
        risk: 'High',
        reasonBn: 'অতিরিক্ত পানিতে গমের শিকড় পচন ও মরিচা রোগের প্রাদুর্ভাব ঘটে।',
        reasonEn: 'Waterlogging suffocates wheat root crowns and invites rust diseases.',
        tipBn: 'জমিতে পানি জমতে দেবেন না, দ্রুত নিষ্কাশন করুন।',
        tipEn: 'Quickly drain excess standing water to avoid root rot.',
      },
      highHeat: {
        risk: 'High',
        reasonBn: 'দানা বাঁধার সময় তাপপ্রবাহ দেখা দিলে দানার আকার ছোট হয়ে যায়।',
        reasonEn: 'Terminal heat during grain-fill leads to shriveled grains.',
        tipBn: 'মাটিতে পরিমিত রস বজায় রাখতে হালকা সেচ দিন।',
        tipEn: 'Apply light irrigation to alleviate terminal heat shock.',
      },
      lowHumidity: {
        risk: 'Low',
        reasonBn: 'গম মাঝারি শুষ্ক আবহাওয়া ভালো সহ্য করতে পারে।',
        reasonEn: 'Wheat handles moderate dry conditions relatively well.',
        tipBn: 'মাটির আর্দ্রতা দেখে কেবল শিডিউল সেচ দিন।',
        tipEn: 'Irrigate only when top 3cm soil shows dryness.',
      },
      highHumidity: {
        risk: 'Moderate',
        reasonBn: 'আর্দ্র আবহাওয়া পাতার ব্লাইট এবং মরিচা রোগের অনুকূল।',
        reasonEn: 'High relative humidity encourages foliar blights.',
        tipBn: 'নিয়মিত পাতা পর্যবেক্ষণ করুন এবং প্রপিকোনাজল জাতীয় স্প্রে প্রস্তুত রাখুন।',
        tipEn: 'Monitor leaf flags and scout for fungal lesions.',
      },
    },
  },
  'Potato': {
    name: 'Potato',
    bengaliName: 'আলু',
    nRange: [68, 85],
    pRange: [26, 38],
    kRange: [135, 160],
    humidityRange: [60, 78],
    tempRange: [16, 24],
    moistureRange: [26, 36],
    phRange: [5.2, 6.2],
    weatherRisks: {
      highRain: {
        risk: 'High',
        reasonBn: 'বৃষ্টি ও জমা পানিতে নাবি ধসা (Late Blight) দ্রুত মহামারি আকারে ছড়ায়।',
        reasonEn: 'Wet weather rapidly spreads devastating Late Blight (Phytophthora infestans).',
        tipBn: 'অবিলম্বে প্রতিষেধক হিসেবে ম্যানকোজেব স্প্রে করুন এবং নালা পরিষ্কার রাখুন।',
        tipEn: 'Apply protective contact fungicide (Mancozeb) and keep drainage active.',
      },
      highHeat: {
        risk: 'Moderate',
        reasonBn: 'তাপমাত্রা ২৫°C ছাড়ালে কন্দ গঠনের হার নাটকীয়ভাবে কমে যায়।',
        reasonEn: 'Temperatures above 25°C stunt tuber initiation and bulking.',
        tipBn: 'গাছের গোড়ায় মাটি তুলে দিয়ে কন্দ সূর্যালোক থেকে ঢেকে রাখুন।',
        tipEn: 'Keep soil ridged high to insulate developing tubers from heat.',
      },
      lowHumidity: {
        risk: 'Low',
        reasonBn: 'মাটির রস থাকলে শুষ্ক বাতাসে ধসা রোগের ভয় কম থাকে।',
        reasonEn: 'Dry air reduces foliar fungal pressure provided soil moisture is maintained.',
        tipBn: 'পরিমিত সেচ বজায় রাখুন।',
        tipEn: 'Maintain moderate furrow irrigation.',
      },
      highHumidity: {
        risk: 'High',
        reasonBn: 'কুয়াশা ও উচ্চ আর্দ্রতা আলুর অন্যতম প্রধান শত্রু।',
        reasonEn: 'Dense fog combined with 85%+ humidity creates severe Late Blight threat.',
        tipBn: 'কুয়াশাচ্ছন্ন দিনে সকালের রোদ ওঠার সাথে সাথে গাছের পাতা শুকানোর ব্যবস্থা করুন।',
        tipEn: 'Scout daily for water-soaked leaf spots.',
      },
    },
  },
  'Tomato': {
    name: 'Tomato',
    bengaliName: 'টমেটো',
    nRange: [65, 80],
    pRange: [26, 35],
    kRange: [145, 170],
    humidityRange: [65, 80],
    tempRange: [20, 28],
    moistureRange: [35, 45],
    phRange: [6.0, 6.8],
    weatherRisks: {
      highRain: {
        risk: 'High',
        reasonBn: 'বৃষ্টিতে ফল ফেটে যাওয়া ও ব্যাক্টেরিয়াল উইল্ট হতে পারে।',
        reasonEn: 'Excessive rain cracks fruits and triggers bacterial wilt in roots.',
        tipBn: 'উঁচু বেড তৈরি রাখুন এবং গাছের নিচে মালচিং করুন।',
        tipEn: 'Use raised beds and organic mulch to buffer root flooding.',
      },
      highHeat: {
        risk: 'Moderate',
        reasonBn: '৩০°C এর উপরে পরাগায়ন ব্যাহত হয় ও ফুল ঝরে পড়ে।',
        reasonEn: 'Pollen becomes sterile above 30°C causing blossom drop.',
        tipBn: 'প্রয়োজনে হালকা ছায়াজাল (shade net) বা বিকেলে সেচ দিন।',
        tipEn: 'Provide light shading and evening misting during heat spikes.',
      },
      lowHumidity: {
        risk: 'Moderate',
        reasonBn: 'কম আর্দ্রতায় লাল মাকড়ের উপদ্রব বাড়ে।',
        reasonEn: 'Low humidity triggers rapid red spider mite outbreaks.',
        tipBn: 'পাতার উল্টো পিঠে পানি স্প্রে করুন।',
        tipEn: 'Spray underside of leaves with water to suppress mite webs.',
      },
      highHumidity: {
        risk: 'High',
        reasonBn: 'অতিরিক্ত আর্দ্রতায় আর্লি ব্লাইট ও পাউডারি মিলডিউ দ্রুত ছড়ায়।',
        reasonEn: 'High humidity causes severe early blight and leaf mold.',
        tipBn: 'নিচের রোগাক্রান্ত পাতা ছাঁটাই করুন যাতে বাতাস চলাচল করে।',
        tipEn: 'Prune lower leaves to enhance airflow and apply copper fungicide.',
      },
    },
  },
  'Maize': {
    name: 'Maize',
    bengaliName: 'ভুট্টা',
    nRange: [85, 100],
    pRange: [30, 38],
    kRange: [135, 155],
    humidityRange: [55, 75],
    tempRange: [22, 32],
    moistureRange: [28, 40],
    phRange: [6.2, 7.2],
    weatherRisks: {
      highRain: {
        risk: 'Moderate',
        reasonBn: 'চারা অবস্থায় জলাবদ্ধতায় ভুট্টার বৃদ্ধি থমকে যায়।',
        reasonEn: 'Seedling stage waterlogging stalls maize vegetative vigor.',
        tipBn: 'সারিগুলোর মাঝে পানি নিষ্কাশনের নালা রাখুন।',
        tipEn: 'Keep furrow drainage clear.',
      },
      highHeat: {
        risk: 'Low',
        reasonBn: 'ভুট্টা একটি C4 ফসল, যা উচ্চ তাপ ভালোভাবে সইতে পারে।',
        reasonEn: 'Maize is a C4 crop with robust heat tolerance.',
        tipBn: 'মাটি শুকিয়ে গেলে নিয়মিত সেচ নিশ্চিত করুন।',
        tipEn: 'Keep moisture available during silking and tasseling.',
      },
      lowHumidity: {
        risk: 'Moderate',
        reasonBn: 'পরাগায়নের সময় শুষ্ক বাতাসে পরাগরেণু শুকিয়ে যেতে পারে।',
        reasonEn: 'Hot dry air can deselect silks before fertilization.',
        tipBn: 'পুষ্পায়নকালে মাটির রস পর্যাপ্ত রাখুন।',
        tipEn: 'Ensure moisture during flowering.',
      },
      highHumidity: {
        risk: 'Moderate',
        reasonBn: 'টার্সিকাম লিফ ব্লাইট রোগের শঙ্কা থাকে।',
        reasonEn: 'Turcicum leaf blight risk rises under persistent wet canopy.',
        tipBn: 'লক্ষণ দেখা দিলে ছত্রাকনাশক স্প্রে করুন।',
        tipEn: 'Scout for cigar-shaped leaf lesions.',
      },
    },
  },
};

/**
 * Returns default or crop-specific profile
 */
export const getCropProfile = (cropType: string): CropAgronomicProfile => {
  const normalized = cropType.trim().toLowerCase();
  for (const [key, profile] of Object.entries(CROP_PROFILES)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return profile;
    }
  }
  // Default general profile if crop not matched
  return {
    name: cropType,
    bengaliName: cropType,
    nRange: [70, 95],
    pRange: [25, 35],
    kRange: [120, 150],
    humidityRange: [60, 80],
    tempRange: [20, 30],
    moistureRange: [30, 42],
    phRange: [6.0, 7.0],
    weatherRisks: {
      highRain: {
        risk: 'Moderate',
        reasonBn: 'ভারী বৃষ্টিতে পুষ্টির অপচয় হতে পারে।',
        reasonEn: 'Heavy precipitation can leach soil nutrients.',
        tipBn: 'পানি নিষ্কাশন ব্যবস্থা সচল রাখুন।',
        tipEn: 'Ensure proper soil drainage.',
      },
      highHeat: {
        risk: 'Moderate',
        reasonBn: 'অতিরিক্ত তাপে পানি চাহিদা বাড়ে।',
        reasonEn: 'Heat spikes increase crop evapotranspiration.',
        tipBn: 'নিয়মিত সেচ দিন।',
        tipEn: 'Provide consistent moisture.',
      },
      lowHumidity: {
        risk: 'Low',
        reasonBn: 'শুষ্ক আবহাওয়ায় পরিমিত সেচ প্রয়োজন।',
        reasonEn: 'Dry conditions require supplemental watering.',
        tipBn: 'মাটির আর্দ্রতা রক্ষা করুন।',
        tipEn: 'Keep root zones hydrated.',
      },
      highHumidity: {
        risk: 'Moderate',
        reasonBn: 'ছত্রাক সংক্রমণের শঙ্কা বৃদ্ধি পায়।',
        reasonEn: 'Prolonged humidity invites fungal foliar pathogens.',
        tipBn: 'গাছের বায়ু চলাচল ও পাতা নিরীক্ষণ করুন।',
        tipEn: 'Inspect foliage regularly.',
      },
    },
  };
};
