from django.db import connections
with connections['app_data'].cursor() as cursor:
    cursor.execute("SELECT schema_name FROM information_schema.schemata")
    schemas = [row[0] for row in cursor.fetchall()]
    print("Schemas in app_data:")
    for s in schemas:
        print(f" - {s}")
