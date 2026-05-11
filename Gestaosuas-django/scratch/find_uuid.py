from django.db import connections
id_to_check = 'dd8ba13c-5353-469f-9bef-621509e8ce61'
with connections['app_data'].cursor() as cursor:
    cursor.execute(f"SELECT id, name FROM directorates WHERE id = '{id_to_check}'")
    row = cursor.fetchone()
    if row:
        print(f"Found: {row}")
    else:
        print("Not found in directorates table.")

    # Let's check if it exists in ANY table as a primary key or something? 
    # Or just check some likely tables.
    for table in ['oscs', 'daily_reports', 'submissions']:
        cursor.execute(f"SELECT count(*) FROM {table} WHERE id = '{id_to_check}'")
        if cursor.fetchone()[0] > 0:
            print(f"Found in table: {table}")
