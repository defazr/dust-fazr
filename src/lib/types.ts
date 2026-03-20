export interface City {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  slug: string;
  is_active: boolean;
}

export interface AirQualityLatest {
  id: number;
  city_id: number;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  co: number | null;
  so2: number | null;
  aqi: number | null;
  fetched_at: string;
  updated_at: string;
}

export interface AirQualityHistory {
  id: number;
  city_id: number;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  aqi: number | null;
  recorded_at: string;
}

export interface CityWithAirQuality extends City {
  airQuality: AirQualityLatest | null;
  history: AirQualityHistory[];
  nearbyCities: City[];
}
