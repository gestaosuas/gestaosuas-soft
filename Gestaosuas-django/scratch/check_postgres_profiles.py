from django.db import connections
with connections['app_data'].cursor() as cursor:
    cursor.execute("SELECT id, primary_directorate_id FROM profiles")
    rows = cursor.fetchall()
    print("Profiles in app_data (Postgres):")
    for row in rows:
        print(f" - ID: {row[0]}, Primary Directorate: {row[1]}")
