"""
WAQI Collector — Fetches air quality data from World Air Quality Index API.
Uses geo-based lookup (lat/lng) for each city.
Run every hour via cron.
"""

import time
import requests
import psycopg2
from config import WAQI_TOKEN, DATABASE_URL

WAQI_BASE = "https://api.waqi.info"


def get_city_data(lat: float, lng: float) -> dict | None:
    """Fetch AQI data for a geo coordinate from WAQI API."""
    url = f"{WAQI_BASE}/feed/geo:{lat};{lng}/?token={WAQI_TOKEN}"
    try:
        r = requests.get(url, timeout=15)
        data = r.json()
        if data.get("status") != "ok":
            return None
        return data["data"]
    except Exception:
        return None


def collect():
    if not WAQI_TOKEN:
        print("ERROR: WAQI_TOKEN not set — skipping collection")
        return

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("SELECT id, name, latitude, longitude FROM cities WHERE is_active = TRUE")
    cities = cur.fetchall()

    print(f"[WAQI] Collecting data for {len(cities)} cities...")
    success = 0
    errors = 0
    no_data = 0

    for city_id, city_name, lat, lng in cities:
        try:
            data = get_city_data(lat, lng)

            if not data:
                no_data += 1
                continue

            iaqi = data.get("iaqi", {})
            aqi_raw = data.get("aqi")
            aqi = int(aqi_raw) if aqi_raw is not None and aqi_raw != "-" else None

            pm25 = iaqi.get("pm25", {}).get("v")
            pm10 = iaqi.get("pm10", {}).get("v")
            o3 = iaqi.get("o3", {}).get("v")
            no2 = iaqi.get("no2", {}).get("v")
            co = iaqi.get("co", {}).get("v")
            so2 = iaqi.get("so2", {}).get("v")

            # Skip if no useful data at all
            if aqi is None and pm25 is None:
                no_data += 1
                continue

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
            print(f"  ✓ {city_name}: AQI={aqi}, PM2.5={pm25}, PM10={pm10}")

        except Exception as e:
            errors += 1
            print(f"  ✗ {city_name}: {e}")
            conn.rollback()

        time.sleep(0.15)

    cur.close()
    conn.close()
    print(f"\n[WAQI] Done. Success: {success}, No data: {no_data}, Errors: {errors}")


if __name__ == "__main__":
    collect()
