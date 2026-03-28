import os

OPENAQ_API_KEY = os.environ.get("OPENAQ_API_KEY")
OPENAQ_BASE_URL = "https://api.openaq.org/v3"

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://dust@localhost:5432/dustfazr")
