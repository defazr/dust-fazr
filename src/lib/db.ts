import { Pool } from "pg";
import type { City, AirQualityLatest, AirQualityHistory, CityWithAirQuality } from "./types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://dust:dust@localhost:5432/dustfazr",
});

export async function getCityBySlug(slug: string): Promise<CityWithAirQuality | null> {
  const client = await pool.connect();
  try {
    // Get city
    const cityResult = await client.query<City>(
      "SELECT * FROM cities WHERE slug = $1 AND is_active = TRUE",
      [slug]
    );
    if (cityResult.rows.length === 0) return null;
    const city = cityResult.rows[0];

    // Get latest air quality
    const latestResult = await client.query<AirQualityLatest>(
      "SELECT * FROM air_quality_latest WHERE city_id = $1",
      [city.id]
    );
    const airQuality = latestResult.rows[0] || null;

    // Get 24h history
    const historyResult = await client.query<AirQualityHistory>(
      "SELECT * FROM air_quality_history WHERE city_id = $1 AND recorded_at > NOW() - INTERVAL '24 hours' ORDER BY recorded_at ASC",
      [city.id]
    );

    // Get nearby cities (by distance, limit 8)
    const nearbyResult = await client.query<City>(
      `SELECT * FROM cities
       WHERE id != $1 AND is_active = TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL
       ORDER BY (latitude - $2)^2 + (longitude - $3)^2 ASC
       LIMIT 8`,
      [city.id, city.latitude, city.longitude]
    );

    return {
      ...city,
      airQuality,
      history: historyResult.rows,
      nearbyCities: nearbyResult.rows,
    };
  } finally {
    client.release();
  }
}

export async function getAllCitySlugs(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT slug FROM cities WHERE is_active = TRUE");
    return result.rows.map((r) => r.slug);
  } finally {
    client.release();
  }
}

export async function getCityWithLatest(citySlug: string): Promise<(City & { aqi: number | null; pm25: number | null; pm10: number | null; updated_at: string | null }) | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT c.*, aq.aqi, aq.pm25, aq.pm10, aq.updated_at
       FROM cities c
       LEFT JOIN air_quality_latest aq ON c.id = aq.city_id
       WHERE c.slug = $1 AND c.is_active = TRUE`,
      [citySlug]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getCleanestCities(limit = 10): Promise<(City & { aqi: number; pm25: number | null; pm10: number | null; updated_at: string | null })[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT c.*, aq.aqi, aq.pm25, aq.pm10, aq.updated_at
       FROM cities c
       JOIN air_quality_latest aq ON c.id = aq.city_id
       WHERE c.is_active = TRUE AND aq.aqi IS NOT NULL AND aq.aqi > 0
       ORDER BY aq.aqi ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getCountryStats(): Promise<{ country: string; country_slug: string; avg_aqi: number; city_count: number }[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT c.country,
              LOWER(REPLACE(REPLACE(c.country, ' ', '-'), '.', '')) as country_slug,
              ROUND(AVG(aq.aqi))::int as avg_aqi,
              COUNT(*)::int as city_count
       FROM cities c
       JOIN air_quality_latest aq ON c.id = aq.city_id
       WHERE c.is_active = TRUE AND aq.aqi IS NOT NULL
       GROUP BY c.country
       ORDER BY avg_aqi DESC`
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getCitiesByCountry(country: string): Promise<(City & { aqi: number | null; pm25: number | null; pm10: number | null; updated_at: string | null })[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT c.*, aq.aqi, aq.pm25, aq.pm10, aq.updated_at
       FROM cities c
       LEFT JOIN air_quality_latest aq ON c.id = aq.city_id
       WHERE c.is_active = TRUE AND LOWER(REPLACE(REPLACE(c.country, ' ', '-'), '.', '')) = $1
       ORDER BY aq.aqi DESC NULLS LAST`,
      [country]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getAllCountrySlugs(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT DISTINCT LOWER(REPLACE(REPLACE(country, ' ', '-'), '.', '')) as country_slug
       FROM cities WHERE is_active = TRUE`
    );
    return result.rows.map((r) => r.country_slug);
  } finally {
    client.release();
  }
}

export async function getTopPollutedCities(limit = 10): Promise<(City & { aqi: number; pm25: number | null; pm10: number | null; updated_at: string | null })[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT c.*, aq.aqi, aq.pm25, aq.pm10, aq.updated_at
       FROM cities c
       JOIN air_quality_latest aq ON c.id = aq.city_id
       WHERE c.is_active = TRUE AND aq.aqi IS NOT NULL
       ORDER BY aq.aqi DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getAllCitiesWithLatest(): Promise<(City & { aqi: number | null })[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT c.*, aq.aqi
       FROM cities c
       LEFT JOIN air_quality_latest aq ON c.id = aq.city_id
       WHERE c.is_active = TRUE
       ORDER BY c.name ASC`
    );
    return result.rows;
  } finally {
    client.release();
  }
}
