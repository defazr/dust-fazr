"""
OpenAQ Collector — Fetches air quality data for all active cities and saves to DB.
Run every hour via cron.
"""

import time
import requests
import psycopg2
from config import OPENAQ_API_KEY, OPENAQ_BASE_URL, DATABASE_URL

HEADERS = {"X-API-Key": OPENAQ_API_KEY, "Accept": "application/json"}

# AQI breakpoints for PM2.5 (EPA standard, simplified)
PM25_BREAKPOINTS = [
    (0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 500.4, 301, 500),
]


def calc_aqi(pm25: float | None) -> int | None:
    """Calculate AQI from PM2.5 using EPA breakpoints"""
    if pm25 is None:
        return None
    for c_low, c_high, i_low, i_high in PM25_BREAKPOINTS:
        if c_low <= pm25 <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (pm25 - c_low) + i_low)
    if pm25 > 500.4:
        return 500
    return None


def get_sensor_map(location_id: int) -> dict:
    """Get sensor_id -> parameter_name mapping"""
    url = f"{OPENAQ_BASE_URL}/locations/{location_id}"
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    sensors = r.json()["results"][0]["sensors"]
    return {s["id"]: s["parameter"]["name"] for s in sensors}


def get_latest_data(location_id: int) -> dict:
    """Fetch latest measurements for a location, returns {param: value}"""
    try:
        sensor_map = get_sensor_map(location_id)
    except Exception:
        return {}

    url = f"{OPENAQ_BASE_URL}/locations/{location_id}/latest"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        results = r.json().get("results", [])
    except Exception:
        return {}

    data = {}
    for item in results:
        sensor_id = item.get("sensorsId")
        param = sensor_map.get(sensor_id)
        if param:
            data[param] = item.get("value")
    return data


def collect():
    if not OPENAQ_API_KEY:
        print("ERROR: OPENAQ_API_KEY not set — skipping collection")
        return

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("SELECT id, name, openaq_location_id FROM cities WHERE is_active = TRUE")
    cities = cur.fetchall()

    print(f"Collecting data for {len(cities)} cities...")
    success = 0
    errors = 0

    for city_id, city_name, openaq_id in cities:
        if not openaq_id:
            continue

        try:
            data = get_latest_data(openaq_id)

            if not data:
                continue

            pm25 = data.get("pm25")
            pm10 = data.get("pm10")
            o3 = data.get("o3")
            no2 = data.get("no2")
            co = data.get("co")
            so2 = data.get("so2")
            aqi = calc_aqi(pm25)

            # Upsert latest
            cur.execute(
                """
                INSERT INTO air_quality_latest (city_id, pm25, pm10, o3, no2, co, so2, aqi, fetched_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (city_id) DO UPDATE SET
                    pm25 = EXCLUDED.pm25,
                    pm10 = EXCLUDED.pm10,
                    o3 = EXCLUDED.o3,
                    no2 = EXCLUDED.no2,
                    co = EXCLUDED.co,
                    so2 = EXCLUDED.so2,
                    aqi = EXCLUDED.aqi,
                    fetched_at = NOW(),
                    updated_at = NOW()
                """,
                (city_id, pm25, pm10, o3, no2, co, so2, aqi),
            )

            # Insert history
            cur.execute(
                """
                INSERT INTO air_quality_history (city_id, pm25, pm10, o3, no2, co, so2, aqi, recorded_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """,
                (city_id, pm25, pm10, o3, no2, co, so2, aqi),
            )

            conn.commit()
            success += 1
            print(f"  ✓ {city_name}: PM2.5={pm25}, PM10={pm10}, AQI={aqi}")

        except Exception as e:
            errors += 1
            print(f"  ✗ {city_name}: {e}")
            conn.rollback()

        # Rate limit: be polite to the API
        time.sleep(0.5)

    cur.close()
    conn.close()
    print(f"\nDone. Success: {success}, Errors: {errors}")


if __name__ == "__main__":
    collect()
