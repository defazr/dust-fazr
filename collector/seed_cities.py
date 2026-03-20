"""
Seed cities with curated city list + nearest OpenAQ location matching.
Clean city names, proper slugs, real city data only.
"""

import re
import math
import requests
import psycopg2
from config import OPENAQ_API_KEY, OPENAQ_BASE_URL, DATABASE_URL

HEADERS = {"X-API-Key": OPENAQ_API_KEY, "Accept": "application/json"}

# Curated city list: (name, country, lat, lon)
CITIES = [
    # South Korea
    ("Seoul", "South Korea", 37.5665, 126.9780),
    ("Busan", "South Korea", 35.1796, 129.0756),
    ("Incheon", "South Korea", 37.4563, 126.7052),
    ("Daegu", "South Korea", 35.8714, 128.6014),
    ("Daejeon", "South Korea", 36.3504, 127.3845),
    ("Gwangju", "South Korea", 35.1595, 126.8526),
    ("Ulsan", "South Korea", 35.5384, 129.3114),
    ("Suwon", "South Korea", 37.2636, 127.0286),
    ("Jeju", "South Korea", 33.4996, 126.5312),
    ("Cheongju", "South Korea", 36.6424, 127.4890),
    ("Jeonju", "South Korea", 35.8242, 127.1480),
    ("Chuncheon", "South Korea", 37.8813, 127.7298),
    ("Wonju", "South Korea", 37.3422, 127.9202),
    ("Changwon", "South Korea", 35.2270, 128.6811),
    ("Pohang", "South Korea", 36.0190, 129.3435),
    # Japan
    ("Tokyo", "Japan", 35.6762, 139.6503),
    ("Osaka", "Japan", 34.6937, 135.5023),
    ("Yokohama", "Japan", 35.4437, 139.6380),
    ("Nagoya", "Japan", 35.1815, 136.9066),
    ("Sapporo", "Japan", 43.0618, 141.3545),
    ("Fukuoka", "Japan", 33.5904, 130.4017),
    ("Kyoto", "Japan", 35.0116, 135.7681),
    ("Kobe", "Japan", 34.6901, 135.1956),
    # China
    ("Beijing", "China", 39.9042, 116.4074),
    ("Shanghai", "China", 31.2304, 121.4737),
    ("Guangzhou", "China", 23.1291, 113.2644),
    ("Shenzhen", "China", 22.5431, 114.0579),
    ("Chengdu", "China", 30.5723, 104.0665),
    ("Wuhan", "China", 30.5928, 114.3055),
    ("Hangzhou", "China", 30.2741, 120.1551),
    ("Nanjing", "China", 32.0603, 118.7969),
    ("Chongqing", "China", 29.4316, 106.9123),
    ("Tianjin", "China", 39.3434, 117.3616),
    # India
    ("New Delhi", "India", 28.6139, 77.2090),
    ("Mumbai", "India", 19.0760, 72.8777),
    ("Bangalore", "India", 12.9716, 77.5946),
    ("Hyderabad", "India", 17.3850, 78.4867),
    ("Chennai", "India", 13.0827, 80.2707),
    ("Kolkata", "India", 22.5726, 88.3639),
    ("Pune", "India", 18.5204, 73.8567),
    ("Ahmedabad", "India", 23.0225, 72.5714),
    ("Lucknow", "India", 26.8467, 80.9462),
    ("Jaipur", "India", 26.9124, 75.7873),
    # United States
    ("New York", "United States", 40.7128, -74.0060),
    ("Los Angeles", "United States", 34.0522, -118.2437),
    ("Chicago", "United States", 41.8781, -87.6298),
    ("Houston", "United States", 29.7604, -95.3698),
    ("Phoenix", "United States", 33.4484, -112.0740),
    ("San Francisco", "United States", 37.7749, -122.4194),
    ("Seattle", "United States", 47.6062, -122.3321),
    ("Denver", "United States", 39.7392, -104.9903),
    ("Miami", "United States", 25.7617, -80.1918),
    ("Atlanta", "United States", 33.7490, -84.3880),
    ("Boston", "United States", 42.3601, -71.0589),
    ("Washington DC", "United States", 38.9072, -77.0369),
    ("Dallas", "United States", 32.7767, -96.7970),
    ("San Diego", "United States", 32.7157, -117.1611),
    ("Portland", "United States", 45.5152, -122.6784),
    # United Kingdom
    ("London", "United Kingdom", 51.5074, -0.1278),
    ("Manchester", "United Kingdom", 53.4808, -2.2426),
    ("Birmingham", "United Kingdom", 52.4862, -1.8904),
    ("Edinburgh", "United Kingdom", 55.9533, -3.1883),
    ("Glasgow", "United Kingdom", 55.8642, -4.2518),
    ("Liverpool", "United Kingdom", 53.4084, -2.9916),
    ("Leeds", "United Kingdom", 53.8008, -1.5491),
    ("Bristol", "United Kingdom", 51.4545, -2.5879),
    # France
    ("Paris", "France", 48.8566, 2.3522),
    ("Marseille", "France", 43.2965, 5.3698),
    ("Lyon", "France", 45.7640, 4.8357),
    ("Toulouse", "France", 43.6047, 1.4442),
    ("Nice", "France", 43.7102, 7.2620),
    ("Bordeaux", "France", 44.8378, -0.5792),
    ("Strasbourg", "France", 48.5734, 7.7521),
    # Germany
    ("Berlin", "Germany", 52.5200, 13.4050),
    ("Munich", "Germany", 48.1351, 11.5820),
    ("Hamburg", "Germany", 53.5511, 9.9937),
    ("Frankfurt", "Germany", 50.1109, 8.6821),
    ("Cologne", "Germany", 50.9375, 6.9603),
    ("Stuttgart", "Germany", 48.7758, 9.1829),
    ("Dusseldorf", "Germany", 51.2277, 6.7735),
    # Australia
    ("Sydney", "Australia", -33.8688, 151.2093),
    ("Melbourne", "Australia", -37.8136, 144.9631),
    ("Brisbane", "Australia", -27.4698, 153.0251),
    ("Perth", "Australia", -31.9505, 115.8605),
    ("Adelaide", "Australia", -34.9285, 138.6007),
    ("Canberra", "Australia", -35.2809, 149.1300),
    # Southeast Asia
    ("Bangkok", "Thailand", 13.7563, 100.5018),
    ("Singapore", "Singapore", 1.3521, 103.8198),
    ("Jakarta", "Indonesia", -6.2088, 106.8456),
    ("Hanoi", "Vietnam", 21.0278, 105.8342),
    ("Ho Chi Minh City", "Vietnam", 10.8231, 106.6297),
    ("Kuala Lumpur", "Malaysia", 3.1390, 101.6869),
    ("Manila", "Philippines", 14.5995, 120.9842),
    # Americas
    ("Mexico City", "Mexico", 19.4326, -99.1332),
    ("Sao Paulo", "Brazil", -23.5505, -46.6333),
    ("Rio de Janeiro", "Brazil", -22.9068, -43.1729),
    ("Buenos Aires", "Argentina", -34.6037, -58.3816),
    ("Bogota", "Colombia", 4.7110, -74.0721),
    ("Lima", "Peru", -12.0464, -77.0428),
    ("Santiago", "Chile", -33.4489, -70.6693),
    ("Toronto", "Canada", 43.6532, -79.3832),
    ("Vancouver", "Canada", 49.2827, -123.1207),
    ("Montreal", "Canada", 45.5017, -73.5673),
    # Europe
    ("Madrid", "Spain", 40.4168, -3.7038),
    ("Barcelona", "Spain", 41.3874, 2.1686),
    ("Rome", "Italy", 41.9028, 12.4964),
    ("Milan", "Italy", 45.4642, 9.1900),
    ("Amsterdam", "Netherlands", 52.3676, 4.9041),
    ("Brussels", "Belgium", 50.8503, 4.3517),
    ("Vienna", "Austria", 48.2082, 16.3738),
    ("Prague", "Czech Republic", 50.0755, 14.4378),
    ("Warsaw", "Poland", 52.2297, 21.0122),
    ("Zurich", "Switzerland", 47.3769, 8.5417),
    ("Stockholm", "Sweden", 59.3293, 18.0686),
    ("Oslo", "Norway", 59.9139, 10.7522),
    ("Copenhagen", "Denmark", 55.6761, 12.5683),
    ("Helsinki", "Finland", 60.1699, 24.9384),
    ("Lisbon", "Portugal", 38.7223, -9.1393),
    ("Athens", "Greece", 37.9838, 23.7275),
    ("Istanbul", "Turkey", 41.0082, 28.9784),
    ("Budapest", "Hungary", 47.4979, 19.0402),
    ("Bucharest", "Romania", 44.4268, 26.1025),
    # Middle East & Africa
    ("Dubai", "UAE", 25.2048, 55.2708),
    ("Riyadh", "Saudi Arabia", 24.7136, 46.6753),
    ("Cairo", "Egypt", 30.0444, 31.2357),
    ("Lagos", "Nigeria", 6.5244, 3.3792),
    ("Nairobi", "Kenya", -1.2921, 36.8219),
    ("Cape Town", "South Africa", -33.9249, 18.4241),
    ("Johannesburg", "South Africa", -26.2041, 28.0473),
    ("Tel Aviv", "Israel", 32.0853, 34.7818),
]


def make_slug(name: str) -> str:
    """Generate clean slug: 'New York' -> 'new-york-air-quality'"""
    clean = re.sub(r"[^a-zA-Z0-9\s-]", "", name)
    clean = re.sub(r"\s+", "-", clean.strip()).lower()
    return f"{clean}-air-quality"


def haversine(lat1, lon1, lat2, lon2):
    """Distance in km between two points"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def fetch_all_locations() -> list:
    """Fetch all locations from OpenAQ, paginated"""
    all_locs = []
    page = 1
    while True:
        url = f"{OPENAQ_BASE_URL}/locations"
        params = {"limit": 1000, "page": page}
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=30)
            r.raise_for_status()
            data = r.json()
            results = data.get("results", [])
            if not results:
                break
            all_locs.extend(results)
            print(f"  Fetched page {page}: {len(results)} locations (total: {len(all_locs)})")
            if len(results) < 1000:
                break
            page += 1
        except Exception as e:
            print(f"  Error on page {page}: {e}")
            break
    return all_locs


def find_nearest_location(city_lat, city_lon, locations, max_distance_km=100):
    """Find nearest OpenAQ location to city coordinates"""
    best = None
    best_dist = float("inf")
    for loc in locations:
        coords = loc.get("coordinates", {})
        lat = coords.get("latitude")
        lon = coords.get("longitude")
        if lat is None or lon is None:
            continue
        # Must have recent data
        if not loc.get("datetimeLast"):
            continue
        dist = haversine(city_lat, city_lon, lat, lon)
        if dist < best_dist and dist <= max_distance_km:
            best_dist = dist
            best = loc
    return best, best_dist


def seed():
    print("Fetching all OpenAQ locations...")
    locations = fetch_all_locations()
    print(f"Total locations: {len(locations)}\n")

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Clear old data
    cur.execute("DELETE FROM air_quality_history")
    cur.execute("DELETE FROM air_quality_latest")
    cur.execute("DELETE FROM cities")
    conn.commit()
    print("Cleared old data.\n")

    matched = 0
    no_match = 0

    for name, country, lat, lon in CITIES:
        slug = make_slug(name)
        nearest, dist = find_nearest_location(lat, lon, locations)

        if nearest:
            openaq_id = nearest["id"]
            cur.execute(
                """INSERT INTO cities (name, country, latitude, longitude, slug, openaq_location_id, is_active)
                   VALUES (%s, %s, %s, %s, %s, %s, TRUE)
                   ON CONFLICT (slug) DO NOTHING""",
                (name, country, lat, lon, slug, openaq_id),
            )
            matched += 1
            print(f"  ✓ {name} ({country}) → location {openaq_id} ({dist:.0f}km)")
        else:
            # Still insert city, just no openaq_id (data will show "updating")
            cur.execute(
                """INSERT INTO cities (name, country, latitude, longitude, slug, openaq_location_id, is_active)
                   VALUES (%s, %s, %s, %s, %s, NULL, TRUE)
                   ON CONFLICT (slug) DO NOTHING""",
                (name, country, lat, lon, slug),
            )
            no_match += 1
            print(f"  ✗ {name} ({country}) → no nearby location")

    conn.commit()
    cur.close()
    conn.close()
    print(f"\nDone. Matched: {matched}, No match: {no_match}, Total: {len(CITIES)}")


if __name__ == "__main__":
    seed()
