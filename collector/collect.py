"""
Entry point — dispatches to the correct collector based on API_PROVIDER.
Usage: python3 collect.py
"""

from config import API_PROVIDER

if __name__ == "__main__":
    if API_PROVIDER == "waqi":
        from waqi_collector import collect
    elif API_PROVIDER == "openaq":
        from openaq_collector import collect
    else:
        print(f"ERROR: Unknown API_PROVIDER '{API_PROVIDER}' — use 'waqi' or 'openaq'")
        raise SystemExit(1)

    print(f"Using provider: {API_PROVIDER}")
    collect()
