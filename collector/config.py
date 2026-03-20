import os

OPENAQ_API_KEY = os.environ.get("OPENAQ_API_KEY", "fcd4345cf03794702a60f3ed3cb182d85019de934b0a82f22ca0dafdafaad3b5")
OPENAQ_BASE_URL = "https://api.openaq.org/v3"

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://dust@localhost:5432/dustfazr")
