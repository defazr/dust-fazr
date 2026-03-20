"""Quick test: collect data for first 5 cities only"""
import psycopg2
from openaq_collector import get_latest_data, calc_aqi
from config import DATABASE_URL

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("SELECT id, name, openaq_location_id FROM cities WHERE is_active = TRUE LIMIT 5")
cities = cur.fetchall()

for city_id, city_name, openaq_id in cities:
    if not openaq_id:
        continue
    data = get_latest_data(openaq_id)
    if not data:
        print(f"  ✗ {city_name}: no data")
        continue

    pm25 = data.get("pm25")
    pm10 = data.get("pm10")
    o3 = data.get("o3")
    no2 = data.get("no2")
    co = data.get("co")
    so2 = data.get("so2")
    aqi = calc_aqi(pm25)

    cur.execute(
        """INSERT INTO air_quality_latest (city_id, pm25, pm10, o3, no2, co, so2, aqi, fetched_at, updated_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
           ON CONFLICT (city_id) DO UPDATE SET
               pm25=EXCLUDED.pm25, pm10=EXCLUDED.pm10, o3=EXCLUDED.o3,
               no2=EXCLUDED.no2, co=EXCLUDED.co, so2=EXCLUDED.so2,
               aqi=EXCLUDED.aqi, fetched_at=NOW(), updated_at=NOW()""",
        (city_id, pm25, pm10, o3, no2, co, so2, aqi),
    )
    cur.execute(
        """INSERT INTO air_quality_history (city_id, pm25, pm10, o3, no2, co, so2, aqi, recorded_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())""",
        (city_id, pm25, pm10, o3, no2, co, so2, aqi),
    )
    conn.commit()
    print(f"  ✓ {city_name}: PM2.5={pm25}, PM10={pm10}, AQI={aqi}")

cur.close()
conn.close()
print("Done.")
