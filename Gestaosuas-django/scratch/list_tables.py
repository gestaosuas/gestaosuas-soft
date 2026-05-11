from django.db import connections
try:
    with connections['app_data'].cursor() as cursor:
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [row[0] for row in cursor.fetchall()]
        print("Tables in app_data:")
        for t in sorted(tables):
            print(f" - {t}")
except Exception as e:
    print(f"Error: {e}")
