export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    // Brand
    brandName: 'অঙ্কুর',
    brandTagline: 'শস্য স্বাস্থ্য ও রোগ পর্যবেক্ষণ',
    
    // Header
    login: 'লগইন (Login)',
    logout: 'লগআউট (Logout)',
    profile: 'প্রোফাইল (Profile)',
    newBatchHeader: 'নতুন ব্যাচ',

    // Home / Scan
    scanTitle: 'ফসলের ছবি দিন',
    scanSubtitle: 'রোগ ও স্বাস্থ্য নিরীক্ষণের জন্য আপনার ফসলের ছবি তুলুন বা আপলোড করুন',
    cameraBtn: 'ক্যামেরা (Camera)',
    uploadBtn: 'আপলোড (Upload)',
    dragDropHint: 'কম্পিউটারে ছবি ড্র্যাগ ও ড্রপ করেও যুক্ত করতে পারেন',
    changePhoto: 'ছবি পরিবর্তন (Change)',
    photoAdded: 'ছবি সংগৃহীত হয়েছে',
    photoReadyDesc: 'সঠিক পুষ্টি ও রোগ নির্ণয়ের জন্য ব্যাচ নির্বাচন করুন',
    
    // Batch selection
    whichBatch: 'কোন ফসলের ব্যাচ?',
    whichBatchSub: 'QR কোড স্ক্যান করুন অথবা তালিকা থেকে একটি ব্যাচ বেছে নিন',
    scanQRBtn: 'QR স্ক্যান করুন',
    savedBatches: 'সংরক্ষিত ব্যাচসমূহ',
    noBatchesTitle: 'কোনো সংরক্ষিত ব্যাচ নেই',
    noBatchesSub: 'বিশ্লেষণ শুরু করার আগে আপনার প্রথম ফসলের ব্যাচ তৈরি করুন।',
    createFirstBatch: 'প্রথম ব্যাচ তৈরি করুন',
    newBatch: 'নতুন ব্যাচ',
    selectedBatchLabel: 'নির্বাচিত ব্যাচ:',
    continueToSensor: 'পরবর্তী ধাপ: সেন্সর ডেটা আপলোড',
    loginPromptTitle: 'ব্যাচ নির্বাচন করতে প্রথমে লগইন করুন',
    loginPromptSub: 'আপনার সংরক্ষিত ফসলের ব্যাচ ও সেন্সর তথ্যের সাথে ছবি যুক্ত করতে অনুগ্রহ করে সাইন ইন করুন। নির্বাচিত ছবিটি সংরক্ষিত থাকবে।',
    signInBtn: 'লগইন / নিবন্ধন করুন',

    // Excel Upload
    sensorUploadTitle: 'সেন্সর ডেটা ফাইল আপলোড',
    sensorUploadSub: 'নির্বাচিত ব্যাচ:',
    sensorDropTitle: 'এক্সেল বা সিএসভি ফাইল সিলেক্ট করুন',
    sensorDropSub: 'বিগত ২ মাসের NPK ও আর্দ্রতা সেন্সর লগ (.xlsx, .xls, .csv) ফাইল আপলোড করুন',
    browseFile: 'ফাইল ব্রাউজ করুন',
    totalRecords: 'মোট রেকর্ড',
    detectedSections: 'চিহ্নিত সেকশন',
    batchRecords: 'এই ব্যাচের রেকর্ড',
    dateRange: 'তারিখের ব্যাপ্তি',
    proceedToAnalysis: 'বিশ্লেষণ শুরু করুন',
    backToBatch: 'ব্যাচ নির্বাচনে ফিরে যান',
    noBatchRowsWarning: 'এই ফাইলে নির্বাচিত ব্যাচের সেকশনের কোনো তথ্য পাওয়া যায়নি।',

    // Weather & Location
    locationTitle: 'খামারের অবস্থান ও আবহাওয়া',
    detectLocation: 'বর্তমান অবস্থান শনাক্ত করুন',
    manualLocation: 'জেলা বা উপজেলার নাম লিখুন',
    currentWeather: 'বর্তমান আবহাওয়া',
    forecast7Days: '৭ দিনের পূর্বাভাস',
    temperature: 'তাপমাত্রা',
    humidity: 'আর্দ্রতা',
    rain: 'বৃষ্টিপাত',
    wind: 'বাতাসের গতি',
    weatherRiskLabel: 'আবহাওয়া ঝুঁকি:',
    weatherTipsTitle: 'কৃষি আবহাওয়া পরামর্শ',

    // Health Analysis & Results
    analysisTitle: 'শস্য স্বাস্থ্য নিরীক্ষা ও ফলাফল',
    healthLevelTitle: 'সামগ্রিক স্বাস্থ্য স্তর',
    critical: 'সংকটাপন্ন (Critical)',
    poor: 'দুর্বল (Poor)',
    fair: 'মোটামুটি (Fair)',
    good: 'ভালো (Good)',
    excellent: 'চমৎকার (Excellent)',
    
    // Pest Diagnosis
    pestTitle: 'রোগ ও পোকা-মাকড় নির্ণয় (AI Vision)',
    noPestDetected: 'কোনো ক্ষতিকর পোকা বা রোগের লক্ষণ শনাক্ত হয়নি',
    pestDetected: 'রোগ বা পোকার লক্ষণ শনাক্ত হয়েছে',
    confidence: 'নির্ভুলতার হার',
    severity: 'তীব্রতা',
    symptoms: 'দৃশ্যমান লক্ষণসমূহ',
    recommendation: 'করণীয় পরামর্শ',
    aiDisclaimer: 'এটি একটি এআই অনুমিত মূল্যায়ন, গবেষণাগারের বিকল্প নয়।',

    // Trends & Ranking
    npkTrendsTitle: 'খনিজ পুষ্টির গতিধারা (NPK Trends)',
    consumptionRateTitle: 'সাপ্তাহিক পুষ্টি গ্রহণের হার (Consumption Rate)',
    rankingTitle: 'সকল সেকশনের স্বাস্থ্য র‍্যাংকিং ও তুলনা',
    attentionTop: 'সবচেয়ে ঝুঁকিপূর্ণ সেকশনগুলো প্রথমে প্রদর্শিত',
    saveAnalysisBtn: 'বিশ্লেষণটি ব্যাচে সংরক্ষণ করুন',
    savedSuccess: 'বিশ্লেষণ সফলভাবে সংরক্ষিত হয়েছে!',
  },
  en: {
    // Brand
    brandName: 'Ankur',
    brandTagline: 'Crop Health & Disease Monitoring',
    
    // Header
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile',
    newBatchHeader: 'New Batch',

    // Home / Scan
    scanTitle: 'Add a Photo of Your Crop',
    scanSubtitle: 'Capture or upload a crop photo to inspect health & diseases',
    cameraBtn: 'Camera',
    uploadBtn: 'Upload',
    dragDropHint: 'Drag & drop an image here or use the buttons above',
    changePhoto: 'Change Photo',
    photoAdded: 'Photo Captured',
    photoReadyDesc: 'Select a crop batch to correlate with sensor telemetry',

    // Batch selection
    whichBatch: 'Which Crop Batch Is This?',
    whichBatchSub: 'Scan the batch QR code or choose from your registered batches',
    scanQRBtn: 'Scan QR Code',
    savedBatches: 'Saved Batches',
    noBatchesTitle: 'No Registered Batches Found',
    noBatchesSub: 'Please create your first crop batch before proceeding with analysis.',
    createFirstBatch: 'Create First Batch',
    newBatch: 'New Batch',
    selectedBatchLabel: 'Selected Batch:',
    continueToSensor: 'Continue to Sensor Upload',
    loginPromptTitle: 'Sign in to Select Crop Batch',
    loginPromptSub: 'Please sign in to link your crop batch and sensor telemetry. Your selected photo will remain in memory.',
    signInBtn: 'Sign In / Register',

    // Excel Upload
    sensorUploadTitle: 'Sensor Data Upload (Testing Mode)',
    sensorUploadSub: 'Selected Batch:',
    sensorDropTitle: 'Select an Excel or CSV file',
    sensorDropSub: 'Upload ~2 months of NPK & humidity sensor logs (.xlsx, .xls, .csv)',
    browseFile: 'Browse File',
    totalRecords: 'Total Records',
    detectedSections: 'Detected Sections',
    batchRecords: 'Records for this Batch',
    dateRange: 'Date Range',
    proceedToAnalysis: 'Proceed to Analysis',
    backToBatch: 'Back to Batch Selection',
    noBatchRowsWarning: 'No sensor rows found matching the selected batch section.',

    // Weather & Location
    locationTitle: 'Farm Location & Weather',
    detectLocation: 'Detect Current Location',
    manualLocation: 'Enter District or Upazila name',
    currentWeather: 'Current Weather',
    forecast7Days: '7-Day Forecast',
    temperature: 'Temperature',
    humidity: 'Humidity',
    rain: 'Precipitation',
    wind: 'Wind Speed',
    weatherRiskLabel: 'Weather Risk:',
    weatherTipsTitle: 'Agronomic Weather Tips',

    // Health Analysis & Results
    analysisTitle: 'Crop Health Report & Results',
    healthLevelTitle: 'Overall Crop Health Level',
    critical: 'Critical',
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',

    // Pest Diagnosis
    pestTitle: 'Pest & Disease Diagnosis (AI Vision)',
    noPestDetected: 'No visible pests or diseases detected',
    pestDetected: 'Possible Pest or Disease Detected',
    confidence: 'Confidence',
    severity: 'Severity',
    symptoms: 'Visible Symptoms',
    recommendation: 'Actionable Recommendation',
    aiDisclaimer: 'This is an AI visual estimate, not a laboratory diagnosis.',

    // Trends & Ranking
    npkTrendsTitle: 'Mineral Telemetry Trends (N, P, K)',
    consumptionRateTitle: 'Weekly Mineral Consumption Rate',
    rankingTitle: 'Comparative Ranking Across All Sections',
    attentionTop: 'Sections needing most attention shown at the top',
    saveAnalysisBtn: 'Save Analysis to Batch History',
    savedSuccess: 'Analysis saved successfully to batch history!',
  }
};
