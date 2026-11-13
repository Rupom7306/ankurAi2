export type GrowthStage = 
  | 'Germination' 
  | 'Seedling' 
  | 'Vegetative' 
  | 'Reproductive' 
  | 'Maturity';

export type HealthCondition = 
  | 'Excellent' 
  | 'Healthy' 
  | 'Moderate' 
  | 'At Risk' 
  | 'Critical';

export type BatchPriority = 'Critical' | 'High' | 'Moderate' | 'Low';

export interface CropBatch {
  id: string;
  userId: string;
  batchName: string;
  cropType: string;
  variety?: string;
  plantingDate: string;
  farmLocation: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  sensorSetId: string;
  growthStage: GrowthStage;
  healthScore: number; // 0 - 100%
  condition: HealthCondition;
  priority: BatchPriority;
  activeIssuesCount: number;
  qrCodeUrl?: string;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensorReading {
  id: string;
  sensorSetId: string;
  timestamp: string;
  nitrogen: number; // mg/kg
  phosphorus: number; // mg/kg
  potassium: number; // mg/kg
  soilHumidity: number; // %
  soilTemperature?: number; // °C
  batteryLevel?: number; // %
}

export interface AIVerdict {
  dos: string[];
  donts: string[];
  monitor: string[];
  nextCheckupDays: number;
  summary: string;
}

export interface CropAnalysis {
  id: string;
  batchId: string;
  imageUrl: string;
  analyzedAt: string;
  modelUsed: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash';
  confidenceScore: number; // 0 - 100%
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  detectedDiseases: string[];
  detectedPests: string[];
  nutrientDeficiencies: string[];
  growthStageDetected: GrowthStage;
  estimatedHealthScore: number;
  evidence: {
    visualSigns: string[];
    sensorCorrelation: string[];
  };
  verdict: AIVerdict;
}

export interface WeatherData {
  temperature: number;
  relativeHumidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  forecastDaily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitationSum: number;
  }>;
}
