export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  precipitation24h: number;
  conditions: string;
  icon: string;
  timestamp: string;
}

export interface WeatherAlert {
  id: string;
  projectId: number;
  userId: string;
  alertType: 'POSTPONE' | 'CANCEL' | 'WARNING' | 'URGENT';
  title: string;
  message: string;
  recommendation: string;
  jalonsAffected: number[];
  weatherCondition: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  validUntil: string;
  acknowledged: boolean;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  conditions: string;
  icon: string;
}

export interface InterventionType {
  code: string;
  name: string;
  weatherSensitive: boolean;
  windThreshold?: number;
  precipitationThreshold?: number;
  temperatureRange?: {
    min?: number;
    max?: number;
  };
}

export interface AlertRule {
  interventionType: string;
  weatherCondition: string;
  threshold: number;
  alertType: WeatherAlert['alertType'];
  message: string;
  recommendation: string;
}