-- DUST.FAZR Database Schema

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    slug VARCHAR(255) UNIQUE NOT NULL,
    openaq_location_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS air_quality_latest (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    o3 DOUBLE PRECISION,
    no2 DOUBLE PRECISION,
    co DOUBLE PRECISION,
    so2 DOUBLE PRECISION,
    aqi INTEGER,
    fetched_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(city_id)
);

CREATE TABLE IF NOT EXISTS air_quality_history (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    o3 DOUBLE PRECISION,
    no2 DOUBLE PRECISION,
    co DOUBLE PRECISION,
    so2 DOUBLE PRECISION,
    aqi INTEGER,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(is_active);
CREATE INDEX IF NOT EXISTS idx_latest_city ON air_quality_latest(city_id);
CREATE INDEX IF NOT EXISTS idx_history_city_time ON air_quality_history(city_id, recorded_at DESC);
