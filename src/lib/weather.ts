import { getCropProfile } from '../config/cropProfiles';

export interface WeatherLocationName {
  en: string;
  bn: string;
}

export interface WeatherData {
  locationName: WeatherLocationName;
  latitude: number;
  longitude: number;
  current: {
    temperature: number; // °C
    humidity: number; // %
    precipitation: number; // mm
    weatherCode: number;
    windSpeed: number; // km/h
  };
  dailyForecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitationSum: number;
    weatherCode: number;
  }>;
}

export interface CropWeatherEvaluation {
  riskLabel: 'Low' | 'Moderate' | 'High';
  riskKey: 'weather_risk_low' | 'weather_risk_moderate' | 'weather_risk_high';
  riskColor: string;
  summary: {
    en: string;
    bn: string;
  };
  tips: {
    en: string[];
    bn: string[];
  };
}

export interface BDRegion {
  nameEn: string;
  nameBn: string;
  lat: number;
  lon: number;
}

export const BD_REGIONS: BDRegion[] = [
  { nameEn: 'Chattogram Agriculture Region', nameBn: 'চট্টগ্রাম কৃষি অঞ্চল', lat: 22.3569, lon: 91.7832 },
  { nameEn: 'Cox\'s Bazar Coastal Zone', nameBn: 'কক্সবাজার উপকূলীয় অঞ্চল', lat: 21.4272, lon: 92.0058 },
  { nameEn: 'Cumilla Agriculture Region', nameBn: 'কুমিল্লা কৃষি অঞ্চল', lat: 23.4682, lon: 91.1788 },
  { nameEn: 'Noakhali Agriculture Region', nameBn: 'নোয়াখালী কৃষি অঞ্চল', lat: 22.8696, lon: 91.0991 },
  { nameEn: 'Dhaka Agriculture Region', nameBn: 'ঢাকা কৃষি অঞ্চল', lat: 23.8103, lon: 90.4125 },
  { nameEn: 'Mymensingh Agriculture Region', nameBn: 'ময়মনসিংহ কৃষি অঞ্চল', lat: 24.7471, lon: 90.4203 },
  { nameEn: 'Sylhet Agro Region', nameBn: 'সিলেট কৃষি অঞ্চল', lat: 24.8949, lon: 91.8687 },
  { nameEn: 'Rajshahi Agro Zone', nameBn: 'রাজশাহী কৃষি অঞ্চল', lat: 24.3745, lon: 88.6042 },
  { nameEn: 'Rangpur Agriculture Region', nameBn: 'রংপুর কৃষি অঞ্চল', lat: 25.7439, lon: 89.2752 },
  { nameEn: 'Bogura Agriculture Region', nameBn: 'বগুড়া কৃষি অঞ্চল', lat: 24.8465, lon: 89.3777 },
  { nameEn: 'Dinajpur Agriculture Region', nameBn: 'দিনাজপুর কৃষি অঞ্চল', lat: 25.6217, lon: 88.6354 },
  { nameEn: 'Khulna Agriculture Region', nameBn: 'খুলনা কৃষি অঞ্চল', lat: 22.8456, lon: 89.5403 },
  { nameEn: 'Jashore Agriculture Region', nameBn: 'যশোর কৃষি অঞ্চল', lat: 23.1664, lon: 89.2081 },
  { nameEn: 'Barishal Agriculture Region', nameBn: 'বরিশাল কৃষি অঞ্চল', lat: 22.7010, lon: 90.3535 },
  { nameEn: 'Pabna Agriculture Region', nameBn: 'পাবনা কৃষি অঞ্চল', lat: 24.0064, lon: 89.2372 },
  { nameEn: 'Kushtia Agriculture Region', nameBn: 'কুষ্টিয়া কৃষি অঞ্চল', lat: 23.9013, lon: 89.1205 },
];

export const getNearestBDRegion = (lat: number, lon: number): WeatherLocationName => {
  let bestDist = Infinity;
  let bestRegion = BD_REGIONS[0]; // default: Chattogram

  for (const reg of BD_REGIONS) {
    const dLat = lat - reg.lat;
    const dLon = lon - reg.lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < bestDist) {
      bestDist = distSq;
      bestRegion = reg;
    }
  }

  return {
    en: bestRegion.nameEn,
    bn: bestRegion.nameBn,
  };
};

/**
 * Detects user position via browser GPS, fallback to IP location, fallback to Chattogram
 */
export const detectUserLocation = async (): Promise<{
  lat: number;
  lon: number;
  locationName: WeatherLocationName;
}> => {
  // Step 1: Try browser geolocation (GPS)
  try {
    const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        return reject(new Error('Geolocation unavailable'));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { timeout: 4000, enableHighAccuracy: false }
      );
    });

    const nearest = getNearestBDRegion(coords.latitude, coords.longitude);
    return {
      lat: coords.latitude,
      lon: coords.longitude,
      locationName: nearest,
    };
  } catch {
    // Geolocation unavailable or timed out
  }

  // Step 2: Try IP geolocation via free client-side endpoint
  try {
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const nearest = getNearestBDRegion(data.latitude, data.longitude);
        return {
          lat: data.latitude,
          lon: data.longitude,
          locationName: nearest,
        };
      }
    }
  } catch {
    // IP location failed
  }

  // Step 3: Default fallback to Chattogram
  return {
    lat: 22.3569,
    lon: 91.7832,
    locationName: {
      en: 'Chattogram Agriculture Region',
      bn: 'চট্টগ্রাম কৃষি অঞ্চল',
    },
  };
};

/**
 * Fetch weather from Open-Meteo by coordinates
 */
export const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  locationName?: WeatherLocationName
): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  const finalLocation = locationName || getNearestBDRegion(lat, lon);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch weather data.');
  }

  const data = await res.json();

  const dailyForecast = (data.daily?.time || []).map((date: string, idx: number) => ({
    date,
    maxTemp: data.daily.temperature_2m_max?.[idx] ?? 0,
    minTemp: data.daily.temperature_2m_min?.[idx] ?? 0,
    precipitationSum: data.daily.precipitation_sum?.[idx] ?? 0,
    weatherCode: data.daily.weather_code?.[idx] ?? 0,
  }));

  return {
    locationName: finalLocation,
    latitude: lat,
    longitude: lon,
    current: {
      temperature: data.current?.temperature_2m ?? 26,
      humidity: data.current?.relative_humidity_2m ?? 70,
      precipitation: data.current?.precipitation ?? 0,
      weatherCode: data.current?.weather_code ?? 0,
      windSpeed: data.current?.wind_speed_10m ?? 8,
    },
    dailyForecast,
  };
};

/**
 * Evaluates weather impact specifically for the given crop type
 */
export const evaluateCropWeather = (
  weather: WeatherData,
  cropType: string
): CropWeatherEvaluation => {
  const profile = getCropProfile(cropType);
  const currentTemp = weather.current.temperature;
  const currentHumidity = weather.current.humidity;

  const total7DayRain = weather.dailyForecast.reduce((sum, d) => sum + d.precipitationSum, 0);
  const maxForecastTemp = Math.max(...weather.dailyForecast.map((d) => d.maxTemp), currentTemp);

  const tipsBn: string[] = [];
  const tipsEn: string[] = [];
  let overallRisk: 'Low' | 'Moderate' | 'High' = 'Low';

  if (total7DayRain > 35) {
    overallRisk = 'High';
    tipsBn.push(profile.weatherRisks.highRain.tipBn);
    tipsEn.push(profile.weatherRisks.highRain.tipEn);
  }

  if (maxForecastTemp > profile.tempRange[1]) {
    if (overallRisk !== 'High') overallRisk = profile.weatherRisks.highHeat.risk;
    tipsBn.push(profile.weatherRisks.highHeat.tipBn);
    tipsEn.push(profile.weatherRisks.highHeat.tipEn);
  }

  if (currentHumidity > profile.humidityRange[1] + 5) {
    if (overallRisk !== 'High') overallRisk = 'Moderate';
    tipsBn.push(profile.weatherRisks.highHumidity.tipBn);
    tipsEn.push(profile.weatherRisks.highHumidity.tipEn);
  }

  if (tipsBn.length === 0) {
    tipsBn.push('আগামী সপ্তাহের আবহাওয়া ফসলের বৃদ্ধির জন্য স্বাভাবিক ও অনুকূল রয়েছে।');
    tipsEn.push('Upcoming 7-day microclimate conditions are optimal for normal crop growth.');
  }

  let summaryBn = 'আবহাওয়া স্বাভাবিক অবস্থায় আছে। নিয়মিত সেচ পর্যবেক্ষণ করুন।';
  let summaryEn = 'Weather conditions are stable. Maintain regular monitoring.';

  if (overallRisk === 'High') {
    summaryBn = 'ভারী বৃষ্টিপাত বা তাপমাত্রার ঝুঁকি রয়েছে। শস্য সুরক্ষায় জরুরি ব্যবস্থা নিন।';
    summaryEn = 'Elevated meteorological hazard detected. Take protective measures.';
  } else if (overallRisk === 'Moderate') {
    summaryBn = 'আবহাওয়ায় কিছুটা পরিবর্তন ও আর্দ্রতার বৃদ্ধি লক্ষ্য করা গেছে।';
    summaryEn = 'Moderate weather stress expected. Ensure adequate field drainage and pest vigilance.';
  }

  let riskColor = '#4ADE80';
  let riskKey: 'weather_risk_low' | 'weather_risk_moderate' | 'weather_risk_high' = 'weather_risk_low';

  if (overallRisk === 'High') {
    riskColor = '#EF4444';
    riskKey = 'weather_risk_high';
  } else if (overallRisk === 'Moderate') {
    riskColor = '#F59E0B';
    riskKey = 'weather_risk_moderate';
  }

  return {
    riskLabel: overallRisk,
    riskKey,
    riskColor,
    summary: {
      en: summaryEn,
      bn: summaryBn,
    },
    tips: {
      en: tipsEn,
      bn: tipsBn,
    },
  };
};
