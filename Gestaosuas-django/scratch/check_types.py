from django.db import connections
with connections['app_data'].cursor() as cursor:
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'oscs' AND column_name IN ('id', 'user_id', 'directorate_id')")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Column: {row[0]}, Type: {row[1]}")
