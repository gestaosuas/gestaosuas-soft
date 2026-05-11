from django.db import connections
with connections['app_data'].cursor() as cursor:
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'")
    columns = [row[0] for row in cursor.fetchall()]
    print("Columns in profiles table (Postgres):")
    for c in columns:
        print(f" - {c}")
